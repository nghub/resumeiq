import { motion } from 'framer-motion';
import { Sparkles, Briefcase, Hash, Target } from 'lucide-react';
import type { ScoreBreakdown } from '@/types/resume';

interface ScoreBreakdownCardProps {
  breakdown: ScoreBreakdown;
}

const categories = [
  { key: 'skills', label: 'Skills Match', icon: Sparkles, weight: '40%' },
  { key: 'experience', label: 'Experience', icon: Briefcase, weight: '30%' },
  { key: 'keywords', label: 'Keywords', icon: Hash, weight: '20%' },
  { key: 'roleAlignment', label: 'Role Alignment', icon: Target, weight: '10%' },
] as const;

export function ScoreBreakdownCard({ breakdown }: ScoreBreakdownCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-score-excellent';
    if (score >= 75) return 'bg-score-good';
    if (score >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  const getTextColor = (score: number) => {
    if (score >= 90) return 'text-score-excellent';
    if (score >= 75) return 'text-score-good';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <motion.div
      className="bg-card rounded-xl border border-border p-6 shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <h3 className="text-lg font-semibold mb-4 text-card-foreground">Score Breakdown</h3>
      <div className="space-y-4">
        {categories.map(({ key, label, icon: Icon, weight }, index) => {
          const score = breakdown[key] ?? 0;
          return (
            <motion.div
              key={key}
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-card-foreground">{label}</span>
                  <span className="text-xs text-muted-foreground">({weight})</span>
                </div>
                <span className={`text-sm font-bold ${getTextColor(score)}`}>
                  {score}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${getScoreColor(score)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, delay: 0.3 + 0.1 * index, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
