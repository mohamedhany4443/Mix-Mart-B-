import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { useCoffee } from '../context/CoffeeContext';
import { Drink, PickupOrder } from '../types';
import { StaffLoginGate } from '../components/StaffLoginGate';
import { PropertyCertificateModal } from '../components/PropertyCertificateModal';
import { getAppUrl, getCurrentOriginAppUrl, AppRole } from '../utils/appUrl';
import {
  Crown,
  Globe,
  LogOut,
  Plus,
  Edit3,
  Trash2,
  TrendingUp,
  Banknote,
  CreditCard,
  Clock,
  Table,
  Star,
  Download,
  Award,
  Link2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Coffee,
  Image as ImageIcon,
  Upload,
  Search,
  Save,
  Receipt,
  Minus,
} from 'lucide-react';

const VERIFIED_DRINK_PRESETS = [
  {
    name: 'Espresso & Cappuccino',
    nameAr: 'اسبرسو وكابتشينو',
    url: '/src/assets/images/drink_espresso_cappuccino_1793735059392.jpg',
  },
  {
    name: 'Gold Velvet / Spanish Latte',
    nameAr: 'جولد / سبانش لاتيه',
    url: '/src/assets/images/drink_gold_velvet_latte_1793735059448.jpg',
  },
  {
    name: 'Iced Mocha Latte',
    nameAr: 'ايس موكا لاتيه',
    url: '/src/assets/images/drink_iced_mocha_latte_1793735059350.jpg',
  },
  {
    name: 'Nitro Cold Brew Can',
    nameAr: 'نيترو كولد برو كانز',
    url: '/src/assets/images/drink_nitro_cold_brew_1793735059432.jpg',
  },
  {
    name: 'Matcha Pour-Over',
    nameAr: 'ماتشا فاخرة',
    url: '/src/assets/images/drink_matcha_pourover_1793735059805.jpg',
  },
  {
    name: 'Chilled Cola Can',
    nameAr: 'كولا كانز مثلجة',
    url: '/src/assets/images/chilled_cola_can_1794320304270.jpg',
  },
  {
    name: 'Pure Mineral Water',
    nameAr: 'مياه معدنية نقية',
    url: '/src/assets/images/pure_mineral_water_1794320316971.jpg',
  },
  {
    name: 'Crystal Cup of Ice',
    nameAr: 'كاس ثلج كريستال',
    url: '/src/assets/images/crystal_cup_ice_1794320328646.jpg',
  },
];

export const OwnerApp: React.FC = () => {
  const {
    categories,
    drinks,
    orders,
    settings,
    language,
    setLanguage,
    syncStatus,
    tables,
    updateOrder,
    updateOrderStatus,
    addDrink,
    updateDrink,
    deleteDrink,
    toggleDrinkAvailability,
    addCategory,
    updateSettings,
    feedbacks,
    deleteFeedback,
    tableClosureRequests,
    settleTableClosure,
  } = useCoffee();

  const isAr = language === 'ar';

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mixmart_owner_app_session') === 'true';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'sales' | 'tables' | 'links'>('orders');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  // Order Edit Modal State
  const [editingOrder, setEditingOrder] = useState<PickupOrder | null>(null);
  const [addDrinkIdToOrder, setAddDrinkIdToOrder] = useState<string>(drinks[0]?.id || '');
  const [orderSearch, setOrderSearch] = useState('');

  // Menu Studio State
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<string>('all');
  const [menuSearch, setMenuSearch] = useState('');
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const [isCreatingDrink, setIsCreatingDrink] = useState(false);

  const [dName, setDName] = useState('');
  const [dNameAr, setDNameAr] = useState('');
  const [dPrice, setDPrice] = useState<number>(85);
  const [dCategoryId, setDCategoryId] = useState<string>(categories[0]?.id || '');
  const [dTemp, setDTemp] = useState<'hot' | 'iced' | 'both'>('iced');
  const [dNote, setDNote] = useState('');
  const [dNoteAr, setDNoteAr] = useState('');
  const [dImage, setDImage] = useState('');
  const [dAvailable, setDAvailable] = useState(true);
  const [dPopular, setDPopular] = useState(false);

  // New Category quick form
  const [newCatEn, setNewCatEn] = useState('');
  const [newCatAr, setNewCatAr] = useState('');

  // Sales state
  const [salesRange, setSalesRange] = useState<'all' | 'today'>('all');

  // Links & QR Hub state
  const [copiedRole, setCopiedRole] = useState<AppRole | null>(null);
  const [qrPreviews, setQrPreviews] = useState<Record<string, string>>({});

  // Credentials form
  const [credOwnerUser, setCredOwnerUser] = useState(settings.ownerUsername || 'mohamedhany444');
  const [credManagerUser, setCredManagerUser] = useState(settings.managerUsername || 'manager_mixmart');
  const [credBaristaUser, setCredBaristaUser] = useState(settings.staffUsername || 'barista_staff');
  const [credStoreName, setCredStoreName] = useState(settings.storeName);

  useEffect(() => {
    setCredOwnerUser(settings.ownerUsername || 'mohamedhany444');
    setCredManagerUser(settings.managerUsername || 'manager_mixmart');
    setCredBaristaUser(settings.staffUsername || 'barista_staff');
    setCredStoreName(settings.storeName);
  }, [settings]);

  useEffect(() => {
    if (activeTab !== 'links') return;
    const roles: AppRole[] = ['guest', 'barista', 'manager', 'owner'];
    roles.forEach(async (r) => {
      try {
        const dataUrl = await QRCode.toDataURL(getAppUrl(r), {
          width: 220,
          margin: 1,
          color: { dark: '#0f172a', light: '#ffffff' },
        });
        setQrPreviews((prev) => ({ ...prev, [r]: dataUrl }));
      } catch {
        // ignore
      }
    });
  }, [activeTab]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  // Sales derivations
  const scopedOrders = useMemo(() => {
    const valid = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'rejected');
    if (salesRange === 'today') {
      const today = new Date().toISOString().slice(0, 10);
      return valid.filter((o) => o.createdAt.startsWith(today));
    }
    return valid;
  }, [orders, salesRange]);

  const totalRevenue = useMemo(
    () => scopedOrders.reduce((s, o) => s + o.total, 0),
    [scopedOrders]
  );
  const cashRevenue = useMemo(
    () => scopedOrders.filter((o) => o.paymentMethod !== 'visa').reduce((s, o) => s + o.total, 0),
    [scopedOrders]
  );
  const visaRevenue = useMemo(
    () => scopedOrders.filter((o) => o.paymentMethod === 'visa').reduce((s, o) => s + o.total, 0),
    [scopedOrders]
  );

  const filteredDrinks = useMemo(() => {
    return drinks.filter((d) => {
      if (menuCategoryFilter !== 'all' && d.categoryId !== menuCategoryFilter) return false;
      if (!menuSearch.trim()) return true;
      const q = menuSearch.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        (d.nameAr && d.nameAr.toLowerCase().includes(q)) ||
        (d.note && d.note.toLowerCase().includes(q))
      );
    });
  }, [drinks, menuCategoryFilter, menuSearch]);

  if (!isAuthenticated) {
    return (
      <StaffLoginGate
        role="owner"
        expectedUsername={settings.ownerUsername || 'mohamedhany444'}
        expectedSecret={settings.ownerPassword}
        onAuthenticated={() => {
          setIsAuthenticated(true);
          try {
            localStorage.setItem('mixmart_owner_app_session', 'true');
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
      localStorage.removeItem('mixmart_owner_app_session');
    } catch {
      // ignore
    }
  };

  const openDrinkModal = (drink?: Drink) => {
    if (drink) {
      setIsCreatingDrink(false);
      setEditingDrink(drink);
      setDName(drink.name);
      setDNameAr(drink.nameAr || '');
      setDPrice(drink.price);
      setDCategoryId(drink.categoryId);
      setDTemp(drink.temperature || 'iced');
      setDNote(drink.note || '');
      setDNoteAr(drink.noteAr || '');
      setDImage(drink.image || '');
      setDAvailable(drink.isAvailable);
      setDPopular(!!drink.isPopular);
    } else {
      setIsCreatingDrink(true);
      setEditingDrink(null);
      setDName('');
      setDNameAr('');
      setDPrice(95);
      setDCategoryId(categories[0]?.id || 'coffee-drink');
      setDTemp('iced');
      setDNote('');
      setDNoteAr('');
      setDImage(VERIFIED_DRINK_PRESETS[0].url);
      setDAvailable(true);
      setDPopular(false);
    }
  };

  const handleSaveDrink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dName.trim()) return;

    const payload = {
      name: dName.trim(),
      nameAr: dNameAr.trim() || dName.trim(),
      price: Math.max(0, Number(dPrice) || 0),
      categoryId: dCategoryId || categories[0]?.id || 'coffee-drink',
      temperature: dTemp,
      note: dNote.trim() || undefined,
      noteAr: dNoteAr.trim() || undefined,
      image: dImage.trim() || undefined,
      isAvailable: dAvailable,
      isPopular: dPopular,
    };

    if (isCreatingDrink) {
      addDrink(payload);
      triggerToast(isAr ? `تمت إضافة المشروب الجديد: ${payload.nameAr}` : `Added drink: ${payload.name}`);
    } else if (editingDrink) {
      updateDrink({ ...editingDrink, ...payload });
      triggerToast(isAr ? `تم تحديث ${payload.nameAr}` : `Updated ${payload.name}`);
    }
    setIsCreatingDrink(false);
    setEditingDrink(null);
  };

  const handleUploadDrinkImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredOrders = orders.filter((o) => {
    if (!orderSearch.trim()) return true;
    const q = orderSearch.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.tableNumber && o.tableNumber.toLowerCase().includes(q))
    );
  });

  const handleAddItemToEditingOrder = () => {
    if (!editingOrder) return;
    const drink = drinks.find((d) => d.id === addDrinkIdToOrder) || drinks[0];
    if (!drink) return;
    const newItem = {
      cartItemId: `edit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      drinkId: drink.id,
      name: drink.name,
      nameAr: drink.nameAr,
      unitPrice: drink.price,
      totalPrice: drink.price,
      quantity: 1,
      size: 'Standard',
    };
    setEditingOrder({
      ...editingOrder,
      items: [...editingOrder.items, newItem],
    });
  };

  const handleSaveEditedOrder = () => {
    if (!editingOrder) return;
    updateOrder(editingOrder);
    triggerToast(
      isAr ? `تم حفظ تعديلات الطلب #${editingOrder.orderNumber}` : `Saved changes to #${editingOrder.orderNumber}`
    );
    setEditingOrder(null);
  };

  const handleCopyLink = async (role: AppRole) => {
    const url = getAppUrl(role);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedRole(role);
      setTimeout(() => setCopiedRole(null), 2000);
    } catch {
      // ignore
    }
  };

  const appDirectory: {
    role: AppRole;
    titleEn: string;
    titleAr: string;
    descEn: string;
    descAr: string;
    authEn: string;
    authAr: string;
  }[] = [
    {
      role: 'guest',
      titleEn: '1. Guest Ordering App',
      titleAr: '١. تطبيق العميل (Guest App)',
      descEn: 'Direct entry menu, extras customization, Immediate or Scheduled prep, Cash or Visa checkout & table closing.',
      descAr: 'دخول مباشر بدون تسجيل — المنيو، الإكسترا، التحضير الفوري أو المجدول، الدفع كاش أو فيزا وتقفيل الطاولة.',
      authEn: 'Direct Entry (No Login)',
      authAr: 'دخول مباشر بدون باسورد',
    },
    {
      role: 'barista',
      titleEn: '2. Barista Counter App',
      titleAr: '٢. تطبيق الباريستا (Barista App)',
      descEn: 'Order reception, Accept or Reject with reason, interactive Upselling & Cross-selling, and Table Closure Cash/Visa.',
      descAr: 'استقبال الطلبات، القبول أو الرفض مع السبب، عمل Upselling و Cross-selling وتقفيل الطاولات.',
      authEn: `Username: ${settings.staffUsername || 'barista_staff'}`,
      authAr: `اسم المستخدم: ${settings.staffUsername || 'barista_staff'}`,
    },
    {
      role: 'manager',
      titleEn: '3. Branch Manager App',
      titleAr: '٣. تطبيق مدير الفرع (Manager App)',
      descEn: 'Live order reception & branch sales analytics ONLY (no menu editing).',
      descAr: 'استقبال الطلبات ومتابعة المبيعات والتقارير فقط بدون المنيو.',
      authEn: `Username: ${settings.managerUsername || 'manager_mixmart'}`,
      authAr: `اسم المستخدم: ${settings.managerUsername || 'manager_mixmart'}`,
    },
    {
      role: 'owner',
      titleEn: '4. Owner Command App',
      titleAr: '٤. تطبيق المالك (Owner App)',
      descEn: 'Full control: Orders + Order Editing, Drinks Studio (Photos, Add Drinks, Prices, Descriptions), Sales & Permanent Links.',
      descAr: 'تحكم شامل: الطلبات وإمكانية التعديل، تغيير الصور، إضافة مشروبات، الأسعار، الوصف والمبيعات.',
      authEn: `Username: ${settings.ownerUsername || 'mohamedhany444'}`,
      authAr: `اسم المستخدم: ${settings.ownerUsername || 'mohamedhany444'}`,
    },
  ];

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      {/* 3-Zone Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-amber-300 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-extrabold text-lg text-slate-950 whitespace-nowrap">
                {settings.storeName}
              </span>
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">
                {isAr ? 'تطبيق المالك' : 'Owner App'}
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto max-w-full">
            {(
              [
                { id: 'orders', labelEn: 'Orders & Edit', labelAr: 'الطلبات والتعديل' },
                { id: 'menu', labelEn: 'Menu Studio', labelAr: 'المشروبات والصور' },
                { id: 'sales', labelEn: 'Sales', labelAr: 'المبيعات' },
                { id: 'tables', labelEn: 'Tables & Reviews', labelAr: 'الطاولات والتقييم' },
                { id: 'links', labelEn: '4 App Links', labelAr: 'روابط التطبيقات' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  activeTab === t.id
                    ? 'bg-white text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {isAr ? t.labelAr : t.labelEn}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCertificateOpen(true)}
              className="hidden md:flex min-h-[38px] px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 text-xs font-bold items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>{isAr ? 'شهادة الملكية' : 'Certificate'}</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage(isAr ? 'en' : 'ar')}
              className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isAr ? 'EN' : 'عربي'}</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-xs font-semibold text-slate-700 hover:text-rose-700 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {toastMsg && (
          <div className="p-3 rounded-xl bg-slate-950 text-white text-xs font-bold flex items-center justify-between">
            <span>{toastMsg}</span>
            <span className="text-[11px] font-mono text-slate-400">
              {syncStatus === 'live' ? 'Synced Live' : 'Saved'}
            </span>
          </div>
        )}

        {/* TAB 1: ORDERS & FULL ORDER EDITOR */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500">{isAr ? 'إجمالي الطلبات' : 'Total Orders'}</div>
                <div className="font-mono text-2xl font-extrabold text-slate-950 tabular-nums mt-1">
                  {orders.length}
                </div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500">{isAr ? 'إجمالي الإيرادات' : 'Total Revenue'}</div>
                <div className="font-mono text-2xl font-extrabold text-slate-950 tabular-nums mt-1">
                  {totalRevenue} {settings.currencySymbol}
                </div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500">{isAr ? 'كاش' : 'Cash'}</div>
                <div className="font-mono text-2xl font-extrabold text-emerald-700 tabular-nums mt-1">
                  {cashRevenue} {settings.currencySymbol}
                </div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500">{isAr ? 'فيزا' : 'Visa'}</div>
                <div className="font-mono text-2xl font-extrabold text-indigo-700 tabular-nums mt-1">
                  {visaRevenue} {settings.currencySymbol}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-slate-950">
                {isAr ? 'جميع الطلبات مع إمكانية التعديل الكامل' : 'All Branch Orders & Full Order Editor'}
              </h2>
              <div className="relative sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder={isAr ? 'بحث في الطلبات...' : 'Search orders...'}
                  className="w-full min-h-[40px] ps-9 pe-3 rounded-xl bg-white border border-slate-200 text-xs outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrders.map((ord) => (
                <div key={ord.id} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-lg font-extrabold text-slate-950 tabular-nums">
                          #{ord.orderNumber}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                          {ord.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 mt-1">
                        <span className="font-bold text-slate-900">{ord.customerName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{ord.tableNumber || (isAr ? 'سفري' : 'Takeaway')}</span>
                        <span aria-hidden="true">·</span>
                        <span>{ord.paymentMethod === 'visa' ? (isAr ? 'فيزا' : 'Visa') : (isAr ? 'كاش' : 'Cash')}</span>
                        <span aria-hidden="true">·</span>
                        <span>{ord.pickupTime}</span>
                      </div>
                    </div>
                    <div className="font-mono text-lg font-extrabold text-slate-950 tabular-nums shrink-0">
                      {ord.total} {settings.currencySymbol}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-2.5 space-y-1 text-xs">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between gap-2">
                        <span>
                          <span className="font-mono font-bold">{it.quantity}×</span>{' '}
                          {isAr && it.nameAr ? it.nameAr : it.name}
                        </span>
                        <span className="font-mono text-slate-700 tabular-nums">
                          {it.totalPrice} {settings.currencySymbol}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          updateOrderStatus(ord.id, e.target.value as PickupOrder['status'])
                        }
                        className="min-h-[38px] px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                      >
                        <option value="received">{isAr ? 'مستلم' : 'Received'}</option>
                        <option value="preparing">{isAr ? 'جاري التحضير' : 'Preparing'}</option>
                        <option value="ready">{isAr ? 'جاهز' : 'Ready'}</option>
                        <option value="completed">{isAr ? 'مكتمل' : 'Completed'}</option>
                        <option value="rejected">{isAr ? 'مرفوض' : 'Rejected'}</option>
                        <option value="cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingOrder(JSON.parse(JSON.stringify(ord)))}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تعديل الطلب بالكامل' : 'Edit Order'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: MENU & DRINKS STUDIO (PHOTOS, ADD DRINKS, PRICES, DESCRIPTIONS) */}
        {activeTab === 'menu' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-950">
                  {isAr
                    ? 'استوديو المنيو والمشروبات (الصور، الأسعار، الوصف والإضافة)'
                    : 'Menu & Drinks Studio (Photos, Add Drinks, Prices & Descriptions)'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'أي تعديل في الصور أو الأسعار أو الوصف ينعكس فوراً في تطبيق الضيوف'
                    : 'All photo, price & description changes sync instantly to the Guest App'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openDrinkModal()}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة مشروب جديد' : 'Add New Drink'}</span>
              </button>
            </div>

            {/* Category quick add + search */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col lg:flex-row gap-3 justify-between">
              <div className="flex items-center gap-2 flex-wrap flex-1">
                <select
                  value={menuCategoryFilter}
                  onChange={(e) => setMenuCategoryFilter(e.target.value)}
                  className="min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold outline-none"
                >
                  <option value="all">{isAr ? 'كل الأقسام' : 'All Categories'} ({drinks.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {isAr && c.nameAr ? c.nameAr : c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder={isAr ? 'بحث في المشروبات...' : 'Search drinks...'}
                  className="flex-1 min-w-[180px] min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCatEn}
                  onChange={(e) => setNewCatEn(e.target.value)}
                  placeholder={isAr ? 'قسم جديد (EN)' : 'New Category (EN)'}
                  className="w-32 min-h-[40px] px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none"
                />
                <input
                  type="text"
                  value={newCatAr}
                  onChange={(e) => setNewCatAr(e.target.value)}
                  placeholder={isAr ? 'الاسم بالعربي' : 'Arabic Name'}
                  className="w-32 min-h-[40px] px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newCatEn.trim()) return;
                    addCategory({
                      name: newCatEn.trim(),
                      nameAr: newCatAr.trim() || newCatEn.trim(),
                      sortOrder: categories.length + 1,
                    });
                    setNewCatEn('');
                    setNewCatAr('');
                    triggerToast(isAr ? 'تمت إضافة القسم' : 'Category added');
                  }}
                  className="min-h-[40px] px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold cursor-pointer whitespace-nowrap"
                >
                  + {isAr ? 'قسم' : 'Cat'}
                </button>
              </div>
            </div>

            {/* Drinks List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDrinks.map((d) => (
                <div
                  key={d.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {d.image ? (
                        <img
                          src={d.image}
                          alt={d.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Coffee className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-slate-950 truncate">
                        {isAr && d.nameAr ? d.nameAr : d.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{d.name}</div>
                      <div className="font-mono text-sm font-extrabold text-slate-950 tabular-nums mt-1">
                        {d.price} {settings.currencySymbol}
                      </div>
                    </div>
                  </div>

                  {(d.note || d.noteAr) && (
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {isAr && d.noteAr ? d.noteAr : d.note}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => toggleDrinkAvailability(d.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                        d.isAvailable
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {d.isAvailable ? (isAr ? 'متاح' : 'Available') : (isAr ? 'غير متاح' : 'Sold Out')}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openDrinkModal(d)}
                        className="min-h-[34px] px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isAr ? 'تعديل' : 'Edit'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteDrink(d.id);
                          triggerToast(isAr ? 'تم حذف المشروب' : 'Drink deleted');
                        }}
                        className="min-h-[34px] px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold cursor-pointer"
                        aria-label="Delete drink"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SALES ANALYTICS */}
        {activeTab === 'sales' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-display text-xl font-bold text-slate-950">
                {isAr ? 'متابعة المبيعات والأرباح' : 'Owner Sales Analytics'}
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex p-1 bg-slate-100 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setSalesRange('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                      salesRange === 'all' ? 'bg-white text-slate-950' : 'text-slate-600'
                    }`}
                  >
                    {isAr ? 'الإجمالي' : 'All Time'}
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
                  onClick={() => {
                    const header = 'Order,Guest,Payment,Status,Total,Date\n';
                    const csv = scopedOrders
                      .map((o) => `${o.orderNumber},"${o.customerName}",${o.paymentMethod || 'cash'},${o.status},${o.total},${o.createdAt}`)
                      .join('\n');
                    const blob = new Blob([header + csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `mixmart-owner-sales.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="min-h-[38px] px-3.5 rounded-xl bg-slate-950 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500">{isAr ? 'إجمالي المبيعات' : 'Total Revenue'}</div>
                <div className="font-mono text-3xl font-extrabold text-slate-950 tabular-nums mt-1">
                  {totalRevenue} {settings.currencySymbol}
                </div>
              </div>
              <div className="p-5 bg-white border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAr ? 'مبيعات الكاش' : 'Cash Revenue'}</span>
                </div>
                <div className="font-mono text-3xl font-extrabold text-emerald-700 tabular-nums mt-1">
                  {cashRevenue} {settings.currencySymbol}
                </div>
              </div>
              <div className="p-5 bg-white border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isAr ? 'مبيعات الفيزا' : 'Visa Revenue'}</span>
                </div>
                <div className="font-mono text-3xl font-extrabold text-indigo-700 tabular-nums mt-1">
                  {visaRevenue} {settings.currencySymbol}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TABLES & GUEST FEEDBACK */}
        {activeTab === 'tables' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-display text-lg font-bold text-slate-950">
                {isAr ? 'تقفيل الطاولات (كاش / فيزا)' : 'Table Closures & Settlements'}
              </h3>
              {tableClosureRequests.map((req) => (
                <div key={req.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-sm">
                      {req.tableNumber} · {req.paymentMethod === 'visa' ? 'Visa' : 'Cash'}
                    </span>
                    <span className="font-mono font-extrabold text-slate-950 tabular-nums">
                      {req.totalAmount} {settings.currencySymbol}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">"{req.baristaFeedback}"</p>
                  {req.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => settleTableClosure(req.id)}
                      className="w-full min-h-[38px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                    >
                      {isAr ? 'تسوية الطاولة' : 'Settle Table'}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="font-display text-lg font-bold text-slate-950">
                {isAr ? 'تقييمات الضيوف للمشروبات والتطبيق' : 'Guest Drink & App Reviews'}
              </h3>
              {feedbacks.map((fb) => (
                <div key={fb.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {fb.guestName || 'Guest'} {fb.tableNumber ? `· ${fb.tableNumber}` : ''}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-600">{fb.appRating}/5 ★</span>
                      <button
                        type="button"
                        onClick={() => deleteFeedback(fb.id)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {fb.drinkName && (
                    <div className="text-slate-700 font-semibold">{fb.drinkName}</div>
                  )}
                  {fb.appReview && <p className="text-slate-600">{fb.appReview}</p>}
                  {fb.drinkReview && <p className="text-slate-600 italic">{fb.drinkReview}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PERMANENT 4-APP LINKS & CREDENTIALS */}
        {activeTab === 'links' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-extrabold text-slate-950">
                {isAr ? 'الروابط الدائمة للتطبيقات الأربعة (بدون انتهاء صلاحية)' : 'Permanent Standalone Links for All 4 Branch Apps'}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {isAr
                  ? 'كل رابط يفتح تطبيقاً منفصلاً تماماً عن الآخر ويعمل بشكل دائم للفرع بالكامل.'
                  : 'Each URL launches a strictly isolated application on the permanent branch host.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appDirectory.map((item) => {
                const liveUrl = getCurrentOriginAppUrl(item.role);
                const permUrl = getAppUrl(item.role);
                return (
                  <div key={item.role} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="font-display text-base font-extrabold text-slate-950">
                          {isAr ? item.titleAr : item.titleEn}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {isAr ? item.descAr : item.descEn}
                        </p>
                        <div className="text-xs font-mono font-bold text-slate-800 pt-1">
                          {isAr ? item.authAr : item.authEn}
                        </div>
                      </div>
                      {qrPreviews[item.role] && (
                        <img
                          src={qrPreviews[item.role]}
                          alt={`${item.role} QR`}
                          className="w-20 h-20 rounded-xl border border-slate-200 shrink-0"
                        />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-emerald-700">
                        {isAr ? 'الرابط الشغال الآن للتجربة:' : 'Active Live Link:'}
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800 break-all" dir="ltr">
                        {liveUrl}
                      </div>
                      {permUrl !== liveUrl && (
                        <>
                          <div className="text-[11px] font-bold text-slate-500 pt-1">
                            {isAr ? 'الرابط الدائم (بعد الضغط على Share / Deploy):' : 'Permanent Published Link:'}
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600 break-all" dir="ltr">
                            {permUrl}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(liveUrl);
                            setCopiedRole(item.role);
                            setTimeout(() => setCopiedRole(null), 2000);
                          } catch {
                            // ignore
                          }
                        }}
                        className="flex-1 min-h-[40px] px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {copiedRole === item.role ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedRole === item.role ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الرابط الشغال' : 'Copy Link')}</span>
                      </button>
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{isAr ? 'فتح' : 'Open'}</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Store & Usernames Config */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
              <h3 className="font-display text-base font-bold text-slate-950">
                {isAr ? 'إعدادات المتجر وأسماء المستخدمين (Usernames)' : 'Store Identity & Staff Usernames'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{isAr ? 'اسم البراند' : 'Store Name'}</label>
                  <input
                    type="text"
                    value={credStoreName}
                    onChange={(e) => setCredStoreName(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{isAr ? 'اسم مستخدم المالك' : 'Owner Username'}</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={credOwnerUser}
                    onChange={(e) => setCredOwnerUser(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 font-mono outline-none focus:border-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{isAr ? 'اسم مستخدم المدير' : 'Manager Username'}</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={credManagerUser}
                    onChange={(e) => setCredManagerUser(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 font-mono outline-none focus:border-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{isAr ? 'اسم مستخدم الباريستا' : 'Barista Username'}</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={credBaristaUser}
                    onChange={(e) => setCredBaristaUser(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 font-mono outline-none focus:border-slate-900"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateSettings({
                    storeName: credStoreName.trim() || 'MIX MART',
                    ownerUsername: credOwnerUser.trim() || 'mohamedhany444',
                    managerUsername: credManagerUser.trim() || 'manager_mixmart',
                    staffUsername: credBaristaUser.trim() || 'barista_staff',
                  });
                  triggerToast(isAr ? 'تم حفظ الإعدادات وأسماء المستخدمين' : 'Saved store & username settings');
                }}
                className="min-h-[42px] px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isAr ? 'حفظ التعديلات' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* EDIT ORDER MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-h-[90vh] flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-display text-lg font-extrabold text-slate-950">
                {isAr ? `تعديل الطلب #${editingOrder.orderNumber}` : `Edit Order #${editingOrder.orderNumber}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{isAr ? 'اسم العميل' : 'Guest Name'}</label>
                  <input
                    type="text"
                    value={editingOrder.customerName}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customerName: e.target.value })}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{isAr ? 'الطاولة / الخدمة' : 'Table / Service'}</label>
                  <select
                    value={editingOrder.tableNumber || ''}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        tableNumber: e.target.value || undefined,
                        orderType: e.target.value ? 'dine-in' : 'takeaway',
                      })
                    }
                    className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  >
                    <option value="">{isAr ? 'سفري / كاونتر' : 'Takeaway / Counter'}</option>
                    {tables.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{isAr ? 'طريقة الدفع' : 'Payment Method'}</label>
                  <select
                    value={editingOrder.paymentMethod || 'cash'}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        paymentMethod: e.target.value as 'cash' | 'visa',
                      })
                    }
                    className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  >
                    <option value="cash">{isAr ? 'كاش' : 'Cash'}</option>
                    <option value="visa">{isAr ? 'فيزا' : 'Visa'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{isAr ? 'توقيت التحضير' : 'Prep Timing'}</label>
                  <select
                    value={editingOrder.preparationTiming || 'immediate'}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        preparationTiming: e.target.value as 'immediate' | 'scheduled',
                      })
                    }
                    className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  >
                    <option value="immediate">{isAr ? 'تحضير فوري' : 'Immediate'}</option>
                    <option value="scheduled">{isAr ? 'بعد وقت محدد' : 'Scheduled'}</option>
                  </select>
                </div>
              </div>

              {/* Order Items Editor */}
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <div className="font-bold text-slate-900">
                  {isAr ? 'أصناف الطلب والكميات:' : 'Order Line Items:'}
                </div>
                {editingOrder.items.map((it, idx) => (
                  <div
                    key={it.cartItemId + idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 truncate">
                        {isAr && it.nameAr ? it.nameAr : it.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        @{it.unitPrice} {settings.currencySymbol}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const nextQty = it.quantity - 1;
                          const nextItems =
                            nextQty <= 0
                              ? editingOrder.items.filter((_, i) => i !== idx)
                              : editingOrder.items.map((x, i) =>
                                  i === idx
                                    ? { ...x, quantity: nextQty, totalPrice: Number((x.unitPrice * nextQty).toFixed(2)) }
                                    : x
                                );
                          setEditingOrder({ ...editingOrder, items: nextItems });
                        }}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold tabular-nums">{it.quantity}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextQty = it.quantity + 1;
                          const nextItems = editingOrder.items.map((x, i) =>
                            i === idx
                              ? { ...x, quantity: nextQty, totalPrice: Number((x.unitPrice * nextQty).toFixed(2)) }
                              : x
                          );
                          setEditingOrder({ ...editingOrder, items: nextItems });
                        }}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingOrder({
                            ...editingOrder,
                            items: editingOrder.items.filter((_, i) => i !== idx),
                          });
                        }}
                        className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Drink to Existing Order */}
                <div className="flex gap-2 pt-1">
                  <select
                    value={addDrinkIdToOrder}
                    onChange={(e) => setAddDrinkIdToOrder(e.target.value)}
                    className="flex-1 min-h-[40px] px-3 rounded-xl bg-white border border-slate-200 outline-none"
                  >
                    {drinks.map((d) => (
                      <option key={d.id} value={d.id}>
                        {isAr && d.nameAr ? `${d.nameAr} (${d.price})` : `${d.name} (${d.price})`}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddItemToEditingOrder}
                    className="min-h-[40px] px-4 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                  >
                    + {isAr ? 'إضافة صنف' : 'Add Item'}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">{isAr ? 'ملاحظات الطلب' : 'Order Notes'}</label>
                <input
                  type="text"
                  value={editingOrder.notes || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                  className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="font-mono text-base font-extrabold text-slate-950 tabular-nums">
                {isAr ? 'الإجمالي الجديد:' : 'Updated Total:'}{' '}
                {editingOrder.items.reduce((s, it) => s + it.totalPrice, 0)} {settings.currencySymbol}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="min-h-[42px] px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedOrder}
                  className="min-h-[42px] px-5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  {isAr ? 'حفظ التعديلات' : 'Save Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT DRINK MODAL (PHOTOS, PRICES, DESCRIPTION) */}
      {(isCreatingDrink || editingDrink) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleSaveDrink}
            className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-h-[90vh] flex flex-col gap-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-display text-lg font-extrabold text-slate-950">
                {isCreatingDrink
                  ? isAr
                    ? 'إضافة مشروب جديد'
                    : 'Add New Drink'
                  : isAr
                  ? `تعديل المشروب: ${editingDrink?.nameAr || editingDrink?.name}`
                  : `Edit Drink: ${editingDrink?.name}`}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingDrink(false);
                  setEditingDrink(null);
                }}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{isAr ? 'الاسم بالإنجليزية *' : 'Name (English) *'}</label>
                  <input
                    type="text"
                    required
                    value={dName}
                    onChange={(e) => setDName(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{isAr ? 'الاسم بالعربية' : 'Name (Arabic)'}</label>
                  <input
                    type="text"
                    value={dNameAr}
                    onChange={(e) => setDNameAr(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    {isAr ? `السعر (${settings.currencySymbol}) *` : `Price (${settings.currencySymbol}) *`}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    required
                    value={dPrice}
                    onChange={(e) => setDPrice(Number(e.target.value))}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold outline-none focus:border-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{isAr ? 'القسم' : 'Category'}</label>
                  <select
                    value={dCategoryId}
                    onChange={(e) => setDCategoryId(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isAr && c.nameAr ? c.nameAr : c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description EN + AR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{isAr ? 'وصف المشروب (EN)' : 'Description (EN)'}</label>
                  <textarea
                    rows={2}
                    value={dNote}
                    onChange={(e) => setDNote(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{isAr ? 'وصف المشروب (عربي)' : 'Description (Arabic)'}</label>
                  <textarea
                    rows={2}
                    value={dNoteAr}
                    onChange={(e) => setDNoteAr(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Photo Manager */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>{isAr ? 'صورة المشروب (رفع صورة أو رابط أو اختيار جاهز)' : 'Drink Photo'}</span>
                  </span>
                  <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isAr ? 'رفع من الجهاز' : 'Upload File'}</span>
                    <input type="file" accept="image/*" onChange={handleUploadDrinkImage} className="hidden" />
                  </label>
                </div>

                <input
                  type="text"
                  dir="ltr"
                  value={dImage}
                  onChange={(e) => setDImage(e.target.value)}
                  placeholder="/src/assets/images/... or https://..."
                  className="w-full min-h-[38px] px-3 rounded-xl bg-white border border-slate-200 font-mono text-[11px] outline-none"
                />

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
                  {VERIFIED_DRINK_PRESETS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setDImage(preset.url)}
                      className={`rounded-xl overflow-hidden border-2 aspect-square cursor-pointer ${
                        dImage === preset.url ? 'border-slate-950' : 'border-transparent'
                      }`}
                      title={isAr ? preset.nameAr : preset.name}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <select
                  value={dTemp}
                  onChange={(e) => setDTemp(e.target.value as 'hot' | 'iced' | 'both')}
                  className="min-h-[38px] px-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold outline-none"
                >
                  <option value="hot">{isAr ? 'ساخن' : 'Hot'}</option>
                  <option value="iced">{isAr ? 'مثلج' : 'Iced'}</option>
                  <option value="both">{isAr ? 'ساخن ومثلج' : 'Hot & Iced'}</option>
                </select>
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dAvailable}
                    onChange={(e) => setDAvailable(e.target.checked)}
                    className="w-4 h-4 accent-slate-900"
                  />
                  <span>{isAr ? 'متاح للطلب' : 'Available'}</span>
                </label>
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dPopular}
                    onChange={(e) => setDPopular(e.target.checked)}
                    className="w-4 h-4 accent-slate-900"
                  />
                  <span>{isAr ? 'الأكثر طلباً' : 'Bestseller'}</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingDrink(false);
                  setEditingDrink(null);
                }}
                className="min-h-[42px] px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="min-h-[42px] px-5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                {isCreatingDrink ? (isAr ? 'إضافة المشروب' : 'Create Drink') : (isAr ? 'حفظ التعديلات' : 'Save Changes')}
              </button>
            </div>
          </form>
        </div>
      )}

      <PropertyCertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
      />
    </div>
  );
};
