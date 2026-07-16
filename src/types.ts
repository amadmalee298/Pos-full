export enum UserRole {
  ADMIN = "Admin",
  MANAGER = "Manager",
  CASHIER = "Cashier",
  STAFF = "Staff"
}

export enum ItemCategory {
  BASIL = "กะเพรา",
  MEAT = "เนื้อสัตว์พิเศษ",
  RICE = "ข้าว/เส้น",
  DRINK = "เครื่องดื่ม",
  TOPPING = "ท็อปปิ้ง"
}

export enum OrderStatus {
  QUEUE = "คิวอาหาร",
  COOKING = "กำลังทำ",
  READY = "เสร็จแล้ว",
  COMPLETED = "เสิร์ฟแล้ว/เช็คบิล",
  CANCELLED = "ยกเลิก"
}

export enum StockCardAction {
  IN = "รับเข้า",
  OUT = "เบิกออก",
  ADJUST = "ปรับปรุงสต๊อก",
  POS_SALE = "ตัดสต๊อกจาก POS"
}

export interface MenuItem {
  id: string;
  name: string;
  category: ItemCategory;
  price: number;
  cost: number; // calculated from recipe
  image: string;
  status: "Available" | "Out of stock";
  recipeId?: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number; // e.g. 0.15 for 150g
  unit: string; // e.g. "กก.", "ฟอง", "ลิตร"
}

export interface Recipe {
  id: string;
  menuItemId: string;
  menuItemName: string;
  ingredients: RecipeIngredient[];
  totalCost: number;
  foodCostPercent: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number; // for Low Stock alert
  unit: string;
  averagePricePerUnit: number;
  expiryDate?: string;
  lotNumber?: string;
}

export interface StockCard {
  id: string;
  timestamp: string;
  ingredientId: string;
  ingredientName: string;
  action: StockCardAction;
  quantity: number;
  previousStock: number;
  newStock: number;
  note: string;
  operator: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
}

export interface PurchaseOrder {
  id: string;
  timestamp: string;
  supplierId: string;
  supplierName: string;
  items: { ingredientId: string; name: string; qty: number; unitPrice: number; total: number }[];
  totalCost: number;
  status: "Draft" | "Pending" | "Received";
}

export interface Expense {
  id: string;
  date: string;
  category: "ค่าเช่า" | "ค่าแรง" | "ค่าไฟ" | "ค่าน้ำ" | "วัตถุดิบ" | "อื่นๆ";
  amount: number;
  note: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
  purchaseHistory: { orderId: string; date: string; amount: number }[];
  couponIds: string[];
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountRate: string;
  targetGroup: string;
  code: string;
  isActive: boolean;
}

export interface Employee {
  id: string;
  name: string;
  role: UserRole;
  salary: number;
  phone: string;
  status: "Active" | "Inactive";
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  toppings: { name: string; price: number }[];
}

export interface Order {
  id: string;
  timestamp: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: "QR Payment" | "พร้อมเพย์" | "เงินสด";
  status: OrderStatus;
  cashierName: string;
  customerId?: string;
  customerName?: string;
  tableNumber?: string;
  cookingStartTime?: string;
  cookingEndTime?: string;
}

export interface CashBookEntry {
  id: string;
  timestamp: string;
  type: "Income" | "Expense";
  category: string;
  amount: number;
  balance: number;
  reference: string;
}

export interface BalanceSheet {
  assets: { name: string; amount: number }[];
  liabilities: { name: string; amount: number }[];
  equity: { name: string; amount: number }[];
}

export interface ProfitLoss {
  revenue: number;
  foodCost: number;
  operatingExpenses: number;
  netProfit: number;
}
