import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Snowflake {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

interface SnowfallProps {
  isActive: boolean;
}

export function Snowfall({ isActive }: SnowfallProps) {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    if (isActive) {
      const flakes: Snowflake[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 3 + 4,
        delay: Math.random() * 5,
      }));
      setSnowflakes(flakes);
    } else {
      setSnowflakes([]);
    }
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {snowflakes.map((flake) => (
            <motion.div
              key={flake.id}
              className="absolute rounded-full bg-white dark:bg-blue-100"
              style={{
                left: `${flake.x}%`,
                width: flake.size,
                height: flake.size,
                boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
              }}
              initial={{ y: -20, opacity: 0 }}
              animate={{
                y: '100vh',
                opacity: [0, 1, 1, 0],
                x: [0, 20, -20, 10, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: flake.duration,
                delay: flake.delay,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
