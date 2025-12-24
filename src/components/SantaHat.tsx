import { motion } from 'framer-motion';

interface SantaHatProps {
  className?: string;
}

export function SantaHat({ className = '' }: SantaHatProps) {
  return (
    <motion.svg
      viewBox="0 0 120 90"
      className={className}
      initial={{ rotate: -12, scale: 0 }}
      animate={{ rotate: -12, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      {/* Hat body - Red part */}
      <path
        d="M25 65 Q30 30 55 20 Q85 10 95 50 L85 62 Q55 55 30 62 Z"
        fill="#b22234"
      />
      {/* Hat darker shade */}
      <path
        d="M30 60 Q35 35 55 25 Q75 18 85 45"
        fill="#8b1a28"
        opacity="0.4"
      />
      
      {/* Fluffy white trim - cloud-like bumps */}
      <ellipse cx="25" cy="68" rx="12" ry="10" fill="#ffffff" />
      <ellipse cx="38" cy="70" rx="11" ry="9" fill="#ffffff" />
      <ellipse cx="52" cy="69" rx="12" ry="10" fill="#ffffff" />
      <ellipse cx="66" cy="70" rx="11" ry="9" fill="#ffffff" />
      <ellipse cx="80" cy="68" rx="12" ry="10" fill="#ffffff" />
      <ellipse cx="90" cy="65" rx="10" ry="8" fill="#ffffff" />
      
      {/* Inner fluff shadows */}
      <ellipse cx="30" cy="70" rx="6" ry="5" fill="#e8e8e8" opacity="0.5" />
      <ellipse cx="55" cy="71" rx="7" ry="5" fill="#e8e8e8" opacity="0.5" />
      <ellipse cx="75" cy="70" rx="6" ry="5" fill="#e8e8e8" opacity="0.5" />
      
      {/* Pompom - fluffy ball */}
      <circle cx="100" cy="48" r="14" fill="#ffffff" />
      <circle cx="95" cy="42" r="8" fill="#ffffff" />
      <circle cx="105" cy="44" r="7" fill="#ffffff" />
      <circle cx="98" cy="55" r="6" fill="#ffffff" />
      {/* Pompom shadows */}
      <circle cx="102" cy="50" r="5" fill="#e8e8e8" opacity="0.4" />
      <circle cx="96" cy="46" r="3" fill="#f5f5f5" opacity="0.6" />
    </motion.svg>
  );
}
