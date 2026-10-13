import React, { useState } from 'react';
import { Product, Transaction, Customer } from '../types/warehouse';
import { ArrowUpFromLine, Camera, Check, Search, AlertTriangle, AlertCircle, Building2 } from 'lucide-react';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { ConfirmModal } from './ConfirmModal';
import { ProductThumbnail } from './ProductThumbnail';

interface GoodsOutViewProps {
  products: Product[];
  customers: Customer[];
  userEmail: string;
  onRecordGoodsOut: (tx: Omit<Transaction, 'tx_id' | 'timestamp'>) => Promise<void>;
}

export const GoodsOutView: React.FC<GoodsOutViewProps> = ({
  products,
  customers,
  userEmail,
  onRecordGoodsOut
}) => {
  const [selectedSku, setSelectedSku] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [department, setDepartment] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const selectedProduct = products.find(p => p.sku === selectedSku);
  const currentStock = selectedProduct?.current_stock ?? 0;
  const numQuantity = Number(quantity) || 0;
  const isOverStock = selectedProduct ? numQuantity > currentStock : false;
  const willBeLowStock = selectedProduct
    ? (currentStock - numQuantity) <= selectedProduct.min_stock
    : false;

  const handleSelectProduct = (product: Product) => {
    setSelectedSku(product.sku);
    setSearchQuery('');
  };

  const handleScanCode = (code: string) => {
    setIsScannerOpen(false);
    const match = products.find(
      p => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase()
    );
    if (match) {
      handleSelectProduct(match);
      setSuccessToast(`พบสินค้า: ${match.name} (คงเหลือ ${match.current_stock} ${match.unit})`);
      setTimeout(() => setSuccessToast(null), 3000);
    } else {
      alert(`ไม่พบสินค้าที่มีรหัสบาร์โค้ด "${code}" ในระบบคลังสินค้า`);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert('กรุณาเลือกสินค้าที่ต้องการเบิก');
      return;
    }
    if (!quantity || numQuantity <= 0) {
      alert('กรุณาระบุจำนวนที่ต้องการเบิกมากกว่า 0');
      return;
    }
    if (isOverStock) {
      alert(`จำนวนที่ต้องการเบิก (${numQuantity}) เกินกว่ายอดคงเหลือในคลัง (${currentStock} ${selectedProduct.unit}) ไม่สามารถทำรายการได้`);
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!selectedProduct || !quantity) return;
    setIsSubmitting(true);
    try {
      const parsedQty = Number(quantity);
      const unitPrice = selectedProduct.unit_price || 0;
      const totalAmount = parsedQty * unitPrice;

      await onRecordGoodsOut({
        type: 'OUT',
        sku: selectedProduct.sku,
        product_name: selectedProduct.name,
        quantity: parsedQty,
        unit: selectedProduct.unit,
        unit_price: unitPrice,
        total_amount: totalAmount,
        reference_no: referenceNo.trim() || `REQ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
        operator_email: userEmail,
        department: department.trim() || 'แผนกทั่วไป',
        notes: notes.trim()
      });

      setShowConfirmModal(false);
      setSuccessToast(`บันทึกเบิกจ่าย "${selectedProduct.name}" จำนวน -${parsedQty} ${selectedProduct.unit} เรียบร้อยแล้ว`);
      setTimeout(() => setSuccessToast(null), 4000);

      // Reset
      setSelectedSku('');
      setQuantity('');
      setDepartment('');
      setReferenceNo('');
      setNotes('');
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาดในการบันทึก: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter products for search
  const filteredProducts = products.filter(p => {
    if (!searchQuery) return false;
    const q = searchQuery.toLowerCase();
    return (
      p.sku.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-xl">
              <ArrowUpFromLine className="w-5 h-5" />
            </span>
            บันทึกเบิกจ่ายสินค้า (Goods Dispatch)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            บันทึกการเบิกใช้งานหรือจ่ายสินค้าออกจากคลัง ตัดยอดคงเหลือใน Google Sheets ทันที
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Camera className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="hidden sm:inline">สแกนบาร์โค้ด</span>
        </button>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-200 animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSubmitForm} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5 transition-colors">
        {/* Step 1: Select Product */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
            1. เลือกรายการสินค้าที่ต้องการเบิก <span className="text-red-500">*</span>
          </label>

          {selectedProduct ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <ProductThumbnail
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  size="lg"
                  enableZoom
                  fallbackCategory={selectedProduct.category}
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                    {selectedProduct.sku}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">{selectedProduct.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>หมวด: {selectedProduct.category}</span>
                    <span>·</span>
                    <span>
                      คงเหลือในคลัง:{' '}
                      <strong className={`font-mono font-bold ${currentStock <= selectedProduct.min_stock ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                        {currentStock}
                      </strong>{' '}
                      {selectedProduct.unit}
                    </span>
                    <span>·</span>
                    <span>ตำแหน่ง: {selectedProduct.location || '-'}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSku('')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shrink-0 shadow-2xs cursor-pointer"
              >
                เปลี่ยนสินค้า
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="พิมพ์ค้นหาด้วยชื่อสินค้า, Code หรือรหัสบาร์โค้ด..."
                  className="w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="absolute right-2 top-1.5 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  สแกน
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {searchQuery && (
                <div className="absolute z-20 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => (
                      <button
                        key={p.sku}
                        type="button"
                        onClick={() => handleSelectProduct(p)}
                        className="w-full text-left p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center justify-between text-xs transition-colors gap-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <ProductThumbnail
                            src={p.image_url}
                            alt={p.name}
                            size="sm"
                            fallbackCategory={p.category}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {p.sku} · {p.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`font-mono font-bold ${p.current_stock <= 0 ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>
                            คงเหลือ {p.current_stock}
                          </span>{' '}
                          {p.unit}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                      ไม่พบสินค้าที่ตรงกับการค้นหา
                    </div>
                  )}
                </div>
              )}

              {/* Quick Select Buttons */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">เลือกด่วน:</span>
                {products.filter(p => p.current_stock > 0).slice(0, 4).map((p) => (
                  <button
                    key={p.sku}
                    type="button"
                    onClick={() => handleSelectProduct(p)}
                    className="px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors truncate max-w-[160px] cursor-pointer"
                  >
                    {p.name} ({p.current_stock})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Requisition Quantity & Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                จำนวนที่ต้องการเบิก <span className="text-red-500">*</span>
              </label>
              {selectedProduct && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  สูงสุด {currentStock} {selectedProduct.unit}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={currentStock || undefined}
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="ระบุจำนวนที่เบิก"
                required
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 text-slate-900 dark:text-white font-mono font-bold ${
                  isOverStock
                    ? 'border-red-500 focus:ring-red-500 bg-red-50/50 dark:bg-red-950/40'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-amber-500'
                }`}
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400 dark:text-slate-500">
                {selectedProduct?.unit || 'หน่วย'}
              </span>
            </div>
            {isOverStock && (
              <p className="text-[11px] font-semibold text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                จำนวนเบิกเกินสต็อกคงเหลือในคลัง (มีเพียง {currentStock} {selectedProduct?.unit})
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                ลูกค้า / แผนกผู้เบิกสินค้า <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">เลือกจากฐานข้อมูล หรือพิมพ์ใหม่</span>
            </div>
            <input
              type="text"
              required
              list="customer-options"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="เลือกหรือพิมพ์ชื่อลูกค้า/แผนกผู้เบิก..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
            />
            <datalist id="customer-options">
              {customers.map(c => (
                <option key={c.id} value={c.name}>{c.id} {c.contact_person ? `(${c.contact_person})` : ''}</option>
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              เลขที่เอกสารขอเบิก (Requisition / Order Ref)
            </label>
            <input
              type="text"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="เช่น REQ-2026-095 หรือ SO-994"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              วัตถุประสงค์ / หมายเหตุ
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น เบิกไปประกอบงาน, แพ็คส่งออเดอร์"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Live Calculation & Warnings */}
        {selectedProduct && quantity && numQuantity > 0 && !isOverStock && (
          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/50 rounded-xl space-y-2 text-xs transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-amber-950 dark:text-amber-200">สรุปยอดคงเหลือหลังการเบิกจ่าย:</span>
                <p className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5">
                  คงเหลือเดิม {currentStock} - เบิกออก {numQuantity} ={' '}
                  <strong className="text-amber-950 dark:text-amber-100 font-bold font-mono">
                    {currentStock - numQuantity} {selectedProduct.unit}
                  </strong>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-amber-700 dark:text-amber-400">มูลค่าจ่ายออก</span>
                <p className="font-mono font-bold text-amber-950 dark:text-amber-200 text-sm">
                  ฿{(numQuantity * (selectedProduct.unit_price || 0)).toLocaleString('th-TH')}
                </p>
              </div>
            </div>

            {willBeLowStock && (
              <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/50 flex items-center gap-1.5 text-amber-800 dark:text-amber-300 text-[11px] font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                หลังจากการเบิกจ่ายนี้ สินค้าจะเข้าสู่เกณฑ์สต็อกต่ำ (เหลือ {currentStock - numQuantity} ≤ เกณฑ์ขั้นต่ำ {selectedProduct.min_stock})
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={!selectedProduct || !quantity || numQuantity <= 0 || isOverStock || isSubmitting}
            className="w-full py-3.5 px-4 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowUpFromLine className="w-5 h-5" />
            ยืนยันบันทึกเบิกจ่ายสินค้า (ตัดสต็อก Google Sheets)
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="ยืนยันการเบิกสินค้า"
        message={`ต้องการยืนยันการเบิกจ่ายสินค้าออกจากคลังหรือไม่? ยอดสต็อกจะถูกหักลบใน Google Sheets ทันที`}
        confirmLabel="ยืนยันเบิกจ่าย"
        variant="warning"
        isLoading={isSubmitting}
        details={[
          { label: 'รหัสสินค้า (Code)', value: selectedProduct?.sku || '' },
          { label: 'ชื่อสินค้า', value: selectedProduct?.name || '' },
          { label: 'จำนวนที่เบิก', value: `-${numQuantity} ${selectedProduct?.unit || ''}` },
          { label: 'คงเหลือหลังเบิก', value: `${currentStock - numQuantity} ${selectedProduct?.unit || ''}` },
          { label: 'แผนก/ผู้ขอเบิก', value: department || '-' },
          { label: 'ผู้ทำรายการ', value: userEmail }
        ]}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanCode}
      />
    </div>
  );
};
