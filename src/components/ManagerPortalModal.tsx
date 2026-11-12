import React, { useState, useEffect } from 'react';
import { useCoffee } from '../context/CoffeeContext';
import {
  X,
  Briefcase,
  KeyRound,
  User,
  ShieldCheck,
  Clock,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  LogOut,
  Sliders,
  Eye,
  EyeOff,
  Table,
  Banknote,
  CreditCard,
  Receipt,
  Star,
  MessageSquare,
} from 'lucide-react';

interface ManagerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSales?: () => void;
}

export const ManagerPortalModal: React.FC<ManagerPortalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    drinks,
    orders,
    settings,
    updateSettings,
    updateOrderStatus,
    toggleDrinkAvailability,
    language,
    tableClosureRequests,
    settleTableClosure,
  } = useCoffee();

  const isAr = language === 'ar';

  const defaultManagerUser = settings.managerUsername || 'manager_mixmart';
  const defaultManagerPass = settings.managerPassword || 'Manager1234mixmart';

  // Login form state - PRE-INSERTED for seamless user experience
  const [usernameInput, setUsernameInput] = useState(defaultManagerUser);
  const [passwordInput, setPasswordInput] = useState(defaultManagerPass);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isManagerAuthenticated, setIsManagerAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('mixmart_manager_session') === 'true';
    } catch {
      return false;
    }
  });

  // Active Manager Tab
  const [managerTab, setManagerTab] = useState<'queue' | 'closures' | 'inventory' | 'shift'>('queue');
  const [drinkSearch, setDrinkSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'active'>('active');

  const pendingClosures = tableClosureRequests.filter((r) => r.status === 'pending');

  useEffect(() => {
    setUsernameInput(settings.managerUsername || 'manager_mixmart');
    setPasswordInput(settings.managerPassword || 'Manager1234mixmart');
  }, [settings]);

  if (!isOpen) return null;

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');

    const targetUser = (settings.managerUsername || 'manager_mixmart').trim().toLowerCase();
    const targetPass = (settings.managerPassword || 'Manager1234mixmart').trim();

    const inputUser = usernameInput.trim().toLowerCase();
    const inputPass = passwordInput.trim();

    if (inputUser === targetUser && inputPass === targetPass) {
      setIsManagerAuthenticated(true);
      try {
        localStorage.setItem('mixmart_manager_session', 'true');
      } catch {
        // ignore
      }
    } else {
      setAuthError(
        isAr
          ? 'اسم مستخدم المدير أو كلمة المرور غير صحيحة.'
          : 'Invalid Manager credentials. Please check or use auto-insert.'
      );
    }
  };

  const handleAutoInsert = () => {
    setUsernameInput(settings.managerUsername || 'manager_mixmart');
    setPasswordInput(settings.managerPassword || 'Manager1234mixmart');
    setAuthError('');
  };

  const handleLogout = () => {
    setIsManagerAuthenticated(false);
    try {
      localStorage.removeItem('mixmart_manager_session');
    } catch {
      // ignore
    }
  };

  // Filter orders
  const activeOrders = orders.filter(
    (o) => o.status === 'received' || o.status === 'preparing' || o.status === 'ready'
  );

  const displayedOrders = orderFilter === 'active' ? activeOrders : orders;

  const todayRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const filteredDrinks = drinks.filter((d) => {
    if (!drinkSearch) return true;
    const q = drinkSearch.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      (d.nameAr && d.nameAr.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl text-slate-900 max-h-[92vh] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div className="h-1 bg-slate-900" />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 relative">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg sm:text-xl font-bold tracking-wide text-slate-950">
                  {isAr ? 'بوابة مدير الفرع' : 'MIX MART Manager Portal'}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                  {isAr ? 'مدير التشغيل' : 'Store Manager'}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {isManagerAuthenticated
                  ? `${isAr ? 'المدير المسؤول:' : 'Manager on Duty:'} ${settings.managerName || 'Store Manager'} (@${settings.managerUsername || 'manager_mixmart'})`
                  : (isAr ? 'إدارة الطلبات المباشرة، المخزون، وأوقات الانتظار' : 'Shift dispatch, inventory stock & wait times')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isManagerAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-xs font-semibold text-slate-700 hover:text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAr ? 'خروج' : 'Sign Out'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY */}
        {!isManagerAuthenticated ? (
          /* LOGIN SCREEN WITH PRE-INSERTED CREDENTIALS */
          <div className="p-6 sm:p-10 flex-1 overflow-y-auto flex flex-col items-center justify-center text-center max-w-md mx-auto w-full space-y-5 relative">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                <Briefcase className="w-8 h-8" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display text-2xl font-bold text-slate-950">
                {isAr ? 'تسجيل دخول مدير الفرع' : 'Store Manager Login'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr
                  ? 'تم إدراج اسم المستخدم وكلمة المرور تلقائياً لك. اضغط على الزر للدخول الفوري.'
                  : 'Your manager username and password have been pre-inserted for you below. Click to sign in instantly.'}
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4 text-left">
              {/* Username Field - PRE-INSERTED */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-900" />
                    <span>{isAr ? 'اسم مستخدم المدير (مدرج تلقائياً)' : 'Manager Username (Pre-Inserted)'}</span>
                  </label>
                  <span className="text-[10px] text-slate-800 font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                    {isAr ? 'جاهز' : 'Auto-Filled'}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white text-slate-900 text-sm outline-none font-mono"
                />
              </div>

              {/* Password Field - PRE-INSERTED */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-900" />
                  <span>{isAr ? 'كلمة مرور المدير' : 'Manager Password'}</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white text-slate-900 text-sm outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Instant Sign In Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                <span>{isAr ? 'تسجيل الدخول الفوري كمدير' : '1-Click Sign In as Manager'}</span>
              </button>

              {/* Re-Insert Credentials button */}
              <button
                type="button"
                onClick={handleAutoInsert}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-800 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                <span>{isAr ? 'إعادة إدراج بيانات المدير لي' : 'Re-Insert Manager User for Me'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED MANAGER DASHBOARD */
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 overflow-x-auto no-scrollbar gap-1.5">
              <button
                type="button"
                onClick={() => setManagerTab('queue')}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  managerTab === 'queue'
                    ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {isAr ? 'طابور الطلبات والاستلام' : 'Live Pickup Queue'} ({activeOrders.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setManagerTab('closures')}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  managerTab === 'closures'
                    ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>{isAr ? 'حساب الطاولات (كاش / فيزا)' : 'Table Closures'}</span>
                {pendingClosures.length > 0 && (
                  <span className="font-mono text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black animate-pulse">
                    {pendingClosures.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setManagerTab('inventory')}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  managerTab === 'inventory'
                    ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>{isAr ? 'حالة التوفر والمخزون' : 'Drink Availability & 86'}</span>
              </button>

              <button
                type="button"
                onClick={() => setManagerTab('shift')}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  managerTab === 'shift'
                    ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isAr ? 'إعدادات الوردية والوقت' : 'Shift Controls'}</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* TAB 1: LIVE ORDERS QUEUE */}
              {managerTab === 'queue' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {isAr ? 'تصفية الطلبات:' : 'Filter Orders:'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOrderFilter('active')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          orderFilter === 'active'
                            ? 'bg-slate-900 text-white font-extrabold shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isAr ? 'النشطة فقط' : 'Active Only'} ({activeOrders.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderFilter('all')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          orderFilter === 'all'
                            ? 'bg-slate-900 text-white font-extrabold shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isAr ? 'جميع الطلبات' : 'All History'} ({orders.length})
                      </button>
                    </div>

                    <div className="text-xs text-slate-600">
                      {isAr ? 'مبيعات الوردية اليوم:' : 'Shift Sales:'}{' '}
                      <strong className="text-slate-950 font-mono font-extrabold">{todayRevenue.toLocaleString()} {settings.currencySymbol}</strong>
                    </div>
                  </div>

                  {displayedOrders.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      {isAr ? 'لا توجد طلبات في هذه التصفية حالياً.' : 'No orders in queue currently.'}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {displayedOrders.map((order) => (
                        <div
                          key={order.id}
                          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all space-y-3 shadow-xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-bold text-sm text-slate-950">
                                {order.orderNumber}
                              </span>
                              {order.tableNumber ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-slate-900 text-amber-300 px-2 py-0.5 rounded-lg font-mono">
                                  <Table className="w-3 h-3" />
                                  <span>{order.tableNumber}</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                  {isAr ? 'كاونتر' : 'Counter'}
                                </span>
                              )}
                              <span className="text-xs font-bold text-slate-900">
                                {order.customerName}
                              </span>
                              {order.customerPhone && (
                                <span className="text-[11px] font-mono text-slate-500">
                                  {order.customerPhone}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                  order.status === 'received'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : order.status === 'preparing'
                                    ? 'bg-slate-900 text-white font-extrabold animate-pulse'
                                    : order.status === 'ready'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : order.status === 'completed'
                                    ? 'bg-slate-100 text-slate-600'
                                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                                }`}
                              >
                                {order.status}
                              </span>
                              <span className="text-xs font-mono font-bold text-slate-950">
                                {order.total} {settings.currencySymbol}
                              </span>
                            </div>
                          </div>

                          {/* Items */}
                          <div className="text-xs text-slate-700 space-y-1">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between">
                                <span>
                                  {it.quantity}x {it.name} {it.temperature ? `(${it.temperature})` : ''}
                                  {it.selectedExtras && it.selectedExtras.length > 0 && (
                                    <span className="text-[10px] text-slate-500 ml-1">
                                      + {it.selectedExtras.map((e) => e.name).join(', ')}
                                    </span>
                                  )}
                                </span>
                                <span className="font-mono text-slate-600 font-semibold">
                                  {it.totalPrice || it.unitPrice * it.quantity}{' '}
                                  {settings.currencySymbol}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Order Dispatcher Status Controls */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                            <span className="text-[11px] text-slate-500 mr-1 font-medium">
                              {isAr ? 'تحديث حالة الطلب:' : 'Dispatch Action:'}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, 'preparing')}
                              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                order.status === 'preparing'
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                              }`}
                            >
                              {isAr ? 'قيد التجهيز (Preparing)' : 'Preparing'}
                            </button>
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                order.status === 'ready'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {isAr ? 'جاهز للاستلام (Ready)' : 'Ready for Counter'}
                            </button>
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              className="px-3 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
                            >
                              {isAr ? 'تم التسليم (Completed)' : 'Completed'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: INVENTORY & 86 TOGGLE */}
              {managerTab === 'inventory' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-xs text-slate-600">
                      {isAr
                        ? 'التحكم الفوري في توفر المشروبات (إذا نفذ المكون أو الحليب، يمكنك تعطيل المشروب من الظهور للزبائن بلمسة واحدة):'
                        : 'Instant stock toggle (mark any drink out-of-stock when ingredients or cups run out):'}
                    </p>
                    <input
                      type="text"
                      placeholder={isAr ? 'ابحث عن مشروب...' : 'Search drink...'}
                      value={drinkSearch}
                      onChange={(e) => setDrinkSearch(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-slate-900 w-full sm:w-60"
                    />
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                    {filteredDrinks.map((drink) => (
                      <div
                        key={drink.id}
                        className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {drink.image && (
                            <img
                              src={drink.image}
                              alt={drink.name}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {isAr ? (drink.nameAr || drink.name) : drink.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {drink.price} {settings.currencySymbol}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleDrinkAvailability(drink.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            drink.isAvailable
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-rose-50 hover:text-rose-700'
                              : 'bg-rose-50 border border-rose-200 text-rose-800 hover:bg-emerald-50 hover:text-emerald-800'
                          }`}
                        >
                          {drink.isAvailable ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{isAr ? 'متاح للطلب' : 'Available'}</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>{isAr ? 'غير متوفر (86)' : 'Out of Stock (86)'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: SHIFT CONTROLS */}
              {managerTab === 'shift' && (
                <div className="space-y-4 max-w-xl">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-900" />
                      <span>{isAr ? 'وقت الانتظار التقديري للوردية (دقائق)' : 'Shift Estimated Wait Time (Minutes)'}</span>
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {[5, 10, 15, 20, 30].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => updateSettings({ defaultWaitTimeMinutes: mins })}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            settings.defaultWaitTimeMinutes === mins
                              ? 'bg-slate-900 text-white font-extrabold shadow-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          ~{mins} {isAr ? 'دقيقة' : 'min'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {isAr ? 'حالة استقبال الطلبات' : 'Online Pickup Ordering'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {isAr ? 'إيقاف مؤقت لاستقبال الطلبات أثناء ضغط العمل' : 'Pause incoming orders during peak rush'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateSettings({ isOpen: !settings.isOpen })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          settings.isOpen
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                            : 'bg-rose-50 border border-rose-200 text-rose-800'
                        }`}
                      >
                        {settings.isOpen ? (isAr ? 'مفتوح للطلب' : 'Receiving Orders') : (isAr ? 'مغلق مؤقتاً' : 'Temporarily Paused')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TABLE CLOSURES (CASH / VISA & BARISTA FEEDBACK) */}
              {managerTab === 'closures' && (
                <div className="space-y-5 animate-in fade-in">
                  {/* Summary Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">
                        {isAr ? 'إجمالي الطلبات' : 'Total Requests'}
                      </div>
                      <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">
                        {tableClosureRequests.length}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                      <div className="text-[11px] font-bold text-amber-700 uppercase">
                        {isAr ? 'طاولات بانتظار التحصيل' : 'Pending Settlement'}
                      </div>
                      <div className="text-xl font-extrabold font-mono text-amber-900 mt-1">
                        {pendingClosures.length}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <div className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                        <Banknote className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تحصيل كاش 💵' : 'Cash Total'}</span>
                      </div>
                      <div className="text-xl font-extrabold font-mono text-emerald-900 mt-1">
                        {tableClosureRequests
                          .filter((r) => r.paymentMethod === 'cash')
                          .reduce((sum, r) => sum + r.totalAmount, 0)}{' '}
                        <span className="text-xs font-normal">{settings.currencySymbol}</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
                      <div className="text-[11px] font-bold text-blue-700 uppercase flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تحصيل فيزا 💳' : 'Visa Total'}</span>
                      </div>
                      <div className="text-xl font-extrabold font-mono text-blue-900 mt-1">
                        {tableClosureRequests
                          .filter((r) => r.paymentMethod === 'visa')
                          .reduce((sum, r) => sum + r.totalAmount, 0)}{' '}
                        <span className="text-xs font-normal">{settings.currencySymbol}</span>
                      </div>
                    </div>
                  </div>

                  {/* Table Closures List */}
                  {tableClosureRequests.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-3xl space-y-2">
                      <Table className="w-10 h-10 mx-auto text-slate-400" />
                      <p className="text-sm font-bold text-slate-800">
                        {isAr ? 'لا توجد طلبات إغلاق طاولات مسجلة بعد' : 'No table closure requests recorded yet.'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {isAr
                          ? 'عندما يطلب الزبون غلق الطاولة عبر الكاش أو الفيزا مع كتابة ملاحظة للباريستا ستظهر فوراً هنا للمدير والباريستا والمالك.'
                          : 'When guests request table closure with Cash/Visa and notes to barista, they appear here live.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                        <span className="font-bold">
                          {isAr ? 'سجل طلبات الحساب للـ 15 طاولة (علامة المدير):' : 'Table Settlement Queue (Manager Mark):'}
                        </span>
                        <span className="text-[11px] font-mono">
                          {pendingClosures.length} {isAr ? 'معلقة' : 'pending'} / {tableClosureRequests.length} {isAr ? 'إجمالي' : 'total'}
                        </span>
                      </div>

                      {tableClosureRequests.map((req) => (
                        <div
                          key={req.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            req.status === 'pending'
                              ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-400/20'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start sm:items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                  req.status === 'pending'
                                    ? 'bg-amber-400 text-slate-950 font-black'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {req.tableNumber.replace(/[^0-9]/g, '') || req.tableNumber}
                              </div>

                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-extrabold text-slate-950 text-sm">
                                    {isAr ? `طاولة رقم ${req.tableNumber.replace(/[^0-9]/g, '')}` : req.tableNumber}
                                  </span>

                                  {/* Payment Mark Badge */}
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 ${
                                      req.paymentMethod === 'cash'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                                    }`}
                                  >
                                    {req.paymentMethod === 'cash' ? (
                                      <>
                                        <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>{isAr ? 'كاش 💵' : 'Cash 💵'}</span>
                                      </>
                                    ) : (
                                      <>
                                        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                                        <span>{isAr ? 'فيزا 💳' : 'Visa 💳'}</span>
                                      </>
                                    )}
                                  </span>

                                  {/* Status Badge */}
                                  <span
                                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                      req.status === 'pending'
                                        ? 'bg-amber-200 text-amber-900 border border-amber-300 animate-pulse'
                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    }`}
                                  >
                                    {req.status === 'pending'
                                      ? (isAr ? 'قيد التحصيل' : 'Pending')
                                      : (isAr ? 'تمت التسوية' : 'Settled')}
                                  </span>
                                </div>

                                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                                  <span>{req.guestName}</span>
                                  <span>·</span>
                                  <span>{new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  <span>·</span>
                                  <div className="flex items-center text-amber-400">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${i < req.rating ? 'fill-amber-400' : 'text-slate-200'}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                              <div className="text-right">
                                <div className="text-sm font-extrabold font-mono text-slate-950">
                                  {req.totalAmount} {settings.currencySymbol}
                                </div>
                              </div>

                              {req.status === 'pending' ? (
                                <button
                                  type="button"
                                  onClick={() => settleTableClosure(req.id)}
                                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>{isAr ? 'تأكيد التحصيل والإغلاق' : 'Confirm & Settle'}</span>
                                </button>
                              ) : (
                                <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{isAr ? 'تم إنهاؤها' : 'Released'}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Barista Feedback Note written by guest */}
                          {req.baristaFeedback && (
                            <div className="mt-3 pt-3 border-t border-slate-200/80 bg-white/60 p-2.5 rounded-xl text-xs flex items-start gap-2 text-slate-700">
                              <MessageSquare className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-slate-900">
                                  {isAr ? 'رسالة الضيف للباريستا: ' : 'Guest note to barista: '}
                                </span>
                                <span className="italic">«{req.baristaFeedback}»</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
