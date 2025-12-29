import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Copy, 
  Check, 
  Download, 
  FileText,
  X,
  Minimize2,
  Maximize2,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  Eye,
  FileType,
  FileType2
} from 'lucide-react';
import { resumeTemplates, TemplateId, colorSchemes } from '@/lib/resumeTemplates';
import { generateResumePDF, parseResumeText, parseResumeIntoSections, orderedSections, generateResumeDocx, generatePlainText, type SectionName } from '@/lib/pdfGenerator';

interface OptimizedResumePanelProps {
  resumeText: string;
  score?: number | null;
  previousScore?: number | null;
  onClose: () => void;
}

// Template preview component that mimics PDF styling
// Get colors for template
function getTemplateColors(templateId: TemplateId) {
  switch (templateId) {
    case 'classic': return colorSchemes.black;
    case 'modern': return colorSchemes.teal;
    case 'executive': return colorSchemes.blue;
    case 'tech': return colorSchemes.gray;
    case 'corporate-navy':
    case 'sapphire-sidebar':
      return { primary: '#0F172A', secondary: '#2563EB', accent: '#3B82F6', text: '#0F172A', muted: '#64748B' };
    case 'azure-minimal':
    case 'royal-rightrail':
      return { primary: '#2563EB', secondary: '#0F172A', accent: '#EFF6FF', text: '#0F172A', muted: '#64748B' };
    default: return colorSchemes.teal;
  }
}

// Template preview component that mimics PDF styling
function ResumePreview({ resumeText, templateId }: { resumeText: string; templateId: TemplateId }) {
  const parsed = parseResumeText(resumeText);
  const { sections } = parseResumeIntoSections(resumeText);
  const template = resumeTemplates.find(t => t.id === templateId);
  const colors = getTemplateColors(templateId);
  
  // Section display names
  const sectionDisplayNames: Record<SectionName, string> = {
    summary: 'SUMMARY',
    experience: 'PROFESSIONAL EXPERIENCE',
    education: 'EDUCATION',
    certifications: 'CERTIFICATIONS',
    skills: 'SKILLS'
  };

  // Helper to detect contact info lines (should be in header only)
  const isContactInfoLine = (line: string) => {
    const trimmed = line.trim();
    if (parsed.email && trimmed.includes(parsed.email)) return true;
    if (parsed.phone && trimmed.includes(parsed.phone)) return true;
    if (parsed.linkedin && trimmed.includes(parsed.linkedin)) return true;
    if ((trimmed.includes('|') || trimmed.includes('•')) && 
        (trimmed.includes('@') || trimmed.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/))) {
      return true;
    }
    return false;
  };

  // Render a section's content with proper formatting
  const renderSectionContent = (sectionName: SectionName, content: string[]) => {
    return content.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;
      
      const isBulletLine = trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*');
      const looksLikeHeader = /^[A-Z][^.!?]*(?:\d{4}|present|current)/i.test(trimmed) ||
                              /^\w+(?:\s+\w+)?(?:\s*[|–-]\s*|\s{2,})/.test(trimmed);
      
      if (isBulletLine) {
        return (
          <div key={idx} className="pl-4" style={{ color: colors.text }}>
            • {trimmed.replace(/^[-•*]\s*/, '')}
          </div>
        );
      } else if (looksLikeHeader) {
        return (
          <div key={idx} className="font-semibold" style={{ color: colors.text }}>
            {trimmed}
          </div>
        );
      } else if (sectionName === 'skills') {
        return (
          <div key={idx} className="pl-4" style={{ color: colors.text }}>
            • {trimmed}
          </div>
        );
      }
      
      return (
        <div key={idx} style={{ color: colors.text }}>
          {trimmed}
        </div>
      );
    });
  };

  // Render ordered sections
  const renderOrderedSections = (filterForSidebar = false) => {
    return orderedSections.map(sectionName => {
      const content = sections[sectionName];
      if (!content || content.filter(l => l.trim()).length === 0) return null;
      
      // For sidebar templates, skip skills/education in main content
      if (filterForSidebar && (sectionName === 'skills' || sectionName === 'education')) {
        return null;
      }
      
      return (
        <div key={sectionName} className="mt-4">
          <div className="mb-2">
            <span className="uppercase text-xs tracking-wide font-bold" style={{ color: colors.primary }}>
              {sectionDisplayNames[sectionName]}
            </span>
            <div className="h-0.5 mt-1" style={{ background: colors.accent, width: '40px' }} />
          </div>
          <div className="space-y-1">
            {renderSectionContent(sectionName, content)}
          </div>
        </div>
      );
    });
  };

  // Sidebar-left layout (Sapphire)
  if (templateId === 'sapphire-sidebar') {
    return (
      <div 
        className="bg-white text-black min-h-[600px] shadow-lg grid grid-cols-3"
        style={{ fontFamily: template?.fontFamily.body || 'Arial, sans-serif', fontSize: '11px', lineHeight: '1.4' }}
      >
        {/* Navy left sidebar */}
        <div className="col-span-1 p-4" style={{ background: '#0F172A', color: 'white' }}>
          <h1 className="text-lg font-bold mb-4 leading-tight">{parsed.name || 'Your Name'}</h1>
          
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wide mb-2 opacity-80">Contact</h3>
            <div className="text-xs space-y-1 opacity-90">
              {parsed.email && <div>{parsed.email}</div>}
              {parsed.phone && <div>{parsed.phone}</div>}
              {parsed.linkedin && <div className="break-all">{parsed.linkedin}</div>}
            </div>
          </div>
          
          {parsed.skills && parsed.skills.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wide mb-2 opacity-80">Skills</h3>
              <div className="text-xs space-y-1 opacity-90">
                {parsed.skills.slice(0, 12).map((skill, idx) => (
                  <div key={idx}>• {skill}</div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Main content - ordered sections */}
        <div className="col-span-2 p-6">
          {renderOrderedSections(true)}
        </div>
      </div>
    );
  }

  // Sidebar-right layout (Royal Right-Rail)
  if (templateId === 'royal-rightrail') {
    return (
      <div 
        className="bg-white text-black min-h-[600px] shadow-lg grid grid-cols-3"
        style={{ fontFamily: template?.fontFamily.body || 'Arial, sans-serif', fontSize: '11px', lineHeight: '1.4' }}
      >
        {/* Main content - ordered sections */}
        <div className="col-span-2 p-6 border-r-2" style={{ borderColor: '#2563EB' }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#0F172A' }}>
            {parsed.name || 'Your Name'}
          </h1>
          
          {renderOrderedSections(true)}
        </div>
        
        {/* Light blue right sidebar */}
        <div className="col-span-1 p-4" style={{ background: '#EFF6FF' }}>
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#0F172A' }}>Contact</h3>
            <div className="text-xs space-y-1" style={{ color: '#64748B' }}>
              {parsed.email && <div>{parsed.email}</div>}
              {parsed.phone && <div>{parsed.phone}</div>}
              {parsed.linkedin && <div className="break-all">{parsed.linkedin}</div>}
            </div>
          </div>
          
          {parsed.skills && parsed.skills.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#0F172A' }}>Skills</h3>
              <div className="text-xs space-y-1" style={{ color: '#64748B' }}>
                {parsed.skills.slice(0, 12).map((skill, idx) => (
                  <div key={idx}>• {skill}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Single column layouts
  const getHeaderStyle = () => {
    switch (templateId) {
      case 'classic':
        return { textAlign: 'center' as const, borderBottom: '2px solid #000' };
      case 'modern':
        return { borderBottom: `3px solid ${colors.accent}`, paddingBottom: '8px' };
      case 'executive':
        return { background: colors.primary, color: 'white', padding: '20px', marginLeft: '-24px', marginRight: '-24px', marginTop: '-24px' };
      case 'tech':
        return { borderBottom: `1px solid ${colors.accent}` };
      case 'corporate-navy':
        return { background: '#0F172A', color: 'white', padding: '20px', marginLeft: '-24px', marginRight: '-24px', marginTop: '-24px' };
      case 'azure-minimal':
        return { textAlign: 'center' as const, paddingBottom: '16px' };
      default:
        return {};
    }
  };

  const getSectionHeaderStyle = () => {
    switch (templateId) {
      case 'classic':
        return { borderBottom: '1px solid #000', color: '#000', fontWeight: 'bold' as const };
      case 'modern':
        return { color: colors.primary, borderBottom: `2px solid ${colors.accent}`, display: 'inline-block' };
      case 'executive':
        return { background: '#f3f4f6', padding: '4px 8px', color: colors.primary, fontWeight: 'bold' as const };
      case 'tech':
        return { color: colors.primary, fontFamily: 'monospace', fontWeight: 'bold' as const };
      case 'corporate-navy':
        return { color: '#2563EB', fontWeight: 'bold' as const, borderBottom: '1px solid #3B82F6', display: 'inline-block' };
      case 'azure-minimal':
        return { color: '#0F172A', fontWeight: 'bold' as const, borderBottom: '2px solid #EFF6FF', display: 'inline-block', paddingBottom: '4px' };
      default:
        return {};
    }
  };

  return (
    <div 
      className="bg-white text-black p-6 min-h-[600px] shadow-lg"
      style={{ fontFamily: template?.fontFamily.body || 'Arial, sans-serif', fontSize: '11px', lineHeight: '1.4' }}
    >
      {/* Header */}
      <div style={getHeaderStyle()} className="mb-4 pb-2">
        <h1 
          style={{ 
            fontSize: templateId === 'azure-minimal' ? '28px' : templateId === 'modern' ? '24px' : templateId === 'executive' || templateId === 'corporate-navy' ? '22px' : '20px',
            fontWeight: 'bold',
            color: templateId === 'executive' || templateId === 'corporate-navy' ? 'white' : templateId === 'modern' || templateId === 'azure-minimal' ? colors.primary : '#000',
            marginBottom: '4px'
          }}
        >
          {parsed.name || 'Your Name'}
        </h1>
        <div style={{ 
          fontSize: '10px', 
          color: templateId === 'executive' || templateId === 'corporate-navy' ? 'rgba(255,255,255,0.9)' : '#666',
          textAlign: templateId === 'azure-minimal' ? 'center' : undefined
        }}>
          {[parsed.email, parsed.phone, parsed.linkedin].filter(Boolean).join(' | ')}
        </div>
      </div>

      {/* Azure Minimal divider */}
      {templateId === 'azure-minimal' && (
        <div className="flex justify-center mb-4">
          <div className="h-0.5 w-32" style={{ background: '#EFF6FF' }} />
        </div>
      )}

      {/* Content - Ordered Sections */}
      <div className="space-y-1">
        {renderOrderedSections(false)}
      </div>
    </div>
  );
}

export function OptimizedResumePanel({ resumeText, score, previousScore, onClose }: OptimizedResumePanelProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('classic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const scoreDiff = score !== null && score !== undefined && previousScore !== null && previousScore !== undefined
    ? score - previousScore 
    : null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(resumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!', description: 'Optimized resume copied to clipboard.' });
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      generateResumePDF(resumeText, selectedTemplate);
      toast({ title: 'Success!', description: 'Resume downloaded as PDF.' });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({ title: 'Error', description: 'Failed to generate PDF.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadDocx = async () => {
    setIsGenerating(true);
    try {
      await generateResumeDocx(resumeText, selectedTemplate);
      toast({ title: 'Success!', description: 'Resume downloaded as DOCX.' });
    } catch (error) {
      console.error('DOCX generation error:', error);
      toast({ title: 'Error', description: 'Failed to generate DOCX.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadTxt = () => {
    try {
      generatePlainText(resumeText);
      toast({ title: 'Success!', description: 'Resume downloaded as TXT.' });
    } catch (error) {
      console.error('TXT generation error:', error);
      toast({ title: 'Error', description: 'Failed to generate TXT.', variant: 'destructive' });
    }
  };

  const getTemplateName = () => {
    return resumeTemplates.find(t => t.id === selectedTemplate)?.name || 'Classic Professional';
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 shadow-lg"
          variant="default"
        >
          <FileText className="w-4 h-4" />
          Optimized Resume
          {score !== null && score !== undefined && (
            <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded">{score}%</span>
          )}
          <Maximize2 className="w-4 h-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-green-500/10 to-emerald-500/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Optimized Resume</h3>
              <span className="text-xs text-muted-foreground">AI Rewritten</span>
            </div>
            
            {/* Score Display */}
            {score !== null && score !== undefined && (
              <div className="flex items-center gap-2 ml-2 px-3 py-1.5 rounded-lg bg-background/50 border border-border">
                <span className="text-xs text-muted-foreground">ATS Score:</span>
                <span className={`text-lg font-bold ${
                  score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {score}%
                </span>
                {scoreDiff !== null && (
                  <span className={`flex items-center text-xs font-medium ${
                    scoreDiff > 0 ? 'text-green-600' : scoreDiff < 0 ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {scoreDiff > 0 ? (
                      <>
                        <TrendingUp className="w-3 h-3 mr-0.5" />
                        +{scoreDiff}
                      </>
                    ) : scoreDiff < 0 ? (
                      <>
                        <TrendingDown className="w-3 h-3 mr-0.5" />
                        {scoreDiff}
                      </>
                    ) : (
                      <>
                        <Minus className="w-3 h-3 mr-0.5" />
                        0
                      </>
                    )}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsMinimized(true)}
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-4 py-2 border-b border-border bg-muted/30">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="text-xs"
          >
            {copied ? <Check className="w-3 h-3 mr-1 text-green-500" /> : <Copy className="w-3 h-3 mr-1" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          
          {/* Template Dropdown + Preview + Download */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-r-none border-r-0"
                >
                  {getTemplateName()}
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-popover border border-border z-50">
                {resumeTemplates.map((template) => (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`cursor-pointer ${selectedTemplate === template.id ? 'bg-accent' : ''}`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{template.name}</span>
                      <span className="text-xs text-muted-foreground">{template.description}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(true)}
              className="text-xs rounded-none border-r-0"
              title="Preview template"
            >
              <Eye className="w-3 h-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  disabled={isGenerating}
                  className="text-xs rounded-l-none"
                >
                  <Download className="w-3 h-3 mr-1" />
                  {isGenerating ? 'Generating...' : 'Download'}
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border border-border z-50">
                <DropdownMenuItem onClick={handleDownloadPDF} className="cursor-pointer">
                  <FileText className="w-4 h-4 mr-2 text-red-500" />
                  <div className="flex flex-col">
                    <span className="font-medium">PDF Format</span>
                    <span className="text-xs text-muted-foreground">Best for sharing</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadDocx} className="cursor-pointer">
                  <FileType className="w-4 h-4 mr-2 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="font-medium">DOCX Format</span>
                    <span className="text-xs text-muted-foreground">Editable in Word</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadTxt} className="cursor-pointer">
                  <FileType2 className="w-4 h-4 mr-2 text-gray-500" />
                  <div className="flex flex-col">
                    <span className="font-medium">Plain Text</span>
                    <span className="text-xs text-muted-foreground">For copy-paste</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="h-[500px] p-4">
          <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
            {resumeText}
          </pre>
        </ScrollArea>
      </motion.div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <DialogTitle className="flex items-center justify-between">
              <span>Template Preview: {getTemplateName()}</span>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      {getTemplateName()}
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border border-border z-[60]">
                    {resumeTemplates.map((template) => (
                      <DropdownMenuItem
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`cursor-pointer ${selectedTemplate === template.id ? 'bg-accent' : ''}`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{template.name}</span>
                          <span className="text-xs text-muted-foreground">{template.description}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      disabled={isGenerating}
                      className="text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      {isGenerating ? 'Generating...' : 'Download'}
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border border-border z-[60]">
                    <DropdownMenuItem onClick={() => { handleDownloadPDF(); setShowPreview(false); }} className="cursor-pointer">
                      <FileText className="w-4 h-4 mr-2 text-red-500" />
                      <span className="font-medium">PDF Format</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { handleDownloadDocx(); setShowPreview(false); }} className="cursor-pointer">
                      <FileType className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="font-medium">DOCX Format</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { handleDownloadTxt(); setShowPreview(false); }} className="cursor-pointer">
                      <FileType2 className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="font-medium">Plain Text</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-80px)]">
            <div className="p-6 bg-muted/30">
              <div className="max-w-[612px] mx-auto border border-border shadow-xl">
                <ResumePreview resumeText={resumeText} templateId={selectedTemplate} />
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
