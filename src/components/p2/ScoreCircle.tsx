import { motion } from 'framer-motion';

interface ScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 48, md: 80, lg: 120 };
const strokeMap = { sm: 4, md: 5, lg: 6 };
const fontMap = { sm: 'text-xs', md: 'text-lg', lg: 'text-2xl' };

function getColor(score: number) {
  if (score <= 25) return '#27AE60';
  if (score <= 50) return '#2980B9';
  if (score <= 75) return '#E67E22';
  return '#C0392B';
}

export function ScoreCircle({ score, size = 'md' }: ScoreCircleProps) {
  const px = sizeMap[size];
  const stroke = strokeMap[size];
  const radius = (px - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getColor(score);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: px, height: px }}>
      <svg width={px} height={px} className="-rotate-90">
        <circle cx={px / 2} cy={px / 2} r={radius} fill="none" stroke="var(--p2-gray-200)" strokeWidth={stroke} />
        <motion.circle
          cx={px / 2} cy={px / 2} r={radius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <span className={`absolute font-bold ${fontMap[size]}`} style={{ color }}>{score}</span>
    </div>
  );
}
