import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

interface KeywordItem {
  keyword: string;
  jdCount: number;
  resumeCount: number;
}

interface KeywordDensityCardProps {
  keywords: KeywordItem[];
}

export function KeywordDensityCard({ keywords }: KeywordDensityCardProps) {
  const maxCount = Math.max(...keywords.map(k => Math.max(k.jdCount, k.resumeCount)));

  return (
    <motion.div
      className="bg-card rounded-xl border border-border p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-card-foreground">Keyword Density</h3>
      </div>

      <div className="space-y-4">
        {keywords.map((item, index) => {
          const jdWidth = (item.jdCount / maxCount) * 100;
          const resumeWidth = (item.resumeCount / maxCount) * 100;
          const isGoodMatch = item.resumeCount >= item.jdCount * 0.7;

          return (
            <motion.div
              key={item.keyword}
              className="space-y-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-card-foreground text-sm">{item.keyword}</span>
                <span className="text-xs text-muted-foreground">
                  JD: {item.jdCount} | You: {item.resumeCount}
                </span>
              </div>
              <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
                {/* JD bar (background) */}
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary/30 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${jdWidth}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.05 }}
                />
                {/* Resume bar (foreground) */}
                <motion.div
                  className={`absolute inset-y-0 left-0 rounded-full ${isGoodMatch ? 'bg-score-good' : 'bg-warning'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${resumeWidth}%` }}
                  transition={{ duration: 0.8, delay: 0.4 + index * 0.05 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary/30" />
          <span className="text-xs text-muted-foreground">Target (JD)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-score-good" />
          <span className="text-xs text-muted-foreground">Good Match</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-xs text-muted-foreground">Low Count</span>
        </div>
      </div>
    </motion.div>
  );
}
