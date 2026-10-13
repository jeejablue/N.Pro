export type TransactionType = 'IN' | 'OUT';

export interface Product {
  sku: string;         // Internal ID / Product Code
  name: string;
  category: string;
  current_stock: number;
  min_stock: number;
  unit: string;
  unit_price: number;  // Selling price (THB)
  unit_cost?: number;  // Cost price (THB)
  location: string;    // Warehouse location / shelf e.g. A-01-2
  barcode?: string;
  image_url?: string;
  updated_at: string;
}

export interface Transaction {
  tx_id: string;
  timestamp: string;
  type: TransactionType;
  sku: string;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price?: number;
  total_amount?: number;
  reference_no: string;   // PO number or Requisition number
  operator_email: string;
  department?: string;    // Recipient department / Customer name / Supplier name
  notes?: string;
}

export interface Supplier {
  id: string;             // SUP-001
  name: string;           // Company or Vendor name
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  updated_at: string;
}

export interface Customer {
  id: string;             // CUST-001
  name: string;           // Customer or Department name
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  updated_at: string;
}

export interface SheetInfo {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  folderId?: string;
  folderUrl?: string;
  lastSyncedAt?: string;
}

export interface LowStockAlert {
  product: Product;
  deficit: number;
  percentageRemaining: number;
}
