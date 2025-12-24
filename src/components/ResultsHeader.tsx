import { motion } from 'framer-motion';
import { Sparkles, RotateCcw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScoreGauge } from '@/components/ScoreGauge';

interface ResultsHeaderProps {
  score: number;
  summary: string;
  onNewScan: () => void;
  previousScore?: number | null;
  showComparison?: boolean;
  onDismissComparison?: () => void;
}

export function ResultsHeader({ 
  score, 
  summary, 
  onNewScan,
  previousScore,
  showComparison,
  onDismissComparison
}: ResultsHeaderProps) {
  const difference = previousScore !== null && previousScore !== undefined 
    ? score - previousScore 
    : 0;
  const isImproved = difference > 0;
  const isUnchanged = difference === 0;

  return (
    <motion.div
      className="bg-card rounded-xl border border-border p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">ATS Score</h2>
        </div>
        <Button variant="outline" size="sm" onClick={onNewScan} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          New Scan
        </Button>
      </div>

      <div className="flex flex-col items-center text-center">
        {/* Score Comparison Inline */}
        {showComparison && previousScore !== null && previousScore !== undefined ? (
          <div className="w-full">
            <div className="flex items-center justify-center gap-6">
              {/* Previous Score - Smaller */}
              <div className="flex flex-col items-center opacity-60">
                <p className="text-xs text-muted-foreground mb-1">Before</p>
                <ScoreGauge score={previousScore} size="sm" showLabel={false} />
              </div>

              {/* Difference Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${
                  isImproved 
                    ? 'bg-success/10 text-success' 
                    : isUnchanged 
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-destructive/10 text-destructive'
                }`}
              >
                {isImproved ? (
                  <TrendingUp className="w-4 h-4" />
                ) : isUnchanged ? (
                  <Minus className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {isImproved ? '+' : ''}{difference}%
              </motion.div>

              {/* New Score - Larger */}
              <div className="flex flex-col items-center">
                <p className="text-xs text-muted-foreground mb-1">After</p>
                <ScoreGauge score={score} size="md" showLabel={false} />
              </div>
            </div>

            {isImproved && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-success mt-3"
              >
                Your resume is now more ATS-friendly!
              </motion.p>
            )}

            <button
              onClick={onDismissComparison}
              className="text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors"
            >
              Dismiss comparison
            </button>
          </div>
        ) : (
          <ScoreGauge score={score} size="lg" showLabel={false} />
        )}
        
        <div className="mt-6 space-y-2">
          <h3 className="text-xl font-semibold text-card-foreground">Analysis Complete</h3>
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed line-clamp-6">
            {summary}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
