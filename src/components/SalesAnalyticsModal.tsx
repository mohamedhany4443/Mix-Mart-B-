import React, { useState, useMemo } from 'react';
import { useCoffee } from '../context/CoffeeContext';
import {
  X,
  TrendingUp,
  BarChart3,
  PieChart,
  Sparkles,
  Download,
} from 'lucide-react';

interface SalesAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SalesAnalyticsModal: React.FC<SalesAnalyticsModalProps> = ({ isOpen, onClose }) => {
  const { orders, categories, drinks, settings, language } = useCoffee();
  const isAr = language === 'ar';
  const [timeRange, setTimeRange] = useState<'all' | 'today'>('all');

  // Filter orders by time range if needed
  const filteredOrders = useMemo(() => {
    if (timeRange === 'today') {
      const todayStr = new Date().toISOString().slice(0, 10);
      return orders.filter((o) => o.createdAt.startsWith(todayStr));
    }
    return orders;
  }, [orders, timeRange]);

  // Aggregate Total Sales
  const totalRevenue = useMemo(() => {
    return filteredOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);
  }, [filteredOrders]);

  const completedOrdersCount = useMemo(() => {
    return filteredOrders.filter((o) => o.status === 'completed').length;
  }, [filteredOrders]);

  const activeOrdersCount = useMemo(() => {
    return filteredOrders.filter((o) => o.status === 'received' || o.status === 'preparing' || o.status === 'ready').length;
  }, [filteredOrders]);

  const avgOrderValue = useMemo(() => {
    const validOrders = filteredOrders.filter((o) => o.status !== 'cancelled');
    if (validOrders.length === 0) return 0;
    return Math.round(totalRevenue / validOrders.length);
  }, [filteredOrders, totalRevenue]);

  // Sales Percentage by Category
  const categorySales = useMemo(() => {
    const catMap: Record<string, { name: string; nameAr?: string; revenue: number; itemsSold: number }> = {};

    categories.forEach((c) => {
      catMap[c.id] = {
        name: c.name,
        nameAr: c.nameAr,
        revenue: 0,
        itemsSold: 0,
      };
    });

    filteredOrders
      .filter((o) => o.status !== 'cancelled')
      .forEach((order) => {
        order.items.forEach((item) => {
          const drink = drinks.find((d) => d.id === item.drinkId);
          const catId = drink ? drink.categoryId : 'other';

          if (!catMap[catId]) {
            catMap[catId] = {
              name: 'Other Specialties',
              nameAr: 'أخرى',
              revenue: 0,
              itemsSold: 0,
            };
          }

          catMap[catId].revenue += item.totalPrice;
          catMap[catId].itemsSold += item.quantity;
        });
      });

    return Object.entries(catMap)
      .map(([id, data]) => {
        const percentage = totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0;
        return {
          id,
          ...data,
          percentage: Number(percentage.toFixed(1)),
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, categories, drinks, totalRevenue]);

  // Top Selling Drinks with Percentage Share
  const topDrinks = useMemo(() => {
    const drinkMap: Record<string, { name: string; nameAr?: string; revenue: number; qty: number }> = {};

    filteredOrders
      .filter((o) => o.status !== 'cancelled')
      .forEach((order) => {
        order.items.forEach((item) => {
          if (!drinkMap[item.drinkId]) {
            drinkMap[item.drinkId] = {
              name: item.name,
              nameAr: item.nameAr,
              revenue: 0,
              qty: 0,
            };
          }
          drinkMap[item.drinkId].revenue += item.totalPrice;
          drinkMap[item.drinkId].qty += item.quantity;
        });
      });

    const list = Object.values(drinkMap).map((d) => {
      const percentage = totalRevenue > 0 ? (d.revenue / totalRevenue) * 100 : 0;
      return {
        ...d,
        percentage: Number(percentage.toFixed(1)),
      };
    });

    return list.sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [filteredOrders, totalRevenue]);

  // Seed sample demo sales for instant realistic visualization
  const handleSeedDemoSales = () => {
    const sampleCustomerNames = [
      { name: 'Karim Ahmed', phone: '01012345678' },
      { name: 'Sarah Mansour', phone: '01223456789' },
      { name: 'Omar Youssef', phone: '01134567890' },
      { name: 'Nour El-Din', phone: '01098765432' },
      { name: 'Mariam Khaled', phone: '01543219876' },
      { name: 'Tarek Zaki', phone: '01233221100' },
    ];

    const savedOrders = JSON.parse(localStorage.getItem('mixmart_official_orders_v2') || '[]');

    sampleCustomerNames.forEach((cust, idx) => {
      const sampleDrink1 = drinks[idx % drinks.length];
      const sampleDrink2 = drinks[(idx + 3) % drinks.length];

      const randomWait = 10 + (idx * 5);
      const readyTime = new Date(Date.now() + randomWait * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const newOrder = {
        id: `demo-${Date.now()}-${idx}`,
        orderNumber: `MM-${200 + idx}`,
        customerName: cust.name,
        customerPhone: cust.phone,
        pickupTime: `Ready in ~${randomWait} mins (${readyTime})`,
        items: [
          {
            cartItemId: `${sampleDrink1.id}-std`,
            drinkId: sampleDrink1.id,
            name: sampleDrink1.name,
            nameAr: sampleDrink1.nameAr,
            unitPrice: sampleDrink1.price,
            totalPrice: sampleDrink1.price * (idx % 2 + 1),
            quantity: idx % 2 + 1,
            size: 'Standard',
            temperature: sampleDrink1.temperature === 'iced' ? 'Iced' : 'Hot',
          },
          {
            cartItemId: `${sampleDrink2.id}-std`,
            drinkId: sampleDrink2.id,
            name: sampleDrink2.name,
            nameAr: sampleDrink2.nameAr,
            unitPrice: sampleDrink2.price,
            totalPrice: sampleDrink2.price,
            quantity: 1,
            size: 'Standard',
            temperature: sampleDrink2.temperature === 'iced' ? 'Iced' : 'Hot',
          },
        ],
        subtotal: sampleDrink1.price * (idx % 2 + 1) + sampleDrink2.price,
        tax: 0,
        total: sampleDrink1.price * (idx % 2 + 1) + sampleDrink2.price,
        status: idx % 3 === 0 ? 'completed' : idx % 2 === 0 ? 'ready' : 'preparing',
        createdAt: new Date(Date.now() - idx * 3600000).toISOString(),
        estimatedReadyTime: readyTime,
      };

      savedOrders.unshift(newOrder);
    });

    localStorage.setItem('mixmart_official_orders_v2', JSON.stringify(savedOrders));
    window.location.reload();
  };

  const handleExportCsv = () => {
    let csv = 'Category,Items Sold,Revenue,Sales Percentage\n';
    categorySales.forEach((cat) => {
      csv += `"${cat.name}",${cat.itemsSold},${cat.revenue},${cat.percentage}%\n`;
    });
    csv += '\nTop Selling Drinks,Quantity Sold,Revenue,Sales Share\n';
    topDrinks.forEach((dr) => {
      csv += `"${dr.name}",${dr.qty},${dr.revenue},${dr.percentage}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mix-mart-sales-percentage-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 max-h-[92vh] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div className="h-1 bg-slate-900" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-slate-950">
                  {isAr ? 'متابعة نسبة المبيعات والأرباح' : 'Sales Percentage & Analytics'}
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 tracking-wider uppercase">
                  {isAr ? 'مباشر' : 'Live'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {isAr
                  ? 'متابعة نسب مبيعات كل قسم ومشروب من إجمالي أرباح ميكس مارت'
                  : 'Track sales percentage share across categories and top performing drinks'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Time Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-full text-xs">
              <button
                type="button"
                onClick={() => setTimeRange('all')}
                className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                  timeRange === 'all'
                    ? 'bg-slate-900 text-white shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isAr ? 'كل الأوقات' : 'All Time'}
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('today')}
                className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                  timeRange === 'today'
                    ? 'bg-slate-900 text-white shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isAr ? 'اليوم' : 'Today'}
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Dashboard Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1 text-xs relative">
          {/* Top KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                {isAr ? 'إجمالي المبيعات' : 'Total Sales'}
              </span>
              <div className="font-mono text-2xl font-extrabold text-slate-950 tabular-nums">
                {totalRevenue} {settings.currencySymbol}
              </div>
              <div className="text-[10px] text-emerald-700 font-medium">
                {filteredOrders.length} {isAr ? 'طلب استلام' : 'orders placed'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                {isAr ? 'متوسط قيمة الطلب' : 'Avg Order Value'}
              </span>
              <div className="font-mono text-2xl font-extrabold text-slate-950 tabular-nums">
                {avgOrderValue} {settings.currencySymbol}
              </div>
              <div className="text-[10px] text-slate-500">
                {isAr ? 'لكل عميل' : 'per customer'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                {isAr ? 'الطلبات المكتملة' : 'Completed Orders'}
              </span>
              <div className="font-mono text-2xl font-extrabold text-emerald-700 tabular-nums">
                {completedOrdersCount}
              </div>
              <div className="text-[10px] text-slate-500">
                {isAr ? 'تم استلامها من البار' : 'collected at counter'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                {isAr ? 'الطلبات قيد التجهيز' : 'In-Progress Queue'}
              </span>
              <div className="font-mono text-2xl font-extrabold text-slate-900 tabular-nums">
                {activeOrdersCount}
              </div>
              <div className="text-[10px] text-slate-500">
                {isAr ? 'جاري تحضيرها الآن' : 'brewing at bar'}
              </div>
            </div>
          </div>

          {/* Section 1: Category Sales Percentage Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-slate-900" />
                <h4 className="font-display text-sm font-bold text-slate-950">
                  {isAr ? 'نسبة مبيعات كل قسم من الإجمالي (%)' : 'Category Sales Percentage Share (%)'}
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">
                {isAr ? 'مرتبة بالأعلى مبيعاً' : 'Ranked by revenue'}
              </span>
            </div>

            {totalRevenue === 0 ? (
              <div className="py-8 text-center text-slate-500 space-y-2">
                <p>{isAr ? 'لا توجد مبيعات مسجلة بعد في هذه الفترة.' : 'No sales recorded yet in this period.'}</p>
                <button
                  type="button"
                  onClick={handleSeedDemoSales}
                  className="px-3.5 py-1.5 rounded-full bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تعبئة بيانات مبيعات تجريبية للاختبار' : 'Load Demo Sales Data to Test'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {categorySales
                  .filter((cat) => cat.revenue > 0)
                  .map((cat) => (
                    <div key={cat.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {isAr && cat.nameAr ? cat.nameAr : cat.name}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            ({cat.itemsSold} {isAr ? 'كوب مباع' : 'items sold'})
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-slate-600 tabular-nums">
                            {cat.revenue} {settings.currencySymbol}
                          </span>
                          <span className="font-mono text-sm font-extrabold text-slate-950 tabular-nums w-14 text-right">
                            {cat.percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Visual Percentage Bar */}
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex p-0.5">
                        <div
                          className="h-full bg-slate-900 rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(4, cat.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Section 2: Top Selling Drinks with % Share */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-900" />
                <h4 className="font-display text-sm font-bold text-slate-950">
                  {isAr ? 'المشروبات الأكثر مبيعاً ونسبة مساهمتها' : 'Top Selling Drinks & Share of Total Revenue'}
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">
                {topDrinks.length} {isAr ? 'مشروبات رئيسية' : 'top performers'}
              </span>
            </div>

            {topDrinks.length === 0 ? (
              <p className="text-center text-slate-500 py-4">
                {isAr ? 'لم يتم تسجيل طلبات مشروبات بعد.' : 'No drink sales recorded yet.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topDrinks.map((dr, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-mono font-bold shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-slate-900 truncate text-xs">
                          {isAr && dr.nameAr ? dr.nameAr : dr.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {dr.qty} {isAr ? 'طلب' : 'orders'} · {dr.revenue} {settings.currencySymbol}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-900 font-mono font-bold text-xs tabular-nums">
                        {dr.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 relative">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-semibold text-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-900" />
              <span>{isAr ? 'تصدير تقرير المبيعات (CSV)' : 'Export Report (CSV)'}</span>
            </button>

            {orders.length < 5 && (
              <button
                type="button"
                onClick={handleSeedDemoSales}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-semibold text-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? 'إضافة مبيعات تجريبية' : 'Add Demo Orders'}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all cursor-pointer shadow-xs"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
