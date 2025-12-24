import { motion } from 'framer-motion';

interface SantaHatProps {
  className?: string;
}

export function SantaHat({ className = '' }: SantaHatProps) {
  return (
    <motion.svg
      viewBox="0 0 100 70"
      className={className}
      initial={{ rotate: 0, scale: 0 }}
      animate={{ rotate: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      {/* Hat body - Red part curving to the right */}
      <path
        d="M10 55 Q15 25 40 15 Q70 5 85 35 Q88 42 80 48 L75 52 Q45 48 15 55 Z"
        fill="#b22234"
      />
      {/* Hat darker shade */}
      <path
        d="M15 50 Q20 28 40 20 Q60 12 75 35"
        fill="#8b1a28"
        opacity="0.3"
      />
      
      {/* Fluffy white trim - cloud-like bumps sitting on top */}
      <ellipse cx="12" cy="56" rx="10" ry="8" fill="#ffffff" />
      <ellipse cx="25" cy="55" rx="11" ry="9" fill="#ffffff" />
      <ellipse cx="40" cy="54" rx="12" ry="9" fill="#ffffff" />
      <ellipse cx="56" cy="54" rx="11" ry="9" fill="#ffffff" />
      <ellipse cx="72" cy="54" rx="11" ry="8" fill="#ffffff" />
      <ellipse cx="82" cy="52" rx="8" ry="7" fill="#ffffff" />
      
      {/* Inner fluff texture */}
      <ellipse cx="20" cy="56" rx="5" ry="4" fill="#f0f0f0" opacity="0.6" />
      <ellipse cx="48" cy="55" rx="6" ry="4" fill="#f0f0f0" opacity="0.6" />
      <ellipse cx="68" cy="54" rx="5" ry="4" fill="#f0f0f0" opacity="0.6" />
      
      {/* Pompom - fluffy ball at tip */}
      <circle cx="88" cy="32" r="11" fill="#ffffff" />
      <circle cx="84" cy="28" r="6" fill="#ffffff" />
      <circle cx="93" cy="28" r="5" fill="#ffffff" />
      <circle cx="90" cy="38" r="5" fill="#ffffff" />
      {/* Pompom highlights */}
      <circle cx="86" cy="30" r="3" fill="#f8f8f8" />
    </motion.svg>
  );
}
