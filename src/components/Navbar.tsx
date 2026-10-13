import React from 'react';
import { User } from 'firebase/auth';
import { SheetInfo } from '../types/warehouse';
import { FileSpreadsheet, LogOut, Layers, RefreshCw, Folder, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  sheetInfo: SheetInfo | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSheetSettings: () => void;
  onLogout: () => void;
  isSyncing: boolean;
  lowStockCount: number;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  sheetInfo,
  activeTab,
  setActiveTab,
  onOpenSheetSettings,
  onLogout,
  isSyncing,
  lowStockCount,
  isDarkMode = false,
  onToggleDarkMode
}) => {
  const navItems = [
    { id: 'dashboard', label: 'แดชบอร์ด' },
    { id: 'stock', label: 'สต็อกสินค้า' },
    { id: 'in', label: 'รับเข้าสินค้า' },
    { id: 'out', label: 'เบิกสินค้า' },
    { id: 'partners', label: 'คู่ค้า / รายชื่อ' },
    { id: 'reports', label: 'รายงาน' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-6">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shadow-xs border border-transparent dark:border-slate-700">
            <Layers className="w-5 h-5 text-blue-400" />
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-left cursor-pointer"
          >
            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap block">
              StockWarehouse
            </span>
            <span className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Google Sheets Database
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Desktop view) */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 font-bold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                {item.label}
                {item.id === 'dashboard' && lowStockCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Status / Profile Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Dark / Light Theme Toggle Button */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              type="button"
              title={isDarkMode ? 'เปลี่ยนเป็นธีมสว่าง (Light Mode)' : 'เปลี่ยนเป็นธีมมืด (Dark Mode สำหรับคลังสินค้า)'}
              aria-label={isDarkMode ? 'สลับเป็นธีมสว่าง' : 'สลับเป็นธีมมืด'}
              className={`p-2 rounded-xl transition-all flex items-center justify-center shrink-0 border cursor-pointer active:scale-95 ${
                isDarkMode
                  ? 'bg-slate-800 text-amber-300 hover:text-amber-200 hover:bg-slate-700/80 border-slate-700 shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 border-slate-200 shadow-2xs'
              }`}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 stroke-[2.2]" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 stroke-[2.2]" />
              )}
            </button>
          )}

          {/* Google Drive Folder button */}
          <a
            href="https://drive.google.com/drive/folders/153xVR1YRvxFFK0xrF7XosuFy-2Y0Xo7o"
            target="_blank"
            rel="noreferrer"
            title="เปิดโฟลเดอร์ใน Google Drive"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-800/60 rounded-lg transition-colors whitespace-nowrap"
          >
            <Folder className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>โฟลเดอร์ Drive</span>
          </a>

          {/* Google Sheet badge button */}
          <button
            onClick={onOpenSheetSettings}
            title="จัดการการเชื่อมต่อ Google Sheets"
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/80 dark:border-emerald-800/60 rounded-lg transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden md:inline truncate max-w-[130px]">
              {sheetInfo?.title || 'เชื่อมต่อ Sheets'}
            </span>
            <span className="md:hidden text-[11px] sm:text-xs">Sheets</span>
            {isSyncing && (
              <RefreshCw className="w-3 h-3 text-emerald-600 dark:text-emerald-400 animate-spin shrink-0" />
            )}
          </button>

          {/* User Profile and Sign out */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-none truncate max-w-[110px]">
                  {user.displayName || 'ผู้ใช้งาน'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none truncate max-w-[110px] mt-0.5">
                  {user.email}
                </p>
              </div>
              <button
                onClick={onLogout}
                title="ออกจากระบบ Google"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
