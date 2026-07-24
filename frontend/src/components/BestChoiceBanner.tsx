import React from 'react';
import { Award, Leaf, ArrowRight, Sparkles } from 'lucide-react';

interface BestChoiceBannerProps {
  productName: string;
  explanation: string;
}

export const BestChoiceBanner: React.FC<BestChoiceBannerProps> = ({ productName, explanation }) => {
  if (!productName || !explanation) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-xl shadow-emerald-900/20 border-2 border-emerald-600/50 p-6 md:p-8 h-full flex flex-col justify-between group transition-transform hover:-translate-y-1">
      {/* Decorative leaf shapes */}
      <div className="absolute right-0 bottom-0 transform translate-x-12 translate-y-12 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
        <Leaf className="w-64 h-64" />
      </div>
      
      {/* Sparkles */}
      <div className="absolute top-4 right-8 opacity-20 group-hover:opacity-60 transition-opacity animate-pulse">
        <Sparkles className="w-12 h-12 text-yellow-300" />
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
        <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 p-4 rounded-2xl flex-shrink-0 shadow-lg shadow-yellow-500/30 transform group-hover:rotate-12 transition-transform duration-500">
          <Award className="w-8 h-8 text-emerald-900" />
        </div>
        
        <div className="space-y-4 flex-1">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-yellow-300 uppercase tracking-[0.2em] block drop-shadow-md">
              Top EcoPick Recommendation
            </span>
            <h4 className="text-2xl md:text-3xl font-black tracking-tight drop-shadow-sm">
              {productName}
            </h4>
          </div>
          
          <p className="text-emerald-50 text-sm md:text-base leading-relaxed max-w-4xl font-medium bg-emerald-900/20 p-4 rounded-xl border border-emerald-600/30">
            {explanation}
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-6 flex justify-end relative z-10">
        <button 
          onClick={() => {
            // Smooth scroll to the alternatives grid where shopping links are
            const altSection = document.getElementById('alternatives-grid');
            if (altSection) {
              altSection.scrollIntoView({ behavior: 'smooth' });
            } else {
              window.scrollBy({ top: 400, behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg transform hover:scale-105"
        >
          View Deals
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
export default BestChoiceBanner;
