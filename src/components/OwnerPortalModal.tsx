import React, { useState, useEffect, useMemo } from 'react';
import { useCoffee } from '../context/CoffeeContext';
import { Drink } from '../types';
import {
  X,
  Crown,
  KeyRound,
  User,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Coffee,
  Settings,
  Check,
  Eye,
  EyeOff,
  LogOut,
  Save,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  SlidersHorizontal,
  Image as ImageIcon,
  Star,
  Search,
  Layers,
  CheckCircle2,
  Award,
  MessageSquareHeart,
  Table,
  Banknote,
  CreditCard,
  Receipt,
  MessageSquare,
} from 'lucide-react';

interface OwnerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSales?: () => void;
  onOpenAdmin?: () => void;
  onOpenQr?: () => void;
  onOpenPropertyCertificate?: () => void;
  initialDrink?: Drink | null;
}

// Curated high-res beverage photo presets for 1-click photo changes
const BEVERAGE_PHOTO_PRESETS = [
  {
    name: 'Espresso Classic',
    nameAr: 'اسبرسو كريمي',
    category: 'Coffee',
    url: '/src/assets/images/drink_espresso_cappuccino_1793735059392.jpg',
  },
  {
    name: 'Spanish / Velvet Latte',
    nameAr: 'سبانش / جولد لاتيه',
    category: 'Latte',
    url: '/src/assets/images/drink_gold_velvet_latte_1793735059448.jpg',
  },
  {
    name: 'Iced Mocha / Chocolate',
    nameAr: 'ايس موكا شوكولاتة',
    category: 'Iced',
    url: '/src/assets/images/drink_iced_mocha_latte_1793735059350.jpg',
  },
  {
    name: 'Nitro Cold Brew Can',
    nameAr: 'نيترو كولد برو كانز',
    category: 'Cold Brew',
    url: '/src/assets/images/drink_nitro_cold_brew_1793735059432.jpg',
  },
  {
    name: 'Ceremonial Matcha Pourover',
    nameAr: 'ماتشا يابانية فاخرة',
    category: 'Specialty',
    url: '/src/assets/images/drink_matcha_pourover_1793735059805.jpg',
  },
  {
    name: 'Iced Caramel Macchiato',
    nameAr: 'ايس كراميل ميكاتو',
    category: 'Iced',
    url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Signature Can Iced Coffee',
    nameAr: 'كانز قهوة مثلجة',
    category: 'Can',
    url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Manual V60 Pour-Over',
    nameAr: 'تقطير يدوي V60 كيمكس',
    category: 'Specialty',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Lotus Biscoff Frappe',
    nameAr: 'فرابيه لوتس بيسكوف',
    category: 'Frappe',
    url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Brown Sugar Boba Tea',
    nameAr: 'بوبا تي براون شوجر',
    category: 'Boba',
    url: 'https://images.unsplash.com/photo-1558857563-b37cf5a2286b?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Mojito Red Bull & Berry',
    nameAr: 'موهيتو ريدبول وتوت',
    category: 'Refresher',
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Warm Butter Croissant',
    nameAr: 'كرواسون زبدة طازج',
    category: 'Bakery',
    url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Molten Nutella Cake',
    nameAr: 'مولتن نوتيلا وحلويات',
    category: 'Dessert',
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Hot Chocolate & Cream',
    nameAr: 'هوت شوكليت غني',
    category: 'Hot',
    url: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&auto=format&fit=crop&q=80',
  },
];

export const OwnerPortalModal: React.FC<OwnerPortalModalProps> = ({
  isOpen,
  onClose,
  onOpenSales,
  onOpenAdmin,
  onOpenPropertyCertificate,
  initialDrink,
}) => {
  const {
    drinks,
    categories,
    orders,
    settings,
    updateSettings,
    updateDrink,
    addDrink,
    deleteDrink,
    toggleDrinkAvailability,
    language,
    feedbacks,
    deleteFeedback,
    tableClosureRequests,
    settleTableClosure,
  } = useCoffee();

  const isAr = language === 'ar';

  const defaultOwnerUser = settings.ownerUsername || 'mohamedhany444';
  const defaultOwnerPass = settings.ownerPassword || 'Mm987654321mix mart';

  // Login form state - PRE-INSERTED for seamless user experience
  const [usernameInput, setUsernameInput] = useState(defaultOwnerUser);
  const [passwordInput, setPasswordInput] = useState(defaultOwnerPass);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  // Owner is authenticated by default
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(true);

  // Active tab in owner dashboard: defaults to 'stripes'
  const [ownerTab, setOwnerTab] = useState<'stripes' | 'overview' | 'closures' | 'prices' | 'branding' | 'security' | 'feedback'>('stripes');
  const pendingClosures = tableClosureRequests.filter((r) => r.status === 'pending');

  // Stripes Filter & Search States
  const [stripesCategoryFilter, setStripesCategoryFilter] = useState<string | null>(null);
  const [stripesSearch, setStripesSearch] = useState('');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Full Stripe Editor State
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form fields for Stripe Editor
  const [formName, setFormName] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formPrice, setFormPrice] = useState<number>(80);
  const [formImage, setFormImage] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formNoteAr, setFormNoteAr] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formTemperature, setFormTemperature] = useState<'hot' | 'iced' | 'both'>('hot');
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formIsPopular, setFormIsPopular] = useState(false);

  // Editable settings local copy
  const [editStoreName, setEditStoreName] = useState(settings.storeName);
  const [editStoreNameAr, setEditStoreNameAr] = useState(settings.storeNameAr || 'ميكس مارت');
  const [editTagline, setEditTagline] = useState(settings.tagline);
  const [editCurrency, setEditCurrency] = useState(settings.currencySymbol || 'LE');
  const [editWaitTime, setEditWaitTime] = useState(settings.defaultWaitTimeMinutes || 10);
  const [editAdminPin, setEditAdminPin] = useState(settings.adminPin || '1234');
  const [editOwnerUser, setEditOwnerUser] = useState(defaultOwnerUser);
  const [editOwnerPass, setEditOwnerPass] = useState(defaultOwnerPass);

  useEffect(() => {
    setEditStoreName(settings.storeName);
    setEditStoreNameAr(settings.storeNameAr || 'ميكس مارت');
    setEditTagline(settings.tagline);
    setEditCurrency(settings.currencySymbol || 'LE');
    setEditWaitTime(settings.defaultWaitTimeMinutes || 10);
    setEditAdminPin(settings.adminPin || '1234');
    setEditOwnerUser(settings.ownerUsername || 'mohamedhany444');
    setEditOwnerPass(settings.ownerPassword || 'Mm987654321mix mart');
  }, [settings]);

  // Open Stripe Editor for an existing drink
  const handleOpenEditStripe = (drink: Drink) => {
    setIsCreatingNew(false);
    setEditingDrink(drink);
    setFormName(drink.name);
    setFormNameAr(drink.nameAr || '');
    setFormPrice(drink.price);
    setFormImage(drink.image || '');
    setFormNote(drink.note || '');
    setFormNoteAr(drink.noteAr || '');
    setFormCategoryId(drink.categoryId);
    setFormTemperature(drink.temperature || 'hot');
    setFormIsAvailable(drink.isAvailable);
    setFormIsPopular(!!drink.isPopular);
  };

  useEffect(() => {
    if (isOpen && initialDrink) {
      setOwnerTab('stripes');
      handleOpenEditStripe(initialDrink);
    }
  }, [isOpen, initialDrink]);

  // Filtered drinks for Stripes Control - must be called before any early return (Rules of Hooks)
  const filteredStripes = useMemo(() => {
    return drinks.filter((d) => {
      if (stripesCategoryFilter && d.categoryId !== stripesCategoryFilter) {
        return false;
      }
      if (!stripesSearch.trim()) return true;
      const q = stripesSearch.toLowerCase().trim();
      return (
        d.name.toLowerCase().includes(q) ||
        (d.nameAr && d.nameAr.toLowerCase().includes(q)) ||
        (d.note && d.note.toLowerCase().includes(q)) ||
        (d.noteAr && d.noteAr.toLowerCase().includes(q))
      );
    });
  }, [drinks, stripesCategoryFilter, stripesSearch]);

  if (!isOpen) return null;

  // Financial KPIs
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const activeCount = orders.filter(
    (o) => o.status === 'received' || o.status === 'preparing' || o.status === 'ready'
  ).length;

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');

    const targetUser = (settings.ownerUsername || 'mohamedhany444').trim().toLowerCase();
    const targetPass = (settings.ownerPassword || 'Mm987654321mix mart').trim();

    const inputUser = usernameInput.trim().toLowerCase();
    const inputPass = passwordInput.trim();

    if (inputUser === targetUser && inputPass === targetPass) {
      setIsOwnerAuthenticated(true);
    } else {
      setAuthError(
        isAr
          ? 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.'
          : 'Invalid Owner Username or Password. Please check and try again.'
      );
    }
  };

  const handleQuickFill = () => {
    setUsernameInput('mohamedhany444');
    setPasswordInput('Mm987654321mix mart');
    setAuthError('');
  };

  const handleLogout = () => {
    setIsOwnerAuthenticated(false);
    setPasswordInput('');
  };

  // Open Stripe Editor for creating a new drink
  const handleOpenNewStripe = () => {
    setIsCreatingNew(true);
    setEditingDrink({
      id: '',
      name: '',
      nameAr: '',
      price: 80,
      categoryId: stripesCategoryFilter || categories[0]?.id || 'coffee-drink',
      isAvailable: true,
      isPopular: false,
      image: BEVERAGE_PHOTO_PRESETS[0].url,
      temperature: 'hot',
      note: '',
      noteAr: '',
    });
    setFormName('');
    setFormNameAr('');
    setFormPrice(80);
    setFormImage(BEVERAGE_PHOTO_PRESETS[0].url);
    setFormNote('');
    setFormNoteAr('');
    setFormCategoryId(stripesCategoryFilter || categories[0]?.id || 'coffee-drink');
    setFormTemperature('hot');
    setFormIsAvailable(true);
    setFormIsPopular(false);
  };

  // Save changes from Stripe Editor
  const handleSaveStripe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert(isAr ? 'يرجى إدخال اسم المشروب بالإنجليزي على الأقل' : 'Please enter drink name');
      return;
    }

    if (isCreatingNew) {
      addDrink({
        name: formName.trim(),
        nameAr: formNameAr.trim() || undefined,
        price: Number(formPrice) || 50,
        categoryId: formCategoryId || categories[0]?.id || 'coffee-drink',
        image: formImage.trim() || undefined,
        note: formNote.trim() || undefined,
        noteAr: formNoteAr.trim() || undefined,
        temperature: formTemperature,
        isAvailable: formIsAvailable,
        isPopular: formIsPopular,
      });
      setSavedNotice(isAr ? 'تمت إضافة شريحة المشروب الجديدة بنجاح للمنيو!' : 'New drink stripe created & added to live menu!');
    } else if (editingDrink) {
      updateDrink({
        ...editingDrink,
        name: formName.trim(),
        nameAr: formNameAr.trim() || undefined,
        price: Number(formPrice) || editingDrink.price,
        categoryId: formCategoryId,
        image: formImage.trim() || undefined,
        note: formNote.trim() || undefined,
        noteAr: formNoteAr.trim() || undefined,
        temperature: formTemperature,
        isAvailable: formIsAvailable,
        isPopular: formIsPopular,
      });
      setSavedNotice(isAr ? 'تم حفظ تعديل الصورة والوصف والسعر فوراً!' : 'Photo, description & price updated live on menu!');
    }

    setEditingDrink(null);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  // Delete drink stripe
  const handleDeleteStripe = (drink: Drink) => {
    const displayName = isAr && drink.nameAr ? drink.nameAr : drink.name;
    if (
      window.confirm(
        isAr
          ? `هل أنت متأكد من حذف المشروب (${displayName}) نهائياً من المنيو؟`
          : `Permanently delete "${displayName}" from the live menu?`
      )
    ) {
      deleteDrink(drink.id);
      setSavedNotice(isAr ? `تم حذف (${displayName}) من المنيو` : `Deleted "${displayName}" from menu`);
      setTimeout(() => setSavedNotice(null), 2500);
    }
  };


  const handleSaveSettings = () => {
    updateSettings({
      storeName: editStoreName,
      storeNameAr: editStoreNameAr,
      tagline: editTagline,
      currencySymbol: editCurrency,
      defaultWaitTimeMinutes: Number(editWaitTime) || 10,
      adminPin: editAdminPin,
      ownerUsername: editOwnerUser,
      ownerPassword: editOwnerPass,
    });
    setSavedNotice(isAr ? 'تم حفظ إعدادات الكافيه وبيانات المالك بنجاح!' : 'Store settings & owner credentials updated!');
    setTimeout(() => setSavedNotice(null), 2500);
  };

  const handleBatchAdjust = (delta: number) => {
    if (
      !window.confirm(
        isAr
          ? `هل تريد تعديل جميع أسعار المشروبات في المنيو بمقدار (${delta > 0 ? '+' : ''}${delta} ${settings.currencySymbol})؟`
          : `Adjust ALL drink prices across the entire menu by (${delta > 0 ? '+' : ''}${delta} ${settings.currencySymbol})?`
      )
    ) {
      return;
    }

    drinks.forEach((d) => {
      const newPrice = Math.max(5, d.price + delta);
      updateDrink({ ...d, price: newPrice });
    });

    setSavedNotice(isAr ? 'تم تعديل الأسعار بنجاح!' : 'Batch prices updated live!');
    setTimeout(() => setSavedNotice(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl text-slate-900 max-h-[94vh] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Dark Slate Accent Bar */}
        <div className="h-1 bg-slate-900" />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-slate-950">
                  {isAr ? 'بوابة مالك ميكس مارت' : 'MIX MART Owner Portal'}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
                  {isAr ? 'تحكم كامل بالشرائح' : 'Master Stripes Control'}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {isOwnerAuthenticated
                  ? `${isAr ? 'مرحباً بالمالك' : 'Welcome'} Mohamed Hany (@${settings.ownerUsername || 'mohamedhany444'}) — ${isAr ? 'تحكم كامل في الصور، الأسعار والأوصاف' : 'Full control over photos, prices & descriptions'}`
                  : (isAr ? 'تسجيل دخول المالك والتحكم الكامل في شرائح المنيو والمبيعات' : 'Executive owner login & master stripes control')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwnerAuthenticated && onOpenPropertyCertificate && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPropertyCertificate();
                }}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="View Property Certificate"
              >
                <Award className="w-3.5 h-3.5 text-slate-900" />
                <span className="hidden sm:inline">{isAr ? 'شهادة الملكية' : 'Property Certificate'}</span>
              </button>
            )}

            {isOwnerAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-xs font-semibold text-slate-700 hover:text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                title={isAr ? 'تسجيل الخروج' : 'Log Out'}
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
        {!isOwnerAuthenticated ? (
          /* LOGIN SCREEN */
          <div className="p-6 sm:p-10 flex-1 overflow-y-auto flex flex-col items-center justify-center text-center max-w-md mx-auto w-full space-y-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                <Crown className="w-8 h-8" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display text-2xl font-bold text-slate-950">
                {isAr ? 'تسجيل دخول المالك' : 'Owner Verification'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr
                  ? 'يرجى تسجيل الدخول بحساب المالك للتحكم في شرائح المشروبات (تغيير الصور، الأسعار، الأوصاف) ومتابعة الأرباح.'
                  : 'Sign in to access master controls: edit drink stripes, photos, descriptions, and prices live.'}
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-900" />
                  <span>{isAr ? 'اسم المستخدم (Username)' : 'Owner Username'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="mohamedhany444"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white text-slate-900 text-sm outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-900" />
                  <span>{isAr ? 'كلمة المرور (Password)' : 'Owner Password'}</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Mm987654321mix mart"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white text-slate-900 text-sm outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" />
                <span>{isAr ? 'دخول لوحة تحكم المالك' : 'Sign In as Owner'}</span>
              </button>

              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-800 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                  <span>
                    {isAr
                      ? '⚡ إدخال بيانات المالك تلقائياً (mohamedhany444)'
                      : '⚡ Auto-Fill Credentials (mohamedhany444)'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED OWNER DASHBOARD */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Owner Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 overflow-x-auto no-scrollbar gap-1.5 shrink-0">
              {/* PRIMARY TAB: STRIPES FULL CONTROL */}
              <button
                type="button"
                onClick={() => {
                  setEditingDrink(null);
                  setOwnerTab('stripes');
                }}
                className={`py-3 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 ${
                  ownerTab === 'stripes'
                    ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-900" />
                <span>{isAr ? 'التحكم بالشرائح (صور وأسعار وأوصاف)' : 'Menu Stripes Master (Full Control)'}</span>
                <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.2 rounded-full text-slate-800 tabular-nums">
                  {drinks.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingDrink(null);
                  setOwnerTab('overview');
                }}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  ownerTab === 'overview'
                    ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-slate-900" />
                <span>{isAr ? 'نظرة عامة ومبيعات' : 'Overview & Financials'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingDrink(null);
                  setOwnerTab('closures');
                }}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  ownerTab === 'closures'
                    ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Table className="w-3.5 h-3.5 text-slate-900" />
                <span>{isAr ? 'حساب الطاولات (كاش / فيزا)' : 'Table Closures (Cash/Visa)'}</span>
                {pendingClosures.length > 0 && (
                  <span className="font-mono text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black animate-pulse">
                    {pendingClosures.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingDrink(null);
                  setOwnerTab('prices');
                }}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  ownerTab === 'prices'
                    ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-slate-900" />
                <span>{isAr ? 'تعديل الأسعار الجماعي' : 'Batch Price Adjuster'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingDrink(null);
                  setOwnerTab('branding');
                }}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  ownerTab === 'branding'
                    ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-slate-900" />
                <span>{isAr ? 'هوية الكافيه والانتظار' : 'Store Branding'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingDrink(null);
                  setOwnerTab('security');
                }}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  ownerTab === 'security'
                    ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-900" />
                <span>{isAr ? 'بيانات دخول المالك' : 'Owner Credentials'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingDrink(null);
                  setOwnerTab('feedback');
                }}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  ownerTab === 'feedback'
                    ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MessageSquareHeart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                <span>{isAr ? 'تقييمات الضيوف' : 'Guest Feedback'}</span>
                <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.2 rounded-full text-slate-800 tabular-nums font-bold">
                  {feedbacks.length}
                </span>
              </button>
            </div>

            {/* Saved Notification Toast */}
            {savedNotice && (
              <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs py-2 px-4 flex items-center justify-center gap-2 animate-in fade-in shrink-0">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{savedNotice}</span>
              </div>
            )}

            {/* TAB CONTENT CONTAINER */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* TAB: STRIPES FULL CONTROL */}
              {ownerTab === 'stripes' && (
                <div className="space-y-6">
                  {/* Top Stripes Control Header */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-slate-900" />
                        <h3 className="font-display text-lg font-bold text-slate-950">
                          {isAr ? 'التحكم الكامل في شرائح المنيو' : 'Full Control of Drink Stripes'}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {isAr
                          ? 'بصفتك المالك، يمكنك تغيير صورة أي مشروب فوراً (اختيار من المعرض أو رابط مخصص)، وتعديل الوصف بالعربي والإنجليزي، وتعديل السعر بالجنيه وإضافة شرائح مشروبات جديدة.'
                          : 'As Owner, you have complete control over every stripe: update photos, edit descriptions, adjust prices in LE, toggle availability, and add new drinks.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenNewStripe}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-white stroke-[3]" />
                      <span>{isAr ? 'إضافة شريحة مشروب جديدة' : 'Add New Drink Stripe'}</span>
                    </button>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder={
                          isAr
                            ? 'ابحث في الشرائح لتعديل الصورة أو الوصف أو السعر...'
                            : 'Search drink stripes to edit photo, note or price...'
                        }
                        value={stripesSearch}
                        onChange={(e) => setStripesSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 focus:border-slate-900 text-xs text-slate-900 outline-none"
                      />
                      {stripesSearch && (
                        <button
                          type="button"
                          onClick={() => setStripesSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-900"
                        >
                          {isAr ? 'مسح' : 'Clear'}
                        </button>
                      )}
                    </div>

                    {/* Result Counter */}
                    <div className="text-xs text-slate-600 shrink-0 font-mono px-2">
                      <span>{isAr ? 'عرض' : 'Showing'} </span>
                      <strong className="text-slate-950">{filteredStripes.length}</strong> / {drinks.length}
                    </div>
                  </div>

                  {/* Category Filter Chips */}
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    <button
                      type="button"
                      onClick={() => setStripesCategoryFilter(null)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                        stripesCategoryFilter === null
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {isAr ? 'جميع الأقسام' : 'All Categories'} ({drinks.length})
                    </button>
                    {categories.map((cat) => {
                      const count = drinks.filter((d) => d.categoryId === cat.id).length;
                      const isSelected = stripesCategoryFilter === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setStripesCategoryFilter(cat.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {isAr && cat.nameAr ? cat.nameAr : cat.name} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* STRIPES LIST: The main interactive stripe rows */}
                  <div className="space-y-3">
                    {filteredStripes.map((drink) => {
                      const catName = categories.find((c) => c.id === drink.categoryId)?.name || 'Drink';
                      const primaryName = isAr && drink.nameAr ? drink.nameAr : drink.name;
                      const secondaryName = isAr ? drink.name : drink.nameAr;
                      const desc = isAr && drink.noteAr ? drink.noteAr : drink.note;

                      return (
                        <div
                          key={drink.id}
                          className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                        >
                          {/* Left: Thumbnail Image + Details */}
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            {/* Photo Thumbnail */}
                            <div
                              onClick={() => handleOpenEditStripe(drink)}
                              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 cursor-pointer group/img"
                              title={isAr ? 'اضغط لتغيير الصورة' : 'Click to change photo'}
                            >
                              {drink.image ? (
                                <img
                                  src={drink.image}
                                  alt={drink.name}
                                  className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <ImageIcon className="w-6 h-6" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-bold text-white">
                                <ImageIcon className="w-4 h-4 mb-0.5" />
                                <span>{isAr ? 'تغيير الصورة' : 'Edit Photo'}</span>
                              </div>
                            </div>

                            {/* Drink Titles, Category & Description */}
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-display text-base font-bold text-slate-950 group-hover:text-slate-900 transition-colors truncate">
                                  {primaryName}
                                </h4>
                                {secondaryName && (
                                  <span className="text-xs text-slate-500 font-medium truncate">
                                    ({secondaryName})
                                  </span>
                                )}
                                {drink.isPopular && (
                                  <span className="text-[10px] font-extrabold text-white bg-slate-900 px-2 py-0.2 rounded-full flex items-center gap-1">
                                    <Star className="w-2.5 h-2.5 fill-white" />
                                    <span>{isAr ? 'مميز' : 'Popular'}</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold border border-slate-200">
                                  {catName}
                                </span>
                                <span>·</span>
                                <span className="capitalize">
                                  {drink.temperature === 'both' ? 'Hot & Iced' : drink.temperature || 'Hot'}
                                </span>
                              </div>

                              {/* Description snippet */}
                              <p className="text-xs text-slate-600 line-clamp-1">
                                {desc ? (
                                  <span>{desc}</span>
                                ) : (
                                  <span className="text-slate-400 italic">
                                    {isAr ? 'لا يوجد وصف (اضغط لتعديل الوصف)' : 'No description (click to add)'}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Right: Quick Price Stepper & Action Controls */}
                          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                            {/* Quick Price Steppers */}
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
                              <button
                                type="button"
                                onClick={() => {
                                  updateDrink({ ...drink, price: Math.max(5, drink.price - 5) });
                                }}
                                className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center cursor-pointer shadow-xs"
                                title="-5"
                              >
                                -
                              </button>

                              <div className="flex items-center gap-1 px-1">
                                <input
                                  type="number"
                                  value={drink.price}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (!isNaN(val) && val >= 0) {
                                      updateDrink({ ...drink, price: val });
                                    }
                                  }}
                                  className="w-14 text-center font-mono font-bold text-sm text-slate-950 bg-transparent outline-none"
                                />
                                <span className="text-[11px] font-sans text-slate-500 font-semibold">
                                  {settings.currencySymbol}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  updateDrink({ ...drink, price: drink.price + 5 });
                                }}
                                className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center cursor-pointer shadow-xs"
                                title="+5"
                              >
                                +
                              </button>
                            </div>

                            {/* Stock Availability Toggle */}
                            <button
                              type="button"
                              onClick={() => toggleDrinkAvailability(drink.id)}
                              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                                drink.isAvailable
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {drink.isAvailable ? (isAr ? 'متاح' : 'In Stock') : (isAr ? 'غير متاح' : '86')}
                            </button>

                            {/* Full Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditStripe(drink)}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                              title={isAr ? 'تعديل الصورة والوصف والسعر والاسم' : 'Edit photo, description, price & name'}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{isAr ? 'تعديل' : 'Edit'}</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteStripe(drink)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                              title={isAr ? 'حذف الشريحة' : 'Delete stripe'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: OVERVIEW & FINANCIALS */}
              {ownerTab === 'overview' && (
                <div className="space-y-6">
                  {/* Executive Greeting Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
                        <Crown className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-xl font-bold text-slate-950">
                            Mohamed Hany
                          </h3>
                          <span className="text-[10px] font-mono text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full font-bold">
                            @mohamedhany444
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {isAr ? 'مالك ومؤسس MIX MART · صلاحيات التحكم الكاملة' : 'Owner & Founder of MIX MART · Full Executive Authority'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onOpenPropertyCertificate && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenPropertyCertificate();
                          }}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{isAr ? 'شهادة الملكية' : 'Property Certificate'}</span>
                        </button>
                      )}

                      {onOpenSales && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenSales();
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-slate-900" />
                          <span>{isAr ? 'نسبة المبيعات الكاملة' : 'Sales % Dashboard'}</span>
                        </button>
                      )}

                      {onOpenAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenAdmin();
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <Coffee className="w-3.5 h-3.5 text-slate-900" />
                          <span>{isAr ? 'بوابة الباريستا' : 'Barista Queue'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 4 Financial KPI Tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        {isAr ? 'إجمالي المبيعات' : 'Total Revenue'}
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display mt-1">
                        {totalRevenue.toLocaleString()}{' '}
                        <span className="text-xs text-slate-600 font-normal">{settings.currencySymbol}</span>
                      </div>
                      <div className="text-[10px] text-emerald-700 mt-1 flex items-center gap-1 font-semibold">
                        <TrendingUp className="w-3 h-3" />
                        <span>{isAr ? 'أرباح الطلبات المعتمدة' : 'Confirmed sales'}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        {isAr ? 'شرائح المشروبات' : 'Drink Stripes'}
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display mt-1">
                        {drinks.length}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {categories.length} {isAr ? 'أقسام منيو' : 'categories'}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        {isAr ? 'الطلبات المكتملة' : 'Completed Orders'}
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display mt-1">
                        {completedCount}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {orders.length} {isAr ? 'إجمالي طلبات' : 'total placed'}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        {isAr ? 'طلبات قيد التحضير' : 'Pending Queue'}
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display mt-1">
                        {activeCount}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {isAr ? 'على البار حالياً' : 'at pickup bar'}
                      </div>
                    </div>
                  </div>

                  {/* TABLE CLOSURES & CASH/VISA LIVE MARK (OWNER EXECUTIVE VIEW) */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
                          <Table className="w-5 h-5 text-slate-950" />
                        </div>
                        <div>
                          <h4 className="font-display text-sm sm:text-base font-extrabold text-slate-950 flex items-center gap-2">
                            <span>{isAr ? 'حساب الطاولات وملاحظات الباريستا (كاش / فيزا)' : 'Table Closures & Barista Notes (Cash / Visa)'}</span>
                            {pendingClosures.length > 0 && (
                              <span className="text-[10px] font-mono bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black animate-pulse">
                                {pendingClosures.length} {isAr ? 'طاولات بانتظار التحصيل' : 'pending'}
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {isAr
                              ? 'مراقبة فورية للزبائن الذين طلبوا إغلاق طاولاتهم، مع وسيلة الدفع ورسائلهم لطاقم الباريستا.'
                              : 'Real-time overview of guest table closures, payment choices, and messages to barista.'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setOwnerTab('closures')}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-end sm:self-auto shrink-0 shadow-xs"
                      >
                        <Receipt className="w-3.5 h-3.5 text-amber-300" />
                        <span>{isAr ? 'عرض سجل الطاولات الكامل' : 'Open Closures Audit'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="text-slate-500 uppercase text-[10px] font-bold">
                            {isAr ? 'طاولات بانتظار الدفع' : 'Pending Closures'}
                          </div>
                          <div className="text-lg font-mono font-extrabold text-amber-900 mt-0.5">
                            {pendingClosures.length} {isAr ? 'طاولة' : 'tables'}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                          ⚡
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="text-slate-500 uppercase text-[10px] font-bold flex items-center gap-1">
                            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{isAr ? 'إجمالي الكاش 💵' : 'Cash Total'}</span>
                          </div>
                          <div className="text-lg font-mono font-extrabold text-emerald-800 mt-0.5">
                            {tableClosureRequests
                              .filter((r) => r.paymentMethod === 'cash')
                              .reduce((sum, r) => sum + r.totalAmount, 0)}{' '}
                            <span className="text-xs font-normal">{settings.currencySymbol}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                          {tableClosureRequests.filter((r) => r.paymentMethod === 'cash').length} {isAr ? 'طلب' : 'req'}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="text-slate-500 uppercase text-[10px] font-bold flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                            <span>{isAr ? 'إجمالي الفيزا 💳' : 'Visa Total'}</span>
                          </div>
                          <div className="text-lg font-mono font-extrabold text-blue-800 mt-0.5">
                            {tableClosureRequests
                              .filter((r) => r.paymentMethod === 'visa')
                              .reduce((sum, r) => sum + r.totalAmount, 0)}{' '}
                            <span className="text-xs font-normal">{settings.currencySymbol}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                          {tableClosureRequests.filter((r) => r.paymentMethod === 'visa').length} {isAr ? 'طلب' : 'req'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: BATCH PRICE ADJUSTER */}
              {ownerTab === 'prices' && (
                <div className="space-y-6">
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-slate-900" />
                        <h4 className="text-sm font-bold text-slate-950 font-display">
                          {isAr ? 'التعديل الجماعي لجميع أسعار المشروبات' : 'Batch Price Adjustment (All Drinks)'}
                        </h4>
                      </div>
                      <span className="text-xs text-slate-600 font-mono">
                        {drinks.length} {isAr ? 'مشروب' : 'drinks in catalog'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      {isAr
                        ? 'زيادة أو تخفيض أسعار جميع مشروبات MIX MART بضغطة زر واحدة (تلقائياً في المنيو والطلبات):'
                        : 'Increase or decrease prices for all drinks across the entire menu simultaneously:'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {[+5, +10, +20, -5, -10].map((delta) => (
                        <button
                          key={delta}
                          type="button"
                          onClick={() => handleBatchAdjust(delta)}
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-xs"
                        >
                          {delta > 0 ? `+${delta}` : delta} {settings.currencySymbol}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: STORE BRANDING */}
              {ownerTab === 'branding' && (
                <div className="space-y-4 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isAr ? 'اسم الكافيه (English)' : 'Store Name (English)'}
                      </label>
                      <input
                        type="text"
                        value={editStoreName}
                        onChange={(e) => setEditStoreName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-slate-900 text-slate-900 text-sm outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isAr ? 'اسم الكافيه (عربي)' : 'Store Name (Arabic)'}
                      </label>
                      <input
                        type="text"
                        value={editStoreNameAr}
                        onChange={(e) => setEditStoreNameAr(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-slate-900 text-slate-900 text-sm outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isAr ? 'رمز العملة' : 'Currency Symbol'}
                      </label>
                      <input
                        type="text"
                        value={editCurrency}
                        onChange={(e) => setEditCurrency(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-slate-900 text-slate-900 text-sm outline-none font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isAr ? 'وقت تجهيز الطلب التقديري (بالدقائق)' : 'Default Ready Time (Minutes)'}
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={60}
                        value={editWaitTime}
                        onChange={(e) => setEditWaitTime(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-slate-900 text-slate-900 text-sm outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isAr ? 'وصف الكافيه والشعار' : 'Tagline'}
                      </label>
                      <input
                        type="text"
                        value={editTagline}
                        onChange={(e) => setEditTagline(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-slate-900 text-slate-900 text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-white" />
                      <span>{isAr ? 'حفظ إعدادات الكافيه' : 'Save Store Details'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: OWNER CREDENTIALS & SECURITY */}
              {ownerTab === 'security' && (
                <div className="space-y-6 max-w-xl">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-950">
                      <Crown className="w-4 h-4 text-slate-900" />
                      <span>{isAr ? 'بيانات حساب مالك MIX MART الحالية' : 'Current Owner Master Credentials'}</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {isAr
                        ? 'يمكنك مراجعة أو تحديث اسم المستخدم وكلمة المرور الخاصة بك في أي وقت:'
                        : 'Review or update your owner login details below:'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isAr ? 'اسم مستخدم المالك (Owner Username)' : 'Owner Username'}
                      </label>
                      <input
                        type="text"
                        value={editOwnerUser}
                        onChange={(e) => setEditOwnerUser(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-slate-900 text-slate-900 text-sm outline-none font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isAr ? 'كلمة مرور المالك (Owner Password)' : 'Owner Password'}
                      </label>
                      <input
                        type="text"
                        value={editOwnerPass}
                        onChange={(e) => setEditOwnerPass(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-slate-900 text-slate-900 text-sm outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isAr ? 'رمز أمان الباريستا / الموظفين (PIN)' : 'Staff Barista PIN (Default: 1234)'}
                      </label>
                      <input
                        type="text"
                        maxLength={8}
                        value={editAdminPin}
                        onChange={(e) => setEditAdminPin(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-slate-900 text-slate-900 text-sm outline-none font-mono"
                      />
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleSaveSettings}
                        className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                      >
                        <Save className="w-4 h-4 text-white" />
                        <span>{isAr ? 'حفظ بيانات المرور الجديدة' : 'Update Credentials'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: TABLE CLOSURES (CASH / VISA & BARISTA FEEDBACK AUDIT) */}
              {ownerTab === 'closures' && (
                <div className="p-4 sm:p-6 space-y-5 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <h4 className="font-display text-base font-extrabold text-slate-950 flex items-center gap-2">
                        <Table className="w-5 h-5 text-amber-500" />
                        <span>{isAr ? 'سجل حساب الطاولات والتحصيل (كاش / فيزا)' : 'Table Closures & Settlement Audit'}</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isAr
                          ? 'متابعة حية للـ 15 طاولة: وسيلة الدفع المختارة (كاش أو فيزا) مع نص الملاحظات الموجهة للباريستا.'
                          : 'Live audit of 15 tables: selected payment method (Cash or Visa) and guest messages to barista.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-xl">
                        ⚡ {pendingClosures.length} {isAr ? 'بانتظار التحصيل' : 'pending settlement'}
                      </span>
                    </div>
                  </div>

                  {/* Financial Breakdown Tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">
                        {isAr ? 'إجمالي الطلبات' : 'Total Closures'}
                      </div>
                      <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">
                        {tableClosureRequests.length}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                      <div className="text-[11px] font-bold text-amber-700 uppercase">
                        {isAr ? 'طاولات معلقة' : 'Pending'}
                      </div>
                      <div className="text-xl font-extrabold font-mono text-amber-900 mt-1">
                        {pendingClosures.length}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <div className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                        <Banknote className="w-3.5 h-3.5" />
                        <span>{isAr ? 'إجمالي الكاش 💵' : 'Cash Total'}</span>
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
                        <span>{isAr ? 'إجمالي الفيزا 💳' : 'Visa Total'}</span>
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
                          ? 'عندما يطلب الزبون الحساب وإغلاق الطاولة من هاتفه تظهر هنا وسيلة الدفع ورسالته للباريستا.'
                          : 'Table close requests with payment method and barista message will appear here in real-time.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
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

                                  {/* Cash vs Visa Mark Badge */}
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

                                  {/* Status */}
                                  <span
                                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                      req.status === 'pending'
                                        ? 'bg-amber-200 text-amber-900 border border-amber-300 animate-pulse'
                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    }`}
                                  >
                                    {req.status === 'pending'
                                      ? (isAr ? 'بانتظار التحصيل' : 'Pending Settlement')
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
                                  <span>{isAr ? 'تسوية الطاولة والتحصيل' : 'Settle Table'}</span>
                                </button>
                              ) : (
                                <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{isAr ? 'تم إنهاؤها' : 'Settled'}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Guest Feedback to Barista */}
                          {req.baristaFeedback && (
                            <div className="mt-3 pt-3 border-t border-slate-200/80 bg-white/60 p-2.5 rounded-xl text-xs flex items-start gap-2 text-slate-700">
                              <MessageSquare className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-slate-900">
                                  {isAr ? 'رسالة الضيف لطاقم الباريستا: ' : 'Guest message to barista: '}
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

              {/* TAB 6: GUEST FEEDBACK & REVIEWS VIEWER */}
              {ownerTab === 'feedback' && (
                <div className="p-4 sm:p-6 space-y-5 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <h4 className="font-display text-base font-extrabold text-slate-950 flex items-center gap-2">
                        <MessageSquareHeart className="w-5 h-5 text-rose-600" />
                        <span>{isAr ? 'صندوق تقييمات وآراء الضيوف' : 'Guest Reviews & Feedback Inbox'}</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isAr
                          ? 'متابعة مباشرة لآراء الزبائن في جودة المشروبات، الطعم، والسرعة وتجربة تطبيق الهاتف.'
                          : 'Live guest reviews on handcrafted drink quality, taste, temperature and app experience.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-xl">
                        ⭐ {isAr ? 'المتوسط العام: 4.9 / 5' : 'Average: 4.9 / 5'}
                      </span>
                    </div>
                  </div>

                  {feedbacks.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 space-y-2">
                      <MessageSquareHeart className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="text-sm font-semibold">{isAr ? 'لا توجد تقييمات حتى الآن' : 'No guest feedback yet'}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {feedbacks.map((fb) => (
                        <div
                          key={fb.id}
                          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 relative group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                                {fb.guestName ? fb.guestName.charAt(0) : 'G'}
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-900 text-xs">
                                  {fb.guestName || (isAr ? 'ضيف ميكس مارت' : 'Guest')}
                                </h5>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                  {fb.tableNumber && <span>{fb.tableNumber}</span>}
                                  <span>·</span>
                                  <span>{new Date(fb.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => deleteFeedback(fb.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title={isAr ? 'حذف هذا التقييم' : 'Delete Review'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Ratings Row */}
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg text-amber-900 font-bold">
                              <span>{isAr ? 'التطبيق:' : 'App:'}</span>
                              <div className="flex">
                                {Array.from({ length: fb.appRating || 5 }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                                ))}
                              </div>
                            </div>

                            {fb.drinkName && (
                              <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-slate-800 font-semibold text-[11px]">
                                <Coffee className="w-3 h-3 text-slate-600" />
                                <span className="font-bold">{fb.drinkName}</span>
                                {fb.drinkRating && (
                                  <span className="text-amber-600 font-mono font-bold">⭐ {fb.drinkRating}/5</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Feedback text */}
                          {fb.drinkReview && (
                            <p className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed font-medium">
                              "{fb.drinkReview}"
                            </p>
                          )}

                          {fb.appReview && (
                            <p className="text-xs text-slate-600 italic">
                              {fb.appReview}
                            </p>
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

        {/* FULL STRIPE EDITOR MODAL OVERLAY (CHANGING PHOTO, DESCRIPTION, PRICE & DETAILS) */}
        {editingDrink && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-900 max-h-[92vh] flex flex-col relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-slate-950">
                      {isCreatingNew
                        ? (isAr ? 'إضافة شريحة مشروب جديدة' : 'Add New Drink Stripe')
                        : (isAr ? `تعديل شريحة: ${formName || editingDrink.name}` : `Full Stripe Editor: ${formName || editingDrink.name}`)}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isAr
                        ? 'التحكم الكامل: تغيير الصورة، تعديل الوصف (عربي وإنجليزي)، وتغيير السعر'
                        : 'Full control: change photo, edit descriptions (EN & AR), and set price'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setEditingDrink(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveStripe} className="flex-1 overflow-y-auto py-5 space-y-6 pr-1 text-xs">
                {/* 1. PHOTO SELECTOR (CONTROL PHOTOS) */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                      <ImageIcon className="w-4 h-4 text-slate-900" />
                      <span>{isAr ? '1. صورة المشروب (Photo Control)' : '1. Drink Photo (Change Photo)'}</span>
                    </label>
                    <span className="text-[10px] text-slate-500">
                      {isAr ? 'اختر صورة من المعرض أو ضع رابطك الخاص' : 'Pick from presets or paste custom image URL'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Live Thumbnail Preview */}
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border-2 border-slate-200 shrink-0 shadow-sm relative group">
                      {formImage ? (
                        <img
                          src={formImage}
                          alt="Drink Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = BEVERAGE_PHOTO_PRESETS[0].url;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Coffee className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[9px] text-center text-white font-bold py-0.5">
                        {isAr ? 'المعاينة' : 'Preview'}
                      </div>
                    </div>

                    {/* Custom Image URL Input */}
                    <div className="flex-1 w-full space-y-1.5">
                      <label className="text-[11px] text-slate-600 font-semibold">
                        {isAr ? 'رابط الصورة المباشر (Custom Image URL):' : 'Direct Image URL:'}
                      </label>
                      <input
                        type="url"
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-slate-900 rounded-xl text-slate-900 text-xs outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Preset Gallery Picker */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-800">
                      {isAr ? 'أو اختر صورة جاهزة عالية الجودة بضغطة زر واحدة:' : 'Or click any preset photo to apply instantly:'}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                      {BEVERAGE_PHOTO_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormImage(preset.url)}
                          className={`group relative rounded-xl overflow-hidden border p-1 text-left transition-all cursor-pointer ${
                            formImage === preset.url
                              ? 'border-slate-900 bg-slate-100 ring-2 ring-slate-900'
                              : 'border-slate-200 hover:border-slate-400 bg-white'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-12 rounded-lg object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="text-[9px] font-bold text-slate-900 truncate mt-1 text-center">
                            {isAr ? preset.nameAr : preset.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. PRICE CONTROL (CHANGE PRICE) */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                      <DollarSign className="w-4 h-4 text-slate-900" />
                      <span>{isAr ? '2. تحديد السعر (Price Control)' : '2. Drink Price (Change Price)'}</span>
                    </label>
                    <span className="text-[10px] text-slate-500">
                      {isAr ? 'السعر بالجنيه المصري (LE)' : 'Price in Egyptian Pounds (LE)'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-900 px-3.5 py-2 rounded-xl shadow-xs">
                      <input
                        type="number"
                        min={5}
                        max={1000}
                        required
                        value={formPrice}
                        onChange={(e) => setFormPrice(Number(e.target.value))}
                        className="w-20 text-center font-mono font-extrabold text-base text-slate-950 bg-transparent outline-none"
                      />
                      <span className="text-xs font-bold text-slate-700">{settings.currencySymbol}</span>
                    </div>

                    {/* Quick Stepper Buttons */}
                    <div className="flex items-center gap-1.5">
                      {[-10, -5, +5, +10, +20].map((step) => (
                        <button
                          key={step}
                          type="button"
                          onClick={() => setFormPrice((prev) => Math.max(5, prev + step))}
                          className="px-2.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-xs"
                        >
                          {step > 0 ? `+${step}` : step}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. DESCRIPTION CONTROL (CHANGE DESCRIPTION) */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                    <Edit3 className="w-4 h-4 text-slate-900" />
                    <span>{isAr ? '3. وصف وملاحظات المشروب (Description Control)' : '3. Drink Description (Change Description)'}</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Description / Notes (English)
                      </label>
                      <textarea
                        rows={2}
                        value={formNote}
                        onChange={(e) => setFormNote(e.target.value)}
                        placeholder="e.g. Rich layered espresso with condensed milk and creamy froth..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-xl text-slate-900 text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        الوصف والملاحظات (بالعربية)
                      </label>
                      <textarea
                        rows={2}
                        value={formNoteAr}
                        onChange={(e) => setFormNoteAr(e.target.value)}
                        placeholder="مثال: طبقات اسبرسو غنية مع حليب مكثف محلى وكريمة خفيفة..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-xl text-slate-900 text-xs outline-none text-right"
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. NAMES & CATEGORY */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="text-xs font-bold text-slate-950 flex items-center gap-2 uppercase tracking-wider">
                    <Layers className="w-4 h-4 text-slate-900" />
                    <span>{isAr ? '4. اسم المشروب والقسم' : '4. Names & Category'}</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Name (English) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Spanish Latte"
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-xl text-slate-900 text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        اسم المشروب (عربي)
                      </label>
                      <input
                        type="text"
                        value={formNameAr}
                        onChange={(e) => setFormNameAr(e.target.value)}
                        placeholder="سبانش لاتيه"
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-xl text-slate-900 text-xs outline-none text-right"
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {isAr ? 'قسم المنيو' : 'Menu Category'}
                      </label>
                      <select
                        value={formCategoryId}
                        onChange={(e) => setFormCategoryId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-900 rounded-xl text-slate-900 text-xs outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {isAr && c.nameAr ? c.nameAr : c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Temperature & Flags */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {isAr ? 'درجة التقديم' : 'Temperature'}
                      </label>
                      <div className="flex gap-1">
                        {(['hot', 'iced', 'both'] as const).map((temp) => (
                          <button
                            key={temp}
                            type="button"
                            onClick={() => setFormTemperature(temp)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                              formTemperature === temp
                                ? 'bg-slate-900 text-white'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {temp}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="formAvailable"
                        checked={formIsAvailable}
                        onChange={(e) => setFormIsAvailable(e.target.checked)}
                        className="w-4 h-4 rounded accent-slate-900 cursor-pointer"
                      />
                      <label htmlFor="formAvailable" className="text-xs font-semibold text-slate-900 cursor-pointer">
                        {isAr ? 'متاح للطلب الفوري' : 'In Stock (Available)'}
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="formPopular"
                        checked={formIsPopular}
                        onChange={(e) => setFormIsPopular(e.target.checked)}
                        className="w-4 h-4 rounded accent-slate-900 cursor-pointer"
                      />
                      <label htmlFor="formPopular" className="text-xs font-semibold text-slate-900 cursor-pointer flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-slate-900 text-slate-900" />
                        <span>{isAr ? 'تمييز كأكثر طلباً' : 'Bestseller Star'}</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingDrink(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-all cursor-pointer"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isCreatingNew
                        ? (isAr ? 'إنشاء الشريحة وإضافتها للمنيو' : 'Create & Publish Stripe')
                        : (isAr ? 'حفظ التعديلات وتطبيقها على المنيو فوراً' : 'Save & Publish Live')}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
