'use client';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export default function LeadScoreRing({
  score,
  size = 56,
  strokeWidth = 4,
  showLabel = true,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 70) return { stroke: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' };
    if (score >= 40) return { stroke: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' };
    return { stroke: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' };
  };

  const colors = getColor();

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill={colors.bg}
            stroke="rgba(148, 163, 184, 0.1)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="score-ring"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-sm font-bold"
            style={{ color: colors.text }}
          >
            {score}
          </span>
        </div>
      </div>
      {showLabel && (
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: colors.text }}
        >
          {score >= 70 ? 'Hot' : score >= 40 ? 'Warm' : 'Cold'}
        </span>
      )}
    </div>
  );
}
