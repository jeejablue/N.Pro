# Add Product Images Across Warehouse WebApp (เพิ่มระบบรูปภาพสินค้าในทุกมุมมอง)

Implement comprehensive product imagery support across the warehouse application: expand Google Sheets schema with an `ImageUrl` column, add device photo upload and URL attachment to product management, generate crisp studio-quality product photos for sample items, and display thumbnails and previews across all views.

## User Review & Critical Decisions

> [!IMPORTANT]
> Product images will be integrated across every screen in the application: in catalog cards, table rows, Goods Inward/Outward forms, and the dashboard. Images will be saved directly into Google Sheets in the `ImageUrl` column.

- **Confirmed Display Locations**: Everywhere across catalog cards, table rows, product selection dropdowns, In/Out transaction forms, and dashboard alert widgets.
- **Image Attachment Options**: Supports both pasting image URLs and uploading/capturing photos directly from the mobile device camera/file picker (converted cleanly to data URLs or web URLs).
- **Zero-Broken-Image Policy**: Every image slot will include an automatic fallback container with category icon and gradient badge so items without photos never show broken frames.

---

## 1. Overview & Core Concept

- **What It Does**: Allows warehouse staff to visually verify items by photo during receiving, packing, dispatching, and stock auditing, reducing picking errors and speeding up identification.
- **High-Fidelity Assets**: Generates 6 realistic, professional industrial warehouse product photos matching the default product catalog (corrugated boxes, packing tape, air bubble roll, PP strapping, thermal barcode labels, plastic pallets).

---

## 2. User Experience & Visual Design

### 1. Stock Master View (สต็อกสินค้า)
- **Table View**: 40×40px thumbnail in the product row with click-to-zoom image lightbox.
- **Card View (Mobile)**: 56×56px thumbnail or card header with crisp rounded corners (`rounded-xl`).
- **Add / Edit Modal**: Dedicated image section with live preview, URL input, and camera/upload button.

### 2. Goods Inward & Outward Views (รับเข้า & เบิกจ่าย)
- **Selected Product Header**: Displays product photo right alongside SKU/Code, current stock, and location to visually verify the physical item before submitting.
- **Autocomplete Dropdown**: Shows small 32×32px thumbnails next to each search result.

### 3. Dashboard View (ภาพรวม)
- **Low Stock Urgent Cards**: Shows product image thumbnail next to critical stock items to quickly recognize needed items.
- **Fast-Moving Rankings**: Displays product thumbnail in the top 5 ranking list.

---

## 3. Data Schema in Google Sheets

### Sheet `Products` Updated Columns
`Code` | `Name` | `Category` | `CurrentStock` | `MinStock` | `Unit` | `UnitPrice` | `UnitCost` | `Location` | `Barcode` | **`ImageUrl`** | `UpdatedAt`

---

## 4. Technical Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Warehouse UI Views                   │
│  ┌───────────────┬───────────────┬──────────────────┐  │
│  │ Stock Master  │ In / Out      │ Dashboard        │  │
│  │ - 40px thumbs │ - Photo check │ - Thumbs in top  │  │
│  │ - Zoom modal  │ - Autocomplete│   movers & alerts│  │
│  │ - Photo upload│   thumbs      │                  │  │
│  └───────────────┴───────────────┴──────────────────┘  │
└───────────────────────────┬────────────────────────────┘
                            │
               ┌────────────▼───────────┐
               │  Image Fallback & Box  │
               │  (Zero broken image)   │
               └────────────┬───────────┘
                            │
               ┌────────────▼───────────┐
               │  Google Sheets Schema  │
               │  Column: ImageUrl (K)  │
               └────────────────────────┘
```

---

## 5. Execution Steps Once Approved

1. Generate 6 realistic studio product images using `generate_image`:
   - Corrugated carton box
   - Clear packing tape
   - Air bubble roll
   - PP strapping band
   - Thermal barcode sticker roll
   - Industrial plastic pallet
2. Update `src/types/warehouse.ts`: Add `image_url?: string` to `Product`.
3. Update `src/services/googleSheets.ts`: Add `ImageUrl` column to `Products` sheet schema and initialize sample products with the generated image assets.
4. Update `src/components/StockMasterView.tsx`: Add image thumbnails, zoom preview, and photo upload/URL input in the Add/Edit modal.
5. Update `src/components/GoodsInView.tsx`: Show product photo banner and thumbnails in search autocomplete.
6. Update `src/components/GoodsOutView.tsx`: Show product photo banner and thumbnails in search autocomplete.
7. Update `src/components/DashboardView.tsx`: Display product thumbnails in low-stock cards and top-moving items.
8. Compile and verify with `compile_applet`.
