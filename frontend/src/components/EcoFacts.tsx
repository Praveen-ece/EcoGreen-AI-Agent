import React, { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';

const facts = [
  "Did you know? Producing a single cotton t-shirt requires over 2,700 liters of water—what one person drinks in 2.5 years.",
  "E-waste is the fastest-growing waste stream in the world. Recycling electronics saves precious metals and reduces toxic pollution.",
  "Switching to reusable water bottles can save you hundreds of dollars a year and prevent hundreds of plastic bottles from entering oceans.",
  "Fast fashion produces over 92 million tons of waste per year. Buying durable, high-quality items drastically reduces your footprint.",
  "Shipping by sea emits about 1/40th of the CO₂ compared to shipping the same cargo by air.",
  "Over 40% of plastic is used just once and then thrown away. Small changes in packaging choices make a massive difference.",
];

export const EcoFacts: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % facts.length);
        setFade(true);
      }, 500); // Wait for fade out
    }, 8000); // Change fact every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-4 flex gap-3 items-start transition-colors">
      <div className="bg-emerald-100 dark:bg-emerald-800/50 p-2 rounded-full flex-shrink-0">
        <Lightbulb className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
      </div>
      <div className="flex-1 min-h-[48px] flex items-center">
        <p 
          className={`text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed font-medium transition-opacity duration-500 ${
            fade ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {facts[index]}
        </p>
      </div>
    </div>
  );
};

export default EcoFacts;
