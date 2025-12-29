import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import type { TemplateId, TemplateCustomization } from './resumeTemplates';
import { colorSchemes, fontFamilies } from './resumeTemplates';

interface ResumeSection {
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  location?: string;
  summary?: string;
  experience?: {
    company: string;
    title: string;
    dates: string;
    bullets: string[];
  }[];
  education?: {
    institution: string;
    degree: string;
    year: string;
    gpa?: string;
  }[];
  skills?: string[];
  certifications?: string[];
}

// Section patterns for detection
const sectionPatterns = {
  summary: /^(?:summary|profile|professional summary|objective|about)\s*:?\s*$/i,
  experience: /^(?:experience|work history|employment|professional experience|work experience)\s*:?\s*$/i,
  education: /^(?:education|academic|academic background)\s*:?\s*$/i,
  certifications: /^(?:certifications?|certificates?|licenses?|credentials?)\s*:?\s*$/i,
  skills: /^(?:skills|technical skills|core competencies|key skills)\s*:?\s*$/i
};

// Ordered section names for output
export const orderedSections = ['summary', 'experience', 'education', 'certifications', 'skills'] as const;
export type SectionName = typeof orderedSections[number];

export interface ParsedSections {
  summary: string[];
  experience: string[];
  education: string[];
  certifications: string[];
  skills: string[];
}

// Parse resume text into sections
export function parseResumeText(text: string): ResumeSection {
  const lines = text.split('\n').filter(l => l.trim());
  const result: ResumeSection = {};
  
  // Try to extract name (usually first line or largest text)
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine.length < 50 && !firstLine.includes('@') && !firstLine.includes(':')) {
      result.name = firstLine;
    }
  }
  
  // Extract contact info
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) result.email = emailMatch[0];
  
  const phoneMatch = text.match(/[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);
  if (phoneMatch) result.phone = phoneMatch[0];
  
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) result.linkedin = linkedinMatch[0];
  
  // Try to find sections
  const summaryMatch = text.match(/(?:summary|profile|objective|about)[:\s]*\n?([\s\S]*?)(?=\n(?:experience|education|skills|work|employment)|\n\n\n|$)/i);
  if (summaryMatch) {
    result.summary = summaryMatch[1].trim().split('\n').slice(0, 4).join(' ').substring(0, 500);
  }
  
  // Extract skills
  const skillsMatch = text.match(/(?:skills|technical skills|core competencies)[:\s]*\n?([\s\S]*?)(?=\n(?:experience|education|certification|work)|\n\n\n|$)/i);
  if (skillsMatch) {
    const skillText = skillsMatch[1];
    const skills = skillText.split(/[,•|;\n]/).map(s => s.trim()).filter(s => s && s.length < 50);
    result.skills = skills.slice(0, 20);
  }
  
  return result;
}

// Parse resume into ordered sections
export function parseResumeIntoSections(text: string): { header: string[]; sections: ParsedSections } {
  const lines = text.split('\n');
  const header: string[] = [];
  const sections: ParsedSections = {
    summary: [],
    experience: [],
    education: [],
    certifications: [],
    skills: []
  };
  
  let currentSection: SectionName | null = null;
  let headerDone = false;
  
  // Detect which section a line represents
  const detectSection = (line: string): SectionName | null => {
    const trimmed = line.trim();
    for (const [name, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(trimmed)) {
        return name as SectionName;
      }
    }
    // Also check for partial matches (e.g., "PROFESSIONAL EXPERIENCE")
    const lower = trimmed.toLowerCase();
    if (lower.includes('summary') || lower.includes('profile') || lower.includes('objective')) return 'summary';
    if (lower.includes('experience') || lower.includes('work history') || lower.includes('employment')) return 'experience';
    if (lower.includes('education') || lower.includes('academic')) return 'education';
    if (lower.includes('certification') || lower.includes('certificate') || lower.includes('license')) return 'certifications';
    if (lower.includes('skills') || lower.includes('competencies')) return 'skills';
    return null;
  };
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check if this is a section header
    const detectedSection = detectSection(trimmed);
    if (detectedSection && trimmed.length < 50) {
      currentSection = detectedSection;
      headerDone = true;
      continue; // Don't add the section header to content
    }
    
    // If we haven't hit any section yet, this is header content
    if (!headerDone && !currentSection) {
      // Check if this looks like contact info or name (header content)
      if (trimmed) {
        header.push(line);
      }
      continue;
    }
    
    // Add to current section
    if (currentSection) {
      sections[currentSection].push(line);
    }
  }
  
  return { header, sections };
}

// Format line as bullet point if it's content
function formatAsBullet(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return '';
  
  // Already has bullet
  if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
    return `• ${trimmed.replace(/^[-•*]\s*/, '')}`;
  }
  
  // Skip lines that look like headers (company names, dates, etc.)
  const looksLikeHeader = /^[A-Z][^.!?]*(?:\d{4}|present|current)/i.test(trimmed) ||
                          /^\w+(?:\s+\w+)?(?:\s*[|–-]\s*|\s{2,})/.test(trimmed);
  
  if (looksLikeHeader) {
    return trimmed;
  }
  
  // Add bullet to content lines
  return `• ${trimmed}`;
}

// Generate PDF with template styling
export function generateResumePDF(
  resumeText: string,
  templateId: TemplateId,
  customization?: Partial<TemplateCustomization>,
  contactName?: string
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 54; // 0.75 inches
  const contentWidth = pageWidth - margin * 2;
  
  // Get colors based on customization or template
  const scheme = customization?.colorScheme || 'teal';
  const colors = colorSchemes[scheme];
  const fontFamily = fontFamilies[customization?.fontFamily || 'arial'];
  const isCompact = customization?.spacing === 'compact';
  
  const lineHeight = isCompact ? 14 : 16;
  let y = margin;
  
  // Helper to add text with word wrap
  const addText = (text: string, x: number, maxWidth: number, options: {
    fontSize?: number;
    color?: string;
    bold?: boolean;
    italic?: boolean;
    align?: 'left' | 'center' | 'right';
  } = {}) => {
    const { fontSize = 11, color = '#000000', bold = false, italic = false, align = 'left' } = options;
    
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    doc.setFont('helvetica', bold ? 'bold' : italic ? 'italic' : 'normal');
    
    const lines = doc.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      let textX = x;
      if (align === 'center') textX = pageWidth / 2;
      if (align === 'right') textX = pageWidth - margin;
      
      doc.text(line, textX, y, { align });
      y += lineHeight;
    });
    
    return lines.length;
  };
  
  // Parse resume
  const parsed = parseResumeText(resumeText);
  
  // Template-specific styling
  switch (templateId) {
    case 'classic':
      // Classic Professional - Centered header, simple dividers
      if (parsed.name || contactName) {
        addText(parsed.name || contactName || 'Resume', margin, contentWidth, { 
          fontSize: 20, 
          bold: true, 
          align: 'center' 
        });
        y += 4;
      }
      
      // Contact info on one line
      const contactParts = [parsed.email, parsed.phone, parsed.linkedin, parsed.location].filter(Boolean);
      if (contactParts.length > 0) {
        addText(contactParts.join(' | '), margin, contentWidth, { 
          fontSize: 10, 
          color: '#666666',
          align: 'center' 
        });
      }
      y += 12;
      
      // Divider line
      doc.setDrawColor('#000000');
      doc.setLineWidth(1);
      doc.line(margin, y, pageWidth - margin, y);
      y += 16;
      break;
      
    case 'modern':
      // Modern Minimal - Left-aligned with teal accents
      if (parsed.name || contactName) {
        addText(parsed.name || contactName || 'Resume', margin, contentWidth, { 
          fontSize: 24, 
          bold: true,
          color: colors.primary
        });
        y += 2;
      }
      
      // Contact info below name
      if (parsed.email) addText(parsed.email, margin, contentWidth, { fontSize: 10, color: '#6b7280' });
      if (parsed.phone) addText(parsed.phone, margin, contentWidth, { fontSize: 10, color: '#6b7280' });
      y += 8;
      
      // Colored underline
      doc.setDrawColor(colors.accent);
      doc.setLineWidth(2);
      doc.line(margin, y, margin + 100, y);
      y += 16;
      break;
      
    case 'executive':
      // Executive Bold - Two-tone header
      doc.setFillColor(colors.primary);
      doc.rect(0, 0, pageWidth, 70, 'F');
      
      y = 30;
      if (parsed.name || contactName) {
        doc.setTextColor('#ffffff');
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(parsed.name || contactName || 'Resume', margin, y);
        y += 20;
      }
      
      if (parsed.email || parsed.phone) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text([parsed.email, parsed.phone].filter(Boolean).join(' | '), margin, y);
      }
      
      y = 90;
      break;
      
    case 'tech':
      // Tech Simple - Clean with monospace accents
      if (parsed.name || contactName) {
        addText(parsed.name || contactName || 'Resume', margin, contentWidth, { 
          fontSize: 18, 
          bold: true 
        });
        y += 2;
      }
      
      // Contact with icons (text representation)
      const techContact = [
        parsed.email && `✉ ${parsed.email}`,
        parsed.phone && `☎ ${parsed.phone}`,
        parsed.linkedin && `🔗 ${parsed.linkedin}`,
      ].filter(Boolean);
      
      if (techContact.length > 0) {
        addText(techContact.join('  •  '), margin, contentWidth, { 
          fontSize: 9, 
          color: colors.muted 
        });
      }
      y += 12;
      
      doc.setDrawColor(colors.accent);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 16;
      break;
      
    case 'corporate-navy':
      // Corporate Navy - Full-width navy header with white text
      doc.setFillColor('#0F172A');
      doc.rect(0, 0, pageWidth, 80, 'F');
      
      y = 30;
      if (parsed.name || contactName) {
        doc.setTextColor('#ffffff');
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(parsed.name || contactName || 'Resume', margin, y);
        y += 24;
      }
      
      // Contact info in header
      const navyContact = [parsed.email, parsed.phone, parsed.linkedin, parsed.location].filter(Boolean);
      if (navyContact.length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(navyContact.join('  |  '), margin, y);
      }
      
      y = 100;
      break;
      
    case 'azure-minimal':
      // Azure Minimal - Centered layout with large blue name
      if (parsed.name || contactName) {
        addText(parsed.name || contactName || 'Resume', margin, contentWidth, { 
          fontSize: 28, 
          bold: true,
          color: '#2563EB',
          align: 'center'
        });
        y += 4;
      }
      
      // Centered contact info
      const azureContact = [parsed.email, parsed.phone, parsed.linkedin].filter(Boolean);
      if (azureContact.length > 0) {
        addText(azureContact.join('  |  '), margin, contentWidth, { 
          fontSize: 10, 
          color: '#64748B',
          align: 'center' 
        });
      }
      y += 12;
      
      // Light blue divider
      doc.setDrawColor('#EFF6FF');
      doc.setLineWidth(2);
      doc.line(margin + 100, y, pageWidth - margin - 100, y);
      y += 20;
      break;
      
    case 'sapphire-sidebar':
      // Sapphire Sidebar - Navy left sidebar (1/3 width)
      const sidebarWidth = pageWidth / 3;
      doc.setFillColor('#0F172A');
      doc.rect(0, 0, sidebarWidth, pageHeight, 'F');
      
      // Sidebar content - Contact, Skills, Education
      let sidebarY = 40;
      doc.setTextColor('#ffffff');
      
      // Name in sidebar
      if (parsed.name || contactName) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        const nameLines = doc.splitTextToSize(parsed.name || contactName || 'Resume', sidebarWidth - 30);
        nameLines.forEach((line: string) => {
          doc.text(line, 15, sidebarY);
          sidebarY += 16;
        });
        sidebarY += 10;
      }
      
      // Contact section in sidebar
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTACT', 15, sidebarY);
      sidebarY += 14;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      if (parsed.email) { doc.text(parsed.email, 15, sidebarY); sidebarY += 12; }
      if (parsed.phone) { doc.text(parsed.phone, 15, sidebarY); sidebarY += 12; }
      if (parsed.linkedin) { doc.text(parsed.linkedin, 15, sidebarY); sidebarY += 12; }
      sidebarY += 10;
      
      // Skills section in sidebar
      if (parsed.skills && parsed.skills.length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('SKILLS', 15, sidebarY);
        sidebarY += 14;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        parsed.skills.slice(0, 12).forEach(skill => {
          const skillLines = doc.splitTextToSize(`• ${skill}`, sidebarWidth - 30);
          skillLines.forEach((line: string) => {
            doc.text(line, 15, sidebarY);
            sidebarY += 11;
          });
        });
      }
      
      // Main content area starts to the right
      y = margin;
      break;
      
    case 'royal-rightrail':
      // Royal Right-Rail - Light blue right sidebar (1/3 width)
      const rightSidebarWidth = pageWidth / 3;
      const mainContentWidth = pageWidth - rightSidebarWidth;
      
      // Light blue right sidebar
      doc.setFillColor('#EFF6FF');
      doc.rect(mainContentWidth, 0, rightSidebarWidth, pageHeight, 'F');
      
      // Blue vertical line separator
      doc.setDrawColor('#2563EB');
      doc.setLineWidth(2);
      doc.line(mainContentWidth, 0, mainContentWidth, pageHeight);
      
      // Main header (left side)
      if (parsed.name || contactName) {
        addText(parsed.name || contactName || 'Resume', margin, mainContentWidth - margin * 2, { 
          fontSize: 22, 
          bold: true,
          color: '#0F172A'
        });
        y += 4;
      }
      
      // Right sidebar content
      let rightY = 40;
      const rightX = mainContentWidth + 15;
      
      // Contact section in right sidebar
      doc.setTextColor('#0F172A');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTACT', rightX, rightY);
      rightY += 14;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor('#64748B');
      if (parsed.email) { doc.text(parsed.email, rightX, rightY); rightY += 12; }
      if (parsed.phone) { doc.text(parsed.phone, rightX, rightY); rightY += 12; }
      if (parsed.linkedin) { 
        const linkedinLines = doc.splitTextToSize(parsed.linkedin, rightSidebarWidth - 30);
        linkedinLines.forEach((line: string) => {
          doc.text(line, rightX, rightY);
          rightY += 11;
        });
      }
      rightY += 15;
      
      // Skills section in right sidebar
      if (parsed.skills && parsed.skills.length > 0) {
        doc.setTextColor('#0F172A');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('SKILLS', rightX, rightY);
        rightY += 14;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor('#64748B');
        parsed.skills.slice(0, 12).forEach(skill => {
          const skillLines = doc.splitTextToSize(`• ${skill}`, rightSidebarWidth - 30);
          skillLines.forEach((line: string) => {
            doc.text(line, rightX, rightY);
            rightY += 11;
          });
        });
      }
      
      y += 16;
      break;
  }
  
  // Parse resume into ordered sections
  const { sections } = parseResumeIntoSections(resumeText);
  
  // Section display names
  const sectionDisplayNames: Record<SectionName, string> = {
    summary: 'SUMMARY',
    experience: 'PROFESSIONAL EXPERIENCE',
    education: 'EDUCATION',
    certifications: 'CERTIFICATIONS',
    skills: 'SKILLS'
  };
  
  // Render sections in order
  for (const sectionName of orderedSections) {
    const sectionContent = sections[sectionName];
    if (!sectionContent || sectionContent.filter(l => l.trim()).length === 0) continue;
    
    // Check if we need a new page
    if (y > pageHeight - margin - 60) {
      doc.addPage();
      y = margin;
    }
    
    // Section header
    y += 8;
    
    if (templateId === 'executive') {
      doc.setFillColor('#f3f4f6');
      doc.rect(margin - 4, y - 12, contentWidth + 8, 18, 'F');
    }
    
    addText(sectionDisplayNames[sectionName], margin, contentWidth, {
      fontSize: 12,
      bold: true,
      color: colors.primary,
    });
    
    if (templateId === 'modern') {
      doc.setDrawColor(colors.accent);
      doc.setLineWidth(1);
      doc.line(margin, y, margin + 60, y);
      y += 4;
    }
    
    y += 4;
    
    // Section content
    for (const line of sectionContent) {
      const trimmed = line.trim();
      if (!trimmed) {
        y += lineHeight / 2;
        continue;
      }
      
      // Check if we need a new page
      if (y > pageHeight - margin - 40) {
        doc.addPage();
        y = margin;
      }
      
      // Format content with bullets where appropriate
      const isBulletLine = trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*');
      const looksLikeHeader = /^[A-Z][^.!?]*(?:\d{4}|present|current)/i.test(trimmed) ||
                              /^\w+(?:\s+\w+)?(?:\s*[|–-]\s*|\s{2,})/.test(trimmed);
      
      if (isBulletLine) {
        const bulletText = trimmed.replace(/^[-•*]\s*/, '');
        addText(`• ${bulletText}`, margin + 12, contentWidth - 12, {
          fontSize: 10,
          color: colors.text,
        });
      } else if (looksLikeHeader) {
        // Company names, titles with dates - render as-is
        addText(trimmed, margin, contentWidth, {
          fontSize: 10,
          color: colors.text,
          bold: true,
        });
      } else if (sectionName === 'skills') {
        // Skills should be bullet points
        addText(`• ${trimmed}`, margin + 12, contentWidth - 12, {
          fontSize: 10,
          color: colors.text,
        });
      } else {
        addText(trimmed, margin, contentWidth, {
          fontSize: 10,
          color: colors.text,
        });
      }
    }
  }
  
  // Generate filename
  const name = (parsed.name || contactName || 'Resume').replace(/[^a-zA-Z\s]/g, '').trim();
  const nameParts = name.split(' ');
  const firstName = nameParts[0] || 'Resume';
  const lastName = nameParts.slice(1).join('_') || '';
  const filename = lastName ? `${firstName}_${lastName}_Resume.pdf` : `${firstName}_Resume.pdf`;
  
  doc.save(filename);
}

// Generate plain text download
export function generatePlainText(resumeText: string, contactName?: string): void {
  const blob = new Blob([resumeText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const name = (contactName || 'Resume').replace(/[^a-zA-Z\s]/g, '').trim();
  const nameParts = name.split(' ');
  const firstName = nameParts[0] || 'Resume';
  const lastName = nameParts.slice(1).join('_') || '';
  const filename = lastName ? `${firstName}_${lastName}_Resume.txt` : `${firstName}_Resume.txt`;
  
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
}

// Generate DOCX download
// Get colors for template
function getTemplateColors(templateId: TemplateId) {
  switch (templateId) {
    case 'classic': return colorSchemes.black;
    case 'modern': return colorSchemes.teal;
    case 'executive': return colorSchemes.blue;
    case 'tech': return colorSchemes.gray;
    case 'corporate-navy':
    case 'sapphire-sidebar':
      return colorSchemes.navy;
    case 'azure-minimal':
    case 'royal-rightrail':
      return { primary: '#2563EB', secondary: '#0F172A', accent: '#EFF6FF', text: '#0F172A', muted: '#64748B' };
    default: return colorSchemes.teal;
  }
}

export async function generateResumeDocx(
  resumeText: string,
  templateId: TemplateId,
  contactName?: string
): Promise<void> {
  const parsed = parseResumeText(resumeText);
  const colors = getTemplateColors(templateId);
  
  const sectionHeaders = ['summary', 'experience', 'education', 'skills', 'certifications', 'projects', 'work history', 'professional experience', 'technical skills'];
  
  const lines = resumeText.split('\n');
  const children: Paragraph[] = [];
  
  // Add name as title
  const name = parsed.name || contactName || 'Resume';
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: name,
          bold: true,
          size: templateId === 'modern' ? 48 : 40, // Size in half-points
          color: templateId === 'modern' || templateId === 'executive' ? colors.primary.replace('#', '') : '000000',
        }),
      ],
      alignment: templateId === 'classic' ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { after: 100 },
    })
  );
  
  // Add contact info
  const contactParts = [parsed.email, parsed.phone, parsed.linkedin].filter(Boolean);
  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactParts.join(' | '),
            size: 20,
            color: '666666',
          }),
        ],
        alignment: templateId === 'classic' ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { after: 200 },
        border: templateId === 'classic' ? {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
        } : undefined,
      })
    );
  }
  
  // Parse resume into ordered sections
  const { sections } = parseResumeIntoSections(resumeText);
  
  // Section display names
  const sectionDisplayNames: Record<SectionName, string> = {
    summary: 'SUMMARY',
    experience: 'PROFESSIONAL EXPERIENCE',
    education: 'EDUCATION',
    certifications: 'CERTIFICATIONS',
    skills: 'SKILLS'
  };
  
  // Render sections in order
  for (const sectionName of orderedSections) {
    const sectionContent = sections[sectionName];
    if (!sectionContent || sectionContent.filter(l => l.trim()).length === 0) continue;
    
    // Section header
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: sectionDisplayNames[sectionName],
            bold: true,
            size: 24,
            color: colors.primary.replace('#', ''),
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        border: templateId === 'modern' ? {
          bottom: { style: BorderStyle.SINGLE, size: 4, color: colors.accent.replace('#', '') },
        } : templateId === 'executive' ? {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: colors.primary.replace('#', '') },
        } : undefined,
      })
    );
    
    // Section content
    for (const line of sectionContent) {
      const trimmed = line.trim();
      if (!trimmed) {
        children.push(new Paragraph({ spacing: { after: 100 } }));
        continue;
      }
      
      const isBulletLine = trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*');
      const looksLikeHeader = /^[A-Z][^.!?]*(?:\d{4}|present|current)/i.test(trimmed) ||
                              /^\w+(?:\s+\w+)?(?:\s*[|–-]\s*|\s{2,})/.test(trimmed);
      
      if (isBulletLine) {
        const bulletText = trimmed.replace(/^[-•*]\s*/, '');
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${bulletText}`,
                size: 22,
              }),
            ],
            indent: { left: 360 },
            spacing: { after: 80 },
          })
        );
      } else if (looksLikeHeader) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: trimmed,
                size: 22,
                bold: true,
              }),
            ],
            spacing: { after: 80 },
          })
        );
      } else if (sectionName === 'skills') {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${trimmed}`,
                size: 22,
              }),
            ],
            indent: { left: 360 },
            spacing: { after: 80 },
          })
        );
      } else {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: trimmed,
                size: 22,
              }),
            ],
            spacing: { after: 80 },
          })
        );
      }
    }
  }
  
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 720,
            right: 720,
            bottom: 720,
            left: 720,
          },
        },
      },
      children,
    }],
  });
  
  const blob = await Packer.toBlob(doc);
  
  // Generate filename
  const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
  const nameParts = cleanName.split(' ');
  const firstName = nameParts[0] || 'Resume';
  const lastName = nameParts.slice(1).join('_') || '';
  const filename = lastName ? `${firstName}_${lastName}_Resume.docx` : `${firstName}_Resume.docx`;
  
  saveAs(blob, filename);
}
