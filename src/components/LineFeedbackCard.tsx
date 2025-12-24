import { motion } from 'framer-motion';
import { AlertCircle, Lightbulb, TrendingUp, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LineFeedback, OptimizedLine } from '@/types/resume';
import { cn } from '@/lib/utils';

interface LineFeedbackCardProps {
  feedback: LineFeedback;
  optimized?: OptimizedLine;
  onAccept?: (lineId: string) => void;
  onReject?: (lineId: string) => void;
  index: number;
}

export function LineFeedbackCard({ 
  feedback, 
  optimized,
  onAccept, 
  onReject, 
  index 
}: LineFeedbackCardProps) {
  const getTypeIcon = (type: LineFeedback['type']) => {
    switch (type) {
      case 'keyword': return <AlertCircle className="w-4 h-4" />;
      case 'vague': return <Lightbulb className="w-4 h-4" />;
      case 'missing': return <AlertCircle className="w-4 h-4" />;
      case 'impact': return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: LineFeedback['type']) => {
    switch (type) {
      case 'keyword': return 'text-warning bg-warning/10 border-warning/30';
      case 'vague': return 'text-info bg-info/10 border-info/30';
      case 'missing': return 'text-destructive bg-destructive/10 border-destructive/30';
      case 'impact': return 'text-success bg-success/10 border-success/30';
    }
  };

  const getScoreImpactColor = (impact: number) => {
    if (impact >= 5) return 'text-success';
    if (impact >= 2) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <motion.div
      className="bg-card rounded-xl border border-border p-5 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      {/* Section badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {feedback.section}
        </span>
        <span className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
          getTypeColor(feedback.type)
        )}>
          {getTypeIcon(feedback.type)}
          {feedback.type}
        </span>
      </div>

      {/* Original text */}
      <div className="highlight-issue mb-4">
        <p className="text-sm font-mono text-card-foreground">{feedback.originalText}</p>
      </div>

      {/* Issue */}
      <div className="flex items-start gap-2 mb-3">
        <span className="text-destructive font-medium text-sm">❌ Issue:</span>
        <p className="text-sm text-muted-foreground">{feedback.issue}</p>
      </div>

      {/* Suggestion or Optimized */}
      {optimized ? (
        <div className="space-y-3">
          <div className="highlight-improved">
            <p className="text-sm font-mono text-card-foreground">{optimized.optimizedText}</p>
          </div>
          {!optimized.accepted && onAccept && onReject && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="success"
                onClick={() => onAccept(feedback.id)}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject(feedback.id)}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
          {optimized.accepted && (
            <div className="flex items-center gap-2 text-success text-sm">
              <Check className="w-4 h-4" />
              <span className="font-medium">Change accepted</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-start gap-2 mb-3">
          <span className="text-success font-medium text-sm">✅ Suggestion:</span>
          <p className="text-sm text-muted-foreground">{feedback.suggestion}</p>
        </div>
      )}

      {/* Score impact */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
        <TrendingUp className={cn("w-4 h-4", getScoreImpactColor(feedback.scoreImpact))} />
        <span className={cn("text-sm font-medium", getScoreImpactColor(feedback.scoreImpact))}>
          +{feedback.scoreImpact}% potential score increase
        </span>
      </div>
    </motion.div>
  );
}
