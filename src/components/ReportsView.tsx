import React, { useState, useMemo } from 'react';
import { Product, Transaction } from '../types/warehouse';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileSpreadsheet,
  ExternalLink,
  Search,
  Layers
} from 'lucide-react';
import { ProductThumbnail } from './ProductThumbnail';

interface ReportsViewProps {
  products: Product[];
  transactions: Transaction[];
  spreadsheetUrl?: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  products,
  transactions,
  spreadsheetUrl
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'balance' | 'ledger'>('balance');
  const [txTypeFilter, setTxTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Filter Transactions by Date and Type
  const filteredTransactions = useMemo(() => {
    const now = new Date().getTime();
    return transactions.filter((tx) => {
      // Type
      if (txTypeFilter !== 'ALL' && tx.type !== txTypeFilter) return false;

      // Date
      if (dateFilter !== 'all') {
        const txTime = new Date(tx.timestamp).getTime();
        const diffDays = (now - txTime) / (1000 * 60 * 60 * 24);
        if (dateFilter === 'today' && diffDays > 1) return false;
        if (dateFilter === '7days' && diffDays > 7) return false;
        if (dateFilter === '30days' && diffDays > 30) return false;
      }

      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          tx.tx_id.toLowerCase().includes(q) ||
          tx.sku.toLowerCase().includes(q) ||
          tx.product_name.toLowerCase().includes(q) ||
          tx.reference_no.toLowerCase().includes(q) ||
          (tx.department && tx.department.toLowerCase().includes(q)) ||
          tx.operator_email.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [transactions, txTypeFilter, dateFilter, searchQuery]);

  // 2. Filter Products Balance
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      p =>
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  // Totals
  const totalValuation = useMemo(
    () => products.reduce((acc, p) => acc + p.current_stock * (p.unit_cost || p.unit_price || 0), 0),
    [products]
  );

  // CSV Export for Balance
  const exportBalanceCSV = () => {
    const headers = ['Code', 'ชื่อสินค้า', 'หมวดหมู่', 'ยอดคงเหลือ', 'หน่วยนับ', 'เกณฑ์ต่ำสุด', 'ต้นทุนต่อหน่วย', 'มูลค่ารวม (บาท)', 'ตำแหน่งจัดเก็บ'];
    const rows = filteredProducts.map(p => [
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.current_stock,
      p.unit,
      p.min_stock,
      p.unit_cost || 0,
      p.current_stock * (p.unit_cost || p.unit_price || 0),
      `"${p.location}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `stock_balance_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export for Transactions
  const exportLedgerCSV = () => {
    const headers = ['รหัสรายการ', 'วันเวลา', 'ประเภท', 'Code', 'ชื่อสินค้า', 'จำนวน', 'หน่วยนับ', 'ราคา/หน่วย', 'มูลค่ารวม', 'เอกสารอ้างอิง', 'แผนก/ซัพพลายเออร์', 'ผู้บันทึก', 'หมายเหตุ'];
    const rows = filteredTransactions.map(t => [
      t.tx_id,
      t.timestamp,
      t.type === 'IN' ? 'รับเข้า' : 'เบิกออก',
      t.sku,
      `"${t.product_name.replace(/"/g, '""')}"`,
      t.quantity,
      t.unit,
      t.unit_price || 0,
      t.total_amount || 0,
      `"${t.reference_no}"`,
      `"${(t.department || '').replace(/"/g, '""')}"`,
      t.operator_email,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `stock_movement_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            รายงานสินค้าคงเหลือและประวัติการเคลื่อนไหว
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            สรุปข้อมูลสินค้าคงคลัง บันทึกรับเข้า-จ่ายออก และส่งออกข้อมูลเป็น CSV
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {spreadsheetUrl && (
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">ดูใน Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={activeReportTab === 'balance' ? exportBalanceCSV : exportLedgerCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            ดาวน์โหลด CSV
          </button>
        </div>
      </div>

      {/* Report Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveReportTab('balance')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeReportTab === 'balance'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          รายงานสินค้าคงเหลือ (Stock Balance)
        </button>
        <button
          onClick={() => setActiveReportTab('ledger')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeReportTab === 'ledger'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          ประวัติการเคลื่อนไหว (In/Out Ledger)
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 transition-colors">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeReportTab === 'balance'
                ? 'ค้นหาด้วย Code หรือชื่อสินค้า...'
                : 'ค้นหาด้วยเลขที่เอกสาร, Code, ชื่อสินค้า, หรือแผนก...'
            }
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {activeReportTab === 'ledger' && (
          <div className="flex items-center gap-2">
            {/* Type selector */}
            <select
              value={txTypeFilter}
              onChange={(e) => setTxTypeFilter(e.target.value as any)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">ทุกประเภท (รับ/เบิก)</option>
              <option value="IN">เฉพาะรับเข้า (IN)</option>
              <option value="OUT">เฉพาะเบิกออก (OUT)</option>
            </select>

            {/* Date filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทุกช่วงเวลา</option>
              <option value="today">วันนี้</option>
              <option value="7days">7 วันล่าสุด</option>
              <option value="30days">30 วันล่าสุด</option>
            </select>
          </div>
        )}
      </div>

      {/* Content View 1: Stock Balance Report */}
      {activeReportTab === 'balance' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              รวม {filteredProducts.length} รายการสินค้า
            </span>
            <span className="font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              มูลค่าคงคลังรวม: ฿{totalValuation.toLocaleString('th-TH')}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-x-auto transition-colors">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3 text-center w-12">รูปภาพ</th>
                  <th className="py-3 px-4">รหัสสินค้า (Code)</th>
                  <th className="py-3 px-4">ชื่อสินค้า</th>
                  <th className="py-3 px-4">หมวดหมู่</th>
                  <th className="py-3 px-4 text-right">ยอดคงเหลือ</th>
                  <th className="py-3 px-4 text-right">เกณฑ์ Min</th>
                  <th className="py-3 px-4 text-right">มูลค่ารวม (฿)</th>
                  <th className="py-3 px-4">ตำแหน่ง</th>
                  <th className="py-3 px-4 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {filteredProducts.map((p) => {
                  const isLow = p.current_stock <= p.min_stock;
                  const isOut = p.current_stock <= 0;
                  const itemValuation = p.current_stock * (p.unit_cost || p.unit_price || 0);

                  return (
                    <tr key={p.sku} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <ProductThumbnail
                          src={p.image_url}
                          alt={p.name}
                          size="xs"
                          enableZoom
                          fallbackCategory={p.category}
                        />
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {p.sku}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white max-w-[220px] truncate">
                        {p.name}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{p.category}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                        <span className={isOut ? 'text-red-600 dark:text-red-400' : isLow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}>
                          {p.current_stock.toLocaleString()}
                        </span>{' '}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{p.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {p.min_stock.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        ฿{itemValuation.toLocaleString('th-TH')}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {p.location || '-'}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isOut
                              ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                              : isLow
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {isOut ? 'สินค้าหมด' : isLow ? 'สต็อกต่ำ' : 'ปกติ'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content View 2: Transaction Movement Ledger */}
      {activeReportTab === 'ledger' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              พบ {filteredTransactions.length} รายการเคลื่อนไหว
            </span>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                รับเข้า: +{filteredTransactions.filter(t => t.type === 'IN').reduce((a, b) => a + b.quantity, 0).toLocaleString()}
              </span>
              <span>·</span>
              <span className="text-amber-700 dark:text-amber-400 font-bold">
                เบิกจ่าย: -{filteredTransactions.filter(t => t.type === 'OUT').reduce((a, b) => a + b.quantity, 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-x-auto transition-colors">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">วันเวลา / รหัสรายการ</th>
                  <th className="py-3 px-4">ประเภท</th>
                  <th className="py-3 px-4">สินค้า</th>
                  <th className="py-3 px-4 text-right">จำนวน</th>
                  <th className="py-3 px-4">เอกสารอ้างอิง</th>
                  <th className="py-3 px-4">แผนก / ซัพพลายเออร์</th>
                  <th className="py-3 px-4">ผู้ทำรายการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {filteredTransactions.map((tx) => {
                  const isIn = tx.type === 'IN';
                  return (
                    <tr key={tx.tx_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-slate-900 dark:text-white block font-bold">
                          {new Date(tx.timestamp).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{tx.tx_id}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isIn
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {isIn ? <ArrowDownToLine className="w-3 h-3" /> : <ArrowUpFromLine className="w-3 h-3" />}
                          {isIn ? 'รับเข้า' : 'เบิกออก'}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-[220px]">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{tx.product_name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{tx.sku}</p>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                        <span className={isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                          {isIn ? '+' : '-'}{tx.quantity.toLocaleString()}
                        </span>{' '}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{tx.unit}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {tx.reference_no || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap truncate max-w-[150px]">
                        {tx.department || '-'}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap truncate max-w-[140px]">
                        {tx.operator_email}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
