import React, { useMemo } from 'react';
import { Product, Transaction } from '../types/warehouse';
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  TrendingUp,
  PackageCheck,
  ChevronRight,
  Flame,
  Clock,
  ExternalLink
} from 'lucide-react';
import { ProductThumbnail } from './ProductThumbnail';

interface DashboardViewProps {
  products: Product[];
  transactions: Transaction[];
  onNavigate: (tab: string) => void;
  onOpenQuickIn: (sku: string) => void;
  spreadsheetUrl?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  transactions,
  onNavigate,
  onOpenQuickIn,
  spreadsheetUrl
}) => {
  // 1. Calculate KPI Metrics
  const totalSKUs = products.length;
  const totalUnits = useMemo(() => products.reduce((acc, p) => acc + (p.current_stock || 0), 0), [products]);
  const totalInventoryValue = useMemo(
    () => products.reduce((acc, p) => acc + (p.current_stock || 0) * (p.unit_cost || p.unit_price || 0), 0),
    [products]
  );

  // 2. Low Stock Alerts
  const lowStockProducts = useMemo(() => {
    return products
      .filter((p) => p.current_stock <= p.min_stock)
      .sort((a, b) => a.current_stock / (a.min_stock || 1) - b.current_stock / (b.min_stock || 1));
  }, [products]);

  // 3. Fast-Moving Items (Movement frequency & total volume)
  const fastMovingStats = useMemo(() => {
    const itemMap = new Map<string, { sku: string; name: string; unit: string; outQty: number; inQty: number; txCount: number }>();

    transactions.forEach((tx) => {
      const existing = itemMap.get(tx.sku) || {
        sku: tx.sku,
        name: tx.product_name,
        unit: tx.unit,
        outQty: 0,
        inQty: 0,
        txCount: 0
      };
      existing.txCount += 1;
      if (tx.type === 'OUT') existing.outQty += tx.quantity;
      if (tx.type === 'IN') existing.inQty += tx.quantity;
      itemMap.set(tx.sku, existing);
    });

    const list = Array.from(itemMap.values());
    const topOutbound = [...list].sort((a, b) => b.outQty - a.outQty).slice(0, 5);
    const topActive = [...list].sort((a, b) => b.txCount - a.txCount).slice(0, 5);

    return { topOutbound, topActive };
  }, [transactions]);

  // 4. Inbound vs Outbound totals
  const totalInQty = useMemo(() => transactions.filter(t => t.type === 'IN').reduce((acc, t) => acc + t.quantity, 0), [transactions]);
  const totalOutQty = useMemo(() => transactions.filter(t => t.type === 'OUT').reduce((acc, t) => acc + t.quantity, 0), [transactions]);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ภาพรวมคลังสินค้า (Warehouse Overview)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            สรุปข้อมูลสินค้าคงคลัง ยอดรับเข้า-เบิกจ่าย และการแจ้งเตือนสต็อกต่ำ
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('in')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl shadow-xs transition-all"
          >
            <ArrowDownToLine className="w-4 h-4" />
            รับเข้าสินค้า
          </button>
          <button
            onClick={() => onNavigate('out')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.98] rounded-xl shadow-xs transition-all"
          >
            <ArrowUpFromLine className="w-4 h-4" />
            เบิกจ่ายสินค้า
          </button>
        </div>
      </div>

      {/* Low Stock Urgent Banner (if any) */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 sm:p-5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-950 dark:text-red-100 flex items-center gap-2">
                  แจ้งเตือนสต็อกต่ำกว่าเกณฑ์กำหนด!
                  <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-red-200 dark:bg-red-900/60 text-red-800 dark:text-red-200 rounded-md">
                    {lowStockProducts.length} รายการ
                  </span>
                </h3>
                <p className="text-xs text-red-700 dark:text-red-300 mt-0.5 leading-relaxed">
                  มีรายการสินค้าที่ระดับสต็อกเหลือน้อยกว่าค่าขั้นต่ำ (Min Stock) ควรรีบทำการจัดซื้อหรือรับเข้าเพิ่มเติม
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('stock')}
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-red-800 dark:text-red-300 hover:text-red-950 dark:hover:text-red-100 underline shrink-0"
            >
              ดูสต็อกทั้งหมด
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick list of top 3 critical items */}
          <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {lowStockProducts.slice(0, 3).map((item) => {
              const isZero = item.current_stock <= 0;
              return (
                <div
                  key={item.sku}
                  className="p-3 bg-white/90 dark:bg-slate-900/90 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ProductThumbnail
                      src={item.image_url}
                      alt={item.name}
                      size="sm"
                      enableZoom
                      fallbackCategory={item.category}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {item.sku} · ต่ำสุด {item.min_stock} {item.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className={`text-sm font-bold font-mono tabular-nums ${isZero ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {item.current_stock}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">{item.unit}</span>
                    </div>
                    <button
                      onClick={() => onOpenQuickIn(item.sku)}
                      title="รับเข้าสินค้านี้ด่วน"
                      className="px-2 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800/60"
                    >
                      + เติม
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total SKUs */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">จำนวนรายการสินค้า (Code)</span>
            <Boxes className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
            {totalSKUs}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">รายการสินค้าในคลัง</p>
        </div>

        {/* Total Stock Units */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">ยอดคงเหลือรวม</span>
            <PackageCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
            {totalUnits.toLocaleString('th-TH')}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">ชิ้น/หน่วยทั้งหมด</p>
        </div>

        {/* Inventory Total Value */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">มูลค่าสต็อกรวม</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
            ฿{totalInventoryValue.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">คำนวณตามต้นทุนคงคลัง</p>
        </div>

        {/* Low Stock Count */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">สต็อกต่ำกว่าเกณฑ์</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockProducts.length > 0 ? 'text-red-500' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold font-mono tabular-nums ${lowStockProducts.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
            {lowStockProducts.length}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {lowStockProducts.length > 0 ? 'ต้องเติมสินค้า' : 'ทุกรายการอยู่ในเกณฑ์ปกติ'}
          </p>
        </div>
      </div>

      {/* Flow Statistics: Total Inbound vs Total Outbound */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">ยอดรับเข้าสะสมทั้งหมด (Total Inbound)</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
                {totalInQty.toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">หน่วย</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('in')}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 p-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg"
          >
            บันทึกรับเข้า →
          </button>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <ArrowUpFromLine className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">ยอดเบิกจ่ายสะสมทั้งหมด (Total Outbound)</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
                {totalOutQty.toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">หน่วย</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('out')}
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 p-2 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg"
          >
            บันทึกเบิกจ่าย →
          </button>
        </div>
      </div>

      {/* Fast Moving Items & Recent Transactions Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fast Moving Items (สินค้าที่เคลื่อนไหวบ่อย / เบิกใช้สูงสุด) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                สินค้าเคลื่อนไหวบ่อย & ยอดเบิกจ่ายสูงสุด
              </h3>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">Top 5</span>
          </div>

          {fastMovingStats.topOutbound.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              ยังไม่มีประวัติการเบิกสินค้าในระบบ
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {fastMovingStats.topOutbound.map((item, index) => {
                const maxOut = fastMovingStats.topOutbound[0]?.outQty || 1;
                const percentage = Math.round((item.outQty / maxOut) * 100);
                const prod = products.find(p => p.sku === item.sku);
                return (
                  <div key={item.sku} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <ProductThumbnail
                          src={prod?.image_url}
                          alt={item.name}
                          size="xs"
                          fallbackCategory={prod?.category}
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.name}</span>
                        <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px] shrink-0">({item.sku})</span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white font-mono tabular-nums shrink-0 ml-2">
                        {item.outQty.toLocaleString()} {item.unit}
                      </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions Stream */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                รายการเคลื่อนไหวล่าสุด
              </h3>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              ดูทั้งหมด →
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              ยังไม่มีประวัติการรับเข้าหรือเบิกจ่าย
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1">
              {transactions.slice(0, 5).map((tx) => {
                const isIn = tx.type === 'IN';
                const prod = products.find(p => p.sku === tx.sku);
                return (
                  <div key={tx.tx_id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          isIn ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {isIn ? '+รับ' : '-เบิก'}
                      </div>
                      <ProductThumbnail
                        src={prod?.image_url}
                        alt={tx.product_name}
                        size="xs"
                        fallbackCategory={prod?.category}
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{tx.product_name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
                          {new Date(tx.timestamp).toLocaleDateString('th-TH')} · {tx.reference_no || tx.operator_email}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-mono font-bold tabular-nums text-sm ${
                          isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {isIn ? '+' : '-'}{tx.quantity.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">{tx.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Direct Google Sheets Link Banner */}
      {spreadsheetUrl && (
        <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl flex items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">ข้อมูลคลังสินค้าเชื่อมต่อสดกับ Google Sheets</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">คุณสามารถเปิดไฟล์สเปรดชีตเพื่อดูตารางดิบหรือส่งออกข้อมูลได้ตลอดเวลา</p>
            </div>
          </div>
          <a
            href={spreadsheetUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shrink-0 shadow-xs"
          >
            เปิด Google Sheets
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
};
