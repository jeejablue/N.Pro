import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Keyboard, AlertCircle } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan
}) => {
  const [manualCode, setManualCode] = useState('');
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'html5qr-code-scanner-element';

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    setScannerError(null);
    let mounted = true;

    const startScanner = async () => {
      try {
        // Wait slightly for DOM to render modal
        await new Promise(r => setTimeout(r, 150));
        if (!document.getElementById(readerElementId)) return;

        const html5QrCode = new Html5Qrcode(readerElementId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (mounted) {
              if (navigator.vibrate) navigator.vibrate(100);
              stopScanner();
              onScan(decodedText.trim());
            }
          },
          () => {
            // Frame ignored/scanning
          }
        );
        if (mounted) setIsScanning(true);
      } catch (err: any) {
        console.warn('Camera scanner start error:', err);
        if (mounted) {
          setScannerError(
            err?.message?.includes('Permission')
              ? 'กรุณาอนุญาตให้เข้าถึงกล้องบนอุปกรณ์ หรือใช้การกรอกรหัสด้วยตนเอง'
              : 'ไม่สามารถเปิดกล้องได้บนเบราว์เซอร์นี้ กรุณากรอกรหัสด้วยตนเองด้านล่าง'
          );
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = () => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current = null;
        });
      } else {
        scannerRef.current = null;
      }
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      stopScanner();
      onScan(manualCode.trim());
      setManualCode('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">สแกนบาร์โค้ด / QR Code</h3>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="p-4 bg-slate-950 flex flex-col items-center justify-center relative min-h-[280px]">
          <div
            id={readerElementId}
            className="w-full max-w-[320px] rounded-lg overflow-hidden"
          />

          {scannerError && (
            <div className="absolute inset-4 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 rounded-xl text-slate-200">
              <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
              <p className="text-xs leading-relaxed text-slate-300 mb-4">{scannerError}</p>
            </div>
          )}

          {!scannerError && isScanning && (
            <p className="text-xs text-slate-300 mt-2 text-center">
              จัดวางบาร์โค้ดหรือ QR Code ให้อยู่ตรงกลางกรอบ
            </p>
          )}
        </div>

        {/* Manual Input Fallback */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              หรือกรอกรหัสบาร์โค้ด / Code ด้วยตนเอง:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="เช่น CODE-001 หรือ 885001100001"
                className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono"
                autoFocus={!!scannerError}
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                ยืนยัน
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
