import React, { useEffect, useState, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { useCoffee } from '../context/CoffeeContext';
import { getPermanentAppUrl } from '../utils/appUrl';
import {
  X,
  Download,
  Copy,
  Check,
  QrCode as QrIcon,
  Printer,
  Camera,
  Upload,
  RefreshCw,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  Sparkles,
  Share2,
  Table,
  Award,
  Layers,
  CheckCircle2,
  AlertCircle,
  Coffee,
  CheckCheck,
} from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrders?: () => void;
  onOpenPropertyCertificate?: () => void;
}

// Audio beep on successful QR scan (Web Audio API - iOS & Android compatible)
const playScanChime = () => {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12); // E6

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch (e) {
    // Audio context may require user interaction in some strict environments
  }
};

// Helper: Detect table number from scanned QR code data
export const extractTableFromScanned = (text: string): string | null => {
  if (!text) return null;
  try {
    // 1. Check URL query param ?table=X or &table=X
    if (text.includes('table=')) {
      const match = text.match(/[?&]table=([^&#]+)/i);
      if (match && match[1]) {
        const val = decodeURIComponent(match[1]).trim();
        const numOnly = val.replace(/[^0-9]/g, '');
        if (numOnly) {
          const n = parseInt(numOnly, 10);
          if (n >= 1 && n <= 15) return `Table ${n}`;
        }
        return val.toLowerCase().startsWith('table') ? val : `Table ${val}`;
      }
    }
    // 2. Check plain text: "Table 5" or "Table5" or "طاولة 5"
    const plainMatch = text.match(/(?:table|طاولة)\s*[-#]?\s*([0-9]{1,2})/i);
    if (plainMatch && plainMatch[1]) {
      const n = parseInt(plainMatch[1], 10);
      if (n >= 1 && n <= 15) return `Table ${n}`;
    }
    // 3. Just a pure integer 1 to 15
    const num = parseInt(text.trim(), 10);
    if (!isNaN(num) && num >= 1 && num <= 15 && text.trim().length <= 2) {
      return `Table ${num}`;
    }
  } catch {
    // ignore
  }
  return null;
};

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  onOpenOrders,
  onOpenPropertyCertificate,
}) => {
  const { settings, language, activeTable, setActiveTable, tables } = useCoffee();
  const isAr = language === 'ar';

  // Active Tab: 'tables' (15 tables QR stands), 'menu' (general menu), 'scan' (iOS/Android camera)
  const [activeTab, setActiveTab] = useState<'tables' | 'menu' | 'scan'>('tables');

  // Selected table in the 15 Tables view (defaults to activeTable or 'Table 1')
  const [selectedTableNumber, setSelectedTableNumber] = useState<number>(() => {
    if (activeTable) {
      const parsed = parseInt(activeTable.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 15) return parsed;
    }
    return 1;
  });

  // Table activation feedback banner
  const [tableActivatedNotice, setTableActivatedNotice] = useState<string | null>(null);

  // General QR Options
  const [menuQrType, setMenuQrType] = useState<'public' | 'certificate' | 'custom'>('public');
  const [customText, setCustomText] = useState<string>('');
  const [qrColor, setQrColor] = useState<string>('#0f172a'); // Classic Slate
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Batch Print All 15 Tables Mode
  const [isBatchPrintingAll, setIsBatchPrintingAll] = useState(false);
  const [allTablesQrUrls, setAllTablesQrUrls] = useState<{ table: string; num: number; url: string }[]>([]);

  // Scanner state (iOS & Android Camera Reader)
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannedTableDetected, setScannedTableDetected] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scanTimestamp, setScanTimestamp] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Canonical permanent URL (always uses permanent ais-pre link so QR codes never expire)
  const publicProductionUrl = getPermanentAppUrl();

  // Compute active target URL based on active tab and settings
  const getTargetUrl = useCallback(() => {
    if (activeTab === 'tables') {
      return `${publicProductionUrl}/?app=guest&table=${selectedTableNumber}`;
    }
    if (menuQrType === 'certificate') {
      return `${publicProductionUrl}/?app=owner`;
    }
    if (menuQrType === 'custom') {
      return customText.trim() || `${publicProductionUrl}/?app=guest`;
    }
    return `${publicProductionUrl}/?app=guest`;
  }, [activeTab, selectedTableNumber, menuQrType, customText, publicProductionUrl]);

  const activeTargetUrl = getTargetUrl();

  // Generate Single QR Code
  useEffect(() => {
    if (!isOpen || activeTab === 'scan') return;

    setIsGenerating(true);
    QRCode.toDataURL(
      activeTargetUrl,
      {
        width: 520,
        margin: 2,
        color: {
          dark: qrColor,
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H', // High error correction level for reliable reading on mobile
      },
      (err, url) => {
        setIsGenerating(false);
        if (!err && url) {
          setDataUrl(url);
        }
      }
    );
  }, [isOpen, activeTab, activeTargetUrl, qrColor]);

  // Generate All 15 Table QR codes when batch print is requested
  const handlePrepareBatchPrintAll = async () => {
    setIsGenerating(true);
    const results: { table: string; num: number; url: string }[] = [];
    for (let i = 1; i <= 15; i++) {
      const url = `${publicProductionUrl}?table=${i}`;
      try {
        const qrData = await QRCode.toDataURL(url, {
          width: 320,
          margin: 2,
          color: { dark: '#0f172a', light: '#ffffff' },
          errorCorrectionLevel: 'H',
        });
        results.push({ table: `Table ${i}`, num: i, url: qrData });
      } catch (e) {
        console.error('Error generating QR for table', i, e);
      }
    }
    setAllTablesQrUrls(results);
    setIsGenerating(false);
    setIsBatchPrintingAll(true);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  // Clean up camera stream
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  // Frame scanning function using jsQR
  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Run jsQR decoder
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });

    if (code && code.data) {
      // Detected a valid QR code!
      playScanChime();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([100, 50, 100]);
        } catch (e) {
          // ignore
        }
      }
      setScanResult(code.data);
      setScanTimestamp(new Date().toLocaleTimeString());

      // Check if this QR code opens a table
      const detectedTable = extractTableFromScanned(code.data);
      if (detectedTable) {
        setActiveTable(detectedTable);
        setScannedTableDetected(detectedTable);
      } else {
        setScannedTableDetected(null);
      }

      stopCamera();
      return;
    }

    // Continue scanning next frame
    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [stopCamera, setActiveTable]);

  // Start live camera stream (Works on iOS Safari & Android Chrome)
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setScanResult(null);
    setScannedTableDetected(null);

    try {
      stopCamera();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          isAr
            ? 'متصفحك لا يدعم الوصول المباشر للكاميرا. يمكنك استخدام زر رفع صورة من المعرض أدناه.'
            : 'Camera access is not supported by this browser. Please use the "Upload Photo" option below.'
        );
      }

      // iOS Safari requires playsinline and exact facing constraints
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Critical for iOS Safari
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.muted = true;
        await videoRef.current.play();
        setIsScanning(true);
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Permission') || msg.includes('NotAllowedError')) {
        setCameraError(
          isAr
            ? 'تم رفض إذن الكاميرا. يرجى تفعيل إذن الكاميرا من إعدادات المتصفح (Safari/Chrome)، أو اختيار صورة QR من المعرض.'
            : 'Camera permission denied. Please allow camera access in your browser settings (iOS Safari or Android Chrome), or pick a photo from your gallery.'
        );
      } else {
        setCameraError(
          isAr
            ? 'تعذر تشغيل الكاميرا في هذا الوضع. يمكنك استخدام زر "رفع صورة" لمسح أي رمز QR بسهولة.'
            : 'Could not open camera stream. You can use "Upload / Take Photo" to scan any QR code instantly.'
        );
      }
      setIsScanning(false);
    }
  }, [facingMode, isAr, scanFrame, stopCamera]);

  // Toggle Camera Facing Mode (Front / Rear)
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Decode QR code from uploaded image (works 100% on all iOS & Android devices)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCameraError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setCameraError(isAr ? 'فشلت معالجة الصورة' : 'Could not process image');
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          playScanChime();
          setScanResult(code.data);
          setScanTimestamp(new Date().toLocaleTimeString());

          // Check if it opens a table
          const detectedTable = extractTableFromScanned(code.data);
          if (detectedTable) {
            setActiveTable(detectedTable);
            setScannedTableDetected(detectedTable);
          } else {
            setScannedTableDetected(null);
          }

          stopCamera();
        } else {
          setCameraError(
            isAr
              ? 'لم يتم العثور على رمز QR صالح في الصورة المختارة. يرجى التأكد من وضوح الرمز وإعادة المحاولة.'
              : 'No valid QR code detected in the selected image. Please make sure the QR code is clearly visible and try again.'
          );
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle direct "Open Table Now" action from modal
  const handleOpenCurrentTableNow = () => {
    const target = `Table ${selectedTableNumber}`;
    setActiveTable(target);
    setTableActivatedNotice(
      isAr
        ? `تم تفعيل (طاولة رقم ${selectedTableNumber}) بنجاح! سيتم توجيه طلباتك إليها مباشرة.`
        : `Table ${selectedTableNumber} is now active! All orders will be served directly to this table.`
    );
    setTimeout(() => {
      setTableActivatedNotice(null);
    }, 3500);
  };

  // Lifecycle when tab switches or modal closes
  useEffect(() => {
    if (activeTab === 'scan' && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, isOpen, startCamera, stopCamera]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeTargetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    const filename =
      activeTab === 'tables'
        ? `mix-mart-table-${selectedTableNumber}-qr.png`
        : `mix-mart-${menuQrType}-qr.png`;
    a.download = filename;
    a.click();
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `MIX MART - Table ${selectedTableNumber}`,
          text: isAr
            ? `افتح منيو ميكس مارت واطلب مباشرة لطاولة رقم ${selectedTableNumber}:`
            : `Open MIX MART Menu & Order directly for Table ${selectedTableNumber}:`,
          url: activeTargetUrl,
        });
      } catch (e) {
        // user cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handlePrint = () => {
    setIsBatchPrintingAll(false);
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 print:p-0 print:bg-white">
      <div
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-900 relative max-h-[94vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:p-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Strip */}
        <div className="h-1 bg-gradient-to-r from-slate-950 via-slate-700 to-amber-500 shrink-0 print:hidden" />

        {/* Header with Title and Mode Switcher */}
        <div className="flex items-center justify-between pb-3 pt-2 border-b border-slate-200 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-sm">
              <Table className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-display text-lg font-extrabold text-slate-950 flex items-center gap-2">
                <span>{isAr ? 'نظام طاولات ميكس مارت (15 طاولة) والـ QR' : 'MIX MART 15 Tables & QR Center'}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  15 Tables Active
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {isAr
                  ? 'إنشاء رموز QR لكافة الطاولات (1-15)، وفتح الطاولات فورياً عبر المسح بكاميرا الهاتف'
                  : 'Generate QR stands for all 15 tables and open any table instantly by scanning'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Main Tabs: 15 Tables QR, General Menu QR, Camera Scanner */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl my-3 shrink-0 print:hidden text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveTab('tables');
            }}
            className={`py-2 px-2 sm:px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'tables'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-4 h-4 text-amber-300" />
            <span>{isAr ? 'طاولات 1-15' : '15 Tables QR'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveTab('menu');
            }}
            className={`py-2 px-2 sm:px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrIcon className="w-4 h-4 text-slate-800" />
            <span>{isAr ? 'المنيو العام' : 'Menu QR'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('scan');
            }}
            className={`py-2 px-2 sm:px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'scan'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4 text-amber-300" />
            <span>{isAr ? 'ماسح الكاميرا' : 'Scan & Read'}</span>
          </button>
        </div>

        {/* Success Notice if Table Opened / Activated */}
        {tableActivatedNotice && (
          <div className="mb-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in shrink-0">
            <div className="flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{tableActivatedNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
              }}
              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-extrabold hover:bg-emerald-700 cursor-pointer shrink-0"
            >
              {isAr ? 'ابدأ الطلب الآن' : 'Start Order'}
            </button>
          </div>
        )}

        {/* Hidden Canvas for QR decoding */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Hidden File Input for Image Upload QR Scanning */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* TAB 1: 15 TABLES QR STANDS GENERATOR & ACTIVATION */}
        {activeTab === 'tables' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* 15 Tables Selector Grid */}
            <div className="space-y-1.5 print:hidden">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-slate-900" />
                  <span>{isAr ? 'اختر طاولة لمعاينة الرمز وطباعته (من 1 إلى 15):' : 'Select a Table (1 to 15):'}</span>
                </label>
                {activeTable && (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    {isAr ? `الطاولة النشطة حالياً: ${activeTable}` : `Active Now: ${activeTable}`}
                  </span>
                )}
              </div>

              {/* 15 Tables Grid Buttons */}
              <div className="grid grid-cols-5 sm:grid-cols-5 gap-1.5">
                {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => {
                  const tblName = `Table ${num}`;
                  const isSelected = selectedTableNumber === num;
                  const isCurrentActive = activeTable === tblName;

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSelectedTableNumber(num)}
                      className={`p-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex flex-col items-center justify-center relative ${
                        isSelected
                          ? 'bg-slate-950 text-white ring-2 ring-slate-900 shadow-sm'
                          : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                    >
                      {isCurrentActive && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                      )}
                      <span className="text-[10px] uppercase font-sans text-slate-400">
                        {isAr ? 'طاولة' : 'Table'}
                      </span>
                      <span className="text-base font-extrabold">{num}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table Stand Preview Card */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 text-center relative overflow-hidden shadow-inner print:bg-white print:border-4 print:border-slate-900 print:shadow-none">
              <div className="mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">
                  {settings.storeName} · SPECIALTY COFFEE BAR
                </span>
                <span className="font-display text-2xl font-black text-slate-950 block mt-0.5">
                  {isAr ? `طاولة رقم ${selectedTableNumber}` : `Table #${selectedTableNumber}`}
                </span>
                <span className="text-xs text-slate-600 font-semibold block mt-0.5">
                  {isAr ? 'امسح بكاميرا الهاتف لفتح المنيو والطلب مباشرة للطاولة' : 'Scan with mobile camera to open menu & order to this table'}
                </span>
              </div>

              {/* QR Image Frame */}
              <div className="inline-block p-3.5 bg-white rounded-2xl shadow-md border-2 border-slate-900 my-2">
                {dataUrl ? (
                  <img
                    src={dataUrl}
                    alt={`MIX MART Table ${selectedTableNumber} QR`}
                    className="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-slate-400 text-xs font-mono">
                    {isGenerating ? 'Rendering Table QR...' : 'Preparing...'}
                  </div>
                )}
                <div className="mt-2 text-center border-t border-slate-100 pt-1">
                  <span className="text-[11px] font-extrabold text-slate-900 tracking-wider font-mono">
                    TABLE #{selectedTableNumber} · طاولة {selectedTableNumber}
                  </span>
                </div>
              </div>

              {/* Table Stand Footer Text */}
              <div className="mt-2 space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-[11px] font-bold shadow-xs">
                  <Smartphone className="w-3.5 h-3.5 text-slate-900" />
                  <span>{isAr ? 'يعمل على كاميرا iPhone و Android بدون تطبيقات' : 'Instant scan on iOS Camera & Android Chrome / Lens'}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate max-w-sm mx-auto px-2">
                  {activeTargetUrl}
                </div>
              </div>
            </div>

            {/* Quick Actions for this Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 print:hidden">
              {/* OPEN THIS TABLE BUTTON */}
              <button
                type="button"
                onClick={handleOpenCurrentTableNow}
                className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Activate this table in the app"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isAr ? `فتح طاولة ${selectedTableNumber}` : `Open Table ${selectedTableNumber}`}</span>
              </button>

              {/* DOWNLOAD PNG */}
              <button
                type="button"
                onClick={handleDownload}
                className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>{isAr ? 'تحميل كارت الطاولة' : 'Save Table PNG'}</span>
              </button>

              {/* PRINT THIS TABLE STAND */}
              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-700" />
                <span>{isAr ? 'طباعة ستاند الطاولة' : 'Print This Stand'}</span>
              </button>

              {/* BATCH PRINT ALL 15 TABLES */}
              <button
                type="button"
                onClick={handlePrepareBatchPrintAll}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Print ready sheets for all 15 tables"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>{isAr ? 'طباعة كافة الطاولات 1-15' : 'Print All 15 Tables'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: GENERAL MENU & CUSTOM QR */}
        {activeTab === 'menu' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="space-y-1.5 print:hidden">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-900" />
                <span>{isAr ? 'نوع الرمز العام:' : 'General QR Type:'}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMenuQrType('public')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    menuQrType === 'public'
                      ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{isAr ? 'المنيو العام' : 'Public Menu'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMenuQrType('certificate')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    menuQrType === 'certificate'
                      ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>{isAr ? 'شهادة الملكية' : 'Certificate'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMenuQrType('custom')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    menuQrType === 'custom'
                      ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAr ? 'رابط مخصص' : 'Custom Link'}</span>
                </button>
              </div>

              {menuQrType === 'custom' && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 mt-2">
                  <label className="text-xs font-semibold text-slate-700">
                    {isAr ? 'اكتب الرابط أو النص المراد تضمينه:' : 'Enter URL or Text:'}
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 outline-none focus:border-slate-900"
                  />
                </div>
              )}
            </div>

            {/* QR Card Presentation */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 text-center relative overflow-hidden shadow-inner print:bg-white print:border-4 print:border-slate-900 print:shadow-none">
              <div className="mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">
                  {settings.storeName} · SPECIALTY COFFEE
                </span>
                <span className="font-display text-base font-extrabold text-slate-950 block">
                  {menuQrType === 'certificate'
                    ? (isAr ? 'شهادة الملكية الرسمية · محمد هاني' : 'Official Property Certificate · Mohamed Hany')
                    : (isAr ? 'المنيو الرسمي المعتمد · امسح بكاميرا الهاتف' : 'Official Menu · Scan with Phone Camera')}
                </span>
              </div>

              <div className="inline-block p-3.5 bg-white rounded-2xl shadow-md border border-slate-200 my-1">
                {dataUrl ? (
                  <img
                    src={dataUrl}
                    alt="MIX MART QR Code"
                    className="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-slate-400 text-xs font-mono">
                    {isGenerating ? 'Rendering QR Code...' : 'Preparing QR...'}
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-[11px] font-bold shadow-xs">
                  <Smartphone className="w-3.5 h-3.5 text-slate-900" />
                  <span>{isAr ? 'متوافق مع كاميرا iPhone و Android' : 'Scannable via iOS Camera & Android Chrome / Lens'}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate max-w-sm mx-auto px-2">
                  {activeTargetUrl}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 print:hidden">
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الرابط' : 'Copy Link')}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>{isAr ? 'تحميل PNG' : 'Save PNG'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Share2 className="w-4 h-4 text-slate-700" />
                <span>{isAr ? 'مشاركة' : 'Share'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-700" />
                <span>{isAr ? 'طباعة' : 'Print'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE CAMERA SCANNER & TABLE DETECTOR */}
        {activeTab === 'scan' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 flex flex-col justify-between">
            {/* Camera Viewport Frame */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-900 flex items-center justify-center shadow-lg">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`w-full h-full object-cover ${scanResult ? 'opacity-40' : 'opacity-100'}`}
              />

              {!scanResult && isScanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-white/60 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
                    <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#f59e0b] animate-[bounce_2s_infinite]" />
                  </div>
                </div>
              )}

              {/* Floating Camera Controls */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto">
                <span className="text-[11px] font-mono font-bold bg-black/60 text-white backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{isAr ? 'ماسح الطاولات والـ QR نشط' : 'Table & QR Reader Active'}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md"
                    title={isAr ? 'تبديل الكاميرا' : 'Switch Camera'}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                    title={isAr ? 'رفع صورة من المعرض' : 'Upload from gallery'}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isAr ? 'صورة' : 'Photo'}</span>
                  </button>
                </div>
              </div>

              {/* Camera Error Message Display */}
              {cameraError && !scanResult && (
                <div className="absolute inset-4 bg-slate-900/95 backdrop-blur-md rounded-2xl p-5 text-white flex flex-col items-center justify-center text-center space-y-3 z-10 border border-slate-700">
                  <AlertCircle className="w-10 h-10 text-amber-400" />
                  <p className="text-xs text-slate-200 leading-relaxed max-w-sm">
                    {cameraError}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {isAr ? 'إعادة المحاولة' : 'Retry Camera'}
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isAr ? 'اختيار من المعرض' : 'Pick from Gallery'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SCAN RESULT DISPLAY */}
            {scanResult ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400/80 text-slate-900 space-y-3 animate-in fade-in zoom-in-95 duration-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      {isAr ? 'تمت قراءة الرمز بنجاح!' : 'QR Code Decoded!'}
                    </span>
                  </div>
                  {scanTimestamp && (
                    <span className="text-[10px] font-mono text-emerald-700">
                      {scanTimestamp}
                    </span>
                  )}
                </div>

                {/* SPECIAL PROMINENT TABLE DETECTION BANNER */}
                {scannedTableDetected ? (
                  <div className="p-4 rounded-2xl bg-slate-950 text-white space-y-2 border border-slate-800 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Table className="w-5 h-5 text-amber-300" />
                        <span className="font-display text-lg font-black tracking-wide text-white">
                          {isAr ? `تم فتح ${scannedTableDetected} بنجاح!` : `${scannedTableDetected} Opened!`}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
                        {isAr ? 'طاولة نشطة' : 'Active'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      {isAr
                        ? `تم ربط المنيو مع ${scannedTableDetected}. عند تأكيد طلبك، سيقوم الباريستا بتقديمه مباشرة إلى طاولتك.`
                        : `Your menu is now locked to ${scannedTableDetected}. All items ordered will be served directly to your table.`}
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                      >
                        <Coffee className="w-4 h-4 text-slate-950" />
                        <span>{isAr ? `ابدأ الطلب الآن لـ ${scannedTableDetected}` : `Start Ordering for ${scannedTableDetected}`}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white border border-emerald-200 font-mono text-xs text-slate-900 break-all select-all">
                    {scanResult}
                  </div>
                )}

                {/* Smart Action Buttons for Result */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {scanResult.startsWith('http://') || scanResult.startsWith('https://') ? (
                    <a
                      href={scanResult}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{isAr ? 'فتح الرابط في المتصفح' : 'Open Link'}</span>
                    </a>
                  ) : null}

                  {(scanResult.toLowerCase().includes('order') || scanResult.includes('MM-')) && onOpenOrders && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenOrders();
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <span>{isAr ? 'عرض تفاصيل الطلب' : 'View Order Details'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(scanResult);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ النص' : 'Copy Text')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isAr ? 'مسح رمز آخر' : 'Scan Another'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Smartphone className="w-4 h-4 text-slate-700" />
                  <span>{isAr ? 'كيفية فتح الطاولة عبر الكاميرا:' : 'How to open a table with camera:'}</span>
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                  <li>
                    {isAr
                      ? 'وجه الكاميرا نحو ستاند رمز QR الموجود على طاولتك (طاولة 1 إلى 15).'
                      : 'Point the camera at the QR code stand on any table (Table 1 to 15).'}
                  </li>
                  <li>
                    {isAr
                      ? 'سيتم التعرف على رقم الطاولة فورياً وتفعيلها تلقائياً لإرسال طلبك إليها.'
                      : 'The app instantly detects your table number and routes your order there.'}
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0 print:hidden mt-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            <span>{isAr ? 'نظام ميكس مارت الذكي لإدارة 15 طاولة' : 'MIX MART 15 Tables Smart Dispatch'}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>

        {/* HIDDEN PRINT-ONLY BATCH SHEET FOR ALL 15 TABLES */}
        {isBatchPrintingAll && (
          <div className="hidden print:block print:w-full print:p-4 text-black">
            <div className="text-center mb-6 border-b-2 border-black pb-3">
              <h1 className="text-2xl font-black uppercase tracking-wider">{settings.storeName}</h1>
              <p className="text-sm font-bold">Official QR Table Stands · كافة طاولات الكافيه (1 - 15)</p>
              <p className="text-xs text-gray-600">Scan with iPhone Camera or Android Google Lens to order directly to table</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {allTablesQrUrls.map((item) => (
                <div
                  key={item.num}
                  className="p-4 border-2 border-dashed border-gray-400 rounded-2xl text-center flex flex-col items-center justify-between break-inside-avoid"
                  style={{ minHeight: '260px' }}
                >
                  <div className="text-[10px] uppercase font-bold tracking-widest text-gray-700">
                    {settings.storeName} · COFFEE BAR
                  </div>
                  <div className="text-xl font-black my-1 text-black">
                    TABLE #{item.num}
                  </div>
                  <img
                    src={item.url}
                    alt={item.table}
                    className="w-36 h-36 mx-auto my-1 border border-black p-1"
                  />
                  <div className="text-[10px] font-bold text-gray-800">
                    امسح للطلب · Scan to Order
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
