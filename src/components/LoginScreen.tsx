import React, { useState } from 'react';
import { Layers, FileSpreadsheet, ShieldCheck, Smartphone, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => Promise<void>;
  onDemoLogin?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onDemoLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoading(true);
    setLoginError(null);
    try {
      await onLogin();
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setLoginError(
        err?.message?.includes('popup-closed-by-user') || err?.message?.includes('หน้าต่างล็อกอินถูกปิด')
          ? 'หน้าต่างล็อกอินถูกปิด กรุณาลองใหม่อีกครั้ง'
          : err?.message || 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้ กรุณาลองใหม่อีกครั้ง'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-950/80 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 text-center">
        {/* Brand Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Layers className="w-7 h-7" />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            ระบบจัดการคลังสินค้า
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Warehouse & Inventory Management
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="text-left space-y-2.5 p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>จัดเก็บและซิงค์ข้อมูลลงใน Google Sheets แบบ Real-time</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>ระบุตัวตนและบันทึกผู้ทำรายการด้วยบัญชี Google Account</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>รองรับการสแกนบาร์โค้ดผ่านกล้องมือถือทุกรุ่น</span>
          </div>
        </div>

        {loginError && (
          <div className="p-3.5 bg-red-950/80 border border-red-800/80 rounded-2xl space-y-1.5 text-xs text-red-200 text-left animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{loginError}</span>
            </div>
            {loginError.includes('unauthorized-domain') && (
              <p className="text-[11px] text-red-300/90 pl-6 leading-relaxed">
                ระบบได้สลับช่องทางยืนยันตัวตนไปยัง Google Identity Services (Direct OAuth) เรียบร้อยแล้ว กรุณากดปุ่มด้านล่างเพื่อเข้าสู่ระบบอีกครั้ง
              </p>
            )}
          </div>
        )}

        {/* Google Sign-in Official Button */}
        <div className="pt-2 flex flex-col items-center">
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="gsi-material-button w-full shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents font-bold">
                {isLoading ? 'กำลังเชื่อมต่อ Google...' : 'เข้าสู่ระบบด้วย Google'}
              </span>
            </div>
          </button>

          <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
            ระบบจะขอสิทธิ์เข้าถึง Google Sheets และ Drive เพื่อสร้างและอัปเดตฐานข้อมูลคลังสินค้าในบัญชีของคุณ
          </p>

          {onDemoLogin && (
            <div className="w-full pt-4 mt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={onDemoLogin}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white text-xs font-semibold rounded-2xl border border-slate-800 hover:border-slate-700 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>ทดลองใช้งานระบบแบบไม่ต้องล็อกอิน (Demo Mode)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
