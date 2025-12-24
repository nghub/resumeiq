import { motion } from 'framer-motion';
import { Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScoreGauge } from '@/components/ScoreGauge';

interface ResultsHeaderProps {
  score: number;
  summary: string;
  onNewScan: () => void;
}

export function ResultsHeader({ score, summary, onNewScan }: ResultsHeaderProps) {
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
        <ScoreGauge score={score} size="lg" showLabel={false} />
        
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
