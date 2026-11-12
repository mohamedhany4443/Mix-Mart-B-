import React, { useState } from 'react';
import { useCoffee } from '../context/CoffeeContext';
import {
  X,
  Settings,
  DollarSign,
  Clock,
  RefreshCw,
  Download,
  Check,
  Sparkles,
  ArrowRight,
  Crown,
  Briefcase,
  Coffee,
  Award,
  FileCheck,
  MessageSquareHeart,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminDrinks: () => void;
  onOpenOwner?: () => void;
  onOpenManager?: () => void;
  onOpenStaff?: () => void;
  onOpenPropertyCertificate?: () => void;
  onOpenInstall?: () => void;
  onOpenFeedback?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenAdminDrinks,
  onOpenOwner,
  onOpenManager,
  onOpenStaff,
  onOpenPropertyCertificate,
  onOpenInstall,
  onOpenFeedback,
}) => {
  const {
    settings,
    updateSettings,
    resetToDefaults,
    exportCatalogJSON,
    drinks,
    updateDrink,
    language,
  } = useCoffee();

  const isAr = language === 'ar';
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeNameAr, setStoreNameAr] = useState(settings.storeNameAr || 'ميكس مارت');
  const [tagline, setTagline] = useState(settings.tagline);
  const [taglineAr, setTaglineAr] = useState(settings.taglineAr || 'بار القهوة والمشروبات المختصة');
  const [pickupCounter, setPickupCounter] = useState(settings.pickupCounterName);
  const [pickupCounterAr, setPickupCounterAr] = useState(settings.pickupCounterNameAr || 'بار الاستلام السريع رقم 1');
  const [address, setAddress] = useState(settings.address);
  const [addressAr, setAddressAr] = useState(settings.addressAr || 'فرع ميكس مارت داون تاون');
  const [operatingHours, setOperatingHours] = useState(settings.operatingHours);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [defaultWaitTime, setDefaultWaitTime] = useState(settings.defaultWaitTimeMinutes);
  const [adminPin, setAdminPin] = useState(settings.adminPin);

  // Batch price adjust state
  const [priceDelta, setPriceDelta] = useState<number>(0);
  const [batchSuccess, setBatchSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: storeName.trim(),
      storeNameAr: storeNameAr.trim(),
      tagline: tagline.trim(),
      taglineAr: taglineAr.trim(),
      pickupCounterName: pickupCounter.trim(),
      pickupCounterNameAr: pickupCounterAr.trim(),
      address: address.trim(),
      addressAr: addressAr.trim(),
      operatingHours: operatingHours.trim(),
      currencySymbol: currencySymbol.trim() || 'LE',
      defaultWaitTimeMinutes: Number(defaultWaitTime) || 10,
      adminPin: adminPin.trim() || '1234',
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleBatchPriceAdjust = () => {
    if (priceDelta === 0) return;
    if (
      !confirm(
        isAr
          ? `هل أنت متأكد من تعديل أسعار جميع المشروبات بمقدار (${priceDelta > 0 ? '+' : ''}${priceDelta} ${currencySymbol})؟`
          : `Apply ${priceDelta > 0 ? '+' : ''}${priceDelta} ${currencySymbol} to all drinks across the entire menu?`
      )
    ) {
      return;
    }

    drinks.forEach((dr) => {
      const newPrice = Math.max(10, dr.price + priceDelta);
      updateDrink({ ...dr, price: newPrice });
    });

    setBatchSuccess(true);
    setTimeout(() => {
      setBatchSuccess(false);
      setPriceDelta(0);
    }, 2000);
  };

  const handleExport = () => {
    const jsonStr = exportCatalogJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mix-mart-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900 max-h-[92vh] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-extrabold text-slate-950">
                {isAr ? 'إعدادات وتخصيص التطبيق' : 'Customizer & Store Settings'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isAr
                  ? 'تخصيص الاسم، العملة، أوقات الاستلام، الأسعار وبوابات العمل'
                  : 'Customize store name, currency, wait times, prices and roles'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1 text-xs">
          {/* Section: Official Property Certificate of Mohamed Hany */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-100 border-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-display text-base font-extrabold text-slate-950">
                    {isAr ? 'شهادة الملكية الرسمية (Property Certificate)' : 'Official Property Certificate'}
                  </h4>
                  <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full">
                    Mohamed Hany
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {isAr
                    ? 'شهادة الحيازة والملكية التجارية لعلامة MIX MART الصادرة باسم محمد هاني'
                    : 'Registered ownership deed and property certification for Mohamed Hany'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPropertyCertificate?.();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer shrink-0"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isAr ? 'عرض وطباعة الشهادة' : 'View & Print Certificate'}</span>
            </button>
          </div>

          {/* Section: Install Mobile App on iOS & Android */}
          {onOpenInstall && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md border border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs shrink-0 font-bold">
                  <Download className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-display text-base font-extrabold text-white">
                      {isAr ? 'تثبيت التطبيق على الموبايل (أيفون وأندرويد)' : 'Install Mobile App (iOS & Android)'}
                    </h4>
                    <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                      PWA App
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {isAr
                      ? 'ثبت تطبيق MIX MART على شاشة هاتفك الرئيسية، وتصفح المنيو بدون انترنت وبشاشة كاملة'
                      : 'Install MIX MART directly to your home screen with offline caching and full screen'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenInstall();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{isAr ? 'خطوات التثبيت والتحميل' : 'Install Instructions'}</span>
              </button>
            </div>
          )}

          {/* Section: Guest Reviews & Feedback for Drinks and App */}
          {onOpenFeedback && (
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 border border-rose-200 text-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <MessageSquareHeart className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-display text-base font-extrabold text-slate-950">
                      {isAr ? 'تقييم ورأي الضيوف (Guest Reviews & Feedback)' : 'Guest Reviews & Feedback'}
                    </h4>
                    <span className="text-[10px] font-mono font-bold bg-rose-200/80 text-rose-950 px-2 py-0.5 rounded-full">
                      Drinks & App
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {isAr
                      ? 'شارك رأيك وتقييمك للمشروبات وتطبيق ميكس مارت لمساعدتنا في تقديم أفضل جودة دائماً'
                      : 'Share your ratings and thoughts on our artisanal drinks and digital app experience'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFeedback();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
              >
                <MessageSquareHeart className="w-4 h-4 text-amber-300" />
                <span>{isAr ? 'كتابة تقييم وملاحظة' : 'Write Feedback'}</span>
              </button>
            </div>
          )}

          {/* Section 0: Team & Role Portals Hub (Owner, Manager, Staff) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-slate-900" />
                <h4 className="font-display text-sm font-extrabold text-slate-950">
                  {isAr ? 'بوابات الإدارة وطاقم العمل (Role Portals)' : 'Team & Administrative Portals'}
                </h4>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                {isAr ? 'صلاحيات الدخول' : 'Access Control'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              {isAr
                ? 'تم نقل بوابات الدخول هنا للحفاظ على هدوء وجمالية الواجهة الرئيسية. اختر البوابة المناسبة لدورك:'
                : 'Role access has been moved here to keep the storefront clean. Select your authorized portal below:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* 1. Owner Portal */}
              <div
                onClick={() => {
                  onClose();
                  onOpenOwner?.();
                }}
                className="p-3.5 rounded-xl bg-white border-2 border-slate-900 hover:shadow-md transition-all flex flex-col justify-between gap-3 group cursor-pointer"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
                      <Crown className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      mohamedhany444
                    </span>
                  </div>
                  <div className="font-bold text-slate-950 text-xs flex items-center gap-1">
                    <span>{isAr ? 'بوابة المالك والتخصيص' : 'Owner Customizer'}</span>
                    <span className="text-[9px] bg-slate-900 text-white px-1 rounded font-extrabold">Active</span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed line-clamp-3">
                    {isAr
                      ? 'التحكم الكامل في مشروبات المنيو: تغيير الصور، الأوصاف، والأسعار في أي وقت بضغطة زر.'
                      : 'Full control of menu stripes: customize photos, descriptions, and prices anytime.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                    onOpenOwner?.();
                  }}
                  className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Crown className="w-3.5 h-3.5 text-white" />
                  <span>{isAr ? 'تخصيص المنيو والأسعار (المالك)' : 'Customize Menu as Owner'}</span>
                </button>
              </div>

              {/* 2. Manager Portal */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-400 transition-all flex flex-col justify-between gap-3 group">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shadow-xs">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      manager_mixmart
                    </span>
                  </div>
                  <div className="font-bold text-slate-950 text-xs">
                    {isAr ? 'بوابة المدير (Manager)' : 'Manager Portal'}
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed line-clamp-3">
                    {isAr
                      ? 'إدارة الوردية اليومية، مراقبة طلبات الاستلام، وتعديل حالة توفر المشروبات في المخزن.'
                      : 'Daily shift operations, live order dispatcher, and 86 stock availability toggle.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenManager?.();
                  }}
                  className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{isAr ? 'دخول المدير' : 'Open Manager'}</span>
                </button>
              </div>

              {/* 3. Staff Portal */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-400 transition-all flex flex-col justify-between gap-3 group">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shadow-xs">
                      <Coffee className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      PIN: 1234
                    </span>
                  </div>
                  <div className="font-bold text-slate-950 text-xs">
                    {isAr ? 'بوابة الباريستا (Staff)' : 'Barista Staff'}
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed line-clamp-3">
                    {isAr
                      ? 'شاشة المطبخ KDS لعرض تذاكر المشروبات، وقت الانتظار، وتغيير حالة الطلب إلى جاهز.'
                      : 'Kitchen display screen for preparing tickets, customer names, and marking orders ready.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenStaff?.();
                  }}
                  className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>{isAr ? 'شاشة الباريستا' : 'Open Staff KDS'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: Storefront Identity */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-xs">
            <h4 className="font-display text-sm font-bold text-slate-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-900" />
              <span>{isAr ? 'هوية المتجر واسم البار' : 'Store Identity & Branding'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
                  Store Name (English)
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-xl text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
                  اسم المتجر (بالعربية)
                </label>
                <input
                  type="text"
                  required
                  value={storeNameAr}
                  onChange={(e) => setStoreNameAr(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-xl text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
                  Tagline / Bio (English)
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-xl text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
                  الوصف / الشعار (بالعربية)
                </label>
                <input
                  type="text"
                  value={taglineAr}
                  onChange={(e) => setTaglineAr(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-xl text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pickup Counter & Operations */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-xs">
            <h4 className="font-display text-sm font-bold text-slate-950 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-900" />
              <span>{isAr ? 'الاستلام وساعات العمل والعملة' : 'Pickup & Currency Settings'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
                  {isAr ? 'رمز العملة' : 'Currency Symbol'}
                </label>
                <div className="flex gap-1">
                  {['LE', 'EGP', '$', 'SAR', 'AED'].map((cur) => (
                    <button
                      key={cur}
                      type="button"
                      onClick={() => setCurrencySymbol(cur)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        currencySymbol === cur
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
                  {isAr ? 'وقت التجهيز المقدر (دقائق)' : 'Est. Wait Time (Mins)'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={defaultWaitTime}
                  onChange={(e) => setDefaultWaitTime(parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-xl text-slate-900 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
                  {isAr ? 'رقم PIN السري للإدارة' : 'Staff Admin PIN'}
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-xl text-slate-900 outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
                  {isAr ? 'نقطة الاستلام' : 'Pickup Counter Spot'}
                </label>
                <input
                  type="text"
                  value={pickupCounter}
                  onChange={(e) => setPickupCounter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-xl text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-600 mb-1 font-semibold">
                  {isAr ? 'مواعيد العمل' : 'Operating Hours'}
                </label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-xl text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Batch Price Adjuster */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-xs">
            <h4 className="font-display text-sm font-bold text-slate-950 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-900" />
                <span>{isAr ? 'تعديل أسعار سريع لجميع المشروبات' : 'Quick Batch Price Adjuster'}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenOwner) {
                    onOpenOwner();
                  } else {
                    onOpenAdminDrinks();
                  }
                }}
                className="text-xs text-slate-900 hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <span>{isAr ? 'تخصيص كمالك (تعديل الصورة والسعر)' : 'Customize Drinks as Owner'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </h4>

            <p className="text-slate-600 text-[11px]">
              {isAr
                ? 'يمكنك زيادة أو خفض أسعار جميع مشروبات المنيو دفعة واحدة (مثال: +5 أو -10 جنيه)'
                : 'Easily increase or decrease all drink prices across the entire menu simultaneously (e.g. +5 or -10 LE).'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-2">
                {[-10, -5, +5, +10, +20].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => setPriceDelta(delta)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      priceDelta === delta
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {delta > 0 ? `+${delta}` : delta} {currencySymbol}
                  </button>
                ))}
              </div>

              {priceDelta !== 0 && (
                <button
                  type="button"
                  onClick={handleBatchPriceAdjust}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all shadow-xs cursor-pointer"
                >
                  {isAr ? `تطبيق (${priceDelta > 0 ? '+' : ''}${priceDelta}) الآن` : `Apply (${priceDelta > 0 ? '+' : ''}${priceDelta}) Now`}
                </button>
              )}

              {batchSuccess && (
                <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>{isAr ? 'تم تحديث الأسعار بنجاح!' : 'Prices updated successfully!'}</span>
                </span>
              )}
            </div>
          </div>

          {/* Section 4: Data Backup & Reset */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-xs">
            <h4 className="font-display text-sm font-bold text-slate-950 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-slate-900" />
              <span>{isAr ? 'النسخ الاحتياطي واستعادة البيانات' : 'Backup & Data Sync'}</span>
            </h4>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-900" />
                <span>{isAr ? 'تصدير نسخة احتياطية (JSON)' : 'Export Menu (JSON)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      isAr
                        ? 'هل تريد استعادة منيو ميكس مارت الافتراضي بالكامل؟'
                        : 'Reset entire menu back to official MIX MART default items & prices?'
                    )
                  ) {
                    resetToDefaults();
                    alert(isAr ? 'تمت استعادة منيو ميكس مارت الافتراضي بنجاح!' : 'Menu reset to default.');
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isAr ? 'استعادة منيو المصنع الافتراضي' : 'Reset to Default Menu'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer with Save Button */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-all cursor-pointer"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm rounded-full transition-all shadow-sm active:scale-98 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isAr ? 'تم الحفظ بنجاح!' : 'Saved!'}</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isAr ? 'حفظ التعديلات' : 'Save Customizations'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
