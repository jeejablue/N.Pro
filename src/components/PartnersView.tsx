import React, { useState, useMemo } from 'react';
import { Supplier, Customer } from '../types/warehouse';
import {
  Users,
  Truck,
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  X
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface PartnersViewProps {
  suppliers: Supplier[];
  customers: Customer[];
  onSaveSupplier: (supplier: Supplier, isNew: boolean) => Promise<void>;
  onDeleteSupplier: (id: string) => Promise<void>;
  onSaveCustomer: (customer: Customer, isNew: boolean) => Promise<void>;
  onDeleteCustomer: (id: string) => Promise<void>;
}

export const PartnersView: React.FC<PartnersViewProps> = ({
  suppliers,
  customers,
  onSaveSupplier,
  onDeleteSupplier,
  onSaveCustomer,
  onDeleteCustomer
}) => {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'customers'>('suppliers');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingItem, setEditingItem] = useState<Supplier | Customer | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: 'supplier' | 'customer' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    if (!searchQuery) return suppliers;
    const q = searchQuery.toLowerCase();
    return suppliers.filter(
      s =>
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        (s.contact_person && s.contact_person.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q))
    );
  }, [suppliers, searchQuery]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      c =>
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.contact_person && c.contact_person.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
    );
  }, [customers, searchQuery]);

  const openAddModal = () => {
    setFormError(null);
    if (activeTab === 'suppliers') {
      const nextNum = suppliers.length + 1;
      setFormId(`SUP-${String(nextNum).padStart(3, '0')}`);
    } else {
      const nextNum = customers.length + 1;
      setFormId(`CUST-${String(nextNum).padStart(3, '0')}`);
    }
    setFormName('');
    setFormContact('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormNotes('');
    setIsAddingNew(true);
    setEditingItem(null);
  };

  const openEditModal = (item: Supplier | Customer) => {
    setFormError(null);
    setFormId(item.id);
    setFormName(item.name);
    setFormContact(item.contact_person || '');
    setFormPhone(item.phone || '');
    setFormEmail(item.email || '');
    setFormAddress(item.address || '');
    setFormNotes(item.notes || '');
    setEditingItem(item);
    setIsAddingNew(false);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const cleanName = formName.trim();
    if (!cleanName) {
      setFormError('กรุณากรอกชื่อบริษัทหรือชื่อคู่ค้า');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        id: formId.trim(),
        name: cleanName,
        contact_person: formContact.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        address: formAddress.trim(),
        notes: formNotes.trim(),
        updated_at: new Date().toISOString()
      };

      if (activeTab === 'suppliers') {
        await onSaveSupplier(payload, isAddingNew);
      } else {
        await onSaveCustomer(payload, isAddingNew);
      }

      setIsAddingNew(false);
      setEditingItem(null);
    } catch (err: any) {
      setFormError(err.message || 'บันทึกข้อมูลไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      if (itemToDelete.type === 'supplier') {
        await onDeleteSupplier(itemToDelete.id);
      } else {
        await onDeleteCustomer(itemToDelete.id);
      }
      setItemToDelete(null);
    } catch (err: any) {
      alert(`ไม่สามารถลบได้: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            จัดการข้อมูลคู่ค้า (Suppliers & Customers)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            ฐานข้อมูลผู้จัดจำหน่ายและลูกค้า เชื่อมต่อกับระบบรับเข้าและเบิกจ่ายสินค้า
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'suppliers' ? 'เพิ่ม Supplier ใหม่' : 'เพิ่ม Customer ใหม่'}
        </button>
      </div>

      {/* Segmented Tab Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => {
            setActiveTab('suppliers');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'suppliers'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          ผู้จัดจำหน่าย / ซัพพลายเออร์ ({suppliers.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('customers');
            setSearchQuery('');
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'customers'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          ลูกค้า / แผนกผู้เบิก ({customers.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'suppliers'
                ? 'ค้นหา Supplier ด้วยรหัส, ชื่อบริษัท, ผู้ติดต่อ หรือเบอร์โทร...'
                : 'ค้นหา Customer ด้วยรหัส, ชื่อลูกค้า, ผู้ติดต่อ หรือเบอร์โทร...'
            }
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Suppliers Tab Content */}
      {activeTab === 'suppliers' && (
        <>
          {filteredSuppliers.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl transition-colors">
              <Truck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">ไม่พบรายชื่อซัพพลายเออร์</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">คลิกปุ่ม "เพิ่ม Supplier ใหม่" เพื่อสร้างรายการ</p>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
                {filteredSuppliers.map((s) => (
                  <div key={s.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                          {s.id}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">{s.name}</h3>
                        {s.contact_person && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">ผู้ติดต่อ: {s.contact_person}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setItemToDelete({ id: s.id, name: s.name, type: 'supplier' })}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {s.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span>{s.phone}</span>
                        </div>
                      )}
                      {s.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span className="truncate">{s.email}</span>
                        </div>
                      )}
                      {s.address && (
                        <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{s.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">รหัส</th>
                      <th className="py-3 px-4">ชื่อบริษัท / ซัพพลายเออร์</th>
                      <th className="py-3 px-4">ผู้ติดต่อ</th>
                      <th className="py-3 px-4">เบอร์โทรศัพท์</th>
                      <th className="py-3 px-4">อีเมล</th>
                      <th className="py-3 px-4">ที่อยู่</th>
                      <th className="py-3 px-4 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    {filteredSuppliers.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded font-semibold border border-transparent dark:border-emerald-800/40">
                            {s.id}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white max-w-[220px] truncate">{s.name}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{s.contact_person || '-'}</td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">{s.phone || '-'}</td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-[160px] truncate">{s.email || '-'}</td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">{s.address || '-'}</td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditModal(s)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                              title="แก้ไขข้อมูล"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setItemToDelete({ id: s.id, name: s.name, type: 'supplier' })}
                              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
                              title="ลบ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* Customers Tab Content */}
      {activeTab === 'customers' && (
        <>
          {filteredCustomers.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl transition-colors">
              <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">ไม่พบรายชื่อลูกค้า / แผนกผู้เบิก</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">คลิกปุ่ม "เพิ่ม Customer ใหม่" เพื่อสร้างรายการ</p>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
                {filteredCustomers.map((c) => (
                  <div key={c.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                          {c.id}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">{c.name}</h3>
                        {c.contact_person && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">ผู้ติดต่อ: {c.contact_person}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setItemToDelete({ id: c.id, name: c.name, type: 'customer' })}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {c.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                      {c.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span className="truncate">{c.email}</span>
                        </div>
                      )}
                      {c.address && (
                        <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{c.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">รหัส</th>
                      <th className="py-3 px-4">ชื่อลูกค้า / แผนกผู้เบิก</th>
                      <th className="py-3 px-4">ผู้ติดต่อ</th>
                      <th className="py-3 px-4">เบอร์โทรศัพท์</th>
                      <th className="py-3 px-4">อีเมล</th>
                      <th className="py-3 px-4">ที่อยู่ / แผนก</th>
                      <th className="py-3 px-4 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded font-semibold border border-transparent dark:border-amber-800/40">
                            {c.id}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white max-w-[220px] truncate">{c.name}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{c.contact_person || '-'}</td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">{c.phone || '-'}</td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-[160px] truncate">{c.email || '-'}</td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">{c.address || '-'}</td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditModal(c)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                              title="แก้ไขข้อมูล"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setItemToDelete({ id: c.id, name: c.name, type: 'customer' })}
                              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
                              title="ลบ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* Add / Edit Modal */}
      {(isAddingNew || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {isAddingNew
                  ? activeTab === 'suppliers'
                    ? 'เพิ่ม Supplier ใหม่'
                    : 'เพิ่ม Customer ใหม่'
                  : `แก้ไขข้อมูล (${editingItem?.id})`}
              </h3>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingItem(null);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 rounded-xl text-xs font-semibold text-red-700 dark:text-red-300">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    รหัสคู่ค้า <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    disabled={!isAddingNew}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-900 dark:text-white disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ชื่อผู้ติดต่อ
                  </label>
                  <input
                    type="text"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="เช่น คุณสมศักดิ์"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {activeTab === 'suppliers' ? 'ชื่อบริษัท / ซัพพลายเออร์' : 'ชื่อลูกค้า / แผนกผู้เบิก'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={activeTab === 'suppliers' ? 'เช่น บจก. วีอาร์ แพ็คเกจจิ้ง' : 'เช่น แผนกจัดส่ง หรือ บจก. ลูกค้า'}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="เช่น 02-123-4567"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ที่อยู่ / สถานที่จัดส่ง
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="ที่อยู่ เลขที่ ถนน อำเภอ จังหวัด"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  หมายเหตุ / เงื่อนไข
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="เช่น เครดิต 30 วัน หรือ ส่งเข้าคลังย่อย 2"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingItem(null);
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
                  {isSaving ? 'กำลังบันทึกลง Sheets...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="ยืนยันการลบรายชื่อคู่ค้า"
        message={`ต้องการลบ "${itemToDelete?.name}" (${itemToDelete?.id}) ออกจาก Google Sheets หรือไม่?`}
        confirmLabel="ยืนยันลบ"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
