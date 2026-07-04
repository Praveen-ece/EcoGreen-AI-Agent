import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

interface ProductInputFormProps {
  onAnalyze: (description: string) => void;
  isLoading: boolean;
}

export const ProductInputForm: React.FC<ProductInputFormProps> = ({ onAnalyze, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'structured' | 'freetext'>('structured');
  
  // Structured state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [material, setMaterial] = useState('');
  const [brand, setBrand] = useState('');
  const [country, setCountry] = useState('');

  // Free-text state
  const [freeText, setFreeText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'structured') {
      if (!name.trim() || !category.trim()) return;
      const desc = `Analyze this product:
- Product Name: ${name.trim()}
- Category: ${category.trim()}
${material.trim() ? `- Material: ${material.trim()}\n` : ''}${brand.trim() ? `- Brand: ${brand.trim()}\n` : ''}${country.trim() ? `- Country of Manufacture: ${country.trim()}\n` : ''}`;
      onAnalyze(desc);
    } else {
      if (!freeText.trim()) return;
      onAnalyze(freeText.trim());
    }
  };

  const isFormValid = activeTab === 'structured' 
    ? (name.trim().length > 0 && category.trim().length > 0)
    : freeText.trim().length > 0;

  return (
    <div className="glass-panel rounded-2xl shadow-xl p-6 md:p-8 transition-all max-w-3xl mx-auto border border-emerald-100/50">
      <div className="flex border-b border-emerald-100/30 pb-4 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('structured')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'structured'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <Search className="w-4 h-4" />
          Structured Form
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('freetext')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'freetext'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Paste Description / Link
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === 'structured' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label htmlFor="prod-name" className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                id="prod-name"
                type="text"
                placeholder="e.g. Disposable Plastic Bottle, Men's Running Shoes"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 outline-none transition-all placeholder-slate-400"
                required
              />
            </div>

            <div>
              <label htmlFor="prod-category" className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
                Product Category <span className="text-red-500">*</span>
              </label>
              <input
                id="prod-category"
                type="text"
                placeholder="e.g. Beverages, Footwear, Electronics"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 outline-none transition-all placeholder-slate-400"
                required
              />
            </div>

            <div>
              <label htmlFor="prod-material" className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
                Primary Material (Optional)
              </label>
              <input
                id="prod-material"
                type="text"
                placeholder="e.g. PET Plastic, Cotton, Aluminum"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 outline-none transition-all placeholder-slate-400"
              />
            </div>

            <div>
              <label htmlFor="prod-brand" className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
                Brand Name (Optional)
              </label>
              <input
                id="prod-brand"
                type="text"
                placeholder="e.g. Nike, Coca-Cola, IKEA"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 outline-none transition-all placeholder-slate-400"
              />
            </div>

            <div>
              <label htmlFor="prod-country" className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
                Country of Manufacture (Optional)
              </label>
              <input
                id="prod-country"
                type="text"
                placeholder="e.g. China, Vietnam, USA"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 outline-none transition-all placeholder-slate-400"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label htmlFor="prod-desc" className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
              Product Description or Shopping Link
            </label>
            <textarea
              id="prod-desc"
              rows={5}
              placeholder="Paste a link or describe the product you are considering (e.g. 'I'm looking at a 100% polyester rain jacket from a fast fashion brand manufactured in China...')"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 outline-none transition-all placeholder-slate-400 resize-y"
              required
            />
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3.5 rounded-xl font-semibold shadow-lg text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${
              isFormValid && !isLoading
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 cursor-pointer shadow-emerald-600/20'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Impact...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze Sustainability
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
export default ProductInputForm;
