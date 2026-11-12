import React, { useState } from 'react';
import QRCode from 'qrcode';
import { useCoffee } from '../context/CoffeeContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { getPermanentAppUrl } from '../utils/appUrl';
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Smartphone,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowDown,
  Layers,
  Flame,
  Globe,
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { language, settings } = useCoffee();
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const isAr = language === 'ar';

  const [activePlatform, setActivePlatform] = useState<'ios' | 'android' | 'share'>(() => {
    if (isIOS) return 'ios';
    if (isAndroid) return 'android';
    return 'android';
  });

  const [copied, setCopied] = useState(false);
  const [shareQrDataUrl, setShareQrDataUrl] = useState<string>('');

  // Permanent Shared App URL (Never expires)
  const publicProductionUrl = getPermanentAppUrl();

  // Generate QR for quick mobile download
  React.useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(
      publicProductionUrl,
      {
        width: 380,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      },
      (err, url) => {
        if (!err && url) {
          setShareQrDataUrl(url);
        }
      }
    );
  }, [isOpen, publicProductionUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicProductionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'MIX MART Coffee Bar App',
          text: isAr
            ? 'حمّل وثبت تطبيق ميكس مارت للقهوة على هاتفك الأيفون أو الأندرويد الآن:'
            : 'Download and install MIX MART Coffee Bar App on your iPhone or Android:',
          url: publicProductionUrl,
        });
      } catch (e) {
        // user cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-900 relative max-h-[94vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Strip */}
        <div className="h-1 bg-gradient-to-r from-slate-950 via-amber-500 to-slate-900 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 pt-2 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700 p-1 flex items-center justify-center shadow-md shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="MIX MART App Icon"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-display text-lg sm:text-xl font-extrabold text-slate-950">
                  {isAr ? 'تثبيت تطبيق MIX MART' : 'Install MIX MART App'}
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                  iOS & Android
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAr
                  ? 'يعمل كتطبيق أصلي على هاتفك بشاشة كاملة وبدون متجر'
                  : 'Install directly on your phone home screen without app stores'}
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

        {/* Permanent Link Banner (Never Expires - Live 24/7) */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 my-2 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-emerald-950 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <div className="font-extrabold flex items-center gap-1.5 flex-wrap">
                <span>{isAr ? 'الرابط الدائم المعتمد (شغال علطول وبدون انتهاء صلاحية)' : 'Permanent Live App Link (Never Expires)'}</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.2 rounded-full font-mono font-bold">
                  24/7 Live
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 font-mono truncate max-w-[260px] sm:max-w-[340px]">
                {publicProductionUrl}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الرابط الدائم' : 'Copy Live Link')}</span>
            </button>
            <a
              href={publicProductionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors"
              title={isAr ? 'فتح الرابط في نافذة جديدة' : 'Open in new tab'}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Platform Tabs: iOS vs Android vs Share */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl my-3 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActivePlatform('ios')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activePlatform === 'ios'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🍏 {isAr ? 'أيفون (iOS)' : 'iPhone'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePlatform('android')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activePlatform === 'android'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🤖 {isAr ? 'أندرويد' : 'Android'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePlatform('share')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activePlatform === 'share'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'شارك التطبيق' : 'Share Link'}</span>
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* TAB 1: IPHONE (iOS Safari) INSTRUCTIONS */}
          {activePlatform === 'ios' && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900 font-medium">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {isAr
                    ? 'على أجهزة أبل (iPhone / iPad): لا تحتاج لمتجر App Store، يتم التثبيت في ثوانٍ عبر متصفح Safari.'
                    : 'On Apple devices (iPhone/iPad): No App Store required! Install in seconds via Safari.'}
                </span>
              </div>

              {/* Visual 3-Step Guide */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span>{isAr ? 'اضغط على زر المشاركة (Share)' : 'Tap the Share Button'}</span>
                      <span className="inline-block p-1 bg-white border border-slate-200 rounded text-[11px]">
                        􀈂
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {isAr
                        ? 'في شريط Safari أسفل شاشة الأيفون، اضغط على أيقونة المشاركة (مربع بسهم متجه لأعلى).'
                        : 'In the Safari bottom toolbar, tap the Share icon (square with arrow pointing up).'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span>{isAr ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Select "Add to Home Screen"'}</span>
                      <span className="inline-block px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">
                        [ + ]
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {isAr
                        ? 'مرر قائمة الخيارات لأسفل واضغط على "إضافة إلى الصفحة الرئيسية" (Add to Home Screen).'
                        : 'Scroll down through the options sheet and tap "Add to Home Screen".'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">
                      {isAr ? 'اضغط على "إضافة" (Add) في الزاوية العلوية' : 'Tap "Add" in Top Right'}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {isAr
                        ? 'سيظهر تطبيق MIX MART فوراً على شاشة هاتفك الرئيسية كأي تطبيق أصلي ويعمل بلمسة واحدة.'
                        : 'MIX MART will appear on your iPhone home screen with its official icon.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Share2 className="w-4 h-4 text-amber-300" />
                  <span>{isAr ? 'مشاركة رابط التطبيق' : 'Share App Link'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ' : 'Copy')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID INSTRUCTIONS & 1-CLICK INSTALL */}
          {activePlatform === 'android' && (
            <div className="space-y-3.5 animate-in fade-in">
              {/* Direct 1-Click Install Button if supported */}
              {isInstallable ? (
                <div className="p-4 rounded-2xl bg-slate-950 text-white space-y-3 shadow-md border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                      <Download className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">
                        {isAr ? 'تثبيت فوري مباشر' : 'Direct One-Click Install'}
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        {isAr ? 'متصفحك يدعم التثبيت المباشر بنقرة زر' : 'Your browser supports direct installation'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <Download className="w-4 h-4 stroke-[3]" />
                    <span>{isAr ? 'تثبيت تطبيق MIX MART الآن' : 'Install MIX MART App Now'}</span>
                  </button>
                </div>
              ) : null}

              {/* Standard Android Steps (Chrome / Samsung Internet) */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">
                      {isAr ? 'اضغط على قائمة خيارات المتصفح (⋮)' : 'Tap Browser Menu (⋮)'}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {isAr
                        ? 'في متصفح Google Chrome أو Samsung Internet أعلى يمين/يسار الشاشة، اضغط على النقاط الثلاث (⋮).'
                        : 'Tap the three-dots menu (⋮) in Chrome or Samsung Internet.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">
                      {isAr ? 'اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"' : 'Tap "Install app" or "Add to Home screen"'}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {isAr
                        ? 'اضغط على خيار "تثبيت التطبيق" (Install App).'
                        : 'Select "Install app" or "Add to Home screen" from the menu list.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">
                      {isAr ? 'تأكيد التثبيت' : 'Confirm Install'}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {isAr
                        ? 'اضغط "تثبيت" (Install) وسيتم تحميل التطبيق ووضعه مع تطبيقات هاتفك مباشرة.'
                        : 'Tap Install to confirm. MIX MART will be placed in your app drawer and home screen.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Share2 className="w-4 h-4 text-amber-300" />
                  <span>{isAr ? 'مشاركة رابط التطبيق' : 'Share App Link'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ' : 'Copy')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SHARE WITH ANYONE ("و أي حد يقدر ينزلو") */}
          {activePlatform === 'share' && (
            <div className="space-y-4 animate-in fade-in text-center">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed">
                <strong className="text-slate-950 font-bold block mb-0.5">
                  {isAr ? 'أي شخص يستطيع تنزيل وتثبيت التطبيق فوراً' : 'Anyone Can Install the App Instantly'}
                </strong>
                {isAr
                  ? 'شارك هذا الرمز أو الرابط مع الزبائن، الأصدقاء، أو طاقم العمل. بمجرد فتح الرابط على هاتفهم، يمكنهم تثبيته على الشاشة الرئيسية فوراً مجاناً.'
                  : 'Share this QR code or link with customers, friends, or staff. Anyone opening it can install MIX MART directly on their mobile home screen.'}
              </div>

              {/* QR Code for instant installation */}
              <div className="p-3.5 bg-white rounded-2xl border-2 border-slate-900 inline-block shadow-md">
                {shareQrDataUrl ? (
                  <img
                    src={shareQrDataUrl}
                    alt="Install MIX MART QR Code"
                    className="w-44 h-44 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                    Generating QR...
                  </div>
                )}
                <div className="mt-2 text-[10px] font-mono font-bold text-slate-700 uppercase">
                  Scan to Install MIX MART App
                </div>
              </div>

              {/* Copy URL Box */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-700 truncate font-mono text-[11px] text-left">
                  {publicProductionUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer text-xs border border-slate-200 shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-700" />}
                  <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الرابط' : 'Copy Link')}</span>
                </button>
              </div>

              {/* Native Share Button */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Share2 className="w-4 h-4 text-amber-300" />
                <span>{isAr ? 'مشاركة عبر واتساب / الرسائل' : 'Share via WhatsApp / Messages'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0 mt-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            <span>{isAr ? 'تطبيق ويب تقدمي رسمي (PWA) معتمد' : 'Verified Progressive Web App (PWA)'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
