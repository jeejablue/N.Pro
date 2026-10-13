import { Product, Transaction, Supplier, Customer, SheetInfo } from '../types/warehouse';

export const TARGET_DRIVE_FOLDER_ID = '153xVR1YRvxFFK0xrF7XosuFy-2Y0Xo7o';
export const TARGET_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${TARGET_DRIVE_FOLDER_ID}`;
const DEFAULT_SHEET_NAME = '🔊 NPRO Audio - คลังสินค้าและสต็อก (Warehouse Inventory)';

export const INITIAL_SAMPLE_PRODUCTS: Product[] = [
  {
    sku: 'NPRO-SPK-12A',
    name: 'ตู้ลำโพง Active 2 ทาง 12 นิ้ว NPRO Pro Sound (1000W DSP)',
    category: 'ลำโพงและตู้ลำโพง',
    current_stock: 24,
    min_stock: 6,
    unit: 'ตู้',
    unit_price: 14900,
    unit_cost: 9800,
    location: 'A-01-01',
    barcode: '885001100001',
    image_url: '/src/assets/images/npro_speaker_1791884719129.jpg',
    updated_at: new Date().toISOString()
  },
  {
    sku: 'NPRO-MIC-UHF2',
    name: 'ชุดไมโครโฟนไร้สาย UHF คู่ NPRO Dual Wireless Mic',
    category: 'ไมโครโฟน',
    current_stock: 4,
    min_stock: 8, // Low stock trigger
    unit: 'ชุด',
    unit_price: 6500,
    unit_cost: 4200,
    location: 'B-02-04',
    barcode: '885001100002',
    image_url: '/src/assets/images/npro_mic_1791884736500.jpg',
    updated_at: new Date().toISOString()
  },
  {
    sku: 'NPRO-MIX-16D',
    name: 'ดิจิตอลมิกเซอร์ 16 แชนแนล NPRO Digital Mixer Console Touchscreen',
    category: 'มิกเซอร์และโปรเซสเซอร์',
    current_stock: 12,
    min_stock: 4,
    unit: 'เครื่อง',
    unit_price: 29900,
    unit_cost: 21500,
    location: 'C-01-02',
    barcode: '885001100003',
    image_url: '/src/assets/images/npro_mixer_1791884758701.jpg',
    updated_at: new Date().toISOString()
  },
  {
    sku: 'NPRO-AMP-2500',
    name: 'เพาเวอร์แอมป์ Class H 2500W NPRO Power Amplifier 2CH',
    category: 'เพาเวอร์แอมป์',
    current_stock: 3,
    min_stock: 5, // Low stock trigger
    unit: 'เครื่อง',
    unit_price: 18500,
    unit_cost: 12900,
    location: 'C-02-01',
    barcode: '885001100004',
    image_url: '/src/assets/images/npro_amplifier_1791884786419.jpg',
    updated_at: new Date().toISOString()
  },
  {
    sku: 'NPRO-CAB-XLR10',
    name: 'สายสัญญาณเสียง Balanced XLR ตัวผู้-ตัวเมีย 10 เมตร (Pure OFC)',
    category: 'สายสัญญาณและคอนเนคเตอร์',
    current_stock: 85,
    min_stock: 20,
    unit: 'เส้น',
    unit_price: 450,
    unit_cost: 220,
    location: 'D-03-01',
    barcode: '885001100005',
    image_url: '/src/assets/images/npro_xlr_cable_1791884870899.jpg',
    updated_at: new Date().toISOString()
  },
  {
    sku: 'NPRO-STD-SPK01',
    name: 'ขาตั้งลำโพงอลูมิเนียมเกรดพรีเมียม ปรับระดับได้ 1.2 - 2.0 ม. (Load 50kg)',
    category: 'ขาตั้งและอุปกรณ์เสริม',
    current_stock: 18,
    min_stock: 10,
    unit: 'คู่',
    unit_price: 1290,
    unit_cost: 750,
    location: 'E-01-05',
    barcode: '885001100006',
    image_url: '/src/assets/images/npro_speaker_stand_1791884907819.jpg',
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    tx_id: 'TX-20261010-001',
    timestamp: '2026-10-10T09:30:00.000Z',
    type: 'IN',
    sku: 'NPRO-SPK-12A',
    product_name: 'ตู้ลำโพง Active 2 ทาง 12 นิ้ว NPRO Pro Sound (1000W DSP)',
    quantity: 20,
    unit: 'ตู้',
    unit_price: 9800,
    total_amount: 196000,
    reference_no: 'PO-NPRO-202601',
    operator_email: 'jeejablue@gmail.com',
    department: 'บจก. เอ็นโปร ออดิโอ เทคโนโลยี (ไทยแลนด์)',
    notes: 'รับสินค้าเครื่องเสียงล็อตใหม่พร้อมใบรับประกันศูนย์'
  },
  {
    tx_id: 'TX-20261011-002',
    timestamp: '2026-10-11T14:15:00.000Z',
    type: 'OUT',
    sku: 'NPRO-SPK-12A',
    product_name: 'ตู้ลำโพง Active 2 ทาง 12 นิ้ว NPRO Pro Sound (1000W DSP)',
    quantity: 4,
    unit: 'ตู้',
    unit_price: 14900,
    total_amount: 59600,
    reference_no: 'REQ-EVT-089',
    operator_email: 'jeejablue@gmail.com',
    department: 'บจก. คอนเสิร์ต โปรดักชั่น แอนด์ ซาวด์',
    notes: 'ส่งมอบชุดลำโพงเวทีคอนเสิร์ตใหญ่'
  },
  {
    tx_id: 'TX-20261012-003',
    timestamp: '2026-10-12T11:00:00.000Z',
    type: 'OUT',
    sku: 'NPRO-MIC-UHF2',
    product_name: 'ชุดไมโครโฟนไร้สาย UHF คู่ NPRO Dual Wireless Mic',
    quantity: 2,
    unit: 'ชุด',
    unit_price: 6500,
    total_amount: 13000,
    reference_no: 'REQ-LIVE-092',
    operator_email: 'jeejablue@gmail.com',
    department: 'ทีมเครื่องเสียง Live Sound & Event Rental',
    notes: 'จัดส่งงานแสดงดนตรีกลางแจ้ง'
  }
];

export const INITIAL_SAMPLE_SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'บจก. เอ็นโปร ออดิโอ เทคโนโลยี (ไทยแลนด์)',
    contact_person: 'คุณพงษ์ศักดิ์ เสียงทอง',
    phone: '02-456-7890',
    email: 'sales@nproaudio.co.th',
    address: '128/9 ถ.พระราม 9 ห้วยขวาง กรุงเทพฯ 10310',
    notes: 'ตัวแทนจำหน่ายหลักตู้ลำโพง ดิจิตอลมิกเซอร์ และเพาเวอร์แอมป์ NPRO Audio รับประกันศูนย์ 2 ปี',
    updated_at: new Date().toISOString()
  },
  {
    id: 'SUP-002',
    name: 'บจก. โปรซาวด์ โซลูชั่นส์ ผู้นำเข้าเครื่องเสียง',
    contact_person: 'คุณนฤมล รัตนโกสินทร์',
    phone: '02-987-1234',
    email: 'import@prosoundsolutions.th',
    address: '55/12 ถ.รังสิต-ปทุมธานี อ.เมือง จ.ปทุมธานี',
    notes: 'ผู้นำเข้าไมโครโฟนไร้สาย UHF ระดับมืออาชีพและโปรเซสเซอร์เสียง',
    updated_at: new Date().toISOString()
  },
  {
    id: 'SUP-003',
    name: 'หจก. ออดิโอเคเบิ้ล แอนด์ สแตนด์ ซัพพลาย',
    contact_person: 'คุณธนากร มั่นคง',
    phone: '081-345-6789',
    email: 'cables@audiocablestand.com',
    address: '88/4 ถ.กิ่งแก้ว บางพลี สมุทรปราการ',
    notes: 'ผลิตและจำหน่ายสายสัญญาณเสียง Balanced XLR คุณภาพสูงและขาตั้งลำโพงรับน้ำหนักมาก',
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    name: 'บจก. คอนเสิร์ต โปรดักชั่น แอนด์ ซาวด์',
    contact_person: 'คุณอานนท์ ดนตรีไพเราะ',
    phone: '089-111-2233',
    email: 'production@concertsound.co.th',
    address: '99/5 ซอยสุขุมวิท 63 (เอกมัย) คลองตันเหนือ วัฒนา กรุงเทพฯ',
    notes: 'เช่าและจัดระบบเครื่องเสียงงานคอนเสิร์ตและอีเวนต์ขนาดใหญ่',
    updated_at: new Date().toISOString()
  },
  {
    id: 'CUST-002',
    name: 'ทีมเครื่องเสียง Live Sound & Event Rental',
    contact_person: 'คุณสุชาติ เวทีเสียง',
    phone: '086-444-5566',
    email: 'livesound@bangkokrental.th',
    address: '45/2 ถ.เกษตร-นวมินทร์ ลาดพร้าว กรุงเทพฯ',
    notes: 'ทีมเครื่องเสียงงานสัมมนา งานแต่งงาน และดนตรีสด',
    updated_at: new Date().toISOString()
  },
  {
    id: 'CUST-003',
    name: 'สตูดิโอบันทึกเสียง Sound Lab Bangkok',
    contact_person: 'คุณกิตติชัย มาสเตอร์ริ่ง',
    phone: '02-777-8899',
    email: 'booking@soundlabbkk.com',
    address: '12/1 ถ.พหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ',
    notes: 'สตูดิโออัดเสียงระดับมืออาชีพและห้องซ้อมดนตรีมาตรฐานสากล',
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
