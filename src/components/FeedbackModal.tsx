import React, { useState, useEffect } from 'react';
import { useCoffee } from '../context/CoffeeContext';
import { Drink, PickupOrder } from '../types';
import {
  X,
  Star,
  MessageSquareHeart,
  Coffee,
  Smartphone,
  CheckCircle2,
  Table,
  Send,
  ThumbsUp,
  Sparkles,
  Heart,
  ChevronDown,
  User,
  Clock,
  Award,
  AlertCircle,
  Lock,
} from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedDrink?: Drink | null;
  isMandatory?: boolean;
  order?: PickupOrder | null;
  onFeedbackSubmitted?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  preSelectedDrink,
  isMandatory = false,
  order,
  onFeedbackSubmitted,
}) => {
  const { drinks, language, activeTable, addFeedback, feedbacks, settings } = useCoffee();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'give' | 'reviews'>('give');
  const [submitted, setSubmitted] = useState(false);

  // Form Fields
  const [guestName, setGuestName] = useState('');
  const [selectedTable, setSelectedTable] = useState(activeTable || 'Table 1');
  
  // App Feedback
  const [appRating, setAppRating] = useState<number>(5);
  const [appReview, setAppReview] = useState('');
  const [selectedAppTags, setSelectedAppTags] = useState<string[]>([]);

  // Drink Feedback
  const [isRatingDrink, setIsRatingDrink] = useState(true);
  const [selectedDrinkId, setSelectedDrinkId] = useState<string>(
    preSelectedDrink ? preSelectedDrink.id : drinks[0]?.id || ''
  );
  const [drinkRating, setDrinkRating] = useState<number>(5);
  const [drinkReview, setDrinkReview] = useState('');
  const [sweetnessRating, setSweetnessRating] = useState<'perfect' | 'too-sweet' | 'less-sweet' | 'neutral'>('perfect');
  const [serviceSpeedRating, setServiceSpeedRating] = useState<'fast' | 'normal' | 'slow'>('fast');

  // Auto-sync order details when an order requires mandatory feedback
  useEffect(() => {
    if (order) {
      if (order.customerName) setGuestName(order.customerName);
      if (order.tableNumber) setSelectedTable(order.tableNumber);
      if (order.items && order.items.length > 0) {
        setSelectedDrinkId(order.items[0].drinkId);
      }
    } else if (preSelectedDrink) {
      setSelectedDrinkId(preSelectedDrink.id);
    }
  }, [order, preSelectedDrink]);

  if (!isOpen) return null;

  const currentSelectedDrink = drinks.find((d) => d.id === selectedDrinkId) || drinks[0];

  const appPraiseTags = isAr
    ? [
        '⚡ سريع وسلس جداً',
        '📱 تطبيق سهل التثبيت',
        '☕ قائمة المنيو واضحة',
        '🏷️ طلب الطاولة مريح',
        '✨ تصميم أبيض ورمادي أنيق',
      ]
    : [
        '⚡ Ultra-fast & responsive',
        '📱 Easy mobile install',
        '☕ Clear visual menu',
        '🏷️ Seamless table ordering',
        '✨ Elegant white & gray aesthetic',
      ];

  const toggleAppTag = (tag: string) => {
    if (selectedAppTags.includes(tag)) {
      setSelectedAppTags(selectedAppTags.filter((t) => t !== tag));
    } else {
      setSelectedAppTags([...selectedAppTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fullAppNotes = [
      selectedAppTags.join(', '),
      appReview.trim(),
    ].filter(Boolean).join(' — ');

    addFeedback({
      guestName: guestName.trim() || (isAr ? 'ضيف ميكس مارت' : 'MIX MART Guest'),
      tableNumber: selectedTable,
      appRating,
      appReview: fullAppNotes || (isAr ? 'تجربة ممتازة وتطبيق رائع' : 'Great experience and smooth app'),
      drinkId: isRatingDrink && currentSelectedDrink ? currentSelectedDrink.id : undefined,
      drinkName: isRatingDrink && currentSelectedDrink
        ? (isAr && currentSelectedDrink.nameAr ? currentSelectedDrink.nameAr : currentSelectedDrink.name)
        : undefined,
      drinkRating: isRatingDrink ? drinkRating : undefined,
      drinkReview: isRatingDrink ? drinkReview.trim() : undefined,
      tasteSweetnessRating: sweetnessRating,
      serviceSpeedRating: serviceSpeedRating,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onFeedbackSubmitted?.();
      onClose();
    }, 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => {
        if (!isMandatory) onClose();
      }}
    >
      <div
        className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-900 relative max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent Top Strip */}
        <div className="h-1 bg-gradient-to-r from-slate-950 via-amber-400 to-slate-900 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 pt-2 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-md shrink-0">
              <MessageSquareHeart className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-950">
                  {isAr ? 'تقييم ورأي الضيوف' : 'Guest Reviews & Feedback'}
                </h3>
                {isMandatory ? (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full border border-amber-500 flex items-center gap-1 shadow-2xs">
                    <Lock className="w-3 h-3 text-slate-950" />
                    <span>{isAr ? 'إلزامي بعد الطلب' : 'Mandatory after order'}</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                    {isAr ? 'مشروبات وتطبيق' : 'Drinks & App'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isMandatory
                  ? (isAr
                      ? `تقييم طلبك #${order?.orderNumber || ''} مطلوب لتأكيد الخدمة وجودة المشروبات`
                      : `Feedback for order #${order?.orderNumber || ''} is required to guarantee highest quality`)
                  : (isAr
                      ? 'رأيك يهمنا في جودة المشروبات وتجربة التطبيق'
                      : 'Share your feedback on our handcrafted drinks and app experience')}
              </p>
            </div>
          </div>

          {isMandatory ? (
            <div className="px-3 py-1 bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-[11px] font-black flex items-center gap-1 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-amber-900" />
              <span>{isAr ? 'مطلوب' : 'Required'}</span>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Mandatory Order Notice Banner */}
        {isMandatory && (
          <div className="my-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200/90 text-slate-900 flex items-start gap-2.5 shrink-0 shadow-2xs">
            <AlertCircle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0 stroke-[2.5]" />
            <div className="text-xs leading-relaxed">
              <span className="font-extrabold text-amber-950 block">
                {isAr
                  ? `التقييم إلزامي للطلب رقم #${order?.orderNumber || ''}`
                  : `Feedback is required for Order #${order?.orderNumber || ''}`}
              </span>
              <span className="text-[11px] text-amber-900/90">
                {isAr
                  ? 'حرصاً من إدارة ميكس مارت (محمد هاني) على متابعة رضاء كل ضيف، يرجى ملء التقييم السريع أدناه للمتابعة.'
                  : 'To ensure top-tier barista craftsmanship, Mohamed Hany & MIX MART require your brief rating below.'}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Tabs: Leave Feedback vs Community Reviews */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl my-3 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('give')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'give'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{isAr ? 'أضف تقييمك الآن' : 'Leave Feedback'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>
              {isAr ? 'آراء الضيوف' : 'Community Reviews'} ({feedbacks.length})
            </span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {submitted ? (
            <div className="py-14 text-center space-y-3 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h4 className="font-display text-xl font-extrabold text-slate-950">
                {isAr ? 'شكراً جزيلاً لتقييمك الكريم!' : 'Thank you for your feedback!'}
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                {isAr
                  ? 'تم استلام ملاحظاتك بنجاح وسنعمل دائماً على تقديم أفضل تجربة ومشروبات تليق بضيوف ميكس مارت.'
                  : 'Your review was received. Mohamed Hany & the baristas appreciate your loyalty!'}
              </p>
            </div>
          ) : activeTab === 'give' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Guest Identification Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isAr ? 'اسمك الكريم (اختياري)' : 'Your Name (Optional)'}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={isAr ? 'مثال: محمد، سارة...' : 'e.g. Alex, Sarah...'}
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                    <Table className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isAr ? 'رقم الطاولة أو الاستلام' : 'Table / Seating'}</span>
                  </label>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-800 text-xs cursor-pointer"
                  >
                    <option value="Takeaway Counter">{isAr ? 'استلام سفري (Takeaway)' : 'Takeaway Counter'}</option>
                    {Array.from({ length: 15 }, (_, i) => `Table ${i + 1}`).map((tbl) => (
                      <option key={tbl} value={tbl}>
                        {isAr ? `طاولة رقم ${tbl.replace('Table ', '')}` : tbl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SECTION 1: DRINK FEEDBACK */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-slate-900" />
                    <span className="font-extrabold text-sm text-slate-900">
                      {isAr ? '1. تقييم المشروب (Drink Quality)' : '1. Handcrafted Drink Quality'}
                    </span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-semibold text-[11px]">
                    <input
                      type="checkbox"
                      checked={isRatingDrink}
                      onChange={(e) => setIsRatingDrink(e.target.checked)}
                      className="rounded accent-slate-900"
                    />
                    <span>{isAr ? 'تقييم مشروب' : 'Review drink'}</span>
                  </label>
                </div>

                {isRatingDrink && (
                  <div className="space-y-3 pt-1">
                    {/* If ordered items exist, provide quick chips to pick which drink to rate */}
                    {order && order.items && order.items.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                          {isAr ? 'اختر مشروب من طلبك للتقييم:' : 'Select ordered drink to review:'}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {order.items.map((it) => (
                            <button
                              key={it.cartItemId}
                              type="button"
                              onClick={() => setSelectedDrinkId(it.drinkId)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                selectedDrinkId === it.drinkId
                                  ? 'bg-slate-900 text-white shadow-xs'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400'
                              }`}
                            >
                              {it.quantity}× {it.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Drink Selector */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        {isAr ? 'المشروب المحدد للتقييم:' : 'Reviewed drink:'}
                      </label>
                      <select
                        value={selectedDrinkId}
                        onChange={(e) => setSelectedDrinkId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-slate-800 text-xs cursor-pointer"
                      >
                        {drinks.map((d) => (
                          <option key={d.id} value={d.id}>
                            {isAr && d.nameAr ? `${d.nameAr} (${d.name})` : d.name} — {d.price} {settings.currencySymbol}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Drink Star Rating */}
                    <div>
                      <span className="block text-slate-700 font-bold mb-1.5">
                        {isAr ? 'تقييمك للمشروب:' : 'Drink Rating:'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setDrinkRating(star)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= drinkRating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-slate-700 font-mono ml-2">
                          {drinkRating === 5
                            ? (isAr ? 'استثنائي ممتاز ⭐ 5/5' : 'Outstanding ⭐ 5/5')
                            : drinkRating === 4
                            ? (isAr ? 'لذيذ جداً 4/5' : 'Very Delicious 4/5')
                            : drinkRating === 3
                            ? (isAr ? 'جيد 3/5' : 'Good 3/5')
                            : (isAr ? 'يحتاج تحسين' : 'Needs tuning')}
                        </span>
                      </div>
                    </div>

                    {/* Taste & Sweetness Chips */}
                    <div>
                      <span className="block text-slate-700 font-bold mb-1.5">
                        {isAr ? 'ملاحظة الطعم والحلاوة:' : 'Taste & Balance:'}
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSweetnessRating('perfect')}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                            sweetnessRating === 'perfect'
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isAr ? '✨ متوازن ومضبوط' : '✨ Perfect'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSweetnessRating('too-sweet')}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                            sweetnessRating === 'too-sweet'
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isAr ? '🍯 سكر زيادة' : '🍯 Too sweet'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSweetnessRating('less-sweet')}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                            sweetnessRating === 'less-sweet'
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isAr ? '☕ خفيف / قليل السكر' : '☕ Less sweet'}
                        </button>
                      </div>
                    </div>

                    {/* Drink Notes */}
                    <div>
                      <input
                        type="text"
                        placeholder={
                          isAr
                            ? 'رأيك في المشروب (النكهة، القوام، الرغوة، البرودة)...'
                            : 'Taste notes (richness, crema, foam, chill factor)...'
                        }
                        value={drinkReview}
                        onChange={(e) => setDrinkReview(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: APP & SPEED FEEDBACK */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-slate-900" />
                    <span className="font-extrabold text-sm text-slate-900">
                      {isAr ? '2. تقييم تطبيق MIX MART وتجربة الطلب' : '2. MIX MART Mobile App Experience'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-700">
                    PWA App
                  </span>
                </div>

                {/* App Star Rating */}
                <div>
                  <span className="block text-slate-700 font-bold mb-1.5">
                    {isAr ? 'سهولة وسرعة استخدام التطبيق:' : 'App usability & speed:'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setAppRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= appRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 font-mono ml-2">
                      {appRating} / 5
                    </span>
                  </div>
                </div>

                {/* Quick App Praise Tags */}
                <div>
                  <span className="block text-slate-700 font-bold mb-1.5">
                    {isAr ? 'ما الذي أعجبك أكثر في التطبيق؟' : 'What stood out to you?'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {appPraiseTags.map((tag) => {
                      const isSelected = selectedAppTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleAppTag(tag)}
                          className={`py-1 px-2.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 text-white font-bold'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* App suggestions */}
                <div>
                  <textarea
                    rows={2}
                    placeholder={
                      isAr
                        ? 'ملاحظات أو اقتراحات لتطوير التطبيق أو الخدمة...'
                        : 'Any suggestions or features you would love to see next...'
                    }
                    value={appReview}
                    onChange={(e) => setAppReview(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 text-xs resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99]"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>{isAr ? 'إرسال التقييم لفريق MIX MART' : 'Submit Feedback to Baristas'}</span>
              </button>
            </form>
          ) : (
            /* REVIEWS TAB: Community reviews */
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-slate-900" />
                  <div>
                    <span className="font-bold text-slate-900">
                      {isAr ? 'تقييمات ضيوف MIX MART' : 'MIX MART Community Reviews'}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {isAr ? 'تقييمات حقيقية للمشروبات وتجربة التطبيق' : 'Authentic guest reviews & drink ratings'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-base font-extrabold text-slate-950 flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>4.9</span>
                  </span>
                  <span className="text-[10px] text-slate-500">{feedbacks.length} {isAr ? 'تقييم' : 'reviews'}</span>
                </div>
              </div>

              {feedbacks.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <MessageSquareHeart className="w-8 h-8 mx-auto text-slate-300" />
                  <p>{isAr ? 'كن أول من يترك تقييماً!' : 'Be the first to leave a review!'}</p>
                </div>
              ) : (
                feedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                          {fb.guestName ? fb.guestName.charAt(0) : 'G'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-xs">
                            {fb.guestName || (isAr ? 'ضيف ميكس مارت' : 'Guest')}
                          </span>
                          {fb.tableNumber && (
                            <span className="text-[10px] font-mono text-slate-500 ml-1.5 bg-slate-100 px-1.5 py-0.2 rounded">
                              {fb.tableNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: fb.appRating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    {/* Drink Tag if reviewed */}
                    {fb.drinkName && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-800 font-semibold">
                        <Coffee className="w-3.5 h-3.5 text-slate-700" />
                        <span>{fb.drinkName}</span>
                        {fb.drinkRating && (
                          <span className="font-mono text-[10px] text-amber-600 font-bold ml-1">
                            ⭐ {fb.drinkRating}/5
                          </span>
                        )}
                      </div>
                    )}

                    {/* Review text */}
                    {fb.drinkReview && (
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100">
                        "{fb.drinkReview}"
                      </p>
                    )}

                    {fb.appReview && (
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        {fb.appReview}
                      </p>
                    )}

                    <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-100">
                      <span>{new Date(fb.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{isAr ? 'تقييم موثق من المتجر' : 'Verified Guest Visit'}</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0 mt-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isAr ? 'بإشراف المالك: محمد هاني' : 'Supervised by: Mohamed Hany'}</span>
          </div>

          {isMandatory ? (
            <div className="flex items-center gap-1.5 font-bold text-amber-950 bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl text-[11px] shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-amber-900" />
              <span>{isAr ? 'إرسال التقييم إلزامي لإتمام الطلب' : 'Mandatory to finalize order'}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
