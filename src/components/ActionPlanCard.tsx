import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, ChevronDown, ChevronUp, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { LineFeedback } from '@/types/resume';

interface ActionPlanCardProps {
  feedback: LineFeedback;
  index: number;
}

export function ActionPlanCard({ feedback, index }: ActionPlanCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Text copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-card rounded-xl border border-border overflow-hidden"
    >
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-destructive" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-card-foreground capitalize truncate">
              {feedback.type === 'keyword' && 'Missing Keyword'}
              {feedback.type === 'vague' && 'Vague Language'}
              {feedback.type === 'missing' && 'Missing Information'}
              {feedback.type === 'impact' && 'Add Impact'}
            </h4>
            <p className="text-sm text-muted-foreground truncate">{feedback.issue}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-score-good/10 text-score-good text-xs font-medium rounded-full">
            <TrendingUp className="w-3 h-3" />
            +{feedback.scoreImpact} pts
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Before */}
              <div className="space-y-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Before</span>
                <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-card-foreground">{feedback.originalText}</p>
                </div>
              </div>

              {/* Recommended */}
              <div className="space-y-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Recommendation</span>
                <div className="p-3 bg-score-good/5 border border-score-good/20 rounded-lg relative group">
                  <p className="text-sm text-card-foreground pr-10">{feedback.suggestion}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(feedback.suggestion);
                    }}
                  >
                    {copied ? <Check className="w-4 h-4 text-score-good" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
