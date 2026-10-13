import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setAccessToken,
  createDemoSession
} from './services/auth';
import {
  GoogleSheetsService,
  INITIAL_SAMPLE_PRODUCTS,
  INITIAL_SAMPLE_TRANSACTIONS,
  INITIAL_SAMPLE_SUPPLIERS,
  INITIAL_SAMPLE_CUSTOMERS
} from './services/googleSheets';
import { Product, Transaction, Supplier, Customer, SheetInfo } from './types/warehouse';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { GoodsInView } from './components/GoodsInView';
import { GoodsOutView } from './components/GoodsOutView';
import { StockMasterView } from './components/StockMasterView';
import { PartnersView } from './components/PartnersView';
import { ReportsView } from './components/ReportsView';
import { LoginScreen } from './components/LoginScreen';
import { SheetSettingsModal } from './components/SheetSettingsModal';
import { RefreshCw, AlertCircle } from 'lucide-react';

const STORAGE_KEY_SHEET_ID = 'warehouse_spreadsheet_id';
const STORAGE_KEY_THEME = 'warehouse_theme';

export default function App() {
  // Theme state with localStorage & system preference fallback
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches || false;
    }
    return false;
  });

  // Sync dark class on <html> element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // App Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [prefilledSkuForIn, setPrefilledSkuForIn] = useState<string>('');

  // Warehouse Data state
  const [products, setProducts] = useState<Product[]>(INITIAL_SAMPLE_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_SAMPLE_TRANSACTIONS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SAMPLE_SUPPLIERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_SAMPLE_CUSTOMERS);
  const [sheetInfo, setSheetInfo] = useState<SheetInfo | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Settings Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 1. Initialize Auth on Mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setIsAuthLoading(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setIsAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Load or Auto-Provision Google Sheet in target folder when user logs in
  const loadOrInitSheet = useCallback(async (authToken: string) => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      let savedSheetId = localStorage.getItem(STORAGE_KEY_SHEET_ID);
      let targetInfo: SheetInfo | null = null;

      if (savedSheetId) {
        targetInfo = {
          spreadsheetId: savedSheetId,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${savedSheetId}/edit`,
          title: '📦 Warehouse Inventory Database'
        };
      } else {
        // Try to find inside user's target folder
        targetInfo = await GoogleSheetsService.findExistingSpreadsheet(authToken);
      }

      // If still none, create a brand new Google Sheet directly inside folder 153xVR1YRvxFFK0xrF7XosuFy-2Y0Xo7o
      if (!targetInfo) {
        targetInfo = await GoogleSheetsService.createNewSpreadsheet(authToken);
      }

      // Save ID
      localStorage.setItem(STORAGE_KEY_SHEET_ID, targetInfo.spreadsheetId);
      setSheetInfo({
        ...targetInfo,
        lastSyncedAt: new Date().toISOString()
      });

      // Fetch warehouse data from sheet
      const data = await GoogleSheetsService.fetchWarehouseData(authToken, targetInfo.spreadsheetId);
      if (data.products.length > 0) setProducts(data.products);
      if (data.transactions.length > 0) setTransactions(data.transactions);
      if (data.suppliers.length > 0) setSuppliers(data.suppliers);
      if (data.customers.length > 0) setCustomers(data.customers);
    } catch (err: any) {
      console.error('Error initializing Google Sheets database:', err);
      setDataError(err.message || 'ไม่สามารถโหลดข้อมูลจาก Google Sheets ได้');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadOrInitSheet(token);
    }
  }, [token, loadOrInitSheet]);

  // Handle Login
  const handleLogin = async () => {
    const result = await googleSignIn();
    if (result) {
      setUser(result.user);
      setToken(result.accessToken);
    }
  };

  // Handle Demo Mode (Local Testing)
  const handleDemoLogin = () => {
    const demo = createDemoSession();
    setUser(demo.user);
    setToken(null);
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
  };

  // Refresh data from Google Sheets
  const handleRefreshData = async () => {
    if (!token || !sheetInfo) return;
    setIsSyncing(true);
    setDataError(null);
    try {
      const data = await GoogleSheetsService.fetchWarehouseData(token, sheetInfo.spreadsheetId);
      setProducts(data.products);
      setTransactions(data.transactions);
      setSuppliers(data.suppliers);
      setCustomers(data.customers);
      setSheetInfo(prev => prev ? { ...prev, lastSyncedAt: new Date().toISOString() } : null);
    } catch (err: any) {
      setDataError(err.message || 'ซิงค์ข้อมูลไม่สำเร็จ');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // Create new Sheet in Drive Folder
  const handleCreateNewSheet = async () => {
    if (!token) return;
    setIsSyncing(true);
    setDataError(null);
    try {
      const newSheet = await GoogleSheetsService.createNewSpreadsheet(token);
      localStorage.setItem(STORAGE_KEY_SHEET_ID, newSheet.spreadsheetId);
      setSheetInfo(newSheet);
      setProducts(INITIAL_SAMPLE_PRODUCTS);
      setTransactions(INITIAL_SAMPLE_TRANSACTIONS);
      setSuppliers(INITIAL_SAMPLE_SUPPLIERS);
      setCustomers(INITIAL_SAMPLE_CUSTOMERS);
    } catch (err: any) {
      setDataError(err.message || 'สร้าง Sheet ใหม่ไม่สำเร็จ');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // Connect custom Sheet ID
  const handleConnectCustomSheet = async (sheetId: string) => {
    if (!token) return;
    setIsSyncing(true);
    setDataError(null);
    try {
      const data = await GoogleSheetsService.fetchWarehouseData(token, sheetId);
      localStorage.setItem(STORAGE_KEY_SHEET_ID, sheetId);
      setSheetInfo({
        spreadsheetId: sheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
        title: 'Custom Warehouse Sheet',
        lastSyncedAt: new Date().toISOString()
      });
      setProducts(data.products);
      setTransactions(data.transactions);
      setSuppliers(data.suppliers);
      setCustomers(data.customers);
    } catch (err: any) {
      setDataError(err.message || 'ไม่สามารถเชื่อมต่อไฟล์ที่ระบุได้');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // Record Goods In (รับเข้า)
  const handleRecordGoodsIn = async (txData: Omit<Transaction, 'tx_id' | 'timestamp'>) => {
    const newTxId = `TX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(transactions.length + 1).padStart(3, '0')}`;
    const newTx: Transaction = {
      ...txData,
      tx_id: newTxId,
      timestamp: new Date().toISOString()
    };

    // Optimistic local update
    const updatedProducts = products.map((p) => {
      if (p.sku === newTx.sku) {
        return {
          ...p,
          current_stock: p.current_stock + newTx.quantity,
          unit_cost: newTx.unit_price || p.unit_cost,
          updated_at: new Date().toISOString()
        };
      }
      return p;
    });

    setTransactions([newTx, ...transactions]);
    setProducts(updatedProducts);

    // Sync to Google Sheets
    if (token && sheetInfo) {
      setIsSyncing(true);
      try {
        await GoogleSheetsService.recordTransaction(token, sheetInfo.spreadsheetId, newTx, updatedProducts);
      } catch (err: any) {
        console.error('Failed to sync transaction to Google Sheets:', err);
        setDataError(`บันทึกข้อมูลในระบบสำเร็จ แต่พบปัญหาการเขียนลง Google Sheet: ${err.message}`);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Record Goods Out (เบิกจ่าย)
  const handleRecordGoodsOut = async (txData: Omit<Transaction, 'tx_id' | 'timestamp'>) => {
    const newTxId = `TX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(transactions.length + 1).padStart(3, '0')}`;
    const newTx: Transaction = {
      ...txData,
      tx_id: newTxId,
      timestamp: new Date().toISOString()
    };

    // Optimistic local update
    const updatedProducts = products.map((p) => {
      if (p.sku === newTx.sku) {
        return {
          ...p,
          current_stock: Math.max(0, p.current_stock - newTx.quantity),
          updated_at: new Date().toISOString()
        };
      }
      return p;
    });

    setTransactions([newTx, ...transactions]);
    setProducts(updatedProducts);

    // Sync to Google Sheets
    if (token && sheetInfo) {
      setIsSyncing(true);
      try {
        await GoogleSheetsService.recordTransaction(token, sheetInfo.spreadsheetId, newTx, updatedProducts);
      } catch (err: any) {
        console.error('Failed to sync transaction to Google Sheets:', err);
        setDataError(`บันทึกข้อมูลในระบบสำเร็จ แต่พบปัญหาการเขียนลง Google Sheet: ${err.message}`);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = async (product: Product, isNew: boolean) => {
    let updatedProducts: Product[];
    if (isNew) {
      updatedProducts = [...products, product];
    } else {
      updatedProducts = products.map(p => (p.sku === product.sku ? product : p));
    }

    setProducts(updatedProducts);

    if (token && sheetInfo) {
      setIsSyncing(true);
      try {
        await GoogleSheetsService.syncProducts(token, sheetInfo.spreadsheetId, updatedProducts);
      } catch (err: any) {
        console.error('Failed to sync product to Google Sheets:', err);
        setDataError(`อัปเดตข้อมูลสำเร็จ แต่ไม่สามารถบันทึกลง Google Sheet ได้: ${err.message}`);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Delete Product
  const handleDeleteProduct = async (sku: string) => {
    const updatedProducts = products.filter(p => p.sku !== sku);
    setProducts(updatedProducts);

    if (token && sheetInfo) {
      setIsSyncing(true);
      try {
        await GoogleSheetsService.syncProducts(token, sheetInfo.spreadsheetId, updatedProducts);
      } catch (err: any) {
        console.error('Failed to sync deletion to Google Sheets:', err);
        setDataError(`ไม่สามารถบันทึกการลบลง Google Sheet: ${err.message}`);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Save Supplier
  const handleSaveSupplier = async (supplier: Supplier, isNew: boolean) => {
    let updated: Supplier[];
    if (isNew) {
      updated = [...suppliers, supplier];
    } else {
      updated = suppliers.map(s => (s.id === supplier.id ? supplier : s));
    }
    setSuppliers(updated);

    if (token && sheetInfo) {
      setIsSyncing(true);
      try {
        await GoogleSheetsService.syncSuppliers(token, sheetInfo.spreadsheetId, updated);
      } catch (err: any) {
        console.error('Failed to sync supplier to Google Sheets:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Delete Supplier
  const handleDeleteSupplier = async (id: string) => {
    const updated = suppliers.filter(s => s.id !== id);
    setSuppliers(updated);

    if (token && sheetInfo) {
      setIsSyncing(true);
      try {
        await GoogleSheetsService.syncSuppliers(token, sheetInfo.spreadsheetId, updated);
      } catch (err: any) {
        console.error('Failed to sync deletion to Google Sheets:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Save Customer
  const handleSaveCustomer = async (customer: Customer, isNew: boolean) => {
    let updated: Customer[];
    if (isNew) {
      updated = [...customers, customer];
    } else {
      updated = customers.map(c => (c.id === customer.id ? customer : c));
    }
    setCustomers(updated);

    if (token && sheetInfo) {
      setIsSyncing(true);
      try {
        await GoogleSheetsService.syncCustomers(token, sheetInfo.spreadsheetId, updated);
      } catch (err: any) {
        console.error('Failed to sync customer to Google Sheets:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (id: string) => {
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);

    if (token && sheetInfo) {
      setIsSyncing(true);
      try {
        await GoogleSheetsService.syncCustomers(token, sheetInfo.spreadsheetId, updated);
      } catch (err: any) {
        console.error('Failed to sync deletion to Google Sheets:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Quick In from Dashboard
  const handleQuickIn = (sku: string) => {
    setPrefilledSkuForIn(sku);
    setActiveTab('in');
  };

  // Low stock count for badge
  const lowStockCount = products.filter(p => p.current_stock <= p.min_stock).length;

  // Render Login screen if not signed in
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-300">กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} onDemoLogin={handleDemoLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Bar Navigation */}
      <Navbar
        user={user}
        sheetInfo={sheetInfo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSheetSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
        isSyncing={isSyncing}
        lowStockCount={lowStockCount}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Sheet Error Notice (if any) */}
      {dataError && (
        <div className="bg-red-50 dark:bg-red-950/60 border-b border-red-200 dark:border-red-900/50 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-red-700 dark:text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{dataError}</span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="font-bold underline ml-2 shrink-0 hover:text-red-900 dark:hover:text-red-100"
            >
              ตั้งค่า Sheet ใหม่
            </button>
          </div>
        </div>
      )}

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24 lg:pb-8">
        {isLoadingData ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">กำลังโหลดและซิงค์ฐานข้อมูล Google Sheets...</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">กำลังเชื่อมต่อโฟลเดอร์ Google Drive และดึงข้อมูล</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                products={products}
                transactions={transactions}
                onNavigate={setActiveTab}
                onOpenQuickIn={handleQuickIn}
                spreadsheetUrl={sheetInfo?.spreadsheetUrl}
              />
            )}

            {activeTab === 'stock' && (
              <StockMasterView
                products={products}
                onSaveProduct={handleSaveProduct}
                onDeleteProduct={handleDeleteProduct}
                onQuickIn={handleQuickIn}
              />
            )}

            {activeTab === 'in' && (
              <GoodsInView
                products={products}
                suppliers={suppliers}
                userEmail={user.email || 'operator'}
                onRecordGoodsIn={handleRecordGoodsIn}
                prefilledSku={prefilledSkuForIn}
                onClearPrefill={() => setPrefilledSkuForIn('')}
              />
            )}

            {activeTab === 'out' && (
              <GoodsOutView
                products={products}
                customers={customers}
                userEmail={user.email || 'operator'}
                onRecordGoodsOut={handleRecordGoodsOut}
              />
            )}

            {activeTab === 'partners' && (
              <PartnersView
                suppliers={suppliers}
                customers={customers}
                onSaveSupplier={handleSaveSupplier}
                onDeleteSupplier={handleDeleteSupplier}
                onSaveCustomer={handleSaveCustomer}
                onDeleteCustomer={handleDeleteCustomer}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                products={products}
                transactions={transactions}
                spreadsheetUrl={sheetInfo?.spreadsheetUrl}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowStockCount={lowStockCount}
      />

      {/* Sheet Settings Modal */}
      <SheetSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        sheetInfo={sheetInfo}
        onRefreshData={handleRefreshData}
        onCreateNewSheet={handleCreateNewSheet}
        onConnectCustomSheet={handleConnectCustomSheet}
        isSyncing={isSyncing}
      />
    </div>
  );
}
