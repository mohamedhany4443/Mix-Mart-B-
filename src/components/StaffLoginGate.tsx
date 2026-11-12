import React, { useState } from 'react';
import {
  Crown,
  Briefcase,
  Coffee,
  User,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Globe,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useCoffee } from '../context/CoffeeContext';

export type StaffRole = 'owner' | 'manager' | 'barista';

interface StaffLoginGateProps {
  role: StaffRole;
  expectedUsername: string;
  expectedSecret?: string;
  onAuthenticated: (username: string) => void;
}

export const StaffLoginGate: React.FC<StaffLoginGateProps> = ({
  role,
  expectedUsername,
  expectedSecret,
  onAuthenticated,
}) => {
  const { language, setLanguage, settings } = useCoffee();
  const isAr = language === 'ar';

  const [username, setUsername] = useState('');
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState('');

  const roleConfig = {
    owner: {
      titleEn: 'Owner Control App',
      titleAr: 'تطبيق المالك والتحكم الكامل',
      subtitleEn: 'Orders & editing, menu studio, drink photos, prices, descriptions, sales & permanent links',
      subtitleAr: 'جميع الطلبات وإمكانية التعديل عليها، تغيير الصور، إضافة مشروبات، الأسعار، الوصف والمبيعات',
      badgeEn: 'Owner Access',
      badgeAr: 'بوابة المالك',
      Icon: Crown,
      accentBg: 'bg-slate-950 text-amber-300',
      placeholderUser: 'mohamedhany444',
      secretLabelEn: 'Access Password (Optional for quick sign-in)',
      secretLabelAr: 'كلمة المرور (اختياري أو أدخلها للتحقق)',
    },
    manager: {
      titleEn: 'Branch Manager App',
      titleAr: 'تطبيق مدير الفرع',
      subtitleEn: 'Live order reception & branch sales analytics only (no menu catalog)',
      subtitleAr: 'استقبال الطلبات المباشرة ومتابعة المبيعات فقط بدون المنيو',
      badgeEn: 'Manager Operations',
      badgeAr: 'تشغيل المدير',
      Icon: Briefcase,
      accentBg: 'bg-slate-900 text-emerald-300',
      placeholderUser: 'manager_mixmart',
      secretLabelEn: 'Manager Password (Optional)',
      secretLabelAr: 'كلمة مرور المدير (اختياري)',
    },
    barista: {
      titleEn: 'Barista Counter App',
      titleAr: 'تطبيق الباريستا والبار',
      subtitleEn: 'Order reception, Accept / Reject decisions & interactive Upsell / Cross-sell',
      subtitleAr: 'استقبال الطلبات، القبول أو الرفض، وعمل Upselling و Cross-selling',
      badgeEn: 'Barista Station',
      badgeAr: 'كاونتر الباريستا',
      Icon: Coffee,
      accentBg: 'bg-slate-900 text-sky-300',
      placeholderUser: 'barista_staff',
      secretLabelEn: 'Staff PIN (Optional)',
      secretLabelAr: 'رمز PIN (اختياري)',
    },
  }[role];

  const Icon = roleConfig.Icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanInput = username.trim().toLowerCase();
    const targetUser = expectedUsername.trim().toLowerCase();

    if (!cleanInput) {
      setError(isAr ? 'يرجى كتابة اسم المستخدم (Username) للدخول.' : 'Please enter your username.');
      return;
    }

    if (cleanInput !== targetUser) {
      setError(
        isAr
          ? `اسم المستخدم غير صحيح. الاسم المعتمد لهذا التطبيق: ${expectedUsername}`
          : `Invalid username. Expected username for this app: ${expectedUsername}`
      );
      return;
    }

    // If user entered a password/PIN, validate it; username-only login is supported per branch spec
    if (secret.trim().length > 0 && expectedSecret && secret.trim() !== expectedSecret.trim()) {
      setError(
        isAr
          ? 'كلمة المرور / الرمز السري المدخل غير صحيح.'
          : 'Entered password/PIN does not match.'
      );
      return;
    }

    onAuthenticated(expectedUsername);
  };

  const handleQuickFill = () => {
    setUsername(expectedUsername);
    setSecret(expectedSecret || '');
    setError('');
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-4 sm:p-8"
    >
      {/* Top minimal bar */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl ${roleConfig.accentBg} flex items-center justify-center shadow-xs`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-extrabold text-lg tracking-tight text-slate-950">
              {settings.storeName}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {isAr ? roleConfig.badgeAr : roleConfig.badgeEn}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setLanguage(isAr ? 'en' : 'ar')}
          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Globe className="w-4 h-4 text-slate-600" />
          <span>{isAr ? 'English' : 'العربية'}</span>
        </button>
      </div>

      {/* Centered Username Login Card */}
      <main className="max-w-md w-full mx-auto my-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-2 text-center">
          <div className={`w-14 h-14 rounded-2xl ${roleConfig.accentBg} mx-auto flex items-center justify-center shadow-sm`}>
            <Icon className="w-7 h-7" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-slate-950 tracking-tight">
            {isAr ? roleConfig.titleAr : roleConfig.titleEn}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {isAr ? roleConfig.subtitleAr : roleConfig.subtitleEn}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-700" />
                <span>{isAr ? 'اسم المستخدم (Username)' : 'Username'}</span>
              </label>
              <span className="font-mono text-[11px] text-slate-500">
                @{expectedUsername}
              </span>
            </div>
            <input
              type="text"
              required
              autoFocus
              dir="ltr"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={roleConfig.placeholderUser}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white text-slate-950 font-mono text-sm outline-none transition-colors"
            />
          </div>

          {expectedSecret && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span>{isAr ? roleConfig.secretLabelAr : roleConfig.secretLabelEn}</span>
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  dir="ltr"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[44px] px-4 py-2.5 pr-11 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white text-slate-950 font-mono text-sm outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full min-h-[46px] px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <span>{isAr ? 'دخول باسم المستخدم' : 'Sign In with Username'}</span>
            <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleQuickFill}
            className="w-full min-h-[42px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-700" />
            <span>
              {isAr
                ? `إدراج اسم المستخدم (${expectedUsername})`
                : `Auto-Fill Username (${expectedUsername})`}
            </span>
          </button>
        </form>
      </main>

      <footer className="max-w-5xl w-full mx-auto text-center text-xs text-slate-500">
        <span>{settings.storeName} · {isAr ? 'نظام تشغيل الفرع المتكامل' : 'Isolated Branch App'}</span>
      </footer>
    </div>
  );
};
