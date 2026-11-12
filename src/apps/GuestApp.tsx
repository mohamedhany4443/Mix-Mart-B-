import React, { useState, useMemo } from 'react';
import { useCoffee } from '../context/CoffeeContext';
import { GuestHeader } from '../components/GuestHeader';
import { ExteriorCategoryNav } from '../components/ExteriorCategoryNav';
import { DrinkItemRow } from '../components/DrinkItemRow';
import { CustomizeDrinkModal } from '../components/CustomizeDrinkModal';
import { CartDrawer } from '../components/CartDrawer';
import { OrderSuccessModal } from '../components/OrderSuccessModal';
import { MyOrdersModal } from '../components/MyOrdersModal';
import { QrCodeModal } from '../components/QrCodeModal';
import { PWAInstallModal } from '../components/PWAInstallModal';
import { OfflineIndicator } from '../components/OfflineIndicator';
import { FeedbackModal } from '../components/FeedbackModal';
import { TableCloseModal } from '../components/TableCloseModal';
import { Drink, PickupOrder } from '../types';
import {
  Coffee,
  Clock,
  Search,
  ShoppingBag,
  Table,
  Download,
  MessageSquareHeart,
  Banknote,
  CreditCard,
  Receipt,
  Sparkles,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const GuestApp: React.FC = () => {
  const {
    categories,
    drinks,
    orders,
    settings,
    language,
    cartItemsCount,
    cartTotal,
    activeTable,
    setActiveTable,
    tables,
    tableClosureRequests,
    respondToUpsellOffer,
  } = useCoffee();
  const isAr = language === 'ar';

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all');
  const [menuLayout, setMenuLayout] = useState<'card' | 'compact'>('card');
  const [menuSearch, setMenuSearch] = useState('');

  // Guest Modals & Drawers
  const [customizingDrink, setCustomizingDrink] = useState<Drink | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackDrink, setFeedbackDrink] = useState<Drink | null>(null);
  const [recentOrder, setRecentOrder] = useState<PickupOrder | null>(null);
  const [isTableCloseOpen, setIsTableCloseOpen] = useState(false);

  const filteredCategories = useMemo(
    () =>
      categories.filter((cat) => {
        if (viewMode === 'single' && activeCategoryId) {
          return cat.id === activeCategoryId;
        }
        return true;
      }),
    [categories, viewMode, activeCategoryId]
  );

  // Surface any live order with pending Barista upsell offers or rejection notice
  const liveAlertOrder = useMemo(() => {
    return orders.find(
      (o) =>
        o.status === 'rejected' ||
        ((o.status === 'received' || o.status === 'preparing' || o.status === 'ready') &&
          (o.upsellOffers || []).some((u) => u.status === 'pending'))
    );
  }, [orders]);

  const activeTablePendingClosure = useMemo(() => {
    if (!activeTable) return null;
    return tableClosureRequests.find(
      (r) => r.tableNumber === activeTable && r.status === 'pending'
    );
  }, [activeTable, tableClosureRequests]);

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans selection:bg-slate-900 selection:text-white"
    >
      <OfflineIndicator />

      <GuestHeader
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenQr={() => setIsQrOpen(true)}
        onOpenInstall={() => setIsInstallOpen(true)}
        onOpenFeedback={() => {
          setFeedbackDrink(null);
          setIsFeedbackOpen(true);
        }}
      />

      {/* Hero Section */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium flex-wrap">
              <span>{isAr ? settings.taglineAr : settings.tagline}</span>
              <span aria-hidden="true">·</span>
              <span>{settings.operatingHours}</span>
              <span aria-hidden="true">·</span>
              <span>{isAr ? 'كاش أو فيزا' : 'Cash or Visa'}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight text-balance">
              {isAr
                ? 'اطلب مشروبك المفضل الآن — تحضير فوري أو حسب وقتك'
                : 'Crafted Coffee & Beverages — Ready Now or Scheduled to Your Time'}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isAr
                ? 'اختر الحجم والإكسترا وتوقيت التحضير المناسب، وحدد الدفع كاش أو فيزا بكل سهولة من طاولتك أو للاستلام الفوري.'
                : 'Customize size and extras, choose immediate or scheduled preparation, and pay via Cash or Visa at your table or counter.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href="#menu-section"
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Coffee className="w-4 h-4" />
              <span>{isAr ? 'تصفح المنيو' : 'Browse Menu'}</span>
            </a>
            <button
              type="button"
              onClick={() => setIsOrdersOpen(true)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>{isAr ? 'متابعة طلبي' : 'Track Order'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsTableCloseOpen(true)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Receipt className="w-4 h-4 text-amber-700" />
              <span>{isAr ? 'إغلاق الطاولة والحساب' : 'Close Table'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Live Barista Upsell / Rejection Alert Banner */}
      {liveAlertOrder && (
        <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
            {liveAlertOrder.status === 'rejected' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200">
                <div className="flex items-start gap-2.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-rose-950">
                      {isAr
                        ? `تم رفض الطلب #${liveAlertOrder.orderNumber} من الباريستا`
                        : `Order #${liveAlertOrder.orderNumber} Declined`}
                    </div>
                    <p className="text-rose-800 mt-0.5">
                      {liveAlertOrder.rejectionReason ||
                        (isAr ? 'الصنف غير متوفر حالياً' : 'Item currently unavailable')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOrdersOpen(true)}
                  className="min-h-[38px] px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 cursor-pointer"
                >
                  {isAr ? 'عرض التفاصيل' : 'View Details'}
                </button>
              </div>
            )}

            {(liveAlertOrder.upsellOffers || [])
              .filter((u) => u.status === 'pending')
              .map((offer) => (
                <div
                  key={offer.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-50 border border-indigo-200"
                >
                  <div className="flex items-start gap-2.5 text-xs">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-indigo-950">
                        {isAr
                          ? `اقتراح من الباريستا لطلبك #${liveAlertOrder.orderNumber}`
                          : `Barista Suggestion for #${liveAlertOrder.orderNumber}`}
                      </div>
                      <p className="text-indigo-900 mt-0.5">
                        {isAr ? offer.titleAr : offer.title}{' '}
                        <span className="font-mono font-bold tabular-nums">
                          (+{offer.price} {settings.currencySymbol})
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => respondToUpsellOffer(liveAlertOrder.id, offer.id, true)}
                      className="min-h-[38px] px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isAr ? 'أضف للطلب' : 'Add to Order'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => respondToUpsellOffer(liveAlertOrder.id, offer.id, false)}
                      className="min-h-[38px] px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
                    >
                      {isAr ? 'تخطي' : 'No thanks'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* 15-Table Bar & Quick Close Table Bar */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Table className="w-4 h-4 text-slate-700" />
              <span>{isAr ? 'طاولتك الحالية:' : 'Your Table:'}</span>
            </div>
            <select
              value={activeTable || ''}
              onChange={(e) => setActiveTable(e.target.value || null)}
              className="min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 outline-none"
            >
              <option value="">{isAr ? 'سفري / كاونتر' : 'Takeaway / Counter'}</option>
              {tables.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {activeTablePendingClosure && (
              <span className="text-xs font-semibold text-amber-800">
                · {isAr ? 'تم إرسال طلب إغلاق الطاولة للباريستا' : 'Table close request sent'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsTableCloseOpen(true)}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Banknote className="w-3.5 h-3.5 text-emerald-400" />
              <CreditCard className="w-3.5 h-3.5 text-indigo-300" />
              <span>
                {isAr ? 'إغلاق الطاولة (كاش / فيزا) + تقييم الباريستا' : 'Close Table (Cash / Visa) & Rate Barista'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Menu Layout */}
      <main id="menu-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-6">
        <ExteriorCategoryNav
          activeSectionId={activeCategoryId}
          onSelectCategory={(id) => {
            setActiveCategoryId(id);
            if (id) {
              setViewMode((prev) => (prev === 'all' ? 'all' : 'single'));
            }
          }}
          viewMode={viewMode}
          onChangeViewMode={(mode) => {
            setViewMode(mode);
            if (mode === 'all') setActiveCategoryId(null);
          }}
        />

        {/* Search & Layout Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder={isAr ? 'ابحث عن مشروب أو وصف...' : 'Search drinks, flavors, or cans...'}
              className="w-full min-h-[44px] ps-10 pe-4 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-slate-100 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setMenuLayout('card')}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                  menuLayout === 'card' ? 'bg-white text-slate-950' : 'text-slate-600'
                }`}
              >
                {isAr ? 'صور' : 'Cards'}
              </button>
              <button
                type="button"
                onClick={() => setMenuLayout('compact')}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                  menuLayout === 'compact' ? 'bg-white text-slate-950' : 'text-slate-600'
                }`}
              >
                {isAr ? 'قائمة' : 'List'}
              </button>
            </div>
          </div>
        </div>

        {/* Category Sections */}
        <div className="space-y-10">
          {filteredCategories.map((cat) => {
            const catDrinks = drinks.filter((d) => {
              if (d.categoryId !== cat.id) return false;
              if (!menuSearch.trim()) return true;
              const q = menuSearch.toLowerCase();
              return (
                d.name.toLowerCase().includes(q) ||
                (d.nameAr && d.nameAr.toLowerCase().includes(q)) ||
                (d.note && d.note.toLowerCase().includes(q)) ||
                (d.noteAr && d.noteAr.toLowerCase().includes(q))
              );
            });

            if (catDrinks.length === 0) return null;

            return (
              <section key={cat.id} id={`section-${cat.id}`} className="space-y-4">
                <div className="flex items-baseline justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-950">
                      {isAr && cat.nameAr ? cat.nameAr : cat.name}
                    </h2>
                    {(cat.description || cat.descriptionAr) && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isAr && cat.descriptionAr ? cat.descriptionAr : cat.description}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-xs text-slate-500 tabular-nums">
                    {catDrinks.length} {isAr ? 'مشروب' : 'items'}
                  </span>
                </div>

                <div
                  className={
                    menuLayout === 'card'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
                      : 'grid grid-cols-1 md:grid-cols-2 gap-3'
                  }
                >
                  {catDrinks.map((drink) => (
                    <DrinkItemRow
                      key={drink.id}
                      drink={drink}
                      layout={menuLayout}
                      onCustomize={(d) => setCustomizingDrink(d)}
                      onGiveFeedback={(d) => {
                        setFeedbackDrink(d);
                        setIsFeedbackOpen(true);
                      }}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* Mobile Floating Bag CTA (Respects <= 15% Sticky Cap) */}
      {cartItemsCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 sm:hidden z-30">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-slate-950 text-white shadow-xl flex items-center justify-between font-bold text-sm cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>{isAr ? 'مراجعة السلة والطلب' : 'View Cart & Checkout'}</span>
              <span className="font-mono text-xs bg-white/20 px-2 py-0.5 rounded-md tabular-nums">
                {cartItemsCount}
              </span>
            </div>
            <span className="font-mono tabular-nums">
              {cartTotal} {settings.currencySymbol}
            </span>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <strong className="text-slate-900">{settings.storeName}</strong> · {isAr ? settings.addressAr : settings.address}
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setFeedbackDrink(null);
                setIsFeedbackOpen(true);
              }}
              className="hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <MessageSquareHeart className="w-3.5 h-3.5 text-rose-500" />
              <span>{isAr ? 'شاركنا رأيك' : 'Leave Feedback'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsInstallOpen(true)}
              className="hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تثبيت التطبيق' : 'Install App'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Guest Modals */}
      <CustomizeDrinkModal
        drink={customizingDrink}
        onClose={() => setCustomizingDrink(null)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderPlaced={(ord) => {
          setRecentOrder(ord);
        }}
      />

      <OrderSuccessModal
        order={recentOrder}
        onClose={() => setRecentOrder(null)}
        onViewAllOrders={() => {
          setRecentOrder(null);
          setIsOrdersOpen(true);
        }}
      />

      <MyOrdersModal isOpen={isOrdersOpen} onClose={() => setIsOrdersOpen(false)} />

      <QrCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        onOpenOrders={() => {
          setIsQrOpen(false);
          setIsOrdersOpen(true);
        }}
      />

      <PWAInstallModal isOpen={isInstallOpen} onClose={() => setIsInstallOpen(false)} />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        preSelectedDrink={feedbackDrink}
      />

      <TableCloseModal
        isOpen={isTableCloseOpen}
        onClose={() => setIsTableCloseOpen(false)}
        initialTable={activeTable}
      />
    </div>
  );
};
