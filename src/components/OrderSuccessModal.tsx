import React from 'react';
import { PickupOrder } from '../types';
import { useCoffee } from '../context/CoffeeContext';
import { CheckCircle2, Clock, MapPin, X, Receipt, Table } from 'lucide-react';

interface OrderSuccessModalProps {
  order: PickupOrder | null;
  onClose: () => void;
  onViewAllOrders: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onViewAllOrders,
}) => {
  const { settings, language } = useCoffee();
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div className="h-1 bg-slate-900" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon & Header */}
        <div className="text-center pb-5 border-b border-slate-200 relative">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-3 text-white shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-mono tracking-widest uppercase text-slate-500 font-bold">
            {language === 'ar' ? 'تم استلام طلبك بنجاح' : 'Order Confirmed'}
          </span>
          <h3 className="font-display text-3xl font-extrabold tracking-tight text-slate-950 mt-1">
            #{order.orderNumber}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            {language === 'ar' ? (
              <>
                شكراً لك <strong className="text-slate-900">{order.customerName}</strong>! تم إرسال طلبك مباشرة للباريستا.
              </>
            ) : (
              <>
                Thank you, <strong className="text-slate-900">{order.customerName}</strong>! Sent directly to our barista.
              </>
            )}
          </p>
        </div>

        {/* Pickup Status Card */}
        <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">{language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-900">
              {order.paymentMethod === 'visa'
                ? language === 'ar'
                  ? 'فيزا / بطاقة'
                  : 'Visa / Card'
                : language === 'ar'
                ? 'كاش عند الاستلام'
                : 'Cash'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-700">
            <Clock className="w-4 h-4 text-slate-900 shrink-0" />
            <span>
              {language === 'ar' ? 'موعد التحضير: ' : 'Preparation: '}
              <strong className="text-slate-950 font-bold">{order.pickupTime}</strong>
            </span>
          </div>

          {order.tableNumber ? (
            <div className="flex items-center gap-2.5 text-xs text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200 shadow-xs">
              <Table className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <span>{language === 'ar' ? 'الخدمة على طاولة: ' : 'Serving to: '}</span>
                <strong className="text-amber-950 font-bold font-mono text-sm">{order.tableNumber}</strong>
                <div className="text-[11px] text-amber-800">
                  {language === 'ar' ? 'سيقوم الباريستا بتقديم المشروبات مباشرة إلى طاولتك' : 'Our barista will bring your order directly to this table.'}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-xs text-slate-700">
              <MapPin className="w-4 h-4 text-slate-900 shrink-0" />
              <span>
                {language === 'ar' ? 'مكان الاستلام: ' : 'Pickup Counter: '}
                <strong className="text-slate-950 font-bold">{settings.pickupCounterName}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Itemized summary */}
        <div className="space-y-2 mb-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>
              {language === 'ar' ? `الأصناف المطلوبة (${order.items.length})` : `Items Ordered (${order.items.length})`}
            </span>
            <Receipt className="w-3.5 h-3.5 text-slate-700" />
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1.5 text-xs pr-1">
            {order.items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-slate-700 py-1 border-b border-slate-100">
                <span>
                  {it.quantity}× {language === 'ar' && it.nameAr ? it.nameAr : it.name}{' '}
                  <span className="text-slate-500">({it.size})</span>
                </span>
                <span className="font-mono tabular-nums font-bold text-slate-900">
                  {it.totalPrice} {settings.currencySymbol}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm font-bold pt-2 text-slate-950 border-t border-slate-200">
            <span>{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
            <span className="font-mono tabular-nums text-slate-950 text-base font-extrabold">
              {order.total} {settings.currencySymbol}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onViewAllOrders}
            className="min-h-[42px] py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all cursor-pointer text-center shadow-xs"
          >
            {language === 'ar' ? 'متابعة حالة الطلب' : 'Track Live Order'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer text-center"
          >
            {language === 'ar' ? 'العودة للمنيو' : 'Back to Menu'}
          </button>
        </div>
      </div>
    </div>
  );
};
