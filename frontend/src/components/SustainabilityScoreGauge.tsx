import React from 'react';

interface SustainabilityScoreGaugeProps {
  score: number;
}

export const SustainabilityScoreGauge: React.FC<SustainabilityScoreGaugeProps> = ({ score }) => {
  // Clamp score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score));

  // Determine score bands
  // 0–20 Very Poor, 21–40 Poor, 41–60 Average, 61–80 Good, 81–100 Excellent
  let bandLabel = 'Average';
  let bandColor = 'text-amber-500';
  let bandStroke = '#f59e0b'; // Amber-500
  let bandBg = 'bg-amber-50 border-amber-200';

  if (clampedScore <= 20) {
    bandLabel = 'Very Poor';
    bandColor = 'text-rose-700';
    bandStroke = '#be123c'; // Rose-700
    bandBg = 'bg-rose-50 border-rose-200';
  } else if (clampedScore <= 40) {
    bandLabel = 'Poor';
    bandColor = 'text-orange-500';
    bandStroke = '#f97316'; // Orange-500
    bandBg = 'bg-orange-50 border-orange-200';
  } else if (clampedScore <= 60) {
    bandLabel = 'Average';
    bandColor = 'text-amber-500';
    bandStroke = '#f59e0b'; // Amber-500
    bandBg = 'bg-amber-50 border-amber-200';
  } else if (clampedScore <= 80) {
    bandLabel = 'Good';
    bandColor = 'text-green-500';
    bandStroke = '#22c55e'; // Green-500
    bandBg = 'bg-green-50 border-green-200';
  } else {
    bandLabel = 'Excellent';
    bandColor = 'text-emerald-600';
    bandStroke = '#059669'; // Emerald-600
    bandBg = 'bg-emerald-50 border-emerald-200';
  }

  // SVG calculations for circular loader
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center">
        {/* Outer Circular Track */}
        <svg className="w-36 h-36 transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="text-slate-100"
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
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text Indicator */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold tracking-tight text-slate-800">
            {clampedScore}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Score
          </span>
        </div>
      </div>

      {/* Band Badge Label */}
      <div className={`mt-4 px-4 py-1.5 rounded-full text-xs font-bold border ${bandBg} ${bandColor} shadow-sm animate-pulse`}>
        {bandLabel}
      </div>
    </div>
  );
};
export default SustainabilityScoreGauge;
