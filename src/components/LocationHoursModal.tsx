import React from 'react';
import { useCoffee } from '../context/CoffeeContext';
import { X, MapPin, Clock, Coffee, Sparkles } from 'lucide-react';

interface LocationHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationHoursModal: React.FC<LocationHoursModalProps> = ({ isOpen, onClose }) => {
  const { settings, language } = useCoffee();
  const isAr = language === 'ar';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div className="h-1 bg-slate-900" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pb-5 border-b border-slate-200 relative">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-3 text-white shadow-xs">
            <Coffee className="w-7 h-7" />
          </div>
          <span className="text-[11px] font-mono tracking-widest uppercase text-slate-500 font-bold">
            {isAr ? 'بار القهوة ونقطة الاستلام' : 'Coffee Bar & Pickup Counter'}
          </span>
          <h3 className="font-display text-3xl font-extrabold tracking-tight text-slate-950 mt-1">
            {settings.storeName} · {settings.storeNameAr}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isAr ? settings.taglineAr : settings.tagline}
          </p>
        </div>

        {/* Details Grid */}
        <div className="my-5 space-y-3.5 text-xs">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <MapPin className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 mb-0.5">
                {isAr ? 'موقع البار والاستلام' : 'Counter Location'}
              </div>
              <div className="text-slate-600">
                {isAr ? settings.addressAr : settings.address}
              </div>
              <div className="text-slate-900 font-bold mt-1">
                {isAr ? 'نقطة الاستلام: ' : 'Designated Spot: '}
                {isAr ? settings.pickupCounterNameAr : settings.pickupCounterName}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <Clock className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 mb-0.5">
                {isAr ? 'مواعيد العمل اليومية' : 'Operating Hours'}
              </div>
              <div className="text-slate-600">{settings.operatingHours}</div>
              <div className="text-emerald-700 font-semibold mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{isAr ? 'مفتوح الآن لاستقبال الطلبات الفورية' : 'Open now for pickup & dine-in orders'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <Sparkles className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 mb-0.5">Fast Pickup Promise</div>
              <div className="text-slate-600">
                Standard drink turnaround is approx. {settings.defaultWaitTimeMinutes} minutes. You will receive an on-screen confirmation code to show our barista upon arrival.
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer text-center"
        >
          {isAr ? 'العودة للمنيو' : 'Back to Menu'}
        </button>
      </div>
    </div>
  );
};
