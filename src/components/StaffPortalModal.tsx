import React, { useState, useEffect } from 'react';
import { useCoffee } from '../context/CoffeeContext';
import {
  X,
  Coffee,
  KeyRound,
  User,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  LogOut,
  Flame,
  Check,
  Table,
  Banknote,
  CreditCard,
  MessageSquareHeart,
  Star,
} from 'lucide-react';

interface StaffPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StaffPortalModal: React.FC<StaffPortalModalProps> = ({ isOpen, onClose }) => {
  const {
    drinks,
    orders,
    settings,
    updateOrderStatus,
    toggleDrinkAvailability,
    language,
    tableClosureRequests,
    settleTableClosure,
  } = useCoffee();

  const isAr = language === 'ar';

  const defaultStaffUser = settings.staffUsername || 'barista_staff';
  const defaultStaffPin = settings.staffPin || settings.adminPin || '1234';

  // Login form state - PRE-INSERTED for seamless user experience
  const [usernameInput, setUsernameInput] = useState(defaultStaffUser);
  const [pinInput, setPinInput] = useState(defaultStaffPin);
  const [authError, setAuthError] = useState('');
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('mixmart_staff_session') === 'true';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<'tickets' | 'tables' | 'stock'>('tickets');
  const pendingClosures = tableClosureRequests.filter((r) => r.status === 'pending');

  useEffect(() => {
    setUsernameInput(settings.staffUsername || 'barista_staff');
    setPinInput(settings.staffPin || settings.adminPin || '1234');
  }, [settings]);

  if (!isOpen) return null;

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');

    const targetUser = (settings.staffUsername || 'barista_staff').trim().toLowerCase();
    const targetPin = (settings.staffPin || settings.adminPin || '1234').trim();

    const inputUser = usernameInput.trim().toLowerCase();
    const inputPin = pinInput.trim();

    if (inputUser === targetUser && inputPin === targetPin) {
      setIsStaffAuthenticated(true);
      try {
        localStorage.setItem('mixmart_staff_session', 'true');
      } catch {
        // ignore
      }
    } else {
      setAuthError(
        isAr
          ? 'اسم الموظف أو رقم PIN غير صحيح.'
          : 'Invalid Staff user or PIN. Use auto-insert button.'
      );
    }
  };

  const handleAutoInsert = () => {
    setUsernameInput(settings.staffUsername || 'barista_staff');
    setPinInput(settings.staffPin || settings.adminPin || '1234');
    setAuthError('');
  };

  const handleLogout = () => {
    setIsStaffAuthenticated(false);
    try {
      localStorage.removeItem('mixmart_staff_session');
    } catch {
      // ignore
    }
  };

  // Orders in Kitchen
  const pendingOrders = orders.filter(
    (o) => o.status === 'received' || o.status === 'preparing' || o.status === 'ready'
  );

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
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg sm:text-xl font-bold tracking-wide text-slate-950">
                  {isAr ? 'بوابة طاقم العمل والباريستا' : 'MIX MART Barista & Staff KDS'}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                  {isAr ? 'شاشة البار' : 'Bar Dispatch'}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {isStaffAuthenticated
                  ? `${isAr ? 'الباريستا المتصل:' : 'Logged in as:'} ${settings.staffName || 'Barista Staff'} (@${settings.staffUsername || 'barista_staff'})`
                  : (isAr ? 'شاشة تحضير وتسليم الطلبات لطاقم البار' : 'Direct order fulfillment & pickup counter tickets')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isStaffAuthenticated && (
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
        {!isStaffAuthenticated ? (
          /* LOGIN SCREEN WITH PRE-INSERTED USER */
          <div className="p-6 sm:p-10 flex-1 overflow-y-auto flex flex-col items-center justify-center text-center max-w-md mx-auto w-full space-y-5 relative">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                <Coffee className="w-8 h-8" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-200 border border-slate-300 text-slate-800 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display text-2xl font-bold text-slate-950">
                {isAr ? 'دخول طاقم الباريستا' : 'Barista Staff Login'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr
                  ? 'تم إدراج اسم المستخدم ورقم PIN للباريستا تلقائياً. اضغط للدخول واستلام تذاكر المشروبات.'
                  : 'Your staff username and PIN have been pre-inserted for you below. Click to access the kitchen tickets.'}
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4 text-left">
              {/* Staff Username - PRE-INSERTED */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-900" />
                    <span>{isAr ? 'اسم الباريستا / الموظف (مدرج لك)' : 'Staff Username (Pre-Inserted)'}</span>
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

              {/* Staff PIN - PRE-INSERTED */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-900" />
                  <span>{isAr ? 'رقم PIN الخاص بالبار' : 'Barista Security PIN'}</span>
                </label>
                <input
                  type="password"
                  required
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white text-slate-900 text-sm outline-none font-mono tracking-widest text-center"
                />
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Instant Sign In Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Coffee className="w-4 h-4" />
                <span>{isAr ? 'دخول فوري لطاقم العمل' : '1-Click Sign In as Staff'}</span>
              </button>

              {/* Re-Insert Credentials button */}
              <button
                type="button"
                onClick={handleAutoInsert}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-800 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                <span>{isAr ? 'إعادة إدراج بيانات الموظف لي' : 'Insert Staff User for Me'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED STAFF TICKETS KDS */
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('tickets')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'tickets'
                      ? 'bg-slate-900 text-white font-extrabold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isAr ? 'تذاكر المشروبات النشطة' : 'Active Tickets'} ({pendingOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tables')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'tables'
                      ? 'bg-slate-900 text-white font-extrabold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>{isAr ? 'طلب حساب الطاولات' : 'Table Closures'}</span>
                  {pendingClosures.length > 0 && (
                    <span className="font-mono text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black animate-pulse">
                      {pendingClosures.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('stock')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'stock'
                      ? 'bg-slate-900 text-white font-extrabold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isAr ? 'تعطيل مكون / مشروب نفذ' : 'Fast 86 Ingredient'}
                </button>
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isAr ? 'بار الاستلام يعمل مباشرة' : 'Pickup Bar Live'}</span>
              </div>
            </div>

            {/* TAB 1: KITCHEN TICKETS */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {activeTab === 'tickets' ? (
                pendingOrders.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 space-y-2">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600" />
                    <p className="text-sm font-bold text-slate-900">
                      {isAr ? 'جميع طلبات البار منتهية وجاهزة!' : 'All drinks served! No pending tickets.'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {isAr ? 'ستظهر الطلبات الجديدة هنا فور قيام الزبائن بالطلب.' : 'New orders will appear here in real-time.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingOrders.map((order) => (
                      <div
                        key={order.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between shadow-xs ${
                          order.status === 'received'
                            ? 'bg-white border-amber-300'
                            : order.status === 'preparing'
                            ? 'bg-white border-slate-900 shadow-sm'
                            : 'bg-white border-emerald-300'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Ticket Header */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div>
                              <div className="font-mono text-lg font-extrabold text-slate-950">
                                {order.orderNumber}
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-slate-900">
                                  {order.customerName}
                                </span>
                                {order.tableNumber ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-slate-900 text-amber-300 px-2 py-0.5 rounded-lg font-mono shadow-xs">
                                    <Table className="w-3 h-3" />
                                    <span>{order.tableNumber}</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                    {isAr ? 'كاونتر' : 'Counter'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span
                              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                order.status === 'received'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : order.status === 'preparing'
                                  ? 'bg-slate-900 text-white font-extrabold animate-pulse'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {order.status === 'received' ? (isAr ? 'طلب جديد' : 'New Order') : order.status === 'preparing' ? (isAr ? 'قيد التحضير' : 'Brewing') : (isAr ? 'جاهز على البار' : 'Ready')}
                            </span>
                          </div>

                          {/* Items List */}
                          <div className="space-y-2 py-1">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                                  <span>
                                    {it.quantity}x {it.name}
                                  </span>
                                  {it.temperature && (
                                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white text-slate-800 border border-slate-200 font-bold">
                                      {it.temperature}
                                    </span>
                                  )}
                                </div>
                                {it.selectedExtras && it.selectedExtras.length > 0 && (
                                  <div className="text-[11px] text-slate-700 mt-1 pl-2 border-l border-slate-300">
                                    + {it.selectedExtras.map((e) => e.name).join(', ')}
                                  </div>
                                )}
                                {it.notes && (
                                  <div className="text-[10px] text-amber-800 mt-1 italic">
                                    &ldquo;{it.notes}&rdquo;
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Barista Workflow Action Buttons */}
                        <div className="pt-3 border-t border-slate-100 mt-3 grid grid-cols-2 gap-2">
                          {order.status === 'received' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, 'preparing')}
                              className="col-span-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            >
                              <Flame className="w-4 h-4 text-white" />
                              <span>{isAr ? 'بدء التحضير (Start Brewing)' : 'Start Brewing'}</span>
                            </button>
                          )}

                          {order.status === 'preparing' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                              className="col-span-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            >
                              <CheckCircle2 className="w-4 h-4 text-white" />
                              <span>{isAr ? 'جاهز للاستلام على البار!' : 'Ring Counter (Ready!)'}</span>
                            </button>
                          )}

                          {order.status === 'ready' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              className="col-span-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            >
                              <Check className="w-4 h-4 text-white" />
                              <span>{isAr ? 'تم تسليم المشروب للزبون (Done)' : 'Handed to Guest (Done)'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : activeTab === 'tables' ? (
                /* TAB: TABLE CLOSURES (CASH VS VISA & BARISTA FEEDBACK) */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h4 className="font-display font-extrabold text-sm text-slate-900">
                        {isAr ? 'طلبات إغلاق الطاولات وتحصيل الحساب' : 'Table Settlement & Closure Calls'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isAr
                          ? 'الزبائن الذين طلبوا الحساب كاش أو فيزا مع رسائلهم للباريستا'
                          : 'Guests requesting bill settlement via Cash or Visa with messages for the barista'}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold bg-amber-100 text-amber-950 px-2.5 py-1 rounded-full border border-amber-300">
                      {pendingClosures.length} {isAr ? 'طلب معلق' : 'pending'}
                    </span>
                  </div>

                  {tableClosureRequests.length === 0 ? (
                    <div className="text-center py-16 text-slate-500 space-y-2">
                      <Table className="w-10 h-10 mx-auto text-slate-400" />
                      <p className="text-sm font-bold text-slate-900">
                        {isAr ? 'لا توجد طلبات إغلاق طاولات حالياً' : 'No table settlement requests'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {tableClosureRequests.map((req) => (
                        <div
                          key={req.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between shadow-xs ${
                            req.status === 'pending'
                              ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/30'
                              : 'bg-white border-slate-200 opacity-75'
                          }`}
                        >
                          <div className="space-y-2.5">
                            {/* Card Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-sm text-slate-950 bg-white border border-slate-300 px-2.5 py-1 rounded-xl shadow-2xs">
                                  {req.tableNumber}
                                </span>
                                <span className="text-xs font-bold text-slate-800">
                                  {req.guestName || (isAr ? 'ضيف ميكس مارت' : 'Guest')}
                                </span>
                              </div>

                              {/* Cash vs Visa Mark */}
                              <div
                                className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-2xs ${
                                  req.paymentMethod === 'cash'
                                    ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                                    : 'bg-blue-100 text-blue-950 border border-blue-300'
                                }`}
                              >
                                {req.paymentMethod === 'cash' ? (
                                  <>
                                    <Banknote className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>{isAr ? 'كاش 💵' : 'Cash 💵'}</span>
                                  </>
                                ) : (
                                  <>
                                    <CreditCard className="w-3.5 h-3.5 text-blue-700" />
                                    <span>{isAr ? 'فيزا 💳' : 'Visa 💳'}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Total to collect */}
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-semibold">
                                {isAr ? 'المبلغ المطلوب تحصيله:' : 'Total Amount to Collect:'}
                              </span>
                              <span className="font-mono font-black text-sm text-slate-950">
                                {req.totalAmount} {settings.currencySymbol}
                              </span>
                            </div>

                            {/* Guest feedback to Barista */}
                            <div className="p-2.5 rounded-xl bg-white border border-amber-200 space-y-1">
                              <div className="flex items-center justify-between text-[11px] text-amber-900 font-bold">
                                <span className="flex items-center gap-1">
                                  <MessageSquareHeart className="w-3.5 h-3.5 text-rose-500" />
                                  <span>{isAr ? 'رسالة الضيف للباريستا:' : 'Guest Note to Barista:'}</span>
                                </span>
                                <span className="flex items-center gap-0.5 text-amber-600 font-mono">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                  <span>{req.rating}/5</span>
                                </span>
                              </div>
                              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                                "{req.baristaFeedback}"
                              </p>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="pt-3 border-t border-slate-100 mt-3">
                            {req.status === 'pending' ? (
                              <button
                                type="button"
                                onClick={() => settleTableClosure(req.id)}
                                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                              >
                                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                                <span>
                                  {isAr
                                    ? `تأكيد استلام [${req.paymentMethod === 'cash' ? 'كاش' : 'فيزا'}] وإخلاء الطاولة`
                                    : `Confirm Payment [${req.paymentMethod.toUpperCase()}] & Clear Table`}
                                </span>
                              </button>
                            ) : (
                              <div className="text-center text-[11px] font-bold text-emerald-700 bg-emerald-50 py-1.5 rounded-xl border border-emerald-200">
                                {isAr ? '✓ تم تحصيل الحساب وإخلاء الطاولة' : '✓ Table Cleared & Settled'}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* TAB 2: FAST 86 OUT OF STOCK TOGGLE */
                <div className="space-y-3">
                  <p className="text-xs text-slate-600">
                    {isAr
                      ? 'إذا نفذ أحد المكونات (مثل الحليب، البوبا، أو نوع قهوة)، اضغط على المشروب لتعطيله فوراً:'
                      : 'Barista emergency 86: disable any drink instantly if cups or beans run out:'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {drinks.map((d) => (
                      <div
                        key={d.id}
                        className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-xs"
                      >
                        <div className="text-xs font-semibold text-slate-900 truncate max-w-[180px]">
                          {isAr ? (d.nameAr || d.name) : d.name}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleDrinkAvailability(d.id)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                            d.isAvailable
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {d.isAvailable ? (isAr ? 'متوفر' : 'Available') : (isAr ? 'غير متوفر (86)' : '86ed')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
