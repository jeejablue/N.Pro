import React, { useState } from 'react';
import { SheetInfo } from '../types/warehouse';
import { ExternalLink, RefreshCw, FileSpreadsheet, PlusCircle, Link, Check, AlertCircle, X } from 'lucide-react';

interface SheetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetInfo: SheetInfo | null;
  onRefreshData: () => Promise<void>;
  onCreateNewSheet: () => Promise<void>;
  onConnectCustomSheet: (sheetId: string) => Promise<void>;
  isSyncing: boolean;
}

export const SheetSettingsModal: React.FC<SheetSettingsModalProps> = ({
  isOpen,
  onClose,
  sheetInfo,
  onRefreshData,
  onCreateNewSheet,
  onConnectCustomSheet,
  isSyncing
}) => {
  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnectCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    let id = customInput.trim();

    // Extract ID if URL is provided
    const match = id.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      id = match[1];
    }

    if (!id) {
      setInputError('กรุณากรอก Spreadsheet ID หรือ URL ที่ถูกต้อง');
      return;
    }

    try {
      await onConnectCustomSheet(id);
      setActionSuccess('เชื่อมต่อ Google Sheet สำเร็จเรียบร้อย');
      setCustomInput('');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setInputError(err.message || 'ไม่สามารถเข้าถึงไฟล์ Sheet นี้ได้ ตรวจสอบสิทธิ์การเข้าถึง');
    }
  };

  const handleCreateNew = async () => {
    try {
      await onCreateNewSheet();
      setActionSuccess('สร้าง Google Sheet ใหม่ใน Drive ของคุณสำเร็จ');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setInputError(err.message || 'เกิดข้อผิดพลาดในการสร้างไฟล์');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">การเชื่อมต่อ Google Sheets</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">ฐานข้อมูลคลังสินค้าของคุณถูกบันทึกลงใน Google Sheets โดยตรง</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {actionSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              {actionSuccess}
            </div>
          )}

          {inputError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              {inputError}
            </div>
          )}

          {/* Current Sheet Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ไฟล์ที่เชื่อมต่อปัจจุบัน</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{sheetInfo?.title || 'ยังไม่ได้เชื่อมต่อ'}</h4>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate max-w-[280px]">ID: {sheetInfo?.spreadsheetId || '-'}</p>
              </div>
              {sheetInfo?.spreadsheetUrl && (
                <a
                  href={sheetInfo.spreadsheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 rounded-lg transition-colors"
                >
                  เปิดใน Sheets
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Target Drive Folder link */}
            <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 rounded-lg flex items-center justify-between text-xs">
              <div className="min-w-0">
                <span className="font-bold text-blue-900 dark:text-blue-200 text-[11px] block">โฟลเดอร์ Google Drive:</span>
                <span className="text-[10px] text-blue-700 dark:text-blue-300 font-mono truncate block">153xVR1YRvxFFK0xrF7XosuFy-2Y0Xo7o</span>
              </div>
              <a
                href="https://drive.google.com/drive/folders/153xVR1YRvxFFK0xrF7XosuFy-2Y0Xo7o"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shrink-0 shadow-2xs"
              >
                เปิดโฟลเดอร์ Drive
              </a>
            </div>

            {/* Included Sheets Indicator */}
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-700 dark:text-slate-300">แท็บตารางในไฟล์:</span>
              <span className="bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono">Products</span>
              <span className="bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono">Transactions</span>
              <span className="bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono">Suppliers</span>
              <span className="bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono">Customers</span>
            </div>

            <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>อัปเดตล่าสุด: {sheetInfo?.lastSyncedAt ? new Date(sheetInfo.lastSyncedAt).toLocaleTimeString('th-TH') : 'เพิ่งซิงค์'}</span>
              <button
                type="button"
                onClick={onRefreshData}
                disabled={isSyncing}
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                ซิงค์ข้อมูลใหม่
              </button>
            </div>
          </div>

          {/* Connect Other Sheet */}
          <form onSubmit={handleConnectCustom} className="space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Link className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              เชื่อมต่อ Google Sheet อื่นด้วย URL หรือ Spreadsheet ID:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="วาง URL ของ Google Spreadsheet ที่นี่..."
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={isSyncing || !customInput.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 disabled:opacity-50 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              >
                เชื่อมต่อ
              </button>
            </div>
          </form>

          {/* Create New Sheet Option */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">ต้องการเริ่มไฟล์ใหม่?</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">สร้างไฟล์ Sheets เปล่าใหม่พร้อมหัวตารางมาตรฐานใน Google Drive</p>
            </div>
            <button
              type="button"
              onClick={handleCreateNew}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-900/50 rounded-xl transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              สร้าง Sheet ใหม่
            </button>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
