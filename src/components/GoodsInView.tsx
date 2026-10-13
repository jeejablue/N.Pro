import React, { useState, useEffect } from 'react';
import { Product, Transaction, Supplier } from '../types/warehouse';
import { ArrowDownToLine, Camera, Check, Search, PlusCircle, Sparkles, Building2 } from 'lucide-react';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { ConfirmModal } from './ConfirmModal';
import { ProductThumbnail } from './ProductThumbnail';

interface GoodsInViewProps {
  products: Product[];
  suppliers: Supplier[];
  userEmail: string;
  onRecordGoodsIn: (tx: Omit<Transaction, 'tx_id' | 'timestamp'>) => Promise<void>;
  prefilledSku?: string;
  onClearPrefill?: () => void;
}

export const GoodsInView: React.FC<GoodsInViewProps> = ({
  products,
  suppliers,
  userEmail,
  onRecordGoodsIn,
  prefilledSku,
  onClearPrefill
}) => {
  const [selectedSku, setSelectedSku] = useState<string>(prefilledSku || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unitCost, setUnitCost] = useState<number | ''>('');
  const [supplier, setSupplier] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // When prefilledSku changes
  useEffect(() => {
    if (prefilledSku) {
      setSelectedSku(prefilledSku);
      const match = products.find(p => p.sku === prefilledSku);
      if (match && match.unit_cost) {
        setUnitCost(match.unit_cost);
      }
    }
  }, [prefilledSku, products]);

  const selectedProduct = products.find(p => p.sku === selectedSku);

  // Auto-fill cost when selectedProduct changes
  const handleSelectProduct = (product: Product) => {
    setSelectedSku(product.sku);
    setSearchQuery('');
    if (product.unit_cost) {
      setUnitCost(product.unit_cost);
    } else if (product.unit_price) {
      setUnitCost(product.unit_price);
    }
    if (onClearPrefill) onClearPrefill();
  };

  const handleScanCode = (code: string) => {
    setIsScannerOpen(false);
    // Find matching product by barcode or SKU
    const match = products.find(
      p => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase()
    );
    if (match) {
      handleSelectProduct(match);
      setSuccessToast(`พบสินค้า: ${match.name} (${match.sku})`);
      setTimeout(() => setSuccessToast(null), 3000);
    } else {
      alert(`ไม่พบสินค้าที่มีรหัสบาร์โค้ด "${code}" ในระบบคลังสินค้า`);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert('กรุณาเลือกสินค้าที่จะรับเข้า');
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      alert('กรุณาระบุจำนวนที่รับเข้ามากกว่า 0');
      return;
    }

    // Trigger confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!selectedProduct || !quantity) return;
    setIsSubmitting(true);
    try {
      const parsedQty = Number(quantity);
      const parsedCost = unitCost !== '' ? Number(unitCost) : selectedProduct.unit_cost || 0;
      const totalAmount = parsedQty * parsedCost;

      await onRecordGoodsIn({
        type: 'IN',
        sku: selectedProduct.sku,
        product_name: selectedProduct.name,
        quantity: parsedQty,
        unit: selectedProduct.unit,
        unit_price: parsedCost,
        total_amount: totalAmount,
        reference_no: referenceNo.trim() || `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
        operator_email: userEmail,
        department: supplier.trim() || 'ซัพพลายเออร์ทั่วไป',
        notes: notes.trim()
      });

      setShowConfirmModal(false);
      setSuccessToast(`บันทึกรับเข้า "${selectedProduct.name}" จำนวน +${parsedQty} ${selectedProduct.unit} เรียบร้อยแล้ว`);
      setTimeout(() => setSuccessToast(null), 4000);

      // Reset form
      setSelectedSku('');
      setQuantity('');
      setUnitCost('');
      setSupplier('');
      setReferenceNo('');
      setNotes('');
      if (onClearPrefill) onClearPrefill();
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาดในการบันทึก: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter products for dropdown/search
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
            <span className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-xl">
              <ArrowDownToLine className="w-5 h-5" />
            </span>
            บันทึกรับเข้าสินค้า (Goods Inward)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            บันทึกการรับสินค้าใหม่เข้าคลัง เพิ่มยอดคงเหลือใน Google Sheets ทันที
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
        {/* Step 1: Select or Scan Product */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
            1. เลือกรายการสินค้าที่จะรับเข้า <span className="text-red-500">*</span>
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
                  <span className="text-[10px] font-bold font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                    {selectedProduct.sku}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">{selectedProduct.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>หมวด: {selectedProduct.category}</span>
                    <span>·</span>
                    <span>คงเหลือปัจจุบัน: <strong className="text-slate-800 dark:text-slate-200 font-mono">{selectedProduct.current_stock}</strong> {selectedProduct.unit}</span>
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
                  className="w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="absolute right-2 top-1.5 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
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
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
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

              {/* Popular / Low Stock Shortcuts */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">เลือกด่วน:</span>
                {products.slice(0, 4).map((p) => (
                  <button
                    key={p.sku}
                    type="button"
                    onClick={() => handleSelectProduct(p)}
                    className="px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors truncate max-w-[160px] cursor-pointer"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Inward Quantities & Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              จำนวนรับเข้า <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="ระบุจำนวน เช่น 50"
                required
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-mono font-bold"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400 dark:text-slate-500">
                {selectedProduct?.unit || 'หน่วย'}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              ต้นทุนต่อหน่วย (บาท)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="any"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="ระบุต้นทุน เช่น 75.00"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-mono"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 dark:text-slate-500">฿</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                ซัพพลายเออร์ / ผู้จัดจำหน่าย
              </label>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">เลือกจากฐานข้อมูล หรือพิมพ์ใหม่</span>
            </div>
            <input
              type="text"
              list="supplier-options"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="เลือกหรือพิมพ์ชื่อซัพพลายเออร์..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
            <datalist id="supplier-options">
              {suppliers.map(s => (
                <option key={s.id} value={s.name}>{s.id} {s.contact_person ? `(${s.contact_person})` : ''}</option>
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              เลขที่เอกสารอ้างอิง (PO / ใบส่งของ)
            </label>
            <input
              type="text"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="เช่น PO-2026-1025"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
            หมายเหตุเพิ่มเติม
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="เช่น ล็อตผลิตใหม่ ตรวจนับครบถ้วน วางชั้น B-02"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Live Balance Preview Calculation */}
        {selectedProduct && quantity && Number(quantity) > 0 && (
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/50 rounded-xl flex items-center justify-between text-xs transition-colors">
            <div>
              <span className="font-semibold text-emerald-900 dark:text-emerald-200">สรุปการเปลี่ยนแปลงยอดคงเหลือ:</span>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                คงเหลือเดิม {selectedProduct.current_stock} + รับเข้า {quantity} ={' '}
                <strong className="text-emerald-950 dark:text-emerald-100 font-bold font-mono">
                  {selectedProduct.current_stock + Number(quantity)} {selectedProduct.unit}
                </strong>
              </p>
            </div>
            {unitCost !== '' && Number(unitCost) > 0 && (
              <div className="text-right">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400">มูลค่ารับเข้าสุทธิ</span>
                <p className="font-mono font-bold text-emerald-950 dark:text-emerald-200 text-sm">
                  ฿{(Number(quantity) * Number(unitCost)).toLocaleString('th-TH')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={!selectedProduct || !quantity || Number(quantity) <= 0 || isSubmitting}
            className="w-full py-3.5 px-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowDownToLine className="w-5 h-5" />
            บันทึกรับเข้าคลังสินค้า (Google Sheets)
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="ยืนยันการรับเข้าสินค้า"
        message={`ต้องการยืนยันบันทึกการรับเข้าสินค้าลงใน Google Sheets หรือไม่? ยอดสต็อกจะถูกเพิ่มโดยอัตโนมัติ`}
        confirmLabel="ยืนยันรับเข้า"
        variant="primary"
        isLoading={isSubmitting}
        details={[
          { label: 'รหัสสินค้า (Code)', value: selectedProduct?.sku || '' },
          { label: 'ชื่อสินค้า', value: selectedProduct?.name || '' },
          { label: 'จำนวนรับเข้า', value: `+${quantity} ${selectedProduct?.unit || ''}` },
          { label: 'ยอดคงเหลือใหม่', value: `${(selectedProduct?.current_stock || 0) + Number(quantity || 0)} ${selectedProduct?.unit || ''}` },
          { label: 'เอกสารอ้างอิง', value: referenceNo || '-' },
          { label: 'ผู้บันทึก', value: userEmail }
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
