import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

interface ScoreComparisonProps {
  oldScore: number;
  newScore: number;
  onDismiss: () => void;
}

export function ScoreComparison({ oldScore, newScore, onDismiss }: ScoreComparisonProps) {
  const difference = newScore - oldScore;
  const isImproved = difference > 0;
  const isUnchanged = difference === 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'hsl(var(--success))';
    if (score >= 60) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card rounded-xl border border-border p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-card-foreground">Score Comparison</h3>
        </div>
        <button
          onClick={onDismiss}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Dismiss
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 items-center">
        {/* Old Score */}
        <div className="flex flex-col items-center">
          <p className="text-sm text-muted-foreground mb-2">Before</p>
          <div className="w-24 h-24">
            <CircularProgressbar
              value={oldScore}
              text={`${oldScore}%`}
              styles={buildStyles({
                textSize: '24px',
                pathColor: getScoreColor(oldScore),
                textColor: 'hsl(var(--foreground))',
                trailColor: 'hsl(var(--muted))',
              })}
            />
          </div>
        </div>

        {/* Difference */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              isImproved 
                ? 'bg-success/10 text-success' 
                : isUnchanged 
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-destructive/10 text-destructive'
            }`}
          >
            {isImproved ? (
              <TrendingUp className="w-5 h-5" />
            ) : isUnchanged ? (
              <Minus className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            <span className="text-lg font-bold">
              {isImproved ? '+' : ''}{difference}%
            </span>
          </motion.div>
          <p className="text-sm text-muted-foreground mt-2">
            {isImproved ? 'Improvement!' : isUnchanged ? 'No change' : 'Decreased'}
          </p>
        </div>

        {/* New Score */}
        <div className="flex flex-col items-center">
          <p className="text-sm text-muted-foreground mb-2">After</p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-24 h-24"
          >
            <CircularProgressbar
              value={newScore}
              text={`${newScore}%`}
              styles={buildStyles({
                textSize: '24px',
                pathColor: getScoreColor(newScore),
                textColor: 'hsl(var(--foreground))',
                trailColor: 'hsl(var(--muted))',
              })}
            />
          </motion.div>
        </div>
      </div>

      {isImproved && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-success mt-4"
        >
          🎉 Great job! Your resume is now more ATS-friendly.
        </motion.p>
      )}
    </motion.div>
  );
}
