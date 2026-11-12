import React from 'react';
import { useCoffee } from '../context/CoffeeContext';
import { Sparkles, Coffee } from 'lucide-react';

interface ExteriorCategoryNavProps {
  activeSectionId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  viewMode: 'all' | 'single';
  onChangeViewMode: (mode: 'all' | 'single') => void;
}

export const ExteriorCategoryNav: React.FC<ExteriorCategoryNavProps> = ({
  activeSectionId,
  onSelectCategory,
  viewMode,
  onChangeViewMode,
}) => {
  const { categories, drinks, language } = useCoffee();
  const isAr = language === 'ar';

  const getDrinkCount = (catId: string) => {
    return drinks.filter((d) => d.categoryId === catId && d.isAvailable).length;
  };

  const handleCategoryClick = (catId: string | null) => {
    onSelectCategory(catId);
    if (viewMode === 'all' && catId) {
      const el = document.getElementById(`section-${catId}`);
      if (el) {
        const yOffset = -130;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-xl border-y border-slate-200/90 sticky top-20 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Label & View Toggle */}
          <div className="flex items-center justify-between md:justify-start gap-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-900 font-bold shrink-0 font-display">
              <Coffee className="w-4 h-4 text-slate-800" />
              <span>{isAr ? 'تصنيفات المشروبات' : 'Categories'}</span>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-full text-xs shrink-0">
              <button
                type="button"
                onClick={() => onChangeViewMode('all')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer font-medium ${
                  viewMode === 'all'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isAr ? 'الكل' : 'All'}
              </button>
              <button
                type="button"
                onClick={() => onChangeViewMode('single')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer font-medium ${
                  viewMode === 'single'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isAr ? 'قسم محدد' : 'Focused'}
              </button>
            </div>
          </div>

          {/* Modern Exterior Category Pills */}
          <div className="overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-2 min-w-max">
              <button
                type="button"
                onClick={() => handleCategoryClick(null)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeSectionId === null
                    ? 'bg-slate-900 text-white shadow-sm font-bold scale-102'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? 'جميع المشروبات' : 'All Drinks'}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
                    activeSectionId === null ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {drinks.filter((d) => d.isAvailable).length}
                </span>
              </button>

              {categories.map((cat) => {
                const count = getDrinkCount(cat.id);
                const isActive = activeSectionId === cat.id;
                const displayName = isAr && cat.nameAr ? cat.nameAr : cat.name;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm font-bold scale-102'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400 hover:text-slate-950 hover:bg-slate-50'
                    }`}
                  >
                    <span>{displayName}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
