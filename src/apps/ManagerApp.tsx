import React, { useState, useMemo } from 'react';
import { useCoffee } from '../context/CoffeeContext';
import { StaffLoginGate } from '../components/StaffLoginGate';
import {
  Briefcase,
  Globe,
  LogOut,
  TrendingUp,
  Clock,
  Banknote,
  CreditCard,
  Table,
  Star,
  Download,
  CheckCircle2,
  Search,
  ShoppingBag,
  Receipt,
} from 'lucide-react';

/**
 * Standalone Branch Manager App
 * Strictly Order Reception, Sales Analytics & Table Closure Cash/Visa Tracking ONLY.
 * NO Menu Catalog or Drink Editor per Manager role specification.
 */
export const ManagerApp: React.FC = () => {
  const {
    orders,
    categories,
    drinks,
    settings,
    language,
    setLanguage,
    syncStatus,
    updateOrderStatus,
    tableClosureRequests,
    settleTableClosure,
  } = useCoffee();

  const isAr = language === 'ar';

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mixmart_manager_app_session') === 'true';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<'orders' | 'sales' | 'closures'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'completed' | 'rejected'>('active');
  const [orderSearch, setOrderSearch] = useState('');
  const [salesRange, setSalesRange] = useState<'all' | 'today'>('all');

  if (!isAuthenticated) {
    return (
      <StaffLoginGate
        role="manager"
        expectedUsername={settings.managerUsername || 'manager_mixmart'}
        expectedSecret={settings.managerPassword}
        onAuthenticated={() => {
          setIsAuthenticated(true);
          try {
            localStorage.setItem('mixmart_manager_app_session', 'true');
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
      localStorage.removeItem('mixmart_manager_app_session');
    } catch {
      // ignore
    }
  };

  const activeOrders = orders.filter(
    (o) => o.status === 'received' || o.status === 'preparing' || o.status === 'ready'
  );
  const pendingClosures = tableClosureRequests.filter((r) => r.status === 'pending');

  const displayedOrders = orders.filter((o) => {
    if (orderFilter === 'active') {
      if (o.status !== 'received' && o.status !== 'preparing' && o.status !== 'ready') return false;
    } else if (orderFilter !== 'all' && o.status !== orderFilter) {
      return false;
    }
    if (!orderSearch.trim()) return true;
    const q = orderSearch.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.tableNumber && o.tableNumber.toLowerCase().includes(q))
    );
  });

  // Sales Calculations (Strictly derived from Orders)
  const scopedOrders = useMemo(() => {
    const valid = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'rejected');
    if (salesRange === 'today') {
      const today = new Date().toISOString().slice(0, 10);
      return valid.filter((o) => o.createdAt.startsWith(today));
    }
    return valid;
  }, [orders, salesRange]);

  const totalRevenue = useMemo(
    () => scopedOrders.reduce((sum, o) => sum + o.total, 0),
    [scopedOrders]
  );

  const cashRevenue = useMemo(
    () => scopedOrders.filter((o) => o.paymentMethod !== 'visa').reduce((sum, o) => sum + o.total, 0),
    [scopedOrders]
  );

  const visaRevenue = useMemo(
    () => scopedOrders.filter((o) => o.paymentMethod === 'visa').reduce((sum, o) => sum + o.total, 0),
    [scopedOrders]
  );

  const avgOrderValue = useMemo(
    () => (scopedOrders.length > 0 ? Math.round(totalRevenue / scopedOrders.length) : 0),
    [scopedOrders, totalRevenue]
  );

  const topSellingFromOrders = useMemo(() => {
    const map: Record<string, { name: string; nameAr?: string; qty: number; revenue: number }> = {};
    scopedOrders.forEach((ord) => {
      ord.items.forEach((it) => {
        if (!map[it.drinkId]) {
          map[it.drinkId] = { name: it.name, nameAr: it.nameAr, qty: 0, revenue: 0 };
        }
        map[it.drinkId].qty += it.quantity;
        map[it.drinkId].revenue += it.totalPrice;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [scopedOrders]);

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { name: string; nameAr?: string; revenue: number; qty: number }> = {};
    scopedOrders.forEach((ord) => {
      ord.items.forEach((it) => {
        const matchDrink = drinks.find((d) => d.id === it.drinkId);
        const cat = categories.find((c) => c.id === matchDrink?.categoryId);
        const key = cat?.id || 'other';
        if (!map[key]) {
          map[key] = {
            name: cat?.name || 'Other / Upsells',
            nameAr: cat?.nameAr || 'أخرى / ترقيات',
            revenue: 0,
            qty: 0,
          };
        }
        map[key].revenue += it.totalPrice;
        map[key].qty += it.quantity;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [scopedOrders, drinks, categories]);

  const handleExportCSV = () => {
    const header = 'OrderNumber,Customer,Table,Payment,Timing,Status,Total,CreatedAt\n';
    const rows = scopedOrders
      .map(
        (o) =>
          `"${o.orderNumber}","${o.customerName}","${o.tableNumber || 'Takeaway'}","${o.paymentMethod || 'cash'}","${o.preparationTiming || 'immediate'}","${o.status}",${o.total},"${o.createdAt}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mixmart-manager-sales-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      {/* 3-Zone Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Brand & Role */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-300 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-extrabold text-lg text-slate-950 whitespace-nowrap">
                {settings.storeName}
              </span>
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                {isAr ? 'تطبيق المدير' : 'Manager App'}
              </span>
            </div>
          </div>

          {/* Zone 2: Orders Reception & Sales ONLY (No Menu Tab) */}
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
              <Clock className="w-3.5 h-3.5" />
              <span>{isAr ? 'استقبال الطلبات' : 'Orders Reception'}</span>
              {activeOrders.length > 0 && (
                <span className="font-mono tabular-nums text-[11px] bg-slate-900 text-white px-1.5 py-0.5 rounded">
                  {activeOrders.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sales')}
              className={`min-h-[38px] px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'sales'
                  ? 'bg-white text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isAr ? 'متابعة المبيعات' : 'Sales Analytics'}</span>
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
              <Table className="w-3.5 h-3.5" />
              <span>{isAr ? 'الطاولات' : 'Tables'}</span>
              {pendingClosures.length > 0 && (
                <span className="font-mono tabular-nums text-[11px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                  {pendingClosures.length}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Language & Sign Out */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden lg:inline text-xs font-mono text-slate-500 whitespace-nowrap">
              {syncStatus === 'live' ? (isAr ? 'متصل مباشر' : 'Live Sync') : (isAr ? 'محلي' : 'Local')}
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: ORDERS RECEPTION */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500 font-medium">
                  {isAr ? 'طلبات نشطة الآن' : 'Active Queue'}
                </div>
                <div className="font-mono text-2xl font-extrabold text-slate-950 tabular-nums mt-1">
                  {activeOrders.length}
                </div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500 font-medium">
                  {isAr ? 'الطلبات المكتملة' : 'Completed'}
                </div>
                <div className="font-mono text-2xl font-extrabold text-emerald-600 tabular-nums mt-1">
                  {orders.filter((o) => o.status === 'completed').length}
                </div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500 font-medium">
                  {isAr ? 'مبيعات الكاش' : 'Cash Revenue'}
                </div>
                <div className="font-mono text-2xl font-extrabold text-slate-950 tabular-nums mt-1">
                  {cashRevenue} {settings.currencySymbol}
                </div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500 font-medium">
                  {isAr ? 'مبيعات الفيزا' : 'Visa Revenue'}
                </div>
                <div className="font-mono text-2xl font-extrabold text-indigo-600 tabular-nums mt-1">
                  {visaRevenue} {settings.currencySymbol}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                {(
                  [
                    { id: 'active', labelEn: 'Active', labelAr: 'النشطة' },
                    { id: 'completed', labelEn: 'Completed', labelAr: 'المكتملة' },
                    { id: 'rejected', labelEn: 'Rejected', labelAr: 'المرفوضة' },
                    { id: 'all', labelEn: 'All Orders', labelAr: 'الكل' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setOrderFilter(f.id)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap ${
                      orderFilter === f.id ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    {isAr ? f.labelAr : f.labelEn}
                  </button>
                ))}
              </div>

              <div className="relative sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder={isAr ? 'بحث برقم الطلب أو العميل...' : 'Search order # or guest...'}
                  className="w-full min-h-[40px] ps-9 pe-3 rounded-xl bg-white border border-slate-200 text-xs outline-none focus:border-slate-900"
                />
              </div>
            </div>

            {displayedOrders.length === 0 ? (
              <div className="py-16 bg-white border border-slate-200 rounded-3xl text-center space-y-2">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-900">
                  {isAr ? 'لا توجد طلبات مطابقة' : 'No matching orders'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedOrders.map((ord) => (
                  <div key={ord.id} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg font-extrabold text-slate-950 tabular-nums">
                            #{ord.orderNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            {ord.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 mt-1">
                          <span className="font-semibold text-slate-900">{ord.customerName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{ord.tableNumber || (isAr ? 'سفري' : 'Takeaway')}</span>
                          <span aria-hidden="true">·</span>
                          <span>{ord.paymentMethod === 'visa' ? (isAr ? 'فيزا' : 'Visa') : (isAr ? 'كاش' : 'Cash')}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {ord.preparationTiming === 'scheduled' && ord.scheduledMinutes
                              ? isAr
                                ? `بعد ${ord.scheduledMinutes}د`
                                : `In ${ord.scheduledMinutes}m`
                              : isAr
                              ? 'تحضير فوري'
                              : 'Immediate'}
                          </span>
                        </div>
                      </div>
                      <div className="font-mono text-lg font-extrabold text-slate-950 tabular-nums">
                        {ord.total} {settings.currencySymbol}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-2.5 space-y-1 text-xs">
                      {ord.items.map((it, i) => (
                        <div key={i} className="flex justify-between gap-2">
                          <span>
                            <span className="font-mono font-bold">{it.quantity}×</span>{' '}
                            {isAr && it.nameAr ? it.nameAr : it.name}
                          </span>
                          <span className="font-mono text-slate-600 tabular-nums">
                            {it.totalPrice} {settings.currencySymbol}
                          </span>
                        </div>
                      ))}
                    </div>

                    {(ord.status === 'received' || ord.status === 'preparing' || ord.status === 'ready') && (
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                        {ord.status === 'received' && (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(ord.id, 'preparing')}
                            className="flex-1 min-h-[40px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                          >
                            {isAr ? 'بدء التحضير' : 'Move to Preparing'}
                          </button>
                        )}
                        {ord.status === 'preparing' && (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(ord.id, 'ready')}
                            className="flex-1 min-h-[40px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                          >
                            {isAr ? 'جاهز للاستلام' : 'Mark Ready'}
                          </button>
                        )}
                        {ord.status === 'ready' && (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(ord.id, 'completed')}
                            className="flex-1 min-h-[40px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isAr ? 'إتمام التسليم' : 'Complete'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SALES ANALYTICS (NO MENU) */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-extrabold text-slate-950">
                  {isAr ? 'تقارير ومتابعة مبيعات الفرع' : 'Branch Sales Analytics'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'متابعة المبيعات النقدية والفيزا وأعلى المشروبات مبيعاً'
                    : 'Real-time revenue breakdown, Cash vs Visa share & top-selling items'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex p-1 bg-slate-100 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setSalesRange('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                      salesRange === 'all' ? 'bg-white text-slate-950' : 'text-slate-600'
                    }`}
                  >
                    {isAr ? 'الإجمالي الكلي' : 'All Time'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSalesRange('today')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                      salesRange === 'today' ? 'bg-white text-slate-950' : 'text-slate-600'
                    }`}
                  >
                    {isAr ? 'اليوم' : 'Today'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="min-h-[38px] px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500 font-medium">
                  {isAr ? 'إجمالي المبيعات' : 'Total Revenue'}
                </div>
                <div className="font-mono text-2xl font-extrabold text-slate-950 tabular-nums mt-1">
                  {totalRevenue} {settings.currencySymbol}
                </div>
              </div>
              <div className="p-5 bg-white border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500 font-medium">
                  {isAr ? 'متوسط قيمة الطلب' : 'Avg. Order Value'}
                </div>
                <div className="font-mono text-2xl font-extrabold text-slate-950 tabular-nums mt-1">
                  {avgOrderValue} {settings.currencySymbol}
                </div>
              </div>
              <div className="p-5 bg-white border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAr ? 'إجمالي الكاش' : 'Cash Sales'}</span>
                </div>
                <div className="font-mono text-2xl font-extrabold text-emerald-700 tabular-nums mt-1">
                  {cashRevenue} {settings.currencySymbol}
                </div>
              </div>
              <div className="p-5 bg-white border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isAr ? 'إجمالي الفيزا' : 'Visa Sales'}</span>
                </div>
                <div className="font-mono text-2xl font-extrabold text-indigo-700 tabular-nums mt-1">
                  {visaRevenue} {settings.currencySymbol}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
                <h3 className="font-display text-base font-bold text-slate-950">
                  {isAr ? 'نسبة المبيعات حسب الأقسام' : 'Category Sales Breakdown'}
                </h3>
                <div className="space-y-3">
                  {categoryBreakdown.length === 0 ? (
                    <p className="text-xs text-slate-500">{isAr ? 'لا توجد بيانات بعد.' : 'No data yet.'}</p>
                  ) : (
                    categoryBreakdown.map((c) => {
                      const pct = totalRevenue > 0 ? Math.round((c.revenue / totalRevenue) * 100) : 0;
                      return (
                        <div key={c.name} className="space-y-1 text-xs">
                          <div className="flex justify-between font-semibold">
                            <span>{isAr && c.nameAr ? c.nameAr : c.name}</span>
                            <span className="font-mono tabular-nums">
                              {c.revenue} {settings.currencySymbol} · {pct}%
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-900 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
                <h3 className="font-display text-base font-bold text-slate-950">
                  {isAr ? 'أعلى الأصناف مبيعاً (من الطلبات)' : 'Top Ordered Items'}
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  {topSellingFromOrders.length === 0 ? (
                    <p className="text-slate-500 py-4">{isAr ? 'لا توجد بيانات بعد.' : 'No orders yet.'}</p>
                  ) : (
                    topSellingFromOrders.map((item) => (
                      <div key={item.name} className="py-2.5 flex items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900">
                            {isAr && item.nameAr ? item.nameAr : item.name}
                          </div>
                          <div className="text-slate-500 font-mono tabular-nums">
                            {item.qty} {isAr ? 'كوب/وحدة' : 'sold'}
                          </div>
                        </div>
                        <div className="font-mono font-extrabold text-slate-950 tabular-nums">
                          {item.revenue} {settings.currencySymbol}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TABLE CLOSURES */}
        {activeTab === 'closures' && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-slate-950">
              {isAr ? 'حسابات وتقفيل الطاولات (كاش / فيزا)' : 'Table Closures & Barista Feedback'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tableClosureRequests.map((req) => (
                <div key={req.id} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono font-extrabold text-base text-slate-950">
                        {req.tableNumber} · {req.paymentMethod === 'visa' ? (isAr ? 'فيزا' : 'Visa') : (isAr ? 'كاش' : 'Cash')}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{req.guestName}</div>
                    </div>
                    <div className="font-mono text-lg font-extrabold text-slate-950 tabular-nums">
                      {req.totalAmount} {settings.currencySymbol}
                    </div>
                  </div>
                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl space-y-1">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < req.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                        />
                      ))}
                    </div>
                    <p>"{req.baristaFeedback}"</p>
                  </div>
                  {req.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => settleTableClosure(req.id)}
                      className="w-full min-h-[42px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>{isAr ? 'تأكيد تسوية الطاولة' : 'Settle Table'}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
