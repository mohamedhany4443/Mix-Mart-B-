import React, { useState } from 'react';
import { useCoffee } from '../context/CoffeeContext';
import { PickupOrder } from '../types';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Clock,
  MapPin,
  Coffee,
  ArrowRight,
  Table,
  CheckCircle2,
  Banknote,
  CreditCard,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: (order: PickupOrder) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onOrderPlaced }) => {
  const {
    cart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartItemsCount,
    placePickupOrder,
    settings,
    language,
    activeTable,
    tables,
  } = useCoffee();

  const isAr = language === 'ar';
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [prepTiming, setPrepTiming] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledMinutes, setScheduledMinutes] = useState<number>(25);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'visa'>('cash');
  const [diningMode, setDiningMode] = useState<'dine-in' | 'takeaway'>(() => (activeTable ? 'dine-in' : 'dine-in'));
  const [selectedTable, setSelectedTable] = useState<string>(() => activeTable || 'Table 1');
  const [orderNotes, setOrderNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync if activeTable changes
  React.useEffect(() => {
    if (activeTable) {
      setDiningMode('dine-in');
      setSelectedTable(activeTable);
    }
  }, [activeTable]);

  if (!isOpen) return null;

  const getEstimatedPickupText = () => {
    const now = new Date();
    if (prepTiming === 'immediate') {
      const estimate = new Date(now.getTime() + settings.defaultWaitTimeMinutes * 60000);
      return isAr
        ? `تحضير فوري (~${settings.defaultWaitTimeMinutes} دقائق · ${estimate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
        : `Immediate (~${settings.defaultWaitTimeMinutes} mins · ${estimate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
    }
    const mins = Math.max(10, Math.min(180, scheduledMinutes || 25));
    const estimate = new Date(now.getTime() + mins * 60000);
    return isAr
      ? `تحضير بعد ${mins} دقيقة (${estimate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
      : `Scheduled in ${mins} mins (${estimate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg(isAr ? 'سلة طلباتك فارغة حالياً' : 'Your pickup cart is empty.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg(isAr ? 'يرجى كتابة اسم العميل لمناداة الطلب' : 'Please enter your name for the order counter call.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.trim().length < 6) {
      setErrorMsg(isAr ? 'يرجى إدخال رقم هاتف صحيح لإشعار الاستلام' : 'Please enter a valid phone number for pickup alerts.');
      return;
    }

    setIsSubmitting(true);

    try {
      const pickupTimeText = getEstimatedPickupText();
      const mins = Math.max(10, Math.min(180, scheduledMinutes || 25));
      const newOrder = placePickupOrder({
        customerName,
        customerPhone,
        pickupTime: pickupTimeText,
        notes: orderNotes,
        tableNumber: diningMode === 'dine-in' ? selectedTable : undefined,
        orderType: diningMode,
        paymentMethod,
        preparationTiming: prepTiming,
        scheduledMinutes: prepTiming === 'scheduled' ? mins : undefined,
        scheduledTimeLabel:
          prepTiming === 'scheduled'
            ? isAr
              ? `بعد ${mins} دقيقة`
              : `In ${mins} mins`
            : undefined,
      });

      setIsSubmitting(false);
      onClose();
      onOrderPlaced(newOrder);
    } catch {
      setIsSubmitting(false);
      setErrorMsg(isAr ? 'تعذر إتمام الطلب، يرجى المحاولة مرة أخرى' : 'Failed to place order. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md sm:max-w-lg bg-white border-l border-slate-200 text-slate-900 h-full flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold tracking-tight text-slate-950">
                {isAr ? 'سلة طلبات الاستلام' : 'Pickup Cart'}
              </h2>
              <div className="text-[11px] text-slate-500 font-medium">
                {cartItemsCount} {isAr ? 'مشروبات مختارة' : 'drinks selected'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-slate-500 hover:text-rose-600 px-2 py-1 transition-colors cursor-pointer font-medium"
              >
                {isAr ? 'إفراغ' : 'Clear'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pickup Location Reminder Banner */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2 text-xs text-slate-700">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-900" />
          <span className="truncate">
            {isAr ? 'مكان الاستلام: ' : 'Pickup at: '}
            <strong className="text-slate-950 font-bold">
              {isAr ? settings.pickupCounterNameAr || settings.pickupCounterName : settings.pickupCounterName}
            </strong>
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Cart Item List */}
          {cart.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center mx-auto text-slate-700">
                <Coffee className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-900">
                {isAr ? 'سلة الطلبات فارغة' : 'Your pickup cart is empty'}
              </p>
              <p className="text-xs max-w-xs mx-auto text-slate-500">
                {isAr
                  ? 'اختر مشروبك المفضل من منيو ميكس مارت لبدء طلبك.'
                  : 'Select any handcrafted coffee or specialty drink from the menu to start.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-col gap-2 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-display text-base font-bold text-slate-950">
                        {isAr && item.nameAr ? item.nameAr : item.name}
                      </h4>
                      {isAr && item.nameAr && item.name !== item.nameAr && (
                        <div className="text-[11px] text-slate-600 font-semibold">{item.name}</div>
                      )}

                      {/* Selected Extras */}
                      {item.selectedExtras && item.selectedExtras.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {item.selectedExtras.map((ext) => (
                            <div key={ext.id} className="text-[11px] text-slate-700 font-medium">
                              + {isAr ? ext.nameAr : ext.name} (+{ext.price} {settings.currencySymbol})
                            </div>
                          ))}
                        </div>
                      )}

                      {item.notes && (
                        <div className="text-[11px] text-slate-500 italic mt-1">
                          {isAr ? 'ملاحظة: ' : 'Note: '}"{item.notes}"
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-sm font-extrabold tabular-nums text-slate-950">
                        {item.totalPrice} <span className="font-sans font-bold text-slate-700">{settings.currencySymbol}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        @{item.unitPrice} {settings.currencySymbol}
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Remove */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'حذف' : 'Remove'}</span>
                    </button>

                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-0.5 shadow-xs">
                      <button
                        type="button"
                        onClick={() => updateCartItemQuantity(item.cartItemId, -1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold tabular-nums text-xs text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartItemQuantity(item.cartItemId, 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Checkout & Pickup Details Form */}
          {cart.length > 0 && (
            <form onSubmit={handleCheckout} className="space-y-4 pt-2">
              <div className="border-t border-slate-200 pt-4">
                {/* Dining Mode Toggle: Table Service vs Counter Pickup */}
                <div className="mb-4 space-y-2">
                  <label className="block text-[11px] uppercase tracking-wider text-slate-600 font-bold">
                    {isAr ? 'طريقة الخدمة والاستلام:' : 'Service & Dining Option:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDiningMode('dine-in')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        diningMode === 'dine-in'
                          ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <Table className="w-4 h-4 text-amber-300" />
                      <span>{isAr ? 'خدمة الطاولة (Dine-in)' : 'Table Service'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDiningMode('takeaway')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        diningMode === 'takeaway'
                          ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <Coffee className="w-4 h-4" />
                      <span>{isAr ? 'سفري / كاونتر' : 'Takeaway / Counter'}</span>
                    </button>
                  </div>

                  {/* 15 Tables Selection for Dine-in */}
                  {diningMode === 'dine-in' && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Table className="w-3.5 h-3.5 text-slate-900" />
                          <span>{isAr ? 'اختر رقم الطاولة (1 - 15):' : 'Select Table (1 to 15):'}</span>
                        </span>
                        <span className="font-mono font-extrabold text-slate-950 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                          {selectedTable}
                        </span>
                      </div>

                      {activeTable && activeTable === selectedTable && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{isAr ? `مفعلة مباشرة عبر رمز QR: ${activeTable}` : `Scanned via QR Code: ${activeTable}`}</span>
                        </div>
                      )}

                      {/* 15 Tables Quick Grid */}
                      <div className="grid grid-cols-5 gap-1.5 pt-1">
                        {tables.map((tbl) => {
                          const isSelected = selectedTable === tbl;
                          const num = tbl.replace('Table ', '');
                          return (
                            <button
                              key={tbl}
                              type="button"
                              onClick={() => setSelectedTable(tbl)}
                              className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                                isSelected
                                  ? 'bg-slate-900 text-white ring-2 ring-slate-900 shadow-xs'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400 hover:bg-slate-100'
                              }`}
                            >
                              <span className="text-[10px] text-slate-400 font-sans">{isAr ? 'طاولة' : 'T'}</span>
                              <span className="text-sm font-extrabold">{num}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="font-display text-base font-bold text-slate-950 mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-900" />
                  <span>{isAr ? 'بيانات الاستلام والتواصل' : 'Customer Details'}</span>
                </h3>

                {/* Customer Name */}
                <div className="space-y-1 mb-3">
                  <label className="block text-[11px] uppercase tracking-wider text-slate-600 font-semibold">
                    {isAr ? 'اسم العميل ' : 'Your Name '}
                    <span className="text-slate-950">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'اسمك لمناداة الطلب عند التجهيز' : 'Name for counter callout'}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none"
                  />
                </div>

                {/* Customer Phone */}
                <div className="space-y-1 mb-3">
                  <label className="block text-[11px] uppercase tracking-wider text-slate-600 font-semibold">
                    {isAr ? 'رقم الهاتف المحمول ' : 'Mobile Phone '}
                    <span className="text-slate-950">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 01012345678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none"
                  />
                </div>

                {/* Preparation Timing: Immediate vs Scheduled */}
                <div className="space-y-2 mb-4">
                  <label className="block text-[11px] uppercase tracking-wider text-slate-600 font-bold">
                    {isAr ? 'توقيت التحضير المطلوب' : 'Preparation Timing'}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPrepTiming('immediate')}
                      className={`min-h-[42px] py-2 px-3 rounded-xl border text-center transition-colors cursor-pointer font-bold ${
                        prepTiming === 'immediate'
                          ? 'border-slate-950 bg-slate-950 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isAr
                        ? `تحضير فوري (~${settings.defaultWaitTimeMinutes}د)`
                        : `Immediate (~${settings.defaultWaitTimeMinutes}m)`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrepTiming('scheduled')}
                      className={`min-h-[42px] py-2 px-3 rounded-xl border text-center transition-colors cursor-pointer font-bold ${
                        prepTiming === 'scheduled'
                          ? 'border-slate-950 bg-slate-950 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isAr ? 'بعد وقت محدد' : 'Scheduled Later'}
                    </button>
                  </div>

                  {prepTiming === 'scheduled' && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">
                          {isAr ? 'اختر عدد الدقائق للتحضير:' : 'Prepare in (minutes):'}
                        </span>
                        <span className="font-mono font-bold text-slate-950 tabular-nums">
                          {scheduledMinutes} {isAr ? 'دقيقة' : 'mins'}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[15, 25, 40, 60].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setScheduledMinutes(m)}
                            className={`py-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-colors ${
                              scheduledMinutes === m
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {m}m
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        min={10}
                        max={180}
                        value={scheduledMinutes}
                        onChange={(e) => setScheduledMinutes(Number(e.target.value) || 15)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-900 outline-none focus:border-slate-900"
                        placeholder={isAr ? 'أو اكتب عدد الدقائق...' : 'Or enter custom minutes'}
                      />
                    </div>
                  )}
                </div>

                {/* Payment Method: Cash vs Visa */}
                <div className="space-y-2 mb-4">
                  <label className="block text-[11px] uppercase tracking-wider text-slate-600 font-bold">
                    {isAr ? 'طريقة الدفع المفضلة' : 'Payment Method'}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`min-h-[44px] py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition-colors cursor-pointer font-bold ${
                        paymentMethod === 'cash'
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Banknote className="w-4 h-4" />
                      <span>{isAr ? 'كاش (نقدي)' : 'Cash'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('visa')}
                      className={`min-h-[44px] py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition-colors cursor-pointer font-bold ${
                        paymentMethod === 'visa'
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{isAr ? 'فيزا / بطاقة' : 'Visa / Card'}</span>
                    </button>
                  </div>
                </div>

                {/* Special Notes */}
                <div className="space-y-1">
                  <label className="block text-[11px] uppercase tracking-wider text-slate-600 font-semibold">
                    {isAr ? 'ملاحظات إضافية (اختياري)' : 'Special Counter Notes'}
                  </label>
                  <input
                    type="text"
                    placeholder={isAr ? 'مثال: علبة كانز، حامل أكواب، مناديل زيادة' : 'e.g. In a can, cup carrier for 3...'}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {errorMsg}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer with Total and Place Order */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="flex justify-between text-base font-bold text-slate-950 pt-1">
              <span className="font-display tracking-tight">
                {isAr
                  ? `الإجمالي (${paymentMethod === 'visa' ? 'فيزا' : 'كاش'})`
                  : `Total (${paymentMethod === 'visa' ? 'Visa' : 'Cash'})`}
              </span>
              <span className="font-mono tabular-nums text-slate-950 font-extrabold text-lg">
                {cartTotal} <span className="font-sans font-bold text-slate-700">{settings.currencySymbol}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full min-h-[46px] py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? (isAr ? 'جاري إرسال الطلب...' : 'Placing Order...') : (isAr ? 'تأكيد وإرسال الطلب' : 'Confirm Order')}</span>
              <ArrowRight className={`w-4 h-4 stroke-[2.5] ${isAr ? 'rotate-180' : ''}`} />
            </button>

            <div className="text-[11px] text-center text-slate-500 font-medium">
              {isAr
                ? 'سيصل طلبك فوراً لشاشة الباريستا مع إمكانية متابعة حالة القبول والتجهيز'
                : 'Sent directly to the Barista screen with live acceptance & readiness tracking.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
