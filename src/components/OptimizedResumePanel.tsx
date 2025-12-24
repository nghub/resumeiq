import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
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
  Minus
} from 'lucide-react';

interface OptimizedResumePanelProps {
  resumeText: string;
  score?: number | null;
  previousScore?: number | null;
  onClose: () => void;
}

export function OptimizedResumePanel({ resumeText, score, previousScore, onClose }: OptimizedResumePanelProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const scoreDiff = score !== null && score !== undefined && previousScore !== null && previousScore !== undefined
    ? score - previousScore 
    : null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(resumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!', description: 'Optimized resume copied to clipboard.' });
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ title: 'Error', description: 'Please allow popups to download PDF.', variant: 'destructive' });
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Optimized Resume</title>
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            margin: 1in;
            color: #000;
          }
          h1, h2, h3 {
            font-family: Arial, sans-serif;
            margin-bottom: 0.5em;
          }
          h1 { font-size: 18pt; }
          h2 { font-size: 14pt; border-bottom: 1px solid #000; padding-bottom: 3px; }
          h3 { font-size: 12pt; }
          p { margin: 0.5em 0; }
          ul { margin: 0.5em 0; padding-left: 1.5em; }
          li { margin-bottom: 0.25em; }
          @media print {
            body { margin: 0.5in; }
          }
        </style>
      </head>
      <body>
        <pre style="white-space: pre-wrap; font-family: inherit;">${resumeText}</pre>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();

    toast({ title: 'PDF Ready', description: 'Use the print dialog to save as PDF.' });
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
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadPDF}
          className="text-xs"
        >
          <Download className="w-3 h-3 mr-1" />
          Download PDF
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="h-[500px] p-4">
        <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
          {resumeText}
        </pre>
      </ScrollArea>
    </motion.div>
  );
}
