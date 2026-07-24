import React, { useEffect, useState } from 'react';

interface SustainabilityScoreGaugeProps {
  score: number;
}

export const SustainabilityScoreGauge: React.FC<SustainabilityScoreGaugeProps> = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate score from 0 to target
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  // Clamp score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, animatedScore));

  let bandLabel = 'Average';
  let bandColor = 'text-amber-500 dark:text-amber-400';
  let bandStroke = '#f59e0b';
  let bandBg = 'bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800';

  if (clampedScore <= 20) {
    bandLabel = 'Very Poor';
    bandColor = 'text-rose-700 dark:text-rose-400';
    bandStroke = '#e11d48';
    bandBg = 'bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800';
  } else if (clampedScore <= 40) {
    bandLabel = 'Poor';
    bandColor = 'text-orange-500 dark:text-orange-400';
    bandStroke = '#f97316';
    bandBg = 'bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800';
  } else if (clampedScore <= 60) {
    bandLabel = 'Average';
    bandColor = 'text-amber-500 dark:text-amber-400';
    bandStroke = '#f59e0b';
    bandBg = 'bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800';
  } else if (clampedScore <= 80) {
    bandLabel = 'Good';
    bandColor = 'text-green-500 dark:text-green-400';
    bandStroke = '#22c55e';
    bandBg = 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800';
  } else {
    bandLabel = 'Excellent';
    bandColor = 'text-emerald-600 dark:text-emerald-400';
    bandStroke = '#059669';
    bandBg = 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800';
  }

  // SVG calculations for circular loader
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center group cursor-help">
        {/* Outer Circular Track */}
        <svg className="w-36 h-36 transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="text-slate-100 dark:text-slate-700"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
          />
          {/* Animated Gauge Path */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke={bandStroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-[1500ms] ease-out drop-shadow-md"
          />
        </svg>

        {/* Center Text Indicator */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black tracking-tight text-slate-800 dark:text-slate-100">
            {clampedScore}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">
            Score
          </span>
        </div>

        {/* Tooltip on Hover */}
        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-3 rounded pointer-events-none whitespace-nowrap shadow-xl">
          0-20: Very Poor | 21-40: Poor | 41-60: Average | 61-80: Good | 81-100: Excellent
        </div>
      </div>

      {/* Band Badge Label */}
      <div className={`mt-5 px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm transition-colors duration-500 ${bandBg} ${bandColor}`}>
        {bandLabel}
      </div>
    </div>
  );
};
export default SustainabilityScoreGauge;
