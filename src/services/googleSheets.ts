import { Product, Transaction, Supplier, Customer, SheetInfo } from '../types/warehouse';

export const TARGET_DRIVE_FOLDER_ID = '153xVR1YRvxFFK0xrF7XosuFy-2Y0Xo7o';
export const TARGET_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${TARGET_DRIVE_FOLDER_ID}`;
const DEFAULT_SHEET_NAME = '📦 Warehouse Inventory Database';

export const INITIAL_SAMPLE_PRODUCTS: Product[] = [
  {
    sku: 'CODE-001',
    name: 'กล่องกระดาษลูกฟูก 00 (A)',
    category: 'บรรจุภัณฑ์',
    current_stock: 450,
    min_stock: 100,
    unit: 'ใบ',
    unit_price: 12,
    unit_cost: 7.5,
    location: 'A-01-01',
    barcode: '885001100001',
    image_url: '/src/assets/images/box_carton_1791873341168.jpg',
    updated_at: new Date().toISOString()
  },
  {
    sku: 'CODE-002',
    name: 'เทปปิดกล่องใส 2 นิ้ว 100 หลา',
    category: 'วัสดุสิ้นเปลือง',
    current_stock: 18,
    min_stock: 30, // Low stock trigger
    unit: 'ม้วน',
    unit_price: 45,
    unit_cost: 28,
    location: 'A-01-03',
    barcode: '885001100002',
    image_url: '/src/assets/images/packing_tape_1791873341029.jpg',
    updated_at: new Date().toISOString()
  },
  {
    sku: 'CODE-003',
    name: 'พลาสติกกันกระแทก แอร์บับเบิ้ล 65cm x 100m',
    category: 'บรรจุภัณฑ์',
    current_stock: 8,
    min_stock: 15, // Low stock trigger
    unit: 'ม้วน',
    unit_price: 250,
    unit_cost: 175,
    location: 'B-02-01',
    barcode: '885001100003',
    image_url: '/src/assets/images/bubble_wrap_1791873341010.jpg',
    updated_at: new Date().toISOString()
  },
  {
    sku: 'CODE-004',
    name: 'สายรัดพลาสติก PP 12 มม. สีดำ',
    category: 'อุปกรณ์คลัง',
    current_stock: 65,
    min_stock: 20,
    unit: 'ม้วน',
    unit_price: 320,
    unit_cost: 210,
    location: 'B-03-02',
    barcode: '885001100004',
    image_url: '/src/assets/images/packing_tape_1791873341029.jpg',
    updated_at: new Date().toISOString()
  },
  {
    sku: 'CODE-005',
    name: 'สติกเกอร์บาร์โค้ดความร้อน Direct Thermal 100x150mm',
    category: 'วัสดุสิ้นเปลือง',
    current_stock: 5,
    min_stock: 25, // Critical low stock trigger
    unit: 'ม้วน',
    unit_price: 130,
    unit_cost: 85,
    location: 'A-02-04',
    barcode: '885001100005',
    image_url: '/src/assets/images/barcode_labels_1791873342713.jpg',
    updated_at: new Date().toISOString()
  },
  {
    sku: 'CODE-006',
    name: 'พาเลทพลาสติกอุตสาหกรรม 100x120 ซม.',
    category: 'อุปกรณ์คลัง',
    current_stock: 42,
    min_stock: 10,
    unit: 'ตัว',
    unit_price: 850,
    unit_cost: 650,
    location: 'Zone-PAL-01',
    barcode: '885001100006',
    image_url: '/src/assets/images/plastic_pallet_1791873342828.jpg',
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    tx_id: 'TX-20261010-001',
    timestamp: '2026-10-10T09:30:00.000Z',
    type: 'IN',
    sku: 'CODE-001',
    product_name: 'กล่องกระดาษลูกฟูก 00 (A)',
    quantity: 500,
    unit: 'ใบ',
    unit_price: 7.5,
    total_amount: 3750,
    reference_no: 'PO-2026-1001',
    operator_email: 'jeejablue@gmail.com',
    department: 'บจก. ไทยแพ็คเกจจิ้ง ซัพพลาย',
    notes: 'รับสินค้าเข้าคลังปกติ ล็อตผลิตใหม่'
  },
  {
    tx_id: 'TX-20261011-002',
    timestamp: '2026-10-11T14:15:00.000Z',
    type: 'OUT',
    sku: 'CODE-001',
    product_name: 'กล่องกระดาษลูกฟูก 00 (A)',
    quantity: 50,
    unit: 'ใบ',
    unit_price: 12,
    total_amount: 600,
    reference_no: 'REQ-2026-089',
    operator_email: 'jeejablue@gmail.com',
    department: 'แผนกจัดส่งสินค้า (Fulfillment)',
    notes: 'เบิกแพ็คออเดอร์แคมเปญ 10.10'
  },
  {
    tx_id: 'TX-20261012-003',
    timestamp: '2026-10-12T11:00:00.000Z',
    type: 'OUT',
    sku: 'CODE-002',
    product_name: 'เทปปิดกล่องใส 2 นิ้ว 100 หลา',
    quantity: 12,
    unit: 'ม้วน',
    unit_price: 45,
    total_amount: 540,
    reference_no: 'REQ-2026-092',
    operator_email: 'jeejablue@gmail.com',
    department: 'แผนกจัดส่งสินค้า (Fulfillment)',
    notes: 'เบิกใช้งานประจำสัปดาห์'
  }
];

export const INITIAL_SAMPLE_SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'บจก. ไทยแพ็คเกจจิ้ง ซัพพลาย',
    contact_person: 'คุณวิชัย เจริญกิจ',
    phone: '02-123-4567',
    email: 'sales@thaipackaging.co.th',
    address: '88/1 ถ.บางนา-ตราด กม.14 บางพลี สมุทรปราการ',
    notes: 'ผู้จัดจำหน่ายกล่องกระดาษและกล่องลูกฟูก เครดิต 30 วัน',
    updated_at: new Date().toISOString()
  },
  {
    id: 'SUP-002',
    name: 'บจก. สยามเทป แอนด์ ฟิล์ม อุตสาหกรรม',
    contact_person: 'คุณสุภาพร มั่นคง',
    phone: '02-987-6543',
    email: 'order@siamtape.com',
    address: '45 หมู่ 3 ถ.เพชรเกษม กระทุ่มแบน สมุทรสาคร',
    notes: 'ซัพพลายเออร์เทปปิดกล่อง ฟิล์มยืด และสายรัด PP',
    updated_at: new Date().toISOString()
  },
  {
    id: 'SUP-003',
    name: 'หจก. บับเบิ้ล แอนด์ พลาสติก โปรดักส์',
    contact_person: 'คุณสมชาย ยิ่งยวด',
    phone: '081-445-6789',
    email: 'contact@bubbleplastic.th',
    address: '120/5 ถ.รังสิต-นครนายก ธัญบุรี ปทุมธานี',
    notes: 'ผลิตแอร์บับเบิ้ลกันกระแทกและซองกันกระแทก',
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    name: 'แผนกจัดส่งสินค้า (Fulfillment)',
    contact_person: 'หัวหน้าแผนกจัดส่ง',
    phone: '02-000-1111 ต่อ 101',
    email: 'fulfillment@company.com',
    address: 'คลังสินค้า โซน F-01',
    notes: 'เบิกใช้งานสำหรับแพ็คพัสดุส่งลูกค้าประจำวัน',
    updated_at: new Date().toISOString()
  },
  {
    id: 'CUST-002',
    name: 'บจก. เอสเอ็มอี โลจิสติกส์ ไทยแลนด์',
    contact_person: 'คุณกิตติศักดิ์ พูลสวัสดิ์',
    phone: '089-987-1234',
    email: 'operations@smelogistics.th',
    address: '99/4 อาคารโลจิสติกส์ฮับ ถ.กิ่งแก้ว บางพลี สมุทรปราการ',
    notes: 'ลูกค้าซื้อส่งพาเลทและอุปกรณ์แพ็คเกจจิ้ง',
    updated_at: new Date().toISOString()
  },
  {
    id: 'CUST-003',
    name: 'ร้านค้าสาขา 1 (สยามสแควร์)',
    contact_person: 'คุณปิยะดา นวมินทร์',
    phone: '02-555-8899',
    email: 'branch1@company.com',
    address: 'อาคารสยามสแควร์วัน ชั้น 2 เขตปทุมวัน กรุงเทพฯ',
    notes: 'สาขาหน้าร้าน เบิกกล่องและเทปประจำเดือน',
    updated_at: new Date().toISOString()
  }
];

export class GoogleSheetsService {
  /**
   * Search user's target Google Drive folder for an existing Warehouse sheet.
   */
  static async findExistingSpreadsheet(accessToken: string): Promise<SheetInfo | null> {
    try {
      // 1. Search inside the user's specific target Google Drive folder first!
      const folderQuery = encodeURIComponent(`'${TARGET_DRIVE_FOLDER_ID}' in parents and mimeType = 'application/vnd.google.apps.spreadsheet' and trashed = false`);
      const folderRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${folderQuery}&fields=files(id,name,webViewLink)&pageSize=5`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (folderRes.ok) {
        const folderData = await folderRes.json();
        if (folderData.files && folderData.files.length > 0) {
          const file = folderData.files[0];
          return {
            spreadsheetId: file.id,
            spreadsheetUrl: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
            title: file.name,
            folderId: TARGET_DRIVE_FOLDER_ID,
            folderUrl: TARGET_DRIVE_FOLDER_URL
          };
        }
      }

      // 2. Fallback: Search globally for default sheet name if not found in folder
      const globalQuery = encodeURIComponent(`name = '${DEFAULT_SHEET_NAME}' and mimeType = 'application/vnd.google.apps.spreadsheet' and trashed = false`);
      const globalRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${globalQuery}&fields=files(id,name,webViewLink,parents)&pageSize=5`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (globalRes.ok) {
        const globalData = await globalRes.json();
        if (globalData.files && globalData.files.length > 0) {
          const file = globalData.files[0];
          return {
            spreadsheetId: file.id,
            spreadsheetUrl: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
            title: file.name,
            folderId: TARGET_DRIVE_FOLDER_ID,
            folderUrl: TARGET_DRIVE_FOLDER_URL
          };
        }
      }

      return null;
    } catch (e) {
      console.warn('Could not search Drive for existing sheets:', e);
      return null;
    }
  }

  /**
   * Create a brand new Google Sheet database directly inside folder `153xVR1YRvxFFK0xrF7XosuFy-2Y0Xo7o`
   * with Products, Transactions, Suppliers, and Customers sheets.
   */
  static async createNewSpreadsheet(accessToken: string): Promise<SheetInfo> {
    // 1. Create Google Spreadsheet directly inside folder 153xVR1YRvxFFK0xrF7XosuFy-2Y0Xo7o using Google Drive API v3
    let spreadsheetId = '';
    let spreadsheetUrl = '';

    try {
      const driveCreateRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: DEFAULT_SHEET_NAME,
          mimeType: 'application/vnd.google.apps.spreadsheet',
          parents: [TARGET_DRIVE_FOLDER_ID]
        })
      });

      if (driveCreateRes.ok) {
        const driveData = await driveCreateRes.json();
        spreadsheetId = driveData.id;
        spreadsheetUrl = driveData.webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
      } else {
        console.warn('Direct Drive folder creation response not OK, attempting Sheets API fallback:', await driveCreateRes.text());
      }
    } catch (driveErr) {
      console.warn('Drive API direct create error, trying Sheets API:', driveErr);
    }

    // Fallback: If Drive creation failed, create via Sheets API and then move to folder
    if (!spreadsheetId) {
      const sheetsCreateRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: { title: DEFAULT_SHEET_NAME }
        })
      });

      if (!sheetsCreateRes.ok) {
        const err = await sheetsCreateRes.json();
        throw new Error(err.error?.message || 'Failed to create Google Spreadsheet');
      }

      const created = await sheetsCreateRes.json();
      spreadsheetId = created.spreadsheetId;
      spreadsheetUrl = created.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

      // Move into target folder
      try {
        await fetch(`https://www.googleapis.com/drive/v3/files/${spreadsheetId}?addParents=${TARGET_DRIVE_FOLDER_ID}&fields=id,parents`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      } catch (moveErr) {
        console.warn('Could not move file to target folder:', moveErr);
      }
    }

    // 2. Configure sheets: Products, Transactions, Suppliers, Customers
    await this.setupSheetTabsAndHeaders(accessToken, spreadsheetId);

    return {
      spreadsheetId,
      spreadsheetUrl,
      title: DEFAULT_SHEET_NAME,
      folderId: TARGET_DRIVE_FOLDER_ID,
      folderUrl: TARGET_DRIVE_FOLDER_URL,
      lastSyncedAt: new Date().toISOString()
    };
  }

  /**
   * Ensure Products, Transactions, Suppliers, and Customers tabs exist and populate headers & initial data for any missing tabs.
   * Preserves existing user data in tabs that already exist.
   */
  static async ensureAllTabsExist(accessToken: string, spreadsheetId: string): Promise<string[]> {
    try {
      // 1. Get existing sheet metadata
      const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!metaRes.ok) {
        console.warn('Could not fetch spreadsheet metadata:', await metaRes.text());
        return [];
      }

      const meta = await metaRes.json();
      const existingTitles: string[] = meta?.sheets?.map((s: any) => s.properties?.title) || [];

      const requiredTabs = ['Products', 'Transactions', 'Suppliers', 'Customers'];
      const missingTabs = requiredTabs.filter(tab => !existingTitles.includes(tab));

      if (missingTabs.length > 0) {
        const addSheetRequests = missingTabs.map(tab => ({
          addSheet: {
            properties: {
              title: tab,
              gridProperties: { frozenRowCount: 1 }
            }
          }
        }));

        const addRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ requests: addSheetRequests })
        });

        if (!addRes.ok) {
          console.warn('Could not add missing tabs via batchUpdate:', await addRes.text());
        }

        // Now populate headers & initial sample rows ONLY for the newly created tabs!
        const valueData: Array<{ range: string; values: any[][] }> = [];

        if (missingTabs.includes('Products')) {
          const productHeaders = [
            'Code', 'Name', 'Category', 'CurrentStock', 'MinStock', 'Unit', 'UnitPrice', 'UnitCost', 'Location', 'Barcode', 'ImageUrl', 'UpdatedAt'
          ];
          const productRows = INITIAL_SAMPLE_PRODUCTS.map(p => [
            p.sku, p.name, p.category, p.current_stock, p.min_stock, p.unit, p.unit_price, p.unit_cost || 0, p.location, p.barcode || '', p.image_url || '', p.updated_at
          ]);
          valueData.push({
            range: 'Products!A1:L' + (productRows.length + 1),
            values: [productHeaders, ...productRows]
          });
        }

        if (missingTabs.includes('Transactions')) {
          const txHeaders = [
            'TransactionID', 'Timestamp', 'Type', 'Code', 'ProductName', 'Quantity', 'Unit', 'UnitPrice', 'TotalAmount', 'ReferenceNo', 'OperatorEmail', 'Department', 'Notes'
          ];
          const txRows = INITIAL_SAMPLE_TRANSACTIONS.map(tx => [
            tx.tx_id, tx.timestamp, tx.type, tx.sku, tx.product_name, tx.quantity, tx.unit, tx.unit_price || 0, tx.total_amount || 0, tx.reference_no, tx.operator_email, tx.department || '', tx.notes || ''
          ]);
          valueData.push({
            range: 'Transactions!A1:M' + (txRows.length + 1),
            values: [txHeaders, ...txRows]
          });
        }

        if (missingTabs.includes('Suppliers')) {
          const supplierHeaders = [
            'SupplierID', 'Name', 'ContactPerson', 'Phone', 'Email', 'Address', 'Notes', 'UpdatedAt'
          ];
          const supplierRows = INITIAL_SAMPLE_SUPPLIERS.map(s => [
            s.id, s.name, s.contact_person || '', s.phone || '', s.email || '', s.address || '', s.notes || '', s.updated_at
          ]);
          valueData.push({
            range: 'Suppliers!A1:H' + (supplierRows.length + 1),
            values: [supplierHeaders, ...supplierRows]
          });
        }

        if (missingTabs.includes('Customers')) {
          const customerHeaders = [
            'CustomerID', 'Name', 'ContactPerson', 'Phone', 'Email', 'Address', 'Notes', 'UpdatedAt'
          ];
          const customerRows = INITIAL_SAMPLE_CUSTOMERS.map(c => [
            c.id, c.name, c.contact_person || '', c.phone || '', c.email || '', c.address || '', c.notes || '', c.updated_at
          ]);
          valueData.push({
            range: 'Customers!A1:H' + (customerRows.length + 1),
            values: [customerHeaders, ...customerRows]
          });
        }

        if (valueData.length > 0) {
          await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              valueInputOption: 'USER_ENTERED',
              data: valueData
            })
          });
        }
      }

      return [...existingTitles, ...missingTabs];
    } catch (e) {
      console.warn('Error ensuring sheet tabs exist:', e);
      return [];
    }
  }

  /**
   * Setup sheet tabs and headers wrapper for compatibility.
   */
  static async setupSheetTabsAndHeaders(accessToken: string, spreadsheetId: string): Promise<void> {
    await this.ensureAllTabsExist(accessToken, spreadsheetId);
  }

  /**
   * Fetch all warehouse products, transactions, suppliers, and customers.
   * Auto-provisions missing tabs (such as Suppliers or Customers) and handles any range issues with resilient fallbacks.
   */
  static async fetchWarehouseData(
    accessToken: string,
    spreadsheetId: string
  ): Promise<{ products: Product[]; transactions: Transaction[]; suppliers: Supplier[]; customers: Customer[] }> {
    // 1. Ensure all 4 required tabs exist first to prevent "Unable to parse range" error
    await this.ensureAllTabsExist(accessToken, spreadsheetId);

    // 2. Fetch value ranges with resilient batch + per-tab fallback
    const rangesToFetch = [
      'Products!A1:L1000',
      'Transactions!A1:M5000',
      'Suppliers!A1:H1000',
      'Customers!A1:H1000'
    ];

    let productsRange: any[][] = [];
    let txRange: any[][] = [];
    let supRange: any[][] = [];
    let custRange: any[][] = [];

    let batchOk = false;
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?` +
        rangesToFetch.map(r => `ranges=${encodeURIComponent(r)}`).join('&');
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (res.ok) {
        const data = await res.json();
        const valueRanges = data.valueRanges || [];
        productsRange = valueRanges[0]?.values || [];
        txRange = valueRanges[1]?.values || [];
        supRange = valueRanges[2]?.values || [];
        custRange = valueRanges[3]?.values || [];
        batchOk = true;
      }
    } catch (batchErr) {
      console.warn('Batch fetch failed, attempting per-tab query:', batchErr);
    }

    // Fallback: If batch failed for any reason, query each tab individually
    if (!batchOk) {
      const fetchTabSafe = async (tabRange: string): Promise<any[][]> => {
        try {
          const singleUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(tabRange)}`;
          const r = await fetch(singleUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
          if (r.ok) {
            const d = await r.json();
            return d.values || [];
          }
        } catch (err) {
          console.warn(`Safe fetch for ${tabRange} failed:`, err);
        }
        return [];
      };

      [productsRange, txRange, supRange, custRange] = await Promise.all([
        fetchTabSafe('Products!A1:L1000'),
        fetchTabSafe('Transactions!A1:M5000'),
        fetchTabSafe('Suppliers!A1:H1000'),
        fetchTabSafe('Customers!A1:H1000')
      ]);
    }

    // 1. Parse Products
    const products: Product[] = [];
    if (productsRange.length > 1) {
      for (let i = 1; i < productsRange.length; i++) {
        const row = productsRange[i];
        if (!row || !row[0]) continue;

        const col10 = String(row[10] || '').trim();
        const col11 = String(row[11] || '').trim();
        let imageUrl = '';
        let updatedAt = new Date().toISOString();

        if (col11) {
          imageUrl = col10;
          updatedAt = col11;
        } else if (col10) {
          if (col10.startsWith('http') || col10.startsWith('data:') || col10.startsWith('/')) {
            imageUrl = col10;
          } else {
            updatedAt = col10;
          }
        }

        products.push({
          sku: String(row[0]).trim(),
          name: String(row[1] || '').trim(),
          category: String(row[2] || 'ทั่วไป').trim(),
          current_stock: Number(row[3]) || 0,
          min_stock: Number(row[4]) || 0,
          unit: String(row[5] || 'ชิ้น').trim(),
          unit_price: Number(row[6]) || 0,
          unit_cost: Number(row[7]) || 0,
          location: String(row[8] || '').trim(),
          barcode: String(row[9] || '').trim(),
          image_url: imageUrl || undefined,
          updated_at: updatedAt
        });
      }
    }

    // 2. Parse Transactions
    const transactions: Transaction[] = [];
    if (txRange.length > 1) {
      for (let i = 1; i < txRange.length; i++) {
        const row = txRange[i];
        if (!row || !row[0]) continue;
        transactions.push({
          tx_id: String(row[0]).trim(),
          timestamp: String(row[1] || new Date().toISOString()),
          type: (String(row[2]).toUpperCase() === 'IN' ? 'IN' : 'OUT') as 'IN' | 'OUT',
          sku: String(row[3] || '').trim(),
          product_name: String(row[4] || '').trim(),
          quantity: Number(row[5]) || 0,
          unit: String(row[6] || 'ชิ้น').trim(),
          unit_price: Number(row[7]) || 0,
          total_amount: Number(row[8]) || 0,
          reference_no: String(row[9] || '').trim(),
          operator_email: String(row[10] || '').trim(),
          department: String(row[11] || '').trim(),
          notes: String(row[12] || '').trim()
        });
      }
    }

    // 3. Parse Suppliers
    const suppliers: Supplier[] = [];
    if (supRange.length > 1) {
      for (let i = 1; i < supRange.length; i++) {
        const row = supRange[i];
        if (!row || !row[0]) continue;
        suppliers.push({
          id: String(row[0]).trim(),
          name: String(row[1] || '').trim(),
          contact_person: String(row[2] || '').trim(),
          phone: String(row[3] || '').trim(),
          email: String(row[4] || '').trim(),
          address: String(row[5] || '').trim(),
          notes: String(row[6] || '').trim(),
          updated_at: String(row[7] || new Date().toISOString())
        });
      }
    }

    // 4. Parse Customers
    const customers: Customer[] = [];
    if (custRange.length > 1) {
      for (let i = 1; i < custRange.length; i++) {
        const row = custRange[i];
        if (!row || !row[0]) continue;
        customers.push({
          id: String(row[0]).trim(),
          name: String(row[1] || '').trim(),
          contact_person: String(row[2] || '').trim(),
          phone: String(row[3] || '').trim(),
          email: String(row[4] || '').trim(),
          address: String(row[5] || '').trim(),
          notes: String(row[6] || '').trim(),
          updated_at: String(row[7] || new Date().toISOString())
        });
      }
    }

    // Sort transactions latest first
    transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      products: products.length > 0 ? products : INITIAL_SAMPLE_PRODUCTS,
      transactions: transactions.length > 0 ? transactions : INITIAL_SAMPLE_TRANSACTIONS,
      suppliers: suppliers.length > 0 ? suppliers : INITIAL_SAMPLE_SUPPLIERS,
      customers: customers.length > 0 ? customers : INITIAL_SAMPLE_CUSTOMERS
    };
  }

  /**
   * Save all products to Products sheet.
   */
  static async syncProducts(accessToken: string, spreadsheetId: string, products: Product[]): Promise<void> {
    const productHeaders = [
      'Code', 'Name', 'Category', 'CurrentStock', 'MinStock', 'Unit', 'UnitPrice', 'UnitCost', 'Location', 'Barcode', 'ImageUrl', 'UpdatedAt'
    ];

    const rows = products.map(p => [
      p.sku, p.name, p.category, p.current_stock, p.min_stock, p.unit, p.unit_price, p.unit_cost || 0, p.location, p.barcode || '', p.image_url || '', p.updated_at
    ]);

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Products!A2:L1000:clear`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Products!A1:L${rows.length + 1}?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: `Products!A1:L${rows.length + 1}`,
        majorDimension: 'ROWS',
        values: [productHeaders, ...rows]
      })
    });
  }

  /**
   * Save all suppliers to Suppliers sheet.
   */
  static async syncSuppliers(accessToken: string, spreadsheetId: string, suppliers: Supplier[]): Promise<void> {
    await this.ensureAllTabsExist(accessToken, spreadsheetId);
    const headers = ['SupplierID', 'Name', 'ContactPerson', 'Phone', 'Email', 'Address', 'Notes', 'UpdatedAt'];
    const rows = suppliers.map(s => [
      s.id, s.name, s.contact_person || '', s.phone || '', s.email || '', s.address || '', s.notes || '', s.updated_at
    ]);

    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Suppliers!A2:H1000:clear`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (e) {
      console.warn('Could not clear Suppliers sheet range before update:', e);
    }

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Suppliers!A1:H${rows.length + 1}?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: `Suppliers!A1:H${rows.length + 1}`,
        majorDimension: 'ROWS',
        values: [headers, ...rows]
      })
    });
  }

  /**
   * Save all customers to Customers sheet.
   */
  static async syncCustomers(accessToken: string, spreadsheetId: string, customers: Customer[]): Promise<void> {
    await this.ensureAllTabsExist(accessToken, spreadsheetId);
    const headers = ['CustomerID', 'Name', 'ContactPerson', 'Phone', 'Email', 'Address', 'Notes', 'UpdatedAt'];
    const rows = customers.map(c => [
      c.id, c.name, c.contact_person || '', c.phone || '', c.email || '', c.address || '', c.notes || '', c.updated_at
    ]);

    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Customers!A2:H1000:clear`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (e) {
      console.warn('Could not clear Customers sheet range before update:', e);
    }

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Customers!A1:H${rows.length + 1}?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: `Customers!A1:H${rows.length + 1}`,
        majorDimension: 'ROWS',
        values: [headers, ...rows]
      })
    });
  }

  /**
   * Append a new transaction row to Transactions sheet and update product stock.
   */
  static async recordTransaction(
    accessToken: string,
    spreadsheetId: string,
    transaction: Transaction,
    updatedProducts: Product[]
  ): Promise<void> {
    const row = [
      transaction.tx_id,
      transaction.timestamp,
      transaction.type,
      transaction.sku,
      transaction.product_name,
      transaction.quantity,
      transaction.unit,
      transaction.unit_price || 0,
      transaction.total_amount || 0,
      transaction.reference_no,
      transaction.operator_email,
      transaction.department || '',
      transaction.notes || ''
    ];

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Transactions!A:M:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [row]
      })
    });

    await this.syncProducts(accessToken, spreadsheetId, updatedProducts);
  }
}
