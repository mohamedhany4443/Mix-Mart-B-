import React from 'react';
import {
  ShoppingBag,
  Clock,
  Globe,
  QrCode as QrIcon,
  Table,
  Download,
  MessageSquareHeart,
} from 'lucide-react';
import { useCoffee } from '../context/CoffeeContext';

interface GuestHeaderProps {
  onOpenCart: () => void;
  onOpenOrders: () => void;
  onOpenQr: () => void;
  onOpenInstall: () => void;
  onOpenFeedback: () => void;
}

export const GuestHeader: React.FC<GuestHeaderProps> = ({
  onOpenCart,
  onOpenOrders,
  onOpenQr,
  onOpenInstall,
  onOpenFeedback,
}) => {
  const { cartItemsCount, cartTotal, orders, settings, language, setLanguage, activeTable } = useCoffee();
  const isAr = language === 'ar';

  const activeOrdersCount = orders.filter(
    (o) => o.status === 'received' || o.status === 'preparing' || o.status === 'ready'
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#menu-section"
          className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-slate-950 whitespace-nowrap shrink-0"
        >
          {isAr ? settings.storeNameAr || 'ميكس مارت' : settings.storeName}
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a
            href="#menu-section"
            className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {isAr ? 'المنيو' : 'Menu'}
          </a>
          <button
            type="button"
            onClick={onOpenOrders}
            className="flex items-center gap-1.5 hover:text-slate-950 hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isAr ? 'طلباتي' : 'My Orders'}</span>
            {activeOrdersCount > 0 && (
              <span className="font-mono text-xs font-bold text-slate-950 tabular-nums">
                ({activeOrdersCount})
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onOpenQr}
            className="flex items-center gap-1.5 hover:text-slate-950 hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <QrIcon className="w-3.5 h-3.5" />
            <span>{isAr ? 'طاولات QR' : 'Table QR'}</span>
          </button>
          <button
            type="button"
            onClick={onOpenFeedback}
            className="flex items-center gap-1.5 hover:text-slate-950 hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <MessageSquareHeart className="w-3.5 h-3.5 text-rose-600" />
            <span>{isAr ? 'التقييم' : 'Reviews'}</span>
          </button>
          <button
            type="button"
            onClick={onOpenInstall}
            className="flex items-center gap-1.5 hover:text-slate-950 hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? 'التطبيق' : 'Install'}</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action + Compact Utility Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {activeTable && (
            <button
              type="button"
              onClick={onOpenQr}
              className="hidden sm:flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 font-mono text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Table className="w-3.5 h-3.5" />
              <span>{activeTable}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenOrders}
            className="lg:hidden flex items-center gap-1 min-h-[40px] px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">{activeOrdersCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setLanguage(isAr ? 'en' : 'ar')}
            className="flex items-center gap-1 min-h-[40px] px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isAr ? 'EN' : 'عربي'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            className="flex items-center gap-2 min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">{isAr ? 'السلة' : 'Bag'}</span>
            <span className="font-mono tabular-nums text-xs bg-white/20 px-1.5 py-0.5 rounded-md">
              {cartItemsCount}
            </span>
            {cartItemsCount > 0 && (
              <span className="font-mono tabular-nums text-xs hidden sm:inline">
                {cartTotal} {settings.currencySymbol}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
