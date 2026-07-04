import React, { useState, useEffect } from 'react';
import { Eye, Flame, Award, ShieldAlert, Sparkles } from 'lucide-react';

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
  }, []);

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      {/* Dynamic Stepper Progress */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-100/50 shadow-md">
        <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-800 mb-6 text-center">
          Analyzing Environmental Impact
        </h4>
        
        {/* Progress bar */}
        <div className="relative mb-8">
          <div className="h-1.5 bg-emerald-100 rounded-full w-full"></div>
          <div 
            className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
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
                className={`flex sm:flex-col items-center text-center gap-3 p-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-emerald-50 border border-emerald-200 shadow-sm scale-105' 
                    : 'opacity-55'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  isCompleted 
                    ? 'bg-emerald-600 text-white' 
                    : isActive 
                    ? 'bg-emerald-600 text-white animate-pulse' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left sm:text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                    Step {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 block mt-0.5 leading-snug">
                    {step.label.split(' ')[0]} {step.label.split(' ')[1] || ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-slate-500 text-sm italic font-medium mt-6 animate-pulse">
          &ldquo;{steps[currentStep].label}...&rdquo;
        </p>
      </div>

      {/* Skeleton Cards Grid */}
      <div className="space-y-6">
        {/* Original Product Skeleton */}
        <div className="glass-panel rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row gap-6 shadow-sm">
          <div className="w-24 h-24 rounded-full shimmer mx-auto md:mx-0 flex-shrink-0"></div>
          <div className="space-y-4 flex-grow">
            <div className="h-6 w-1/3 rounded shimmer"></div>
            <div className="h-4 w-1/4 rounded shimmer"></div>
            <div className="h-4 w-5/6 rounded shimmer"></div>
            <div className="h-12 w-full rounded shimmer"></div>
          </div>
        </div>

        {/* Alternatives Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="glass-panel rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <div className="h-5 w-1/2 rounded shimmer"></div>
                <div className="h-6 w-1/4 rounded-full shimmer"></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-3 rounded shimmer"></div>
                <div className="h-3 rounded shimmer"></div>
                <div className="h-3 rounded shimmer"></div>
                <div className="h-3 rounded shimmer"></div>
              </div>
              <div className="h-16 rounded-xl shimmer"></div>
              <div className="h-10 rounded-xl shimmer"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default LoadingState;
