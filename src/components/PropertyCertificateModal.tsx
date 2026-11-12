import React, { useRef } from 'react';
import { useCoffee } from '../context/CoffeeContext';
import {
  X,
  Award,
  ShieldCheck,
  Printer,
  Copy,
  Check,
  QrCode,
  Calendar,
  User,
  Coffee,
  Sparkles,
  FileCheck,
  Crown,
} from 'lucide-react';

interface PropertyCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PropertyCertificateModal: React.FC<PropertyCertificateModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language, settings } = useCoffee();
  const isAr = language === 'ar';
  const [copied, setCopied] = React.useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const certificateNumber = 'MM-PROP-2026-444-HANY';
  const issueDate = '06 November 2026';
  const issueDateAr = '٠٦ نوفمبر ٢٠٢٦';
  const ownerNameEn = 'Mohamed Hany';
  const ownerNameAr = 'محمد هاني';

  const handleCopySerial = () => {
    navigator.clipboard.writeText(certificateNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 print:p-0 print:bg-white">
      <div
        className="w-full max-w-3xl bg-white border border-slate-300 rounded-3xl p-5 sm:p-8 shadow-2xl text-slate-900 max-h-[94vh] flex flex-col relative overflow-hidden print:max-h-none print:shadow-none print:border-none print:p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Controls (Hidden during print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-extrabold text-slate-900">
                {isAr ? 'شهادة الملكية والحيازة الرسمية' : 'Official Certificate of Property'}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {certificateNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySerial}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy Serial Number"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ السيريال' : 'Copy Serial')}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isAr ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Parchment Body */}
        <div className="flex-1 overflow-y-auto py-5 pr-1 print:p-0">
          <div
            ref={certificateRef}
            className="relative bg-white border-8 border-double border-slate-300 rounded-2xl p-6 sm:p-10 shadow-inner overflow-hidden text-center"
          >
            {/* Watermark Logo in Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
              <span className="font-serif font-black text-[220px] tracking-widest text-slate-900">
                MIX
              </span>
            </div>

            {/* Corner Decorative Ornaments with Gold Accents */}
            <div className="absolute top-3 left-3 w-7 h-7 border-t-2 border-l-2 border-amber-500/80" />
            <div className="absolute top-3 right-3 w-7 h-7 border-t-2 border-r-2 border-amber-500/80" />
            <div className="absolute bottom-3 left-3 w-7 h-7 border-b-2 border-l-2 border-amber-500/80" />
            <div className="absolute bottom-3 right-3 w-7 h-7 border-b-2 border-r-2 border-amber-500/80" />

            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-300 text-[11px] font-mono uppercase tracking-widest font-bold mb-3 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>OFFICIAL REGISTERED PROPERTY TITLE</span>
            </div>

            {/* Certificate Titles */}
            <h1 className="font-serif text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-950 uppercase mb-1">
              Certificate of Property & Ownership
            </h1>
            <p className="font-serif text-lg sm:text-xl font-bold text-slate-700 mb-6">
              شهادة ملكية وحيازة تجارية مسجلة
            </p>

            <div className="w-28 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6" />

            {/* Proclamation */}
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto uppercase tracking-wider font-semibold mb-3">
              THIS CERTIFIES AND CONFIRMS THAT FULL TITLE, INTELLECTUAL PROPERTY & SOLE OWNERSHIP OF
            </p>

            {/* Entity Name */}
            <div className="py-2.5 px-6 rounded-2xl bg-slate-50 border border-slate-200/90 max-w-lg mx-auto mb-5 shadow-xs">
              <span className="font-display text-xl sm:text-2xl font-black tracking-wider text-slate-950 block">
                MIX MART SPECIALTY COFFEE & BEVERAGE BAR
              </span>
              <span className="text-sm font-semibold text-slate-700 block mt-0.5">
                علامة ميكس مارت للمشروبات والقهوة المختصة
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto uppercase tracking-wider font-semibold mb-3">
              IS OFFICIALLY VESTED IN AND CONFERRED UPON
            </p>

            {/* Sole Owner Name Callout */}
            <div className="py-4 px-8 rounded-2xl bg-gradient-to-r from-slate-100 via-amber-50/30 to-slate-100 border-2 border-slate-900 max-w-md mx-auto mb-6 shadow-sm relative">
              <div className="text-[11px] font-mono tracking-widest text-slate-600 uppercase font-bold flex items-center justify-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>SOLE REGISTERED OWNER & FOUNDER</span>
              </div>
              <div className="font-serif text-3xl sm:text-4xl font-black text-slate-950 mt-1 tracking-tight">
                {ownerNameEn}
              </div>
              <div className="font-serif text-xl sm:text-2xl font-bold text-slate-800 mt-0.5">
                {ownerNameAr}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                ID: @mohamedhany444 · Full Administrative & Commercial Authority
              </div>
            </div>

            {/* Scope of Property Rights */}
            <div className="text-xs text-slate-600 max-w-xl mx-auto space-y-1.5 leading-relaxed text-justify sm:text-center mb-8 px-2">
              <p>
                {isAr
                  ? 'بموجب هذه الوثيقة الرسمية، يمتلك السيد / محمد هاني (Mohamed Hany) كامل الحقوق الحصرية والإدارية والتجارية لعلامة MIX MART ومنيو المشروبات والأسعار والمنظومة الرقمية والتوزيع.'
                  : 'By virtue of this title deed, Mohamed Hany holds full and exclusive proprietary, operational, menu curation, and financial governance rights over MIX MART storefront, assets, and branding.'}
              </p>
            </div>

            {/* Bottom Proof Section: QR, Seal, Signatures */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              {/* QR Verification */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 inline-block mb-1.5 shadow-xs">
                  <QrCode className="w-14 h-14 text-slate-900" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Official Verification QR
                </span>
                <span className="text-[9px] font-mono text-slate-400">
                  {certificateNumber}
                </span>
              </div>

              {/* Embossed Official Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-double border-slate-900 bg-slate-50 flex flex-col items-center justify-center text-slate-900 shadow-sm relative">
                  <Coffee className="w-5 h-5 mb-0.5" />
                  <span className="text-[8px] font-extrabold tracking-widest uppercase">
                    SEAL OF OWNER
                  </span>
                  <span className="text-[7px] font-mono font-bold text-slate-600">
                    MOHAMED HANY
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mt-1.5">
                  Certified & Sealed
                </span>
              </div>

              {/* Signature Line */}
              <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                <div className="w-40 border-b-2 border-slate-900 pb-1 font-serif italic text-lg text-slate-900 select-none">
                  Mohamed Hany
                </div>
                <span className="text-xs font-bold text-slate-900 mt-1">
                  Mohamed Hany (محمد هاني)
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Founder & Proprietary Owner
                </span>
                <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                  Issued: {issueDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 print:hidden shrink-0">
          <span>{isAr ? 'وثيقة رسمية معتمدة ومسجلة في النظام' : 'Official certified property title deed'}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
