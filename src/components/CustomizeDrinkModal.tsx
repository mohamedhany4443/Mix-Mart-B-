import React, { useState } from 'react';
import { Drink, MenuExtra } from '../types';
import { useCoffee } from '../context/CoffeeContext';
import { X, Plus, Minus, Check, Sparkles } from 'lucide-react';

interface CustomizeDrinkModalProps {
  drink: Drink | null;
  onClose: () => void;
}

export const CustomizeDrinkModal: React.FC<CustomizeDrinkModalProps> = ({ drink, onClose }) => {
  const { addToCart, settings, language, availableExtras } = useCoffee();

  if (!drink) return null;

  const isAr = language === 'ar';
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<'Standard' | 'Large'>('Standard');
  const [temperature, setTemperature] = useState<'Hot' | 'Iced'>(
    drink.temperature === 'iced' ? 'Iced' : 'Hot'
  );
  const [milk, setMilk] = useState<'Standard Milk' | 'No Milk'>('Standard Milk');
  const [selectedExtras, setSelectedExtras] = useState<MenuExtra[]>([]);
  const [notes, setNotes] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  // Extras toggle
  const toggleExtra = (extra: MenuExtra) => {
    setSelectedExtras((prev) => {
      const exists = prev.find((e) => e.id === extra.id);
      if (exists) {
        return prev.filter((e) => e.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  };

  // Base price + Extras calculation
  let currentUnitPrice = drink.price;
  selectedExtras.forEach((ext) => {
    currentUnitPrice += ext.price;
  });
  const currentTotal = currentUnitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(drink, {
      size,
      temperature,
      milk,
      selectedExtras,
      notes,
      quantity,
    });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 600);
  };

  const primaryName = isAr && drink.nameAr ? drink.nameAr : drink.name;
  const secondaryName = isAr ? drink.name : drink.nameAr;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-900 relative max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-500 hover:text-slate-900 bg-white/90 backdrop-blur-md hover:bg-slate-100 rounded-full border border-slate-200 shadow-sm transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto pr-1 space-y-4">
          {/* Realistic Image Preview */}
          {drink.image && (
            <div className="relative -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-4 aspect-[16/9] overflow-hidden bg-slate-100 border-b border-slate-200">
              <img
                src={drink.image}
                alt={drink.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
            </div>
          )}

          {/* Header */}
          <div className="border-b border-slate-200 pb-3">
            <span className="text-[11px] font-mono tracking-widest uppercase text-slate-500 font-bold">
              {isAr ? 'تخصيص المشروب والإضافات' : 'Customize Drink & Extras'}
            </span>
            <div className="flex items-baseline justify-between gap-2 mt-0.5">
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
                {primaryName}
              </h3>
              {secondaryName && (
                <span className="text-sm text-slate-600 font-semibold">
                  {secondaryName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span className="font-mono tabular-nums text-sm font-extrabold text-slate-900">
                {drink.price} <span className="font-sans font-semibold text-slate-700">{settings.currencySymbol}</span>
              </span>
              {(drink.note || drink.noteAr) && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{isAr && drink.noteAr ? drink.noteAr : drink.note}</span>
                </>
              )}
            </div>
          </div>

          {/* Temperature Options */}
          {drink.temperature === 'both' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                {isAr ? 'درجة الحرارة' : 'Temperature'}
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setTemperature('Hot')}
                  className={`py-2 px-3 rounded-xl border text-center transition-colors cursor-pointer font-bold ${
                    temperature === 'Hot'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {isAr ? 'ساخن (Hot)' : 'Hot'}
                </button>
                <button
                  type="button"
                  onClick={() => setTemperature('Iced')}
                  className={`py-2 px-3 rounded-xl border text-center transition-colors cursor-pointer font-bold ${
                    temperature === 'Iced'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {isAr ? 'مثلج (Iced)' : 'Iced'}
                </button>
              </div>
            </div>
          )}

          {/* Official MIX MART Extras From PDF */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                <span>{isAr ? 'الإضافات الرسمية (منيو ميكس مارت)' : 'Official Extras (Mix Mart Menu)'}</span>
              </label>
            </div>

            <div className="space-y-1.5">
              {availableExtras.map((extra) => {
                const isSelected = !!selectedExtras.find((e) => e.id === extra.id);
                return (
                  <button
                    key={extra.id}
                    type="button"
                    onClick={() => toggleExtra(extra)}
                    className={`w-full p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'border-slate-900 bg-slate-100 text-slate-950 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white font-extrabold'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && '✓'}
                      </div>
                      <span className="font-semibold text-slate-900">
                        {isAr ? extra.nameAr : extra.name}
                      </span>
                    </div>

                    <span className="font-mono tabular-nums text-slate-900 font-extrabold shrink-0">
                      +{extra.price} {settings.currencySymbol}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Barista Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              {isAr ? 'ملاحظات للباريستا (اختياري)' : 'Barista Instructions (Optional)'}
            </label>
            <input
              type="text"
              placeholder={isAr ? 'مثال: سكر زيادة، حليب خفيف، ثلج قليل...' : 'e.g. Extra hot, light ice, decaf...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={80}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors"
            />
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-600">
              {isAr ? 'العدد' : 'Quantity'}
            </span>
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-mono font-bold text-sm tabular-nums text-slate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer with Price and Add Button */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              {isAr ? 'الإجمالي' : 'Total Price'}
            </div>
            <div className="font-mono text-xl sm:text-2xl font-extrabold tabular-nums text-slate-950">
              {currentTotal} <span className="text-sm font-sans text-slate-700 font-bold">{settings.currencySymbol}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer"
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isAr ? 'تمت الإضافة!' : 'Added to Cart!'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{isAr ? 'إضافة إلى طلب الاستلام' : 'Add to Pickup Order'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
