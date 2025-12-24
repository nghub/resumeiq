import { motion } from 'framer-motion';

interface SantaHatProps {
  className?: string;
}

export function SantaHat({ className = '' }: SantaHatProps) {
  return (
    <motion.svg
      viewBox="0 0 100 80"
      className={className}
      initial={{ rotate: -15, scale: 0 }}
      animate={{ rotate: -15, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      {/* Hat body - Red part */}
      <path
        d="M15 55 Q20 20 50 15 Q80 10 85 45 L75 55 Q50 50 25 55 Z"
        fill="#c41e3a"
      />
      {/* Hat highlight */}
      <path
        d="M20 50 Q25 25 50 20 Q65 18 70 35"
        fill="none"
        stroke="#e63946"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* White fur trim */}
      <ellipse cx="50" cy="58" rx="38" ry="10" fill="#ffffff" />
      <ellipse cx="50" cy="58" rx="38" ry="10" fill="url(#furGradient)" />
      {/* Pompom */}
      <circle cx="88" cy="42" r="10" fill="#ffffff" />
      <circle cx="86" cy="40" r="3" fill="#f0f0f0" />
      
      <defs>
        <radialGradient id="furGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e8e8e8" />
        </radialGradient>
      </defs>
    </motion.svg>
  );
}
