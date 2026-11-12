import React, { useState } from 'react';
import { useCoffee } from '../context/CoffeeContext';
import { PickupOrder } from '../types';
import { StaffLoginGate } from '../components/StaffLoginGate';
import {
  Coffee,
  Globe,
  LogOut,
  Check,
  XCircle,
  Sparkles,
  Plus,
  Clock,
  Table,
  Banknote,
  CreditCard,
  Star,
  CheckCircle2,
  Receipt,
  Send,
  ShoppingBag,
  AlertTriangle,
} from 'lucide-react';

export const BaristaApp: React.FC = () => {
  const {
    orders,
    drinks,
    settings,
    language,
    setLanguage,
    syncStatus,
    acceptOrder,
    rejectOrder,
    updateOrderStatus,
    sendUpsellOffer,
    tableClosureRequests,
    settleTableClosure,
  } = useCoffee();

  const isAr = language === 'ar';

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mixmart_barista_app_session') === 'true';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<'orders' | 'closures'>('orders');
  const [statusFilter, setStatusFilter] = useState<
    'active' | 'received' | 'preparing' | 'ready' | 'all' | 'rejected'
  >('active');

  // Reject Modal State
  const [rejectingOrder, setRejectingOrder] = useState<PickupOrder | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Upsell / Cross-Sell Drawer State
  const [upsellOrder, setUpsellOrder] = useState<PickupOrder | null>(null);
  const [upsellMode, setUpsellMode] = useState<'offer' | 'direct'>('offer');
  const [customUpsellTitle, setCustomUpsellTitle] = useState('');
  const [customUpsellPrice, setCustomUpsellPrice] = useState<number>(35);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  if (!isAuthenticated) {
    return (
      <StaffLoginGate
        role="barista"
        expectedUsername={settings.staffUsername || 'barista_staff'}
        expectedSecret={settings.staffPin || settings.adminPin}
        onAuthenticated={() => {
          setIsAuthenticated(true);
          try {
            localStorage.setItem('mixmart_barista_app_session', 'true');
          } catch {
            // ignore
          }
        }}
      />
    );
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('mixmart_barista_app_session');
    } catch {
      // ignore
    }
  };

  const pendingDecisionCount = orders.filter((o) => o.status === 'received').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const pendingClosures = tableClosureRequests.filter((r) => r.status === 'pending');

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'active') {
      return o.status === 'received' || o.status === 'preparing' || o.status === 'ready';
    }
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  const quickRejectReasons = isAr
    ? [
        'نفاذ مكون أساسي لهذا المشروب حالياً',
        'الماكينة في صيانة سريعة لمدة 15 دقيقة',
        'ضغط طلبات مرتفع — نعتذر عن التأخير',
        'الصنف غير متاح الآن',
      ]
    : [
        'Key ingredient currently out of stock',
        'Espresso machine brief maintenance (15 mins)',
        'High queue load — unable to fulfill in window',
        'Selected drink currently unavailable',
      ];

  const upsellPresets = [
    {
      type: 'upsell' as const,
      title: 'Upgrade to Large Size',
      titleAr: 'ترقية إلى حجم كبير (Large)',
      price: 25,
    },
    {
      type: 'upsell' as const,
      title: 'Extra Espresso Shot',
      titleAr: 'إضافة شوت اسبرسو إضافي',
      price: 45,
    },
    {
      type: 'upsell' as const,
      title: 'Special Mix Mart Can Cup',
      titleAr: 'تقديم في علبة كانز ميكس مارت',
      price: 30,
    },
    {
      type: 'upsell' as const,
      title: 'Lotus / Pistachio Whip Cream',
      titleAr: 'إضافة كريمة لوتس / بستاشيو',
      price: 40,
    },
    {
      type: 'cross-sell' as const,
      title: 'Chilled Cola Can',
      titleAr: 'كانز كولا مثلجة (Cross-sell)',
      price: 35,
    },
    {
      type: 'cross-sell' as const,
      title: 'Pure Mineral Water Bottle',
      titleAr: 'زجاجة مياه معدنية نقية',
      price: 20,
    },
    {
      type: 'cross-sell' as const,
      title: 'Crystal Cup of Ice',
      titleAr: 'كاس ثلج كريستال إضافي',
      price: 10,
    },
    {
      type: 'cross-sell' as const,
      title: 'Warm Butter Croissant',
      titleAr: 'كرواسون زبدة دافئ',
      price: 75,
    },
  ];

  // Refresh reference for open upsellOrder
  const currentUpsellOrder = upsellOrder
    ? orders.find((o) => o.id === upsellOrder.id) || upsellOrder
    : null;

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      {/* 3-Zone Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Brand & Role */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-sky-300 flex items-center justify-center">
              <Coffee className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-extrabold text-lg text-slate-950 whitespace-nowrap">
                {settings.storeName}
              </span>
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                {isAr ? 'تطبيق الباريستا' : 'Barista App'}
              </span>
            </div>
          </div>

          {/* Zone 2: Clean Nav Tabs */}
          <nav className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`min-h-[38px] px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-white text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <span>{isAr ? 'الطلبات والترقيات' : 'Orders & Upsell'}</span>
              {pendingDecisionCount > 0 && (
                <span className="font-mono tabular-nums text-[11px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                  {pendingDecisionCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('closures')}
              className={`min-h-[38px] px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'closures'
                  ? 'bg-white text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <span>{isAr ? 'تقفيل الطاولات' : 'Table Closures'}</span>
              {pendingClosures.length > 0 && (
                <span className="font-mono tabular-nums text-[11px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">
                  {pendingClosures.length}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Compact Utility & Sign Out */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline text-xs font-mono text-slate-500 whitespace-nowrap">
              {syncStatus === 'live' ? (isAr ? 'مزامنة حية' : 'Live Sync') : (isAr ? 'محلي' : 'Local')}
            </span>
            <button
              type="button"
              onClick={() => setLanguage(isAr ? 'en' : 'ar')}
              className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isAr ? 'EN' : 'عربي'}</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-xs font-semibold text-slate-700 hover:text-rose-700 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? 'خروج' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {toastMsg && (
          <div className="p-3 rounded-xl bg-slate-950 text-white text-xs font-bold flex items-center justify-between">
            <span>{toastMsg}</span>
            <button
              type="button"
              onClick={() => setToastMsg(null)}
              className="text-slate-300 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {activeTab === 'orders' ? (
          <div className="space-y-6">
            {/* Compact KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500 font-medium">
                  {isAr ? 'طلبات بانتظار القرار' : 'Awaiting Decision'}
                </div>
                <div className="font-mono text-2xl font-extrabold text-amber-600 tabular-nums mt-1">
                  {pendingDecisionCount}
                </div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500 font-medium">
                  {isAr ? 'جاري التحضير' : 'Preparing'}
                </div>
                <div className="font-mono text-2xl font-extrabold text-slate-950 tabular-nums mt-1">
                  {preparingCount}
                </div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500 font-medium">
                  {isAr ? 'جاهز للاستلام' : 'Ready for Pickup'}
                </div>
                <div className="font-mono text-2xl font-extrabold text-emerald-600 tabular-nums mt-1">
                  {readyCount}
                </div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500 font-medium">
                  {isAr ? 'إجمالي طلبات اليوم' : 'Total Orders'}
                </div>
                <div className="font-mono text-2xl font-extrabold text-slate-950 tabular-nums mt-1">
                  {orders.length}
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1.5 flex-wrap p-1 bg-slate-100 rounded-xl">
                {(
                  [
                    { id: 'active', labelEn: 'Active Queue', labelAr: 'النشطة الآن' },
                    { id: 'received', labelEn: 'Pending Accept', labelAr: 'تنتظر القبول' },
                    { id: 'preparing', labelEn: 'Preparing', labelAr: 'قيد التحضير' },
                    { id: 'ready', labelEn: 'Ready', labelAr: 'جاهزة' },
                    { id: 'rejected', labelEn: 'Rejected', labelAr: 'المرفوضة' },
                    { id: 'all', labelEn: 'All', labelAr: 'الكل' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStatusFilter(f.id)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                      statusFilter === f.id
                        ? 'bg-white text-slate-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {isAr ? f.labelAr : f.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Grid */}
            {filteredOrders.length === 0 ? (
              <div className="py-20 bg-white border border-slate-200 rounded-3xl text-center space-y-2">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-900">
                  {isAr ? 'لا توجد طلبات في هذا القسم حالياً' : 'No orders in this queue'}
                </p>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'أي طلب يرسله الضيف سيظهر هنا فوراً لاتخاذ قرار القبول أو الرفض وعمل Upsell.'
                    : 'New guest orders appear here automatically for Accept/Reject & Upselling.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredOrders.map((ord) => {
                  const isReceived = ord.status === 'received';
                  const isPreparing = ord.status === 'preparing';
                  const isReady = ord.status === 'ready';
                  const isRejected = ord.status === 'rejected';
                  const canModifyOrUpsell = isReceived || isPreparing || isReady;

                  return (
                    <div
                      key={ord.id}
                      className={`bg-white border rounded-2xl p-5 flex flex-col justify-between gap-4 ${
                        isReceived
                          ? 'border-amber-300'
                          : isRejected
                          ? 'border-rose-200 bg-rose-50/20'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Top Header */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-lg font-extrabold text-slate-950 tabular-nums">
                                #{ord.orderNumber}
                              </span>
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                  isReceived
                                    ? 'bg-amber-100 text-amber-900'
                                    : isPreparing
                                    ? 'bg-slate-900 text-white'
                                    : isReady
                                    ? 'bg-emerald-100 text-emerald-900'
                                    : isRejected
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {isReceived
                                  ? isAr
                                    ? 'طلب جديد'
                                    : 'New Order'
                                  : isPreparing
                                  ? isAr
                                    ? 'قيد التحضير'
                                    : 'Preparing'
                                  : isReady
                                  ? isAr
                                    ? 'جاهز'
                                    : 'Ready'
                                  : isRejected
                                  ? isAr
                                    ? 'مرفوض'
                                    : 'Rejected'
                                  : isAr
                                  ? 'مكتمل'
                                  : 'Completed'}
                              </span>
                            </div>

                            {/* Clean unboxed metadata with typographic separators */}
                            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 mt-1">
                              <span className="font-bold text-slate-900">{ord.customerName}</span>
                              <span aria-hidden="true">·</span>
                              <span>
                                {ord.tableNumber
                                  ? ord.tableNumber
                                  : isAr
                                  ? 'سفري'
                                  : 'Takeaway'}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                                {ord.paymentMethod === 'visa' ? (
                                  <>
                                    <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>{isAr ? 'فيزا' : 'Visa'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{isAr ? 'كاش' : 'Cash'}</span>
                                  </>
                                )}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>
                                  {ord.preparationTiming === 'scheduled' && ord.scheduledMinutes
                                    ? isAr
                                      ? `بعد ${ord.scheduledMinutes}د`
                                      : `In ${ord.scheduledMinutes}m`
                                    : isAr
                                    ? 'فوري'
                                    : 'Immediate'}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="text-end shrink-0">
                            <div className="font-mono text-lg font-extrabold text-slate-950 tabular-nums">
                              {ord.total} {settings.currencySymbol}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                              {new Date(ord.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-mono font-bold text-slate-950">{it.quantity}×</span>{' '}
                                <span className="font-semibold text-slate-900">
                                  {isAr && it.nameAr ? it.nameAr : it.name}
                                </span>{' '}
                                <span className="text-slate-500">({it.size})</span>
                                {it.isUpsell && (
                                  <span className="mx-1.5 text-[10px] font-bold text-indigo-700">
                                    · {it.upsellType === 'upsell' ? 'Upsell' : 'Cross-sell'}
                                  </span>
                                )}
                                {it.selectedExtras && it.selectedExtras.length > 0 && (
                                  <div className="text-[11px] text-slate-500">
                                    + {it.selectedExtras.map((e) => (isAr ? e.nameAr : e.name)).join(', ')}
                                  </div>
                                )}
                              </div>
                              <span className="font-mono font-semibold text-slate-700 tabular-nums shrink-0">
                                {it.totalPrice} {settings.currencySymbol}
                              </span>
                            </div>
                          ))}
                          {ord.notes && (
                            <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                              {isAr ? 'ملاحظات الضيف: ' : 'Guest note: '}
                              {ord.notes}
                            </div>
                          )}
                        </div>

                        {/* Sent Upsells Status */}
                        {ord.upsellOffers && ord.upsellOffers.length > 0 && (
                          <div className="pt-2 space-y-1">
                            {ord.upsellOffers.map((of) => (
                              <div
                                key={of.id}
                                className="text-[11px] flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-950"
                              >
                                <span>
                                  {of.type === 'upsell' ? 'Upsell' : 'Cross-sell'}:{' '}
                                  <strong>{isAr ? of.titleAr : of.title}</strong> (+{of.price}{' '}
                                  {settings.currencySymbol})
                                </span>
                                <span className="font-mono font-bold">
                                  {of.status === 'accepted'
                                    ? isAr
                                      ? 'موافق عليه ✓'
                                      : 'Accepted ✓'
                                    : of.status === 'declined'
                                    ? isAr
                                      ? 'مرفوض'
                                      : 'Declined'
                                    : isAr
                                    ? 'بانتظار العميل'
                                    : 'Pending'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {isRejected && ord.rejectionReason && (
                          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>
                              {isAr ? 'سبب الرفض: ' : 'Rejected: '}
                              {ord.rejectionReason}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Barista Action Buttons */}
                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                        {isReceived && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                acceptOrder(ord.id);
                                triggerToast(
                                  isAr
                                    ? `تم قبول الطلب #${ord.orderNumber} وبدء التحضير`
                                    : `Accepted order #${ord.orderNumber}`
                                );
                              }}
                              className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                              <span>{isAr ? 'قبول الطلب' : 'Accept Order'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingOrder(ord);
                                setRejectReason('');
                              }}
                              className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>{isAr ? 'رفض' : 'Reject'}</span>
                            </button>
                          </>
                        )}

                        {isPreparing && (
                          <button
                            type="button"
                            onClick={() => {
                              updateOrderStatus(ord.id, 'ready');
                              triggerToast(
                                isAr ? `الطلب #${ord.orderNumber} جاهز للاستلام` : `Order #${ord.orderNumber} marked ready`
                              );
                            }}
                            className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>{isAr ? 'تحديد كجاهز للاستلام' : 'Mark Ready'}</span>
                          </button>
                        )}

                        {isReady && (
                          <button
                            type="button"
                            onClick={() => {
                              updateOrderStatus(ord.id, 'completed');
                              triggerToast(
                                isAr ? `تم تسليم الطلب #${ord.orderNumber}` : `Order #${ord.orderNumber} completed`
                              );
                            }}
                            className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            <span>{isAr ? 'تأكيد التسليم' : 'Complete Pickup'}</span>
                          </button>
                        )}

                        {canModifyOrUpsell && (
                          <button
                            type="button"
                            onClick={() => setUpsellOrder(ord)}
                            className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span>{isAr ? 'Upsell / Cross-sell' : 'Upsell / Cross-sell'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* TABLE CLOSURES TAB */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-slate-950">
                {isAr ? 'طلبات تقفيل الطاولات (كاش / فيزا) وتقييم الباريستا' : 'Table Closure & Cash/Visa Settlements'}
              </h2>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {pendingClosures.length} {isAr ? 'قيد الانتظار' : 'pending'}
              </span>
            </div>

            {tableClosureRequests.length === 0 ? (
              <div className="py-16 bg-white border border-slate-200 rounded-3xl text-center text-slate-500 text-xs">
                {isAr ? 'لا توجد طلبات تقفيل طاولات حالياً.' : 'No table closure requests yet.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tableClosureRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`p-5 rounded-2xl border bg-white space-y-3 ${
                      req.status === 'pending' ? 'border-amber-300' : 'border-slate-200 opacity-85'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Table className="w-4 h-4 text-slate-900" />
                          <span className="font-mono font-extrabold text-base text-slate-950">
                            {req.tableNumber}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              req.status === 'pending'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {req.status === 'pending'
                              ? isAr
                                ? 'مطلوب التقفيل'
                                : 'Pending Settlement'
                              : isAr
                              ? 'تمت التسوية'
                              : 'Settled'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                          <span>{req.guestName || (isAr ? 'ضيف' : 'Guest')}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-slate-900 inline-flex items-center gap-1">
                            {req.paymentMethod === 'visa' ? (
                              <>
                                <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                                <span>{isAr ? 'فيزا' : 'Visa'}</span>
                              </>
                            ) : (
                              <>
                                <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{isAr ? 'كاش' : 'Cash'}</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="font-mono text-lg font-extrabold text-slate-950 tabular-nums">
                        {req.totalAmount} {settings.currencySymbol}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < req.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                      <p className="text-slate-700 leading-relaxed">"{req.baristaFeedback}"</p>
                    </div>

                    {req.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => {
                          settleTableClosure(req.id);
                          triggerToast(isAr ? `تمت تسوية ${req.tableNumber}` : `Settled ${req.tableNumber}`);
                        }}
                        className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Receipt className="w-4 h-4" />
                        <span>
                          {isAr
                            ? `تأكيد استلام (${req.paymentMethod === 'visa' ? 'فيزا' : 'كاش'}) وإغلاق الطاولة`
                            : `Confirm ${req.paymentMethod === 'visa' ? 'Visa' : 'Cash'} & Settle Table`}
                        </span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* REJECT REASON MODAL */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-slate-950">
                {isAr ? `رفض الطلب #${rejectingOrder.orderNumber}` : `Reject Order #${rejectingOrder.orderNumber}`}
              </h3>
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {isAr
                ? 'اختر أو اكتب سبب الرفض ليظهر مباشرة على شاشة العميل:'
                : 'Select or write the rejection reason shown directly to the guest:'}
            </p>

            <div className="space-y-1.5">
              {quickRejectReasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRejectReason(r)}
                  className={`w-full text-start px-3 py-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                    rejectReason === r
                      ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={isAr ? 'أو اكتب سبباً مخصصاً...' : 'Or write a custom reason...'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-slate-900"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="flex-1 min-h-[44px] rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {isAr ? 'تراجع' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalReason =
                    rejectReason.trim() ||
                    (isAr ? 'نعتذر، الطلب غير متاح حالياً' : 'Sorry, item unavailable right now');
                  rejectOrder(rejectingOrder.id, finalReason);
                  triggerToast(
                    isAr ? `تم رفض الطلب #${rejectingOrder.orderNumber}` : `Rejected order #${rejectingOrder.orderNumber}`
                  );
                  setRejectingOrder(null);
                }}
                className="flex-1 min-h-[44px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                {isAr ? 'تأكيد الرفض وإبلاغ العميل' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPSELL & CROSS-SELL MODAL */}
      {currentUpsellOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-h-[90vh] flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-display text-lg font-extrabold text-slate-950">
                  {isAr
                    ? `Upsell & Cross-sell للطلب #${currentUpsellOrder.orderNumber}`
                    : `Upsell & Cross-sell · Order #${currentUpsellOrder.orderNumber}`}
                </h3>
                <p className="text-xs text-slate-500">
                  {currentUpsellOrder.customerName} · {currentUpsellOrder.total} {settings.currencySymbol}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUpsellOrder(null)}
                className="min-h-[38px] min-w-[38px] rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Execution Mode Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setUpsellMode('offer')}
                className={`min-h-[40px] px-3 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                  upsellMode === 'offer' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAr ? 'إرسال عرض تفاعلي لشاشة العميل' : 'Send Live Offer to Guest'}</span>
              </button>
              <button
                type="button"
                onClick={() => setUpsellMode('direct')}
                className={`min-h-[40px] px-3 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                  upsellMode === 'direct' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'إضافة مباشرة (بعد موافقة العميل)' : 'Direct Counter Add-on'}</span>
              </button>
            </div>

            {/* Presets Grid */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {upsellPresets.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => {
                      sendUpsellOffer(
                        currentUpsellOrder.id,
                        {
                          type: preset.type,
                          title: preset.title,
                          titleAr: preset.titleAr,
                          price: preset.price,
                        },
                        upsellMode === 'direct'
                      );
                      triggerToast(
                        upsellMode === 'direct'
                          ? isAr
                            ? `تمت إضافة ${preset.titleAr} للفاتورة`
                            : `Added ${preset.title} directly`
                          : isAr
                          ? `تم إرسال عرض ${preset.titleAr} لشاشة العميل`
                          : `Sent ${preset.title} offer to guest`
                      );
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50/50 text-start flex items-center justify-between gap-2 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                        {preset.type === 'upsell' ? 'Upsell' : 'Cross-sell'}
                      </div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">
                        {isAr ? preset.titleAr : preset.title}
                      </div>
                    </div>
                    <span className="font-mono text-xs font-extrabold text-slate-950 tabular-nums shrink-0">
                      +{preset.price} {settings.currencySymbol}
                    </span>
                  </button>
                ))}
              </div>

              {/* Popular Menu Cross-Sell Suggestions */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="text-xs font-bold text-slate-700">
                  {isAr ? 'ترشيح مشروب أو صنف إضافي من القائمة (Cross-sell):' : 'Cross-sell Menu Drink:'}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {drinks
                    .filter((d) => d.isAvailable && (d.isPopular || d.categoryId === 'desserts' || d.categoryId === 'drinks-ice'))
                    .slice(0, 6)
                    .map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          sendUpsellOffer(
                            currentUpsellOrder.id,
                            {
                              type: 'cross-sell',
                              drinkId: d.id,
                              title: d.name,
                              titleAr: d.nameAr || d.name,
                              price: d.price,
                            },
                            upsellMode === 'direct'
                          );
                          triggerToast(
                            isAr ? `تم إرسال/إضافة ${d.nameAr || d.name}` : `Processed ${d.name}`
                          );
                        }}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-400 bg-white text-start cursor-pointer"
                      >
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {isAr && d.nameAr ? d.nameAr : d.name}
                        </div>
                        <div className="font-mono text-[11px] font-bold text-slate-600 tabular-nums mt-0.5">
                          +{d.price} {settings.currencySymbol}
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Custom Offer Input */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800">
                  {isAr ? 'أو أرسل ترقية / إضافة مخصصة:' : 'Custom Upsell / Cross-sell:'}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customUpsellTitle}
                    onChange={(e) => setCustomUpsellTitle(e.target.value)}
                    placeholder={isAr ? 'اسم الترقية أو الصنف...' : 'Offer description...'}
                    className="flex-1 min-h-[40px] px-3 rounded-xl bg-white border border-slate-200 text-xs outline-none focus:border-slate-900"
                  />
                  <input
                    type="number"
                    min={1}
                    value={customUpsellPrice}
                    onChange={(e) => setCustomUpsellPrice(Number(e.target.value) || 0)}
                    className="w-24 min-h-[40px] px-3 rounded-xl bg-white border border-slate-200 font-mono text-xs outline-none focus:border-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!customUpsellTitle.trim()) return;
                      sendUpsellOffer(
                        currentUpsellOrder.id,
                        {
                          type: 'upsell',
                          title: customUpsellTitle.trim(),
                          titleAr: customUpsellTitle.trim(),
                          price: Math.max(0, customUpsellPrice),
                        },
                        upsellMode === 'direct'
                      );
                      setCustomUpsellTitle('');
                      triggerToast(isAr ? 'تم إرسال العرض المخصص' : 'Custom offer processed');
                    }}
                    className="min-h-[40px] px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                  >
                    {upsellMode === 'direct' ? (isAr ? 'إضافة' : 'Add') : (isAr ? 'إرسال' : 'Send')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
