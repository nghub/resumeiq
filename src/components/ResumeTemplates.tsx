import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Check, 
  Eye, 
  Palette,
  X,
  FileType,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  resumeTemplates, 
  defaultCustomization,
  type TemplateId, 
  type TemplateCustomization 
} from '@/lib/resumeTemplates';
import { generateResumePDF, generatePlainText } from '@/lib/pdfGenerator';

interface ResumeTemplatesProps {
  resumeText: string;
  optimizedResume?: string | null;
  contactName?: string;
}

const templatePreviews: Record<TemplateId, React.ReactNode> = {
  classic: (
    <div className="w-full h-full bg-white p-3 text-[6px] font-sans">
      <div className="text-center border-b border-black pb-1 mb-1">
        <div className="font-bold text-[8px]">JOHN DOE</div>
        <div className="text-gray-600">email@example.com | (555) 123-4567</div>
      </div>
      <div className="space-y-1">
        <div className="font-bold border-b border-gray-300">EXPERIENCE</div>
        <div className="text-gray-700">Senior Developer at Tech Corp</div>
        <div className="font-bold border-b border-gray-300 mt-1">EDUCATION</div>
        <div className="text-gray-700">B.S. Computer Science</div>
      </div>
    </div>
  ),
  modern: (
    <div className="w-full h-full bg-white p-3 text-[6px] font-sans">
      <div className="mb-2">
        <div className="font-bold text-[9px] text-teal-600">John Doe</div>
        <div className="text-gray-500 text-[5px]">email@example.com</div>
        <div className="w-8 h-[2px] bg-teal-400 mt-1" />
      </div>
      <div className="space-y-1">
        <div className="font-bold text-teal-600 text-[7px]">EXPERIENCE</div>
        <div className="text-gray-700">Senior Developer</div>
        <div className="flex gap-1 mt-1">
          <span className="bg-teal-50 text-teal-700 px-1 rounded text-[5px]">React</span>
          <span className="bg-teal-50 text-teal-700 px-1 rounded text-[5px]">Node.js</span>
        </div>
      </div>
    </div>
  ),
  executive: (
    <div className="w-full h-full bg-white text-[6px] font-serif">
      <div className="bg-slate-800 text-white p-2 mb-2">
        <div className="font-bold text-[9px]">JOHN DOE</div>
        <div className="text-slate-300 text-[5px]">email@example.com</div>
      </div>
      <div className="px-3 space-y-1">
        <div className="bg-gray-100 px-1 font-bold text-[7px]">EXPERIENCE</div>
        <div className="text-gray-700">Executive Director</div>
        <div className="bg-gray-100 px-1 font-bold text-[7px] mt-1">EDUCATION</div>
        <div className="text-gray-700">MBA, Harvard</div>
      </div>
    </div>
  ),
  tech: (
    <div className="w-full h-full bg-white p-3 text-[6px] font-mono">
      <div className="mb-2">
        <div className="font-bold text-[8px]">John Doe</div>
        <div className="text-gray-500 text-[5px]">✉ email • 🔗 github.com/johndoe</div>
        <div className="border-t border-sky-400 mt-1" />
      </div>
      <div className="space-y-1">
        <div className="font-bold text-gray-600 text-[7px]">// SKILLS</div>
        <div className="grid grid-cols-2 gap-1 text-[5px]">
          <span>JavaScript</span>
          <span>Python</span>
          <span>Go</span>
          <span>Rust</span>
        </div>
      </div>
    </div>
  ),
  'corporate-navy': (
    <div className="w-full h-full bg-white text-[6px] font-sans">
      <div className="p-2 mb-2" style={{ background: '#0F172A' }}>
        <div className="font-bold text-[9px] text-white">JOHN DOE</div>
        <div className="text-[5px] text-white/80">email@example.com | (555) 123-4567</div>
      </div>
      <div className="px-3 space-y-1">
        <div className="font-bold text-[7px]" style={{ color: '#2563EB' }}>EXPERIENCE</div>
        <div className="text-gray-700">Senior Developer</div>
        <div className="font-bold text-[7px] mt-1" style={{ color: '#2563EB' }}>SKILLS</div>
        <div className="text-gray-700">React, TypeScript</div>
      </div>
    </div>
  ),
  'azure-minimal': (
    <div className="w-full h-full bg-white p-3 text-[6px] font-sans text-center">
      <div className="mb-2">
        <div className="font-bold text-[10px]" style={{ color: '#2563EB' }}>John Doe</div>
        <div className="text-gray-500 text-[5px]">email@example.com | (555) 123-4567</div>
        <div className="mx-auto w-12 h-[2px] mt-2" style={{ background: '#EFF6FF' }} />
      </div>
      <div className="text-left space-y-1">
        <div className="font-bold text-[7px]" style={{ color: '#0F172A' }}>EXPERIENCE</div>
        <div className="text-gray-700">Senior Developer at Tech Corp</div>
      </div>
    </div>
  ),
  'sapphire-sidebar': (
    <div className="w-full h-full bg-white text-[6px] font-sans grid grid-cols-3">
      <div className="col-span-1 p-2 text-white" style={{ background: '#0F172A' }}>
        <div className="font-bold text-[7px] mb-2">John Doe</div>
        <div className="text-[5px] opacity-80 mb-2">
          <div>CONTACT</div>
          <div className="opacity-70">email@ex.com</div>
        </div>
        <div className="text-[5px] opacity-80">
          <div>SKILLS</div>
          <div className="opacity-70">React, Node</div>
        </div>
      </div>
      <div className="col-span-2 p-2">
        <div className="font-bold text-[7px]" style={{ color: '#2563EB' }}>EXPERIENCE</div>
        <div className="text-gray-700">Senior Dev</div>
      </div>
    </div>
  ),
  'royal-rightrail': (
    <div className="w-full h-full bg-white text-[6px] font-sans grid grid-cols-3">
      <div className="col-span-2 p-2 border-r-2" style={{ borderColor: '#2563EB' }}>
        <div className="font-bold text-[8px] mb-1" style={{ color: '#0F172A' }}>John Doe</div>
        <div className="font-bold text-[7px]" style={{ color: '#0F172A' }}>EXPERIENCE</div>
        <div className="text-gray-700">Senior Developer</div>
      </div>
      <div className="col-span-1 p-2" style={{ background: '#EFF6FF' }}>
        <div className="text-[5px] mb-2">
          <div className="font-bold" style={{ color: '#0F172A' }}>CONTACT</div>
          <div className="text-gray-600">email@ex.com</div>
        </div>
        <div className="text-[5px]">
          <div className="font-bold" style={{ color: '#0F172A' }}>SKILLS</div>
          <div className="text-gray-600">React, Node</div>
        </div>
      </div>
    </div>
  ),
};

export function ResumeTemplates({ resumeText, optimizedResume, contactName }: ResumeTemplatesProps) {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('classic');
  const [customization, setCustomization] = useState<TemplateCustomization>(defaultCustomization);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const textToUse = optimizedResume || resumeText;
  
  const handleDownloadPDF = async () => {
    if (!textToUse) {
      toast({ 
        title: 'No resume content', 
        description: 'Please analyze your resume first.', 
        variant: 'destructive' 
      });
      return;
    }
    
    setGenerating(true);
    try {
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      generateResumePDF(textToUse, selectedTemplate, customization, contactName);
      toast({ 
        title: 'Resume downloaded!', 
        description: 'Your professional PDF has been generated.' 
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({ 
        title: 'Download failed', 
        description: 'Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setGenerating(false);
    }
  };
  
  const handleDownloadTXT = () => {
    if (!textToUse) {
      toast({ 
        title: 'No resume content', 
        description: 'Please analyze your resume first.', 
        variant: 'destructive' 
      });
      return;
    }
    
    generatePlainText(textToUse, contactName);
    toast({ title: 'Text file downloaded!' });
  };
  
  const selectedTemplateData = resumeTemplates.find(t => t.id === selectedTemplate)!;
  
  return (
    <motion.div
      className="bg-card rounded-xl border border-border p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-card-foreground">Format & Download Resume</h3>
      </div>
      
      {/* Template Gallery */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {resumeTemplates.map((template) => (
          <motion.button
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={`relative aspect-[3/4] rounded-lg border-2 overflow-hidden transition-all ${
              selectedTemplate === template.id 
                ? 'border-primary ring-2 ring-primary/20' 
                : 'border-border hover:border-primary/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Template Preview */}
            <div className="absolute inset-0 bg-muted">
              {templatePreviews[template.id]}
            </div>
            
            {/* Selected Indicator */}
            {selectedTemplate === template.id && (
              <motion.div
                className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Check className="w-3 h-3 text-primary-foreground" />
              </motion.div>
            )}
            
            {/* Template Name */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p className="text-[10px] font-medium text-white">{template.name}</p>
            </div>
          </motion.button>
        ))}
      </div>
      
      {/* Selected Template Info */}
      <div className="bg-muted/30 rounded-lg p-4 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-foreground">{selectedTemplateData.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">{selectedTemplateData.description}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCustomizeOpen(true)}
            >
              <Palette className="w-4 h-4 mr-1" />
              Customize
            </Button>
          </div>
        </div>
      </div>
      
      {/* ATS Friendly Note */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <CheckCircle2 className="w-4 h-4 text-score-good" />
        <span>All templates are ATS-friendly with single-column layouts and standard fonts</span>
      </div>
      
      {/* Download Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="gradient"
          onClick={handleDownloadPDF}
          disabled={generating || !textToUse}
          className="flex-1 min-w-[160px]"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleDownloadTXT}
          disabled={!textToUse}
        >
          <FileType className="w-4 h-4 mr-2" />
          Download TXT
        </Button>
      </div>
      
      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview: {selectedTemplateData.name}</DialogTitle>
          </DialogHeader>
          <div className="bg-white rounded-lg shadow-lg aspect-[8.5/11] overflow-hidden">
            <div className="transform scale-150 origin-top-left w-[66.67%] h-full">
              {templatePreviews[selectedTemplate]}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            <Button variant="gradient" onClick={() => {
              setPreviewOpen(false);
              handleDownloadPDF();
            }}>
              <Download className="w-4 h-4 mr-2" />
              Download This Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Customization Modal */}
      <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customize Template</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Color Scheme */}
            <div className="space-y-3">
              <Label>Color Scheme</Label>
              <RadioGroup
                value={customization.colorScheme}
                onValueChange={(v) => setCustomization(prev => ({ ...prev, colorScheme: v as any }))}
                className="flex gap-3"
              >
                {(['blue', 'teal', 'gray', 'black', 'navy'] as const).map(color => (
                  <div key={color} className="flex items-center gap-2">
                    <RadioGroupItem value={color} id={`color-${color}`} />
                    <Label htmlFor={`color-${color}`} className="capitalize cursor-pointer">
                      <span className={`inline-block w-4 h-4 rounded-full mr-1 ${
                        color === 'blue' ? 'bg-blue-600' :
                        color === 'teal' ? 'bg-teal-600' :
                        color === 'gray' ? 'bg-gray-600' :
                        color === 'navy' ? 'bg-slate-900' :
                        'bg-black'
                      }`} />
                      {color}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            {/* Font Selection */}
            <div className="space-y-3">
              <Label>Font Family</Label>
              <RadioGroup
                value={customization.fontFamily}
                onValueChange={(v) => setCustomization(prev => ({ ...prev, fontFamily: v as any }))}
                className="grid grid-cols-2 gap-2"
              >
                {(['arial', 'calibri', 'georgia', 'times'] as const).map(font => (
                  <div key={font} className="flex items-center gap-2">
                    <RadioGroupItem value={font} id={`font-${font}`} />
                    <Label 
                      htmlFor={`font-${font}`} 
                      className="capitalize cursor-pointer"
                      style={{ fontFamily: font === 'times' ? 'Times New Roman' : font }}
                    >
                      {font === 'times' ? 'Times New Roman' : font}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            {/* Spacing */}
            <div className="space-y-3">
              <Label>Spacing</Label>
              <RadioGroup
                value={customization.spacing}
                onValueChange={(v) => setCustomization(prev => ({ ...prev, spacing: v as any }))}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="compact" id="spacing-compact" />
                  <Label htmlFor="spacing-compact" className="cursor-pointer">Compact</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="comfortable" id="spacing-comfortable" />
                  <Label htmlFor="spacing-comfortable" className="cursor-pointer">Comfortable</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Show/Hide Sections */}
            <div className="space-y-3">
              <Label>Optional Sections</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-certs" className="cursor-pointer">Show Certifications</Label>
                  <Switch
                    id="show-certs"
                    checked={customization.showCertifications}
                    onCheckedChange={(v) => setCustomization(prev => ({ ...prev, showCertifications: v }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-langs" className="cursor-pointer">Show Languages</Label>
                  <Switch
                    id="show-langs"
                    checked={customization.showLanguages}
                    onCheckedChange={(v) => setCustomization(prev => ({ ...prev, showLanguages: v }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-volunteer" className="cursor-pointer">Show Volunteer Work</Label>
                  <Switch
                    id="show-volunteer"
                    checked={customization.showVolunteer}
                    onCheckedChange={(v) => setCustomization(prev => ({ ...prev, showVolunteer: v }))}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setCustomization(defaultCustomization)}
            >
              Reset to Default
            </Button>
            <Button 
              variant="gradient"
              onClick={() => {
                setCustomizeOpen(false);
                toast({ title: 'Customization applied!', description: 'Your preferences have been saved.' });
              }}
            >
              Apply Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
