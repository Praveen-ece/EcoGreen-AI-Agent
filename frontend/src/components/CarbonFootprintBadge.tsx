import { CloudRain } from 'lucide-react';

import { CarbonFootprint } from '../types/product';

interface Props {
  level: CarbonFootprint | 'Unknown';
}

export const CarbonFootprintBadge: React.FC<Props> = ({ level }) => {
  let color = 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
  let iconColor = 'text-slate-400';
  
  if (level === 'LOW') {
    color = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
    iconColor = 'text-emerald-500';
  } else if (level === 'MEDIUM') {
    color = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
    iconColor = 'text-amber-500';
  } else if (level === 'HIGH') {
    color = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
    iconColor = 'text-rose-500';
  }

  return (
    <div className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-xs shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-help ${color}`}>
      <CloudRain className={`w-4 h-4 ${iconColor} group-hover:animate-pulse`} />
      <span className="uppercase tracking-wider">{level} Carbon</span>
    </div>
  );
};
export default CarbonFootprintBadge;
