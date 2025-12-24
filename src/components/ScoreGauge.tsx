import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

export function ScoreGauge({ score, size = 'md', showLabel = true, label = 'ATS Score' }: ScoreGaugeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'hsl(152, 60%, 42%)'; // excellent
    if (score >= 75) return 'hsl(80, 60%, 45%)'; // good
    if (score >= 50) return 'hsl(38, 92%, 50%)'; // fair
    return 'hsl(0, 72%, 51%)'; // poor
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Work';
  };

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-44 h-44',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <motion.div 
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className={sizeClasses[size]}>
        <CircularProgressbar
          value={score}
          text={`${score}%`}
          styles={buildStyles({
            textSize: '22px',
            pathColor: getScoreColor(score),
            textColor: getScoreColor(score),
            trailColor: 'hsl(220, 15%, 88%)',
            pathTransitionDuration: 1.5,
          })}
        />
      </div>
      {showLabel && (
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p 
            className={`font-bold ${textSizes[size]}`}
            style={{ color: getScoreColor(score) }}
          >
            {getScoreLabel(score)}
          </p>
        </div>
      )}
    </motion.div>
  );
}
