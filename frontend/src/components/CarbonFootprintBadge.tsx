import React from 'react';
import { Leaf, AlertTriangle, Flame } from 'lucide-react';
import { CarbonFootprint } from '../types/product';

interface CarbonFootprintBadgeProps {
  level: CarbonFootprint;
}

export const CarbonFootprintBadge: React.FC<CarbonFootprintBadgeProps> = ({ level }) => {
  let badgeStyle = '';
  let Icon = Leaf;

  switch (level) {
    case 'LOW':
      badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      Icon = Leaf;
      break;
    case 'MEDIUM':
      badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
      Icon = AlertTriangle;
      break;
    case 'HIGH':
      badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
      Icon = Flame;
      break;
    default:
      badgeStyle = 'bg-slate-50 text-slate-600 border-slate-200';
      Icon = AlertTriangle;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${badgeStyle}`}>
      <Icon className="w-3.5 h-3.5" />
      {level} FOOTPRINT
    </span>
  );
};
export default CarbonFootprintBadge;
