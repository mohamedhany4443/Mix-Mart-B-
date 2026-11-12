import { ShoppingBag, Clock, Globe, Settings, QrCode as QrIcon, TrendingUp, Crown, Award, Table, Download, MessageSquareHeart } from 'lucide-react';
import { useCoffee } from '../context/CoffeeContext';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenOrders: () => void;
  onOpenStoreInfo: () => void;
  onOpenSettings: () => void;
  onOpenQr: () => void;
  onOpenSales: () => void;
  onOpenOwner?: () => void;
  onOpenManager?: () => void;
  onOpenStaff?: () => void;
  onOpenPropertyCertificate?: () => void;
  onOpenInstall?: () => void;
  onOpenFeedback?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenOrders,
  onOpenSettings,
  onOpenQr,
  onOpenSales,
  onOpenOwner,
  onOpenPropertyCertificate,
  onOpenInstall,
  onOpenFeedback,
}) => {
  const { cartItemsCount, cartTotal, orders, settings, language, setLanguage, activeTable } = useCoffee();

  const activeOrdersCount = orders.filter(
    (o) => o.status === 'received' || o.status === 'preparing' || o.status === 'ready'
  ).length;

  const isAr = language === 'ar';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Zone 1: Modern Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a href="#" className="group flex items-center gap-2.5 sm:gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-slate-950 border border-slate-700/80 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-all duration-300">
              <span className="font-serif">M</span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-wider text-slate-900 group-hover:text-slate-700 transition-colors font-display">
                  {settings.storeName}
                </span>
                <span className="text-xs text-slate-500 font-semibold tracking-wide">
                  {settings.storeNameAr || 'ميكس مارت'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 -mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] tracking-wider uppercase text-slate-500 font-medium">
                  {isAr ? 'بار القهوة المختصة · متاح للطلب والاستلام' : 'Specialty Coffee Bar · Order Pickup'}
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-full border border-slate-200 backdrop-blur-md text-xs font-semibold text-slate-600">
          <a
            href="#menu-section"
            className="px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
          >
            {isAr ? 'المنيو' : 'Menu'}
          </a>
          <button
            type="button"
            onClick={onOpenOrders}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-slate-700" />
            <span>{isAr ? 'الطلبات' : 'Orders'}</span>
            {activeOrdersCount > 0 && (
              <span className="ml-1 text-[10px] font-bold text-white bg-slate-900 px-1.5 py-0.2 rounded-full tabular-nums">
                {activeOrdersCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onOpenSales}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-white transition-all cursor-pointer text-slate-700"
          >
            <TrendingUp className="w-3.5 h-3.5 text-slate-700" />
            <span>{isAr ? 'نسبة المبيعات' : 'Sales %'}</span>
          </button>
          {onOpenOwner && (
            <button
              type="button"
              onClick={onOpenOwner}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer font-bold shadow-xs"
              title={isAr ? 'لوحة تحكم وتخصيص المالك' : 'Owner Customizer (Mohamed Hany)'}
            >
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>{isAr ? 'المالك والتخصيص' : 'Owner'}</span>
            </button>
          )}
          {onOpenPropertyCertificate && (
            <button
              type="button"
              onClick={onOpenPropertyCertificate}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-white transition-all cursor-pointer text-slate-700 font-bold"
              title="Mohamed Hany Property Certificate"
            >
              <Award className="w-3.5 h-3.5 text-slate-900" />
              <span>{isAr ? 'شهادة الملكية' : 'Certificate'}</span>
            </button>
          )}
          {onOpenInstall && (
            <button
              type="button"
              onClick={onOpenInstall}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-white transition-all cursor-pointer text-slate-900 font-bold bg-white/70 shadow-2xs"
              title={isAr ? 'تثبيت التطبيق على أيفون وأندرويد' : 'Install App on iPhone & Android'}
            >
              <Download className="w-3.5 h-3.5 text-slate-900" />
              <span>{isAr ? 'تنزيل التطبيق' : 'Install App'}</span>
            </button>
          )}
          {onOpenFeedback && (
            <button
              type="button"
              onClick={onOpenFeedback}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-white transition-all cursor-pointer text-slate-800 font-bold"
              title={isAr ? 'تقييم المشروبات وتطبيق MIX MART' : 'Guest Reviews for Drinks & App'}
            >
              <MessageSquareHeart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
              <span>{isAr ? 'التقييمات' : 'Feedback'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenQr}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:text-slate-900 hover:bg-white transition-all cursor-pointer text-slate-600"
            title={isAr ? 'إنشاء وقراءة رموز QR على iOS و Android' : 'Generate & Scan QR codes on iOS & Android'}
          >
            <QrIcon className="w-3.5 h-3.5 text-slate-700" />
            <span>{isAr ? 'رمز QR والماسح' : 'QR & Scanner'}</span>
          </button>
        </nav>

        {/* Zone 3: Modern Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Active Table Pill */}
          {activeTable && (
            <button
              type="button"
              onClick={onOpenQr}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono text-xs font-black shadow-xs cursor-pointer transition-all border border-amber-500/50"
              title={isAr ? `طاولة رقم ${activeTable.replace(/[^0-9]/g, '')} مفعلة` : `${activeTable} Active`}
            >
              <Table className="w-3.5 h-3.5 text-slate-950" />
              <span>{activeTable}</span>
            </button>
          )}

          {/* Owner / Customizer Direct Button */}
          {onOpenOwner && (
            <button
              type="button"
              onClick={onOpenOwner}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              title={isAr ? 'لوحة تحكم وتخصيص المالك (تعديل الصور، الأسعار والأوصاف)' : 'Owner Customizer (Edit Photos, Descriptions, Prices)'}
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>{isAr ? 'المالك' : 'Owner'}</span>
            </button>
          )}
          {/* Sales Percentage Button */}
          <button
            type="button"
            onClick={onOpenSales}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-xs"
            title={isAr ? 'متابعة نسبة المبيعات والأرباح' : 'Follow up sales percentage and revenue'}
          >
            <TrendingUp className="w-3.5 h-3.5 text-slate-700" />
            <span className="hidden md:inline">{isAr ? 'المبيعات %' : 'Sales %'}</span>
          </button>

          {/* Dedicated Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800 hover:text-slate-950 transition-all cursor-pointer shadow-xs"
            title={isAr ? 'الإعدادات وبوابات الإدارة (المالك، المدير، الموظفين)' : 'Settings & Role Portals (Owner, Manager, Staff)'}
          >
            <Settings className="w-3.5 h-3.5 text-slate-700" />
            <span>{isAr ? 'الإعدادات' : 'Settings'}</span>
          </button>

          {/* Quick Install Mobile App Trigger */}
          {onOpenInstall && (
            <button
              type="button"
              onClick={onOpenInstall}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-black text-slate-950 transition-all cursor-pointer shadow-xs active:scale-95"
              title={isAr ? 'تثبيت تطبيق MIX MART على هاتفك (أيفون وأندرويد)' : 'Install MIX MART App on iPhone & Android'}
            >
              <Download className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
              <span className="hidden sm:inline">{isAr ? 'تثبيت التطبيق' : 'Install'}</span>
            </button>
          )}

          {/* Guest Feedback Icon Button */}
          {onOpenFeedback && (
            <button
              type="button"
              onClick={onOpenFeedback}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-950 transition-all cursor-pointer shadow-2xs active:scale-95"
              title={isAr ? 'أعطنا رأيك وتقييمك في المشروبات والتطبيق' : 'Give Feedback for Drinks & App'}
            >
              <MessageSquareHeart className="w-3.5 h-3.5 text-rose-600 fill-rose-600/20" />
              <span className="hidden md:inline">{isAr ? 'تقييمك' : 'Feedback'}</span>
            </button>
          )}

          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => setLanguage(isAr ? 'en' : 'ar')}
            className="flex items-center gap-1 px-2.5 py-2 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-600" />
            <span>{isAr ? 'EN' : 'عربي'}</span>
          </button>

          {/* Modern Cart Button */}
          <button
            onClick={onOpenCart}
            aria-label="View pickup cart"
            className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm rounded-full transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
            <span className="hidden sm:inline font-display">{isAr ? 'السلة' : 'Bag'}</span>
            <span className="font-mono text-xs bg-white/20 px-1.5 py-0.5 rounded-full font-extrabold">
              {cartItemsCount}
            </span>
            {cartItemsCount > 0 && (
              <span className="font-mono text-xs font-bold border-l border-white/25 pl-1.5">
                {cartTotal} {settings.currencySymbol}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
