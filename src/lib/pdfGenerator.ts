import { jsPDF } from 'jspdf';
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
  }
  
  // Add resume content - clean text version
  const cleanLines = resumeText.split('\n');
  let currentSection = '';
  
  cleanLines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      y += lineHeight / 2;
      return;
    }
    
    // Check if we need a new page
    if (y > pageHeight - margin - 40) {
      doc.addPage();
      y = margin;
    }
    
    // Detect section headers
    const sectionHeaders = ['summary', 'experience', 'education', 'skills', 'certifications', 'projects', 'work history', 'professional experience', 'technical skills'];
    const isHeader = sectionHeaders.some(h => trimmed.toLowerCase().includes(h) && trimmed.length < 40);
    
    if (isHeader) {
      y += 8;
      currentSection = trimmed;
      
      if (templateId === 'executive') {
        // Gray background for headers
        doc.setFillColor('#f3f4f6');
        doc.rect(margin - 4, y - 12, contentWidth + 8, 18, 'F');
      }
      
      addText(trimmed.toUpperCase(), margin, contentWidth, {
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
      return;
    }
    
    // Bullet points
    if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
      const bulletText = trimmed.replace(/^[-•*]\s*/, '');
      addText(`• ${bulletText}`, margin + 12, contentWidth - 12, {
        fontSize: 10,
        color: colors.text,
      });
      return;
    }
    
    // Regular text
    addText(trimmed, margin, contentWidth, {
      fontSize: 10,
      color: colors.text,
    });
  });
  
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
