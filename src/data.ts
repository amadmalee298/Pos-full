import {
  MenuItem,
  ItemCategory,
  InventoryItem,
  Recipe,
  Supplier,
  Customer,
  Promotion,
  Employee,
  UserRole,
  Expense,
  Order,
  OrderStatus,
  StockCard,
  StockCardAction,
  CashBookEntry
} from "./types";

export const initialMenuItems: MenuItem[] = [
  {
    id: "m1",
    name: "กะเพราหมูสับพริกแห้งโบราณ",
    category: ItemCategory.BASIL,
    price: 65,
    cost: 18.5,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    status: "Available"
  },
  {
    id: "m2",
    name: "กะเพราเนื้อโคขุนสับพรีเมียม",
    category: ItemCategory.BASIL,
    price: 95,
    cost: 41.2,
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80",
    status: "Available"
  },
  {
    id: "m3",
    name: "กะเพราหมูกรอบคั่วกระทะเหล็ก",
    category: ItemCategory.BASIL,
    price: 85,
    cost: 32.8,
    image: "https://images.unsplash.com/photo-1626804475315-9644b37a2fe4?auto=format&fit=crop&w=600&q=80",
    status: "Available"
  },
  {
    id: "m4",
    name: "กะเพราทะเลอันดามันพริกขี้หนูสวน",
    category: ItemCategory.BASIL,
    price: 90,
    cost: 34.0,
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80",
    status: "Available"
  },
  {
    id: "m5",
    name: "ข้าวผัดพริกแกงใต้สะตอหมูสับ",
    category: ItemCategory.RICE,
    price: 75,
    cost: 21.0,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
    status: "Available"
  },
  {
    id: "m6",
    name: "น้ำเก๊กฮวยจักรพรรดิ์เย็นชื่นใจ",
    category: ItemCategory.DRINK,
    price: 25,
    cost: 6.0,
    image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=600&q=80",
    status: "Available"
  },
  {
    id: "m7",
    name: "ชาไทยเฉาก๊วยโบราณเข้มข้น",
    category: ItemCategory.DRINK,
    price: 30,
    cost: 8.5,
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    status: "Available"
  }
];

export const initialInventory: InventoryItem[] = [
  { id: "i1", name: "เนื้อหมูบดอนามัย", currentStock: 12.5, minStock: 5.0, unit: "กก.", averagePricePerUnit: 160 },
  { id: "i2", name: "เนื้อวัวโคขุนสับละเอียด", currentStock: 4.8, minStock: 3.0, unit: "กก.", averagePricePerUnit: 280 },
  { id: "i3", name: "หมูกรอบพรีเมียมอบรีดน้ำมัน", currentStock: 6.2, minStock: 3.0, unit: "กก.", averagePricePerUnit: 240 },
  { id: "i4", name: "กุ้งสดและปลาหมึกหั่นชิ้น", currentStock: 5.0, minStock: 2.0, unit: "กก.", averagePricePerUnit: 220 },
  { id: "i5", name: "ใบกะเพราเกษตรออร์แกนิก", currentStock: 2.5, minStock: 1.5, unit: "กก.", averagePricePerUnit: 80 },
  { id: "i6", name: "ไข่ไก่เบอร์ 2 (สดใหม่)", currentStock: 180, minStock: 60, unit: "ฟอง", averagePricePerUnit: 4.0 },
  { id: "i7", name: "พริกแห้งและพริกจินดาแดง", currentStock: 3.2, minStock: 1.0, unit: "กก.", averagePricePerUnit: 120 },
  { id: "i8", name: "ซอสปรุงรสกะเพราสูตรลับ", currentStock: 15.0, minStock: 5.0, unit: "ลิตร", averagePricePerUnit: 60 },
  { id: "i9", name: "ข้าวหอมมะลิกลางปีหุงสุก", currentStock: 25.0, minStock: 10.0, unit: "กก.", averagePricePerUnit: 35 }
];

export const initialRecipes: Recipe[] = [
  {
    id: "r1",
    menuItemId: "m1",
    menuItemName: "กะเพราหมูสับพริกแห้งโบราณ",
    ingredients: [
      { ingredientId: "i1", quantity: 0.1, unit: "กก." }, // 100g หมูสับ -> 16 บาท
      { ingredientId: "i5", quantity: 0.02, unit: "กก." }, // 20g กะเพรา -> 1.6 บาท
      { ingredientId: "i7", quantity: 0.01, unit: "กก." }, // 10g พริก -> 1.2 บาท
      { ingredientId: "i8", quantity: 0.03, unit: "ลิตร" }, // 30ml ซอส -> 1.8 บาท
      { ingredientId: "i9", quantity: 0.15, unit: "กก." } // 150g ข้าวหอม -> 5.25 บาท
    ],
    totalCost: 25.85,
    foodCostPercent: 39.7
  },
  {
    id: "r2",
    menuItemId: "m2",
    menuItemName: "กะเพราเนื้อโคขุนสับพรีเมียม",
    ingredients: [
      { ingredientId: "i2", quantity: 0.12, unit: "กก." }, // 120g เนื้อโคขุน -> 33.6 บาท
      { ingredientId: "i5", quantity: 0.02, unit: "กก." },
      { ingredientId: "i7", quantity: 0.015, unit: "กก." },
      { ingredientId: "i8", quantity: 0.03, unit: "ลิตร" },
      { ingredientId: "i9", quantity: 0.15, unit: "กก." }
    ],
    totalCost: 43.15,
    foodCostPercent: 45.4
  }
];

export const initialSuppliers: Supplier[] = [
  { id: "s1", name: "ซีพี เฟรชมาร์ท สาขาลาดพร้าว", contact: "คุณสุรชัย (ผู้จัดการฝ่ายจัดส่ง)", phone: "081-234-5678", address: "123 ถ.ลาดพร้าว แขวงคลองจั่น เขตบางกะปิ กรุงเทพฯ" },
  { id: "s2", name: "สวนผักเกษตรอินทรีย์ ป้าแป๋ว", contact: "ป้าแป๋ว", phone: "089-876-5432", address: "45 หมู่ 3 ต.บางเลน อ.บางใหญ่ จ.นนทบุรี" },
  { id: "s3", name: "เขียงหมูอนามัย เจ๊วรรณ ตลาดไท", contact: "เจ๊วรรณ", phone: "086-555-7890", address: "แผง 24 โซนเนื้อสัตว์ ตลาดไท จ.ปทุมธานี" }
];

export const initialCustomers: Customer[] = [
  { id: "c1", name: "สมชาย แสนดี", phone: "090-111-2222", points: 240, purchaseHistory: [], couponIds: ["cp1"] },
  { id: "c2", name: "วิภาดา รักดี", phone: "095-333-4444", points: 150, purchaseHistory: [], couponIds: [] },
  { id: "c3", name: "ณัฐพงษ์ ยอดสู้", phone: "098-777-8888", points: 480, purchaseHistory: [], couponIds: ["cp2"] }
];

export const initialPromotions: Promotion[] = [
  { id: "cp1", title: "คูปองลดบาทดีเดย์", description: "คูปองลดทันที 20 บาทเมื่อสั่งซื้อครบ 150 บาทขึ้นไป", discountRate: "20", targetGroup: "ลูกค้าเก่ากลับมาซื้อ", code: "WELCOME20", isActive: true },
  { id: "cp2", title: "สมาชิกสยามกะเพรา", description: "ส่วนลด 10% สำหรับสมาชิก Kaprao Club ทุกยอดบิล", discountRate: "10%", targetGroup: "สมาชิกพรีเมียม", code: "KAPRAOCLUB", isActive: true }
];

export const initialEmployees: Employee[] = [
  { id: "e1", name: "อานนท์ เผาพริก", role: UserRole.ADMIN, salary: 28000, phone: "084-555-1234", status: "Active" },
  { id: "e2", name: "พรทิพย์ ผัดกะเพรา", role: UserRole.MANAGER, salary: 22000, phone: "081-999-5678", status: "Active" },
  { id: "e3", name: "ใจดี ถือตังค์", role: UserRole.CASHIER, salary: 15000, phone: "085-777-9900", status: "Active" },
  { id: "e4", name: "กุ๊ก สมัครใจ", role: UserRole.STAFF, salary: 16000, phone: "082-111-2233", status: "Active" }
];

export const initialExpenses: Expense[] = [
  { id: "ex1", date: "2026-07-01", category: "ค่าเช่า", amount: 15000, note: "ค่าเช่าล็อคอาคารพาณิชย์ ประจำเดือน กรกฎาคม" },
  { id: "ex2", date: "2026-07-05", category: "ค่าไฟ", amount: 3850, note: "บิลค่าไฟฟ้า มิตเตอร์ร้านครัวกะเพรา" },
  { id: "ex3", date: "2026-07-05", category: "ค่าน้ำ", amount: 620, note: "ค่าน้ำประปาร้าน" },
  { id: "ex4", date: "2026-07-10", category: "วัตถุดิบ", amount: 4500, note: "สั่งผักและเนื้อหมูสดเติมคลังล็อตใหญ่" }
];

export const initialOrders: Order[] = [
  {
    id: "KPR-1001",
    timestamp: "2026-07-15T11:20:00Z",
    items: [
      {
        menuItemId: "m1",
        name: "กะเพราหมูสับพริกแห้งโบราณ",
        price: 65,
        quantity: 2,
        toppings: [
          { name: "เพิ่มไข่ดาวลาวา", price: 10 }
        ],
        note: "เผ็ดสะใจพริกแห้งล้วน"
      }
    ],
    subtotal: 150,
    discount: 15,
    total: 135,
    paymentMethod: "พร้อมเพย์",
    status: OrderStatus.COMPLETED,
    cashierName: "ใจดี ถือตังค์",
    customerName: "สมชาย แสนดี",
    customerId: "c1"
  },
  {
    id: "KPR-1002",
    timestamp: "2026-07-15T11:45:00Z",
    items: [
      {
        menuItemId: "m2",
        name: "กะเพราเนื้อโคขุนสับพรีเมียม",
        price: 95,
        quantity: 1,
        toppings: [],
        note: "ไม่ใส่น้ำตาล"
      },
      {
        menuItemId: "m6",
        name: "น้ำเก๊กฮวยจักรพรรดิ์เย็นชื่นใจ",
        price: 25,
        quantity: 2,
        toppings: []
      }
    ],
    subtotal: 145,
    discount: 0,
    total: 145,
    paymentMethod: "QR Payment",
    status: OrderStatus.READY,
    cashierName: "ใจดี ถือตังค์",
    tableNumber: "โต๊ะ 4"
  }
];

export const initialCashBook: CashBookEntry[] = [
  { id: "cb1", timestamp: "2026-07-01T09:00:00Z", type: "Expense", category: "ค่าเช่า", amount: 15000, balance: 35000, reference: "KPR-RENT-07", note: "จ่ายค่าเช่าร้าน" } as any,
  { id: "cb2", timestamp: "2026-07-15T11:20:00Z", type: "Income", category: "ยอดขายอาหาร", amount: 135, balance: 35135, reference: "KPR-1001", note: "กะเพราหมูสับ x2 บิล KPR-1001" } as any
];

// Helper to estimate initial Profit & Loss, Balance Sheet, etc.
export const generateFinanceSheet = () => {
  return {
    assets: [
      { name: "เงินสดในมือ/เก๊ะ", amount: 12500 },
      { name: "เงินฝากธนาคาร (กสิกรไทย POS)", amount: 145000 },
      { name: "มูลค่าสินค้าวัตถุดิบในสต๊อก", amount: 9680 },
      { name: "อุปกรณ์ครัวและเครื่องตกแต่งร้าน", amount: 85000 }
    ],
    liabilities: [
      { name: "เจ้าหนี้การค้า (ซีพี เฟรชมาร์ท)", amount: 3400 },
      { name: "เงินเดือนพนักงานค้างจ่าย", amount: 0 }
    ],
    equity: [
      { name: "ทุนจดทะเบียนเริ่มต้น", amount: 200000 },
      { name: "กำไรสะสมยังไม่ได้จัดสรร", amount: 48780 }
    ]
  };
};
