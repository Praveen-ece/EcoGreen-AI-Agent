import React, { useState, useEffect } from 'react';
import { Eye, Flame, Award, ShieldAlert, Sparkles, Leaf } from 'lucide-react';

export const LoadingState: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: 'Identifying details (Name, Category, Brand, Material)', icon: Eye },
    { label: 'Estimating manufacturing & shipping emissions', icon: ShieldAlert },
    { label: 'Calculating sustainability score (0 - 100)', icon: Award },
    { label: 'Classifying carbon footprint band (Low, Medium, High)', icon: Flame },
    { label: 'Finding eco-friendlier alternatives & live data', icon: Sparkles }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2800); // Progress every 2.8 seconds

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      {/* Dynamic Stepper Progress */}
      <div className="glass-panel dark:dark-glass-panel rounded-3xl p-6 md:p-8 border-2 border-emerald-100/50 dark:border-emerald-800/30 shadow-xl shadow-emerald-900/5">
        
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative w-16 h-16 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50 rounded-full mb-4">
            <Leaf className="w-8 h-8 text-emerald-600 dark:text-emerald-400 absolute animate-ping opacity-20" />
            <Leaf className="w-8 h-8 text-emerald-600 dark:text-emerald-400 relative animate-bounce" />
          </div>
          <h4 className="text-sm md:text-base font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-400 text-center drop-shadow-sm">
            Analyzing Environmental Impact
          </h4>
        </div>
        
        {/* Progress bar */}
        <div className="relative mb-8 max-w-2xl mx-auto">
          <div className="h-2 bg-emerald-100 dark:bg-slate-800 rounded-full w-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
            </div>
          </div>
        </div>

        {/* Stepper items */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;

            return (
              <div 
                key={idx} 
                className={`flex sm:flex-col items-center text-center gap-3 p-3 rounded-2xl transition-all duration-500 ${
                  isActive 
                    ? 'bg-emerald-50 dark:bg-emerald-900/40 border-2 border-emerald-200 dark:border-emerald-700 shadow-md transform scale-105' 
                    : isCompleted
                    ? 'opacity-80'
                    : 'opacity-40 grayscale'
                }`}
              >
                <div className={`p-2.5 rounded-full transition-colors ${
                  isCompleted 
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm' 
                    : isActive 
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 animate-pulse' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left sm:text-center">
                  <span className={`text-[10px] font-black uppercase block tracking-widest ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    Step {idx + 1}
                  </span>
                  <span className={`text-xs font-bold block mt-0.5 leading-snug ${isActive ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                    {step.label.split(' ')[0]} {step.label.split(' ')[1] || ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center bg-slate-50 dark:bg-slate-800/50 py-3 rounded-xl border border-slate-100 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-300 text-sm italic font-medium animate-pulse flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            &ldquo;{steps[currentStep].label}...&rdquo;
          </p>
        </div>
      </div>

      {/* Skeleton Cards Grid */}
      <div className="space-y-6 opacity-60">
        {/* Original Product Skeleton */}
        <div className="glass-panel dark:dark-glass-panel rounded-3xl border-2 border-slate-100 dark:border-slate-800/50 p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-sm">
          <div className="w-32 h-32 rounded-full shimmer mx-auto md:mx-0 flex-shrink-0"></div>
          <div className="space-y-5 flex-grow">
            <div className="h-8 w-1/3 rounded-lg shimmer"></div>
            <div className="h-5 w-1/4 rounded-lg shimmer"></div>
            <div className="h-5 w-5/6 rounded-lg shimmer"></div>
            <div className="h-16 w-full rounded-xl shimmer"></div>
          </div>
        </div>

        {/* Alternatives Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="glass-panel dark:dark-glass-panel rounded-3xl border-2 border-slate-100 dark:border-slate-800/50 p-6 space-y-5 shadow-sm">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-6 w-1/2 rounded-lg shimmer"></div>
                <div className="h-8 w-1/4 rounded-xl shimmer"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-4 rounded-md shimmer"></div>
                <div className="h-4 rounded-md shimmer"></div>
                <div className="h-4 rounded-md shimmer"></div>
                <div className="h-4 rounded-md shimmer"></div>
              </div>
              <div className="h-20 rounded-2xl shimmer"></div>
              <div className="h-14 rounded-xl shimmer"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default LoadingState;
