import React, { useState } from 'react';
import { Drink } from '../types';
import { useCoffee } from '../context/CoffeeContext';
import { Plus, Check, SlidersHorizontal, Coffee, Star, Crown, MessageSquareHeart } from 'lucide-react';

interface DrinkItemRowProps {
  drink: Drink;
  onCustomize: (drink: Drink) => void;
  onOwnerEdit?: (drink: Drink) => void;
  onGiveFeedback?: (drink: Drink) => void;
  layout?: 'card' | 'compact';
}

export const DrinkItemRow: React.FC<DrinkItemRowProps> = ({
  drink,
  onCustomize,
  onOwnerEdit,
  onGiveFeedback,
  layout = 'card',
}) => {
  const { addToCart, settings, language } = useCoffee();
  const [justAdded, setJustAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const isAr = language === 'ar';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!drink.isAvailable) return;

    addToCart(drink, {
      size: 'Standard',
      temperature: drink.temperature === 'iced' ? 'Iced' : 'Hot',
      milk: 'Standard Milk',
      quantity: 1,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const primaryName = isAr && drink.nameAr ? drink.nameAr : drink.name;
  const secondaryName = isAr ? drink.name : drink.nameAr;
  const noteText = isAr && drink.noteAr ? drink.noteAr : drink.note;

  // 1. Rich Modern Card View with Realistic Photo
  if (layout === 'card' && drink.image && !imgError) {
    return (
      <div
        onClick={() => drink.isAvailable && onCustomize(drink)}
        className={`group relative rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 cursor-pointer ${
          drink.isAvailable
            ? 'bg-white hover:bg-slate-50/90 border-slate-200 hover:border-slate-400 hover:shadow-lg hover:-translate-y-1'
            : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
        }`}
      >
        {/* Realistic Drink Image Showcase */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <img
            src={drink.image}
            alt={drink.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

          {/* Floating Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
            {drink.isPopular && drink.isAvailable && (
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-slate-900 bg-amber-300 border border-amber-400/80 px-2.5 py-0.5 rounded-full shadow-sm">
                <Star className="w-2.5 h-2.5 fill-slate-900 text-slate-900" />
                <span>{isAr ? 'الأكثر طلباً' : 'Bestseller'}</span>
              </span>
            )}
            {drink.temperature && drink.isAvailable && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md bg-white/90 border border-slate-200 text-slate-700 shadow-xs">
                {drink.temperature === 'iced'
                  ? (isAr ? 'مثلج ❄️' : 'Iced ❄️')
                  : drink.temperature === 'both'
                  ? (isAr ? 'حار / مثلج' : 'Hot / Iced')
                  : (isAr ? 'حار ☕' : 'Hot ☕')}
              </span>
            )}
            {!drink.isAvailable && (
              <span className="text-[10px] uppercase tracking-wider font-bold text-rose-700 bg-rose-50 border border-rose-300 px-2.5 py-0.5 rounded-full shadow-md">
                {isAr ? 'نفذت الكمية' : 'Sold Out'}
              </span>
            )}
          </div>

          {/* Modern Floating Glass Price Tag */}
          <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 font-mono font-bold text-sm tabular-nums text-slate-900 shadow-md flex items-center gap-1 group-hover:border-slate-400 transition-colors">
            <span className="text-base font-extrabold text-slate-950">{drink.price}</span>
            <span className="text-[11px] font-sans text-slate-600 font-bold">
              {settings.currencySymbol}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3 bg-white">
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="font-display text-lg font-bold tracking-tight text-slate-950 group-hover:text-slate-700 transition-colors">
                {primaryName}
              </h4>
              {secondaryName && (
                <span className="text-xs text-slate-400 font-medium shrink-0">
                  {secondaryName}
                </span>
              )}
            </div>

            {noteText && (
              <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                {noteText}
              </p>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCustomize(drink);
                }}
                className="text-xs text-slate-600 hover:text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer font-medium px-2 py-1 rounded-lg hover:bg-slate-100"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-700" />
                <span>{isAr ? 'تخصيص' : 'Customize'}</span>
              </button>

              {onGiveFeedback && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onGiveFeedback(drink);
                  }}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-all cursor-pointer border border-slate-200"
                  title={isAr ? `تقييم مشروب ${drink.nameAr || drink.name}` : `Review ${drink.name}`}
                >
                  <MessageSquareHeart className="w-3.5 h-3.5" />
                </button>
              )}

              {onOwnerEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOwnerEdit(drink);
                  }}
                  className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                  title={isAr ? 'تعديل صورة ووصف وسعر المشروب كمالك' : 'Owner: Edit photo, description & price'}
                >
                  <Crown className="w-3 h-3 text-amber-600" />
                  <span>{isAr ? 'تعديل' : 'Edit'}</span>
                </button>
              )}
            </div>

            {drink.isAvailable && (
              <button
                type="button"
                onClick={handleQuickAdd}
                aria-label={`Add ${drink.name} to cart`}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                  justAdded
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs hover:shadow-sm active:scale-95'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{isAr ? 'تم' : 'Added'}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{isAr ? 'طلب' : 'Add'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. Modern Compact Row View
  return (
    <div
      onClick={() => drink.isAvailable && onCustomize(drink)}
      className={`group relative p-3.5 sm:p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
        drink.isAvailable
          ? 'bg-white hover:bg-slate-50/90 border-slate-200 hover:border-slate-400 hover:shadow-md'
          : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Thumbnail & Drink Name */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
          {drink.image && !imgError ? (
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
              <img
                src={drink.image}
                alt={drink.name}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <Coffee className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h4 className="font-display text-base font-bold tracking-wide text-slate-900 group-hover:text-slate-800 transition-colors truncate">
                {primaryName}
              </h4>
              {secondaryName && (
                <span className="text-xs text-slate-500 font-semibold">
                  {secondaryName}
                </span>
              )}
              {drink.isPopular && drink.isAvailable && (
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-900 bg-amber-300 border border-amber-400/80 px-1.5 py-0.2 rounded-full">
                  {isAr ? 'مميز' : 'Fav'}
                </span>
              )}
              {drink.temperature && drink.isAvailable && (
                <span className="text-[9px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded-full">
                  {drink.temperature === 'iced' ? '❄️' : '☕'}
                </span>
              )}
            </div>
            {noteText && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 group-hover:text-slate-600 transition-colors">
                {noteText}
              </p>
            )}
          </div>
        </div>

        {/* Right: Price & Add Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="font-mono tabular-nums text-base font-extrabold text-slate-900 group-hover:text-slate-800 transition-colors">
              {drink.price}
            </span>
            <span className="text-xs text-slate-500 ml-1 font-sans font-semibold">
              {settings.currencySymbol}
            </span>
          </div>

          {drink.isAvailable && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCustomize(drink);
                }}
                title={isAr ? 'تخصيص' : 'Customize'}
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-700" />
              </button>

              {onGiveFeedback && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onGiveFeedback(drink);
                  }}
                  title={isAr ? 'تقييم هذا المشروب' : 'Review drink'}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 cursor-pointer transition-colors border border-slate-200"
                >
                  <MessageSquareHeart className="w-3.5 h-3.5" />
                </button>
              )}

              {onOwnerEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOwnerEdit(drink);
                  }}
                  title={isAr ? 'تعديل كمالك' : 'Owner Edit'}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
                >
                  <Crown className="w-3 h-3 text-amber-600" />
                  <span className="hidden sm:inline">{isAr ? 'تعديل' : 'Edit'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleQuickAdd}
                aria-label={`Add ${drink.name} to cart`}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                  justAdded
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{isAr ? 'تم' : 'Added'}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{isAr ? 'طلب' : 'Add'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
