import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalysisStep {
  id: string;
  label: string;
  duration: number; // ms
}

const ANALYSIS_STEPS: AnalysisStep[] = [
  { id: 'parse', label: 'Parsing document structure...', duration: 1500 },
  { id: 'extract', label: 'Extracting candidate profile...', duration: 2000 },
  { id: 'match', label: 'Matching skills against JD...', duration: 2500 },
  { id: 'keywords', label: 'Analyzing ATS keywords...', duration: 2000 },
  { id: 'score', label: 'Calculating score impact...', duration: 1500 },
];

interface AnalysisLoaderProps {
  isAnalyzing: boolean;
}

export function AnalysisLoader({ isAnalyzing }: AnalysisLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    let stepIndex = 0;
    let elapsed = 0;
    const totalDuration = ANALYSIS_STEPS.reduce((sum, s) => sum + s.duration, 0);

    const interval = setInterval(() => {
      elapsed += 100;
      
      // Calculate which step we're on
      let accumulatedTime = 0;
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        accumulatedTime += ANALYSIS_STEPS[i].duration;
        if (elapsed < accumulatedTime) {
          stepIndex = i;
          break;
        }
        stepIndex = i;
      }
      
      setCurrentStep(stepIndex);
      setProgress(Math.min((elapsed / totalDuration) * 100, 99));
    }, 100);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  if (!isAnalyzing) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
      >
        <div className="w-full max-w-md px-6 text-center">
          {/* Circular Progress */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative mx-auto mb-8 w-32 h-32"
          >
            {/* Outer ring */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="4"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={283}
                strokeDashoffset={283 - (283 * progress) / 100}
                className="drop-shadow-[0_0_8px_hsl(var(--primary))]"
              />
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Zap className="w-6 h-6 text-primary mb-1" />
              <span className="text-2xl font-bold text-foreground">
                {Math.round(progress)}%
              </span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="text-xl font-semibold text-foreground mb-1">
              AI Analysis in Progress
            </h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we analyze your resume
            </p>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>

          {/* Steps */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 text-left"
          >
            {ANALYSIS_STEPS.map((step, index) => {
              const isComplete = index < currentStep;
              const isActive = index === currentStep;
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  {/* Status icon */}
                  <div className="relative">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                        isComplete && "border-primary bg-primary",
                        isActive && "border-primary",
                        !isComplete && !isActive && "border-muted-foreground/30"
                      )}
                    >
                      {isComplete ? (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      ) : isActive ? (
                        <Loader2 className="w-3 h-3 text-primary animate-spin" />
                      ) : null}
                    </div>
                    
                    {/* Connecting line */}
                    {index < ANALYSIS_STEPS.length - 1 && (
                      <div
                        className={cn(
                          "absolute left-1/2 top-6 w-0.5 h-4 -translate-x-1/2 transition-colors duration-300",
                          isComplete ? "bg-primary" : "bg-muted-foreground/30"
                        )}
                      />
                    )}
                  </div>
                  
                  {/* Label */}
                  <span
                    className={cn(
                      "text-sm transition-colors duration-300",
                      isComplete && "text-muted-foreground",
                      isActive && "text-foreground font-medium",
                      !isComplete && !isActive && "text-muted-foreground/50"
                    )}
                  >
                    {step.label}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
