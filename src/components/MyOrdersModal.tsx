import React from 'react';
import { useCoffee } from '../context/CoffeeContext';
import { PickupOrder } from '../types';
import {
  X,
  Clock,
  ShoppingBag,
  Table,
  Banknote,
  CreditCard,
  AlertTriangle,
  Sparkles,
  Check,
} from 'lucide-react';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({ isOpen, onClose }) => {
  const { orders, settings, language, respondToUpsellOffer } = useCoffee();
  const isAr = language === 'ar';

  if (!isOpen) return null;

  const getStatusBadge = (status: PickupOrder['status']) => {
    switch (status) {
      case 'received':
        return (
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full">
            {isAr ? 'بانتظار قبول الباريستا' : 'Pending Barista'}
          </span>
        );
      case 'preparing':
        return (
          <span className="text-[11px] font-semibold text-white bg-slate-900 px-2.5 py-0.5 rounded-full">
            {isAr ? 'تم القبول · جاري التحضير' : 'Accepted · Preparing'}
          </span>
        );
      case 'ready':
        return (
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            {isAr ? 'جاهز للاستلام' : 'Ready for Pickup'}
          </span>
        );
      case 'completed':
        return (
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
            {isAr ? 'مكتمل' : 'Completed'}
          </span>
        );
      case 'rejected':
        return (
          <span className="text-[11px] font-semibold text-rose-800 bg-rose-100 border border-rose-200 px-2.5 py-0.5 rounded-full">
            {isAr ? 'مرفوض من الباريستا' : 'Rejected by Barista'}
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-[11px] font-semibold text-rose-800 bg-rose-100 border border-rose-200 px-2.5 py-0.5 rounded-full">
            {isAr ? 'ملغي' : 'Cancelled'}
          </span>
        );
    }
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-900 max-h-[88vh] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950">
                {isAr ? 'متابعة حالة الطلبات' : 'Live Orders Tracker'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isAr
                  ? `تحديث لحظي مباشر من كاونتر ${settings.storeNameAr || settings.storeName}`
                  : `Live status & barista offers at ${settings.storeName}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {orders.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-900">
                {isAr ? 'لا توجد طلبات حتى الآن' : 'No orders yet'}
              </p>
              <p className="text-xs max-w-xs mx-auto text-slate-500">
                {isAr
                  ? 'اختر مشروبك من المنيو وأكد الطلب لمتابعة حالة التحضير هنا.'
                  : 'Add any drink from the menu and confirm your order to track progress here.'}
              </p>
            </div>
          ) : (
            orders.map((ord) => {
              const pendingOffers = (ord.upsellOffers || []).filter((o) => o.status === 'pending');

              return (
                <div
                  key={ord.id}
                  className={`p-4 rounded-2xl border space-y-3 ${
                    ord.status === 'rejected'
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-lg font-bold text-slate-950 tabular-nums">
                          #{ord.orderNumber}
                        </span>
                        {getStatusBadge(ord.status)}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
                        <span className="font-semibold text-slate-900">{ord.customerName}</span>
                        <span aria-hidden="true">·</span>
                        {ord.tableNumber ? (
                          <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                            <Table className="w-3 h-3" />
                            <span>{ord.tableNumber}</span>
                          </span>
                        ) : (
                          <span>{isAr ? 'سفري / كاونتر' : 'Takeaway'}</span>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                          {ord.paymentMethod === 'visa' ? (
                            <>
                              <CreditCard className="w-3 h-3 text-indigo-600" />
                              <span>{isAr ? 'فيزا' : 'Visa'}</span>
                            </>
                          ) : (
                            <>
                              <Banknote className="w-3 h-3 text-emerald-600" />
                              <span>{isAr ? 'كاش' : 'Cash'}</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="text-end">
                      <div className="font-mono text-base font-extrabold tabular-nums text-slate-950">
                        {ord.total} {settings.currencySymbol}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {ord.pickupTime}
                      </div>
                    </div>
                  </div>

                  {/* Rejected Order Notice */}
                  {ord.status === 'rejected' && (
                    <div className="p-3 rounded-xl bg-rose-100/80 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-700" />
                      <div className="space-y-0.5">
                        <div className="font-bold">
                          {isAr ? 'تم رفض الطلب من الباريستا' : 'Order Declined by Barista'}
                        </div>
                        <p className="text-rose-800">
                          {isAr ? 'السبب: ' : 'Reason: '}
                          {ord.rejectionReason || (isAr ? 'الصنف غير متوفر حالياً' : 'Item currently unavailable')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Pending Upsell / Cross-Sell Offers from Barista */}
                  {pendingOffers.length > 0 && ord.status !== 'rejected' && ord.status !== 'cancelled' && (
                    <div className="space-y-2">
                      {pendingOffers.map((offer) => (
                        <div
                          key={offer.id}
                          className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                            <div className="text-xs space-y-0.5">
                              <div className="font-bold text-indigo-950">
                                {offer.type === 'upsell'
                                  ? isAr
                                    ? 'ترقية مقترحة من الباريستا (Upsell)'
                                    : 'Barista Upgrade Suggestion'
                                  : isAr
                                  ? 'إضافة مميزة مقترحة (Cross-sell)'
                                  : 'Barista Pairing Suggestion'}
                              </div>
                              <div className="text-indigo-900 font-medium">
                                {isAr ? offer.titleAr : offer.title}{' '}
                                <span className="font-mono font-bold tabular-nums">
                                  (+{offer.price} {settings.currencySymbol})
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => respondToUpsellOffer(ord.id, offer.id, true)}
                              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isAr ? 'إضافة للطلب' : 'Add to Order'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => respondToUpsellOffer(ord.id, offer.id, false)}
                              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer transition-colors"
                            >
                              {isAr ? 'لا شكراً' : 'Decline'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Progress Tracker */}
                  {ord.status !== 'rejected' && ord.status !== 'cancelled' && (
                    <div className="py-1">
                      <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold tracking-tight mb-1.5">
                        <span className="text-slate-900">
                          {isAr ? '١. مستلم' : '1. Received'}
                        </span>
                        <span
                          className={
                            ord.status === 'preparing' || ord.status === 'ready' || ord.status === 'completed'
                              ? 'text-slate-900'
                              : 'text-slate-400'
                          }
                        >
                          {isAr ? '٢. تحضير' : '2. Preparing'}
                        </span>
                        <span
                          className={
                            ord.status === 'ready' || ord.status === 'completed' ? 'text-slate-900' : 'text-slate-400'
                          }
                        >
                          {isAr ? '٣. جاهز' : '3. Ready'}
                        </span>
                        <span className={ord.status === 'completed' ? 'text-slate-900' : 'text-slate-400'}>
                          {isAr ? '٤. مستلم' : '4. Picked Up'}
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full transition-all duration-300 ${
                            ord.status === 'received'
                              ? 'w-1/4 bg-slate-900'
                              : ord.status === 'preparing'
                              ? 'w-2/4 bg-slate-900'
                              : ord.status === 'ready'
                              ? 'w-3/4 bg-emerald-600'
                              : 'w-full bg-emerald-600'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Items list */}
                  <div className="text-xs text-slate-700 space-y-1 pt-1">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between gap-2">
                        <span>
                          <span className="font-mono font-bold">{it.quantity}×</span>{' '}
                          {isAr && it.nameAr ? it.nameAr : it.name}{' '}
                          <span className="text-slate-500">({it.size})</span>
                          {it.isUpsell && (
                            <span className="mx-1.5 text-[10px] font-semibold text-indigo-700">
                              · {it.upsellType === 'upsell' ? (isAr ? 'ترقية' : 'Upsell') : (isAr ? 'إضافة مقترحة' : 'Add-on')}
                            </span>
                          )}
                        </span>
                        <span className="font-mono font-bold text-slate-900 tabular-nums shrink-0">
                          {it.totalPrice} {settings.currencySymbol}
                        </span>
                      </div>
                    ))}
                    {ord.notes && (
                      <div className="text-[11px] text-slate-600 italic pt-1">
                        {isAr ? 'ملاحظات: ' : 'Notes: '}"{ord.notes}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {isAr
              ? `استلام من ${settings.pickupCounterNameAr || settings.pickupCounterName}`
              : `Pickup at ${settings.pickupCounterName}`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
