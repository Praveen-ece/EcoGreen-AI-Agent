import React from 'react';
import { Award, Leaf } from 'lucide-react';

interface BestChoiceBannerProps {
  productName: string;
  explanation: string;
}

export const BestChoiceBanner: React.FC<BestChoiceBannerProps> = ({ productName, explanation }) => {
  if (!productName || !explanation) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-800 text-white shadow-xl border border-emerald-700/50 p-6 md:p-8">
      {/* Decorative leaf shapes */}
      <div className="absolute right-0 bottom-0 transform translate-x-10 translate-y-10 opacity-10 pointer-events-none">
        <Leaf className="w-64 h-64" />
      </div>

      <div className="flex flex-col md:flex-row gap-5 items-start relative z-10">
        <div className="bg-emerald-700/40 border border-emerald-600/30 p-3 rounded-2xl flex-shrink-0">
          <Award className="w-8 h-8 text-emerald-300" />
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest block">
              ECOPICK RECOMMENDED BEST CHOICE
            </span>
            <h4 className="text-xl md:text-2xl font-extrabold tracking-tight">
              {productName}
            </h4>
          </div>
          
          <p className="text-emerald-100 text-sm md:text-base leading-relaxed max-w-4xl">
            {explanation}
          </p>
        </div>
      </div>
    </div>
  );
};
export default BestChoiceBanner;
