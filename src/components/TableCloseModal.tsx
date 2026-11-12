import React, { useState } from 'react';
import { useCoffee } from '../context/CoffeeContext';
import {
  X,
  Table,
  CreditCard,
  Banknote,
  Send,
  Star,
  Coffee,
  CheckCircle2,
  Clock,
  Sparkles,
  Receipt,
  User,
  Heart,
} from 'lucide-react';

interface TableCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTable?: string | null;
}

export const TableCloseModal: React.FC<TableCloseModalProps> = ({
  isOpen,
  onClose,
  initialTable,
}) => {
  const {
    activeTable,
    orders,
    settings,
    language,
    requestTableClosure,
    tableClosureRequests,
  } = useCoffee();
  const isAr = language === 'ar';

  const [tableNumber, setTableNumber] = useState<string>(
    initialTable || activeTable || 'Table 1'
  );
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'visa'>('cash');
  const [guestName, setGuestName] = useState('');
  const [baristaFeedback, setBaristaFeedback] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [submitted, setSubmitted] = useState(false);

  // Sync table if initialTable changes
  React.useEffect(() => {
    if (initialTable) setTableNumber(initialTable);
    else if (activeTable) setTableNumber(activeTable);
  }, [initialTable, activeTable]);

  if (!isOpen) return null;

  // Find all active orders associated with this table
  const tableOrders = orders.filter(
    (o) =>
      o.tableNumber === tableNumber &&
      (o.status === 'received' || o.status === 'preparing' || o.status === 'ready' || o.status === 'completed')
  );

  const tableTotal = tableOrders.reduce((sum, o) => sum + o.total, 0);

  // Check if this table already has a pending closure request
  const existingRequest = tableClosureRequests.find(
    (r) => r.tableNumber === tableNumber && r.status === 'pending'
  );

  const quickBaristaPraise = isAr
    ? [
        '☕ القهوة مضبوطة ورائعة',
        '⚡ سرعة في التقديم',
        '😊 تعامل راقي وودود',
        '❄️ البرودة والسكر ممتازين',
      ]
    : [
        '☕ Perfectly crafted coffee',
        '⚡ Lightning fast service',
        '😊 Friendly & courteous staff',
        '❄️ Perfect sweetness & chill',
      ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    requestTableClosure({
      tableNumber,
      guestName: guestName.trim() || (isAr ? `ضيف طاولة ${tableNumber.replace(/[^0-9]/g, '')}` : `Guest at ${tableNumber}`),
      paymentMethod,
      totalAmount: tableTotal || 95,
      baristaFeedback: baristaFeedback.trim() || (isAr ? 'الخدمة ممتازة والمشروبات رائعة، شكراً للباريستا!' : 'Great handcrafted drinks and barista service!'),
      rating,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-900 relative max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent top line */}
        <div className="h-1 bg-gradient-to-r from-amber-500 via-slate-900 to-amber-500 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 pt-2 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-md shrink-0">
              <Table className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-950">
                  {isAr ? 'طلب الحساب وإغلاق الطاولة' : 'Close Table & Settle Bill'}
                </h3>
                <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  {tableNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAr
                  ? 'اختر طريقة الدفع (كاش أو فيزا) واكتب رسالتك وتقييمك للباريستا'
                  : 'Select payment (Cash or Visa) and send feedback to the barista'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 text-xs">
          {submitted ? (
            <div className="py-12 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h4 className="font-display text-xl font-extrabold text-slate-950">
                {isAr ? 'تم إرسال طلب الحساب للباريستا بنجاح!' : 'Bill Request & Feedback Sent to Barista!'}
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                {isAr ? (
                  <>
                    تم وضع علامة على <strong className="text-slate-950">{tableNumber}</strong> بأن الدفع عبر{' '}
                    <strong className="text-slate-950">
                      {paymentMethod === 'cash' ? 'الكاش 💵' : 'الفيزا 💳'}
                    </strong>
                    . الباريستا في طريقه لطاولتك لإنهاء الحساب وإخلاء الطاولة!
                  </>
                ) : (
                  <>
                    Mark created on <strong className="text-slate-950">{tableNumber}</strong> for{' '}
                    <strong className="text-slate-950">
                      {paymentMethod === 'cash' ? 'Cash 💵' : 'Visa / Card 💳'}
                    </strong>
                    . The barista has received your feedback note and will assist you shortly!
                  </>
                )}
              </p>
            </div>
          ) : existingRequest ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-3 text-slate-900 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <h4 className="font-display font-extrabold text-sm text-amber-950">
                  {isAr ? 'طلب إغلاق الطاولة قيد المتابعة حالياً' : 'Table Closure Request in Progress'}
                </h4>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                {isAr
                  ? `تم تسجيل طلب حساب لطاولة ${tableNumber} بطريقة دفع [${existingRequest.paymentMethod === 'cash' ? 'كاش 💵' : 'فيزا 💳'}] وتم إرسال تقييمك للباريستا والإدارة. الباريستا في الطريق إليك.`
                  : `A settlement request for ${tableNumber} via [${existingRequest.paymentMethod === 'cash' ? 'Cash' : 'Visa'}] is active. Barista and manager are notified.`}
              </p>
              <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200 text-xs">
                <span className="text-[11px] text-slate-500 font-bold block mb-1">
                  {isAr ? 'رسالتك المرسلة للباريستا:' : 'Your message to barista:'}
                </span>
                <span className="font-semibold text-slate-900">"{existingRequest.baristaFeedback}"</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                {isAr ? 'حسناً، فهمت' : 'Got it'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Table & Total Amount Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <label className="text-slate-500 font-bold text-[11px] block">
                    {isAr ? 'الطاولة المراد إغلاقها:' : 'Closing Table:'}
                  </label>
                  <select
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-mono font-bold text-xs text-slate-950 focus:outline-none cursor-pointer"
                  >
                    {Array.from({ length: 15 }, (_, i) => `Table ${i + 1}`).map((tbl) => (
                      <option key={tbl} value={tbl}>
                        {isAr ? `طاولة رقم ${tbl.replace('Table ', '')}` : tbl}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-right">
                  <span className="text-slate-500 font-bold text-[11px] block">
                    {isAr ? 'إجمالي الحساب التقديري:' : 'Estimated Bill Total:'}
                  </span>
                  <div className="font-mono text-base font-black text-slate-950">
                    {tableTotal > 0 ? tableTotal : '—'} <span className="text-xs font-sans font-bold text-slate-600">{settings.currencySymbol}</span>
                  </div>
                </div>
              </div>

              {/* PAYMENT METHOD BUTTONS: CASH OR VISA */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-900">
                  {isAr ? 'اختر طريقة الدفع (إلزامي):' : 'Select Payment Method (Cash or Visa):'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* CASH BUTTON */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2.5 font-extrabold text-xs transition-all cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-md scale-[1.02]'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-400 stroke-[2.2]" />
                    <div className="text-left">
                      <span className="block text-sm font-black">
                        {isAr ? 'كاش 💵' : 'Cash 💵'}
                      </span>
                      <span className="text-[10px] opacity-80 font-normal">
                        {isAr ? 'الدفع نقداً للباريستا' : 'Pay cash at table'}
                      </span>
                    </div>
                  </button>

                  {/* VISA BUTTON */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('visa')}
                    className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2.5 font-extrabold text-xs transition-all cursor-pointer ${
                      paymentMethod === 'visa'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-md scale-[1.02]'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-amber-400 stroke-[2.2]" />
                    <div className="text-left">
                      <span className="block text-sm font-black">
                        {isAr ? 'فيزا 💳' : 'Visa / Card 💳'}
                      </span>
                      <span className="text-[10px] opacity-80 font-normal">
                        {isAr ? 'جهاز نقاط البيع POS' : 'POS wireless card machine'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* WRITE FEEDBACK TO BARISTA */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Coffee className="w-4 h-4 text-slate-900" />
                    <span className="font-extrabold text-xs text-slate-950">
                      {isAr ? 'اكتب رسالة أو تقييم إلى الباريستا:' : 'Write Feedback to Barista:'}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                    {isAr ? 'تصل للباريستا والمالك' : 'Sent to Barista & Owner'}
                  </span>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  <span className="text-slate-600 font-bold text-xs mr-2">
                    {isAr ? 'تقييم التجربة:' : 'Rating:'}
                  </span>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-mono text-xs font-bold text-slate-800 ml-1.5">{rating} / 5</span>
                </div>

                {/* Quick praise chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {quickBaristaPraise.map((praise) => (
                    <button
                      key={praise}
                      type="button"
                      onClick={() =>
                        setBaristaFeedback((prev) => (prev ? `${prev} - ${praise}` : praise))
                      }
                      className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-all cursor-pointer border border-slate-200"
                    >
                      {praise}
                    </button>
                  ))}
                </div>

                {/* Textarea */}
                <textarea
                  rows={3}
                  required
                  placeholder={
                    isAr
                      ? 'اكتب رسالتك وتقييمك للباريستا هنا (مثال: القهوة ممتازة وسريعة، كاس الثلج والكولا ممتازين)...'
                      : 'Write your feedback or note to the barista (e.g. delicious coffee, fast counter service, thank you!)...'
                  }
                  value={baristaFeedback}
                  onChange={(e) => setBaristaFeedback(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none resize-none"
                />

                {/* Optional guest name */}
                <div>
                  <input
                    type="text"
                    placeholder={isAr ? 'اسمك الكريم (اختياري)...' : 'Your name (optional)...'}
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99]"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>
                  {isAr
                    ? `إرسال طلب الحساب [${paymentMethod === 'cash' ? 'كاش 💵' : 'فيزا 💳'}] والتقييم`
                    : `Submit Bill Request [${paymentMethod === 'cash' ? 'Cash 💵' : 'Visa 💳'}] & Feedback`}
                </span>
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isAr ? 'إشعار مباشر للباريستا والمدير والمالك' : 'Live mark at Barista, Manager & Owner'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
