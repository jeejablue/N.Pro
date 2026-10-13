import React, { useState, useMemo } from 'react';
import { Product } from '../types/warehouse';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  ArrowUpDown,
  X,
  Camera,
  Filter
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { ProductThumbnail } from './ProductThumbnail';

interface StockMasterViewProps {
  products: Product[];
  onSaveProduct: (product: Product, isNew: boolean) => Promise<void>;
  onDeleteProduct: (sku: string) => Promise<void>;
  onQuickIn: (sku: string) => void;
}

export const StockMasterView: React.FC<StockMasterViewProps> = ({
  products,
  onSaveProduct,
  onDeleteProduct,
  onQuickIn
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'normal' | 'low' | 'out'>('all');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Modal states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form fields
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formStock, setFormStock] = useState<number | ''>(0);
  const [formMinStock, setFormMinStock] = useState<number | ''>(10);
  const [formUnit, setFormUnit] = useState('ชิ้น');
  const [formPrice, setFormPrice] = useState<number | ''>('');
  const [formCost, setFormCost] = useState<number | ''>('');
  const [formLocation, setFormLocation] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [isCompressingImg, setIsCompressingImg] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingImg(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 480;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setFormImageUrl(compressedDataUrl);
        }
        setIsCompressingImg(false);
      };
      img.onerror = () => setIsCompressingImg(false);
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          p.sku.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.toLowerCase().includes(q)) ||
          (p.location && p.location.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Category
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Status
      if (selectedStatus === 'out' && p.current_stock > 0) return false;
      if (selectedStatus === 'low' && (p.current_stock > p.min_stock || p.current_stock <= 0)) return false;
      if (selectedStatus === 'normal' && p.current_stock <= p.min_stock) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  const openAddModal = () => {
    const nextNum = products.length + 1;
    const padded = String(nextNum).padStart(3, '0');
    setFormSku(`CODE-${padded}`);
    setFormName('');
    setFormCategory(categories[0] || 'ทั่วไป');
    setFormStock(0);
    setFormMinStock(10);
    setFormUnit('ชิ้น');
    setFormPrice('');
    setFormCost('');
    setFormLocation('A-01');
    setFormBarcode('');
    setFormImageUrl('');
    setFormError(null);
    setIsAddingNew(true);
    setEditingProduct(null);
  };

  const openEditModal = (p: Product) => {
    setFormSku(p.sku);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormStock(p.current_stock);
    setFormMinStock(p.min_stock);
    setFormUnit(p.unit);
    setFormPrice(p.unit_price || '');
    setFormCost(p.unit_cost || '');
    setFormLocation(p.location || '');
    setFormBarcode(p.barcode || '');
    setFormImageUrl(p.image_url || '');
    setFormError(null);
    setEditingProduct(p);
    setIsAddingNew(false);
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const skuClean = formSku.trim();
    const nameClean = formName.trim();

    if (!skuClean || !nameClean) {
      setFormError('กรุณากรอกรหัสสินค้า (Code) และชื่อสินค้าให้ครบถ้วน');
      return;
    }

    // Check duplicate code if adding new
    if (isAddingNew && products.some(p => p.sku.toLowerCase() === skuClean.toLowerCase())) {
      setFormError(`รหัสสินค้า (Code) "${skuClean}" มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น`);
      return;
    }

    setIsSaving(true);
    try {
      const productObj: Product = {
        sku: skuClean,
        name: nameClean,
        category: formCategory.trim() || 'ทั่วไป',
        current_stock: formStock === '' ? 0 : Number(formStock),
        min_stock: formMinStock === '' ? 0 : Number(formMinStock),
        unit: formUnit.trim() || 'ชิ้น',
        unit_price: formPrice === '' ? 0 : Number(formPrice),
        unit_cost: formCost === '' ? 0 : Number(formCost),
        location: formLocation.trim() || '-',
        barcode: formBarcode.trim() || '',
        image_url: formImageUrl.trim() || undefined,
        updated_at: new Date().toISOString()
      };

      await onSaveProduct(productObj, isAddingNew);
      setIsAddingNew(false);
      setEditingProduct(null);
    } catch (err: any) {
      setFormError(err.message || 'บันทึกข้อมูลไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteProduct(productToDelete.sku);
      setProductToDelete(null);
    } catch (err: any) {
      setActionError(`ไม่สามารถลบสินค้าได้: ${err.message}`);
      setTimeout(() => setActionError(null), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {actionError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold text-red-800 dark:text-red-200 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            จัดการข้อมูล Stock สินค้า (Inventory Master)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            ข้อมูลรายการสินค้าในคลัง เกณฑ์สต็อกขั้นต่ำ และตำแหน่งจัดเก็บ ({products.length} รายการ)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          เพิ่มสินค้าใหม่
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหา Code, ชื่อสินค้า, บาร์โค้ด, ชั้นวาง..."
              className="w-full pl-10 pr-20 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <button
              onClick={() => setIsScannerOpen(true)}
              className="absolute right-2 top-1.5 px-2 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg flex items-center gap-1 shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              สแกน
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">หมวดหมู่ทั้งหมด ({products.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter tabs (buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium mr-1 shrink-0">สถานะสต็อก:</span>
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors shrink-0 ${
              selectedStatus === 'all'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setSelectedStatus('normal')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors shrink-0 ${
              selectedStatus === 'normal'
                ? 'bg-emerald-700 text-white font-bold'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
            }`}
          >
            ปกติ
          </button>
          <button
            onClick={() => setSelectedStatus('low')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors shrink-0 ${
              selectedStatus === 'low'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
            }`}
          >
            สต็อกต่ำ
          </button>
          <button
            onClick={() => setSelectedStatus('out')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors shrink-0 ${
              selectedStatus === 'out'
                ? 'bg-red-600 text-white font-bold'
                : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50'
            }`}
          >
            สินค้าหมด (0)
          </button>
        </div>
      </div>

      {/* Product List: Responsive Table for Desktop + Cards for Mobile */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl transition-colors">
          <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">ไม่พบรายการสินค้าที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่</p>
        </div>
      ) : (
        <>
          {/* Mobile Card Layout (< 1024px) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
            {filteredProducts.map((p) => {
              const isLow = p.current_stock <= p.min_stock;
              const isOut = p.current_stock <= 0;
              return (
                <div
                  key={p.sku}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <ProductThumbnail
                        src={p.image_url}
                        alt={p.name}
                        size="md"
                        enableZoom
                        fallbackCategory={p.category}
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                          {p.sku}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">{p.name}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {p.category} {p.location ? `· ชั้นวาง ${p.location}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-base font-extrabold font-mono tabular-nums ${isOut ? 'text-red-600 dark:text-red-400' : isLow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                        {p.current_stock.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{p.unit}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>เกณฑ์ต่ำสุด: {p.min_stock}</span> · <span>ราคา: ฿{p.unit_price}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isLow && (
                        <button
                          onClick={() => onQuickIn(p.sku)}
                          className="px-2 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg"
                        >
                          + รับเข้า
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setProductToDelete(p)}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                        title="ลบรายการ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= 1024px) */}
          <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-3 text-center w-14">รูปภาพ</th>
                  <th className="py-3.5 px-4">Code / รหัสสินค้า</th>
                  <th className="py-3.5 px-4">ชื่อสินค้า</th>
                  <th className="py-3.5 px-4">หมวดหมู่</th>
                  <th className="py-3.5 px-4 text-right">คงเหลือ (Stock)</th>
                  <th className="py-3.5 px-4 text-right">เกณฑ์ขั้นต่ำ (Min)</th>
                  <th className="py-3.5 px-4 text-right">ราคาขาย/ต้นทุน</th>
                  <th className="py-3.5 px-4">ตำแหน่งจัดเก็บ</th>
                  <th className="py-3.5 px-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {filteredProducts.map((p) => {
                  const isLow = p.current_stock <= p.min_stock;
                  const isOut = p.current_stock <= 0;
                  return (
                    <tr key={p.sku} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <ProductThumbnail
                          src={p.image_url}
                          alt={p.name}
                          size="sm"
                          enableZoom
                          fallbackCategory={p.category}
                        />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 border border-transparent dark:border-slate-700">
                          {p.sku}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white max-w-[240px] truncate">
                        {p.name}
                        {p.barcode && (
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-mono font-normal">
                            บาร์โค้ด: {p.barcode}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {p.category}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-extrabold tabular-nums whitespace-nowrap">
                        <span className={`text-sm ${isOut ? 'text-red-600 dark:text-red-400' : isLow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                          {p.current_stock.toLocaleString()}
                        </span>{' '}
                        <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">{p.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {p.min_stock.toLocaleString()} {p.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                        <span className="text-slate-900 dark:text-white font-bold">฿{p.unit_price}</span>
                        {p.unit_cost ? (
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500">ทุน ฿{p.unit_cost}</span>
                        ) : null}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          {p.location || '-'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {isLow && (
                            <button
                              onClick={() => onQuickIn(p.sku)}
                              className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800/60"
                            >
                              + รับเข้า
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            title="แก้ไขข้อมูล"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                            title="ลบรายการ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add / Edit Product Modal */}
      {(isAddingNew || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {isAddingNew ? 'เพิ่มสินค้าใหม่ลงคลัง' : `แก้ไขข้อมูลสินค้า (${editingProduct?.sku})`}
              </h3>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingProduct(null);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 rounded-xl text-xs font-semibold text-red-700 dark:text-red-300">
                  {formError}
                </div>
              )}

              {/* Product Image Section */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    รูปภาพสินค้า (Product Photo)
                  </label>
                  {formImageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormImageUrl('')}
                      className="text-[11px] font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline"
                    >
                      ลบรูปภาพ
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <ProductThumbnail
                    src={formImageUrl}
                    alt={formName || 'ตัวอย่างรูปสินค้า'}
                    size="lg"
                    enableZoom
                    fallbackCategory={formCategory}
                  />

                  <div className="flex-1 space-y-2 min-w-0">
                    <input
                      type="text"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="วาง URL รูปภาพ (https://...) หรือคลิกถ่ายรูปด้านล่าง"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800 dark:text-slate-200"
                    />

                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg shadow-2xs transition-colors">
                        <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{isCompressingImg ? 'กำลังประมวลผลรูป...' : 'ถ่ายภาพ / อัปโหลดไฟล์'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">รองรับกล้องมือถือและไฟล์ JPG/PNG</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    รหัสสินค้า (Code) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    disabled={!isAddingNew}
                    placeholder="เช่น CODE-001"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-900 dark:text-white disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    หมวดหมู่
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="เช่น บรรจุภัณฑ์"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ชื่อสินค้า <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="เช่น กล่องกระดาษลูกฟูก 00"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    สต็อกปัจจุบัน
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    เกณฑ์ขั้นต่ำ (Min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    หน่วยนับ
                  </label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="เช่น ชิ้น, ลัง"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ราคาขายต่อหน่วย (฿)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ต้นทุนต่อหน่วย (฿)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ตำแหน่งจัดเก็บ / ชั้นวาง
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="เช่น A-01-02"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    รหัสบาร์โค้ด / QR Code
                  </label>
                  <input
                    type="text"
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    placeholder="เช่น 885001100001"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 disabled:opacity-50 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  {isSaving ? 'กำลังบันทึกลง Sheets...' : 'บันทึกข้อมูลสินค้า'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!productToDelete}
        title="ยืนยันการลบรายการสินค้า"
        message={`ต้องการลบสินค้า "${productToDelete?.name}" (${productToDelete?.sku}) ออกจากฐานข้อมูล Google Sheets หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
        confirmLabel="ยืนยันลบสินค้า"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setProductToDelete(null)}
      />

      {/* Barcode scanner */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(code) => {
          setIsScannerOpen(false);
          setSearchQuery(code);
        }}
      />
    </div>
  );
};
