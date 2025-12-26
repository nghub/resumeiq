import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, 
  Bot, 
  Sparkles, 
  RefreshCw,
  Copy,
  Check,
  Loader2,
  Download,
  FileText
} from 'lucide-react';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  isFullResume?: boolean;
}

interface ResumeCopilotProps {
  resumeText: string;
  jobDescription: string;
  score: number | null;
  onUpdateResume?: (newText: string, isFullRewrite?: boolean) => void;
}

const defaultActions = [
  'Add metrics to experience',
  'Write a cover letter',
  'Fix grammar errors'
];

export function ResumeCopilot({ resumeText, jobDescription, score, onUpdateResume }: ResumeCopilotProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: score 
        ? `Hi! I'm your Resume Copilot. I've analyzed your resume against a job description.\n\n**How can I help you improve your score today?**`
        : `Hi! I'm your Resume Copilot. Upload your resume and job description to get started.\n\n**How can I help you today?**`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generatedResume, setGeneratedResume] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleRewriteResume = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast({ 
        title: 'Missing input', 
        description: 'Please provide both resume and job description first.', 
        variant: 'destructive' 
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: 'Rewrite my entire resume to achieve 95%+ ATS score',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('rewrite-resume', {
        body: { 
          resumeText, 
          jobDescription, 
          mode: 'full_rewrite'
        }
      });

      if (error) throw error;

      const rewrittenResume = data.rewrittenResume || data.response;
      setGeneratedResume(rewrittenResume);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: rewrittenResume,
        timestamp: new Date(),
        isFullResume: true
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (onUpdateResume && rewrittenResume) {
        onUpdateResume(rewrittenResume, true);
      }
    } catch (error: any) {
      console.error('Rewrite error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error while rewriting your resume. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to rewrite resume.', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (message?: string) => {
    const text = message || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('rewrite-resume', {
        body: { 
          resumeText, 
          jobDescription, 
          userMessage: text,
          chatHistory: messages.map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.rewrittenResume || 'I apologize, but I encountered an issue. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.rewrittenResume && onUpdateResume) {
        onUpdateResume(data.rewrittenResume);
      }
    } catch (error: any) {
      console.error('Copilot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to process your request.', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: 'Copied!', description: 'Resume copied to clipboard.' });
  };

  const handleDownloadPDF = async (content: string) => {
    try {
      // Create a simple HTML document for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({ title: 'Error', description: 'Please allow popups to download PDF.', variant: 'destructive' });
        return;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Resume</title>
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
          <pre style="white-space: pre-wrap; font-family: inherit;">${content}</pre>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();

      toast({ title: 'PDF Ready', description: 'Use the print dialog to save as PDF.' });
    } catch (error) {
      console.error('Download error:', error);
      toast({ title: 'Error', description: 'Failed to generate PDF.', variant: 'destructive' });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[600px] bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Resume Copilot</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setMessages([messages[0]]);
            setGeneratedResume(null);
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          New Chat
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={`group relative max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                  <div 
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'bg-muted/50 text-foreground rounded-tl-sm border border-border'
                    }`}
                  >
                    <p className={`text-sm whitespace-pre-wrap leading-relaxed ${message.isFullResume ? 'max-h-[300px] overflow-y-auto' : ''}`}>
                      {message.content.replace(/\*\*/g, '')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => handleCopy(message.content, message.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Full Resume Actions */}
                  {message.isFullResume && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(message.content, message.id)}
                        className="text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Full Resume
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(message.content)}
                        className="text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download PDF
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-3 border border-border">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Rewriting your resume...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Suggested Actions */}
      <div className="px-4 py-3 border-t border-border bg-muted/20">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Suggested Actions
        </p>
        <div className="flex flex-wrap gap-2">
          {/* Main Rewrite Button */}
          <Button
            variant="default"
            size="sm"
            className="text-xs h-8 rounded-full bg-primary hover:bg-primary/90"
            onClick={handleRewriteResume}
            disabled={isLoading || !resumeText.trim() || !jobDescription.trim()}
          >
            <FileText className="w-3 h-3 mr-1" />
            Rewrite Resume (Target 95%)
          </Button>

          {/* Other actions */}
          {defaultActions.map((action) => (
            <Button
              key={action}
              variant="outline"
              size="sm"
              className="text-xs h-8 rounded-full"
              onClick={() => handleSend(action)}
              disabled={isLoading}
            >
              {action}
            </Button>
          ))}

          {/* Show Copy/Download if resume was generated */}
          {generatedResume && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 rounded-full border-green-500/50 text-green-600 hover:bg-green-50"
                onClick={() => handleCopy(generatedResume, 'generated')}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy Resume
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 rounded-full border-blue-500/50 text-blue-600 hover:bg-blue-50"
                onClick={() => handleDownloadPDF(generatedResume)}
              >
                <Download className="w-3 h-3 mr-1" />
                Download PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to rewrite something..."
            className="flex-1 rounded-full bg-muted/30"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full"
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-xs text-center text-muted-foreground mt-2">
          AI can make mistakes.
        </p>
      </div>
    </div>
  );
}
