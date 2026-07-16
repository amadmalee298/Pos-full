import React, { useState } from "react";
import { 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  User, 
  Tag, 
  ShoppingBag, 
  Check, 
  ChevronRight, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Sparkles,
  UtensilsCrossed
} from "lucide-react";
import { 
  MenuItem, 
  ItemCategory, 
  Customer, 
  Promotion, 
  OrderItem, 
  OrderStatus, 
  Order 
} from "../types";

interface POSProps {
  menuItems: MenuItem[];
  customers: Customer[];
  promotions: Promotion[];
  currentUser: { name: string };
  onPlaceOrder: (orderData: Omit<Order, "id" | "timestamp">) => void;
}

export default function POSView({
  menuItems,
  customers,
  promotions,
  currentUser,
  onPlaceOrder
}: POSProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [basket, setBasket] = useState<OrderItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
  const [customDiscount, setCustomDiscount] = useState<number>(0);
  const [tableNumber, setTableNumber] = useState<string>("");
  const [isTakeaway, setIsTakeaway] = useState<boolean>(false);
  const [orderNote, setOrderNote] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"QR Payment" | "พร้อมเพย์" | "เงินสด">("เงินสด");
  const [cashPaid, setCashPaid] = useState<string>("");
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<any | null>(null);

  // Available toppings
  const toppingsList = [
    { name: "เพิ่มไข่ดาวลาวา", price: 10 },
    { name: "เพิ่มไข่ต้มยางมะตูม", price: 10 },
    { name: "ดับเบิ้ลเนื้อสัตว์ (+Double)", price: 30 },
  ];

  // Filters
  const categories = ["All", ...Object.values(ItemCategory)];
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Basket Handlers
  const addToBasket = (item: MenuItem) => {
    const existingIndex = basket.findIndex(bi => bi.menuItemId === item.id);
    if (existingIndex > -1) {
      const newBasket = [...basket];
      newBasket[existingIndex].quantity += 1;
      setBasket(newBasket);
    } else {
      setBasket([...basket, {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        toppings: [],
        note: ""
      }]);
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    const newBasket = [...basket];
    newBasket[index].quantity += delta;
    if (newBasket[index].quantity <= 0) {
      newBasket.splice(index, 1);
    }
    setBasket(newBasket);
  };

  const toggleTopping = (basketIndex: number, topping: { name: string; price: number }) => {
    const newBasket = [...basket];
    const toppingIndex = newBasket[basketIndex].toppings.findIndex(t => t.name === topping.name);
    if (toppingIndex > -1) {
      newBasket[basketIndex].toppings.splice(toppingIndex, 1);
    } else {
      newBasket[basketIndex].toppings.push(topping);
    }
    setBasket(newBasket);
  };

  const updateItemNote = (basketIndex: number, note: string) => {
    const newBasket = [...basket];
    newBasket[basketIndex].note = note;
    setBasket(newBasket);
  };

  const removeFromBasket = (index: number) => {
    const newBasket = [...basket];
    newBasket.splice(index, 1);
    setBasket(newBasket);
  };

  // Calculations
  const calculateBasketSubtotal = () => {
    return basket.reduce((total, item) => {
      const toppingsCost = item.toppings.reduce((sum, t) => sum + t.price, 0);
      return total + (item.price + toppingsCost) * item.quantity;
    }, 0);
  };

  const calculateDiscount = (subtotal: number) => {
    let promoDiscount = 0;
    if (selectedPromo) {
      if (selectedPromo.discountRate.endsWith("%")) {
        const pct = parseInt(selectedPromo.discountRate) / 100;
        promoDiscount = subtotal * pct;
      } else {
        promoDiscount = parseFloat(selectedPromo.discountRate);
      }
    }
    return Math.min(subtotal, promoDiscount + customDiscount);
  };

  const subtotal = calculateBasketSubtotal();
  const discount = calculateDiscount(subtotal);
  const total = Math.max(0, subtotal - discount);
  const changeDue = cashPaid ? Math.max(0, parseFloat(cashPaid) - total) : 0;

  // Submit POS Order
  const handleCheckout = () => {
    if (basket.length === 0) return;

    const orderData = {
      items: basket,
      subtotal,
      discount,
      total,
      paymentMethod,
      status: OrderStatus.QUEUE,
      cashierName: currentUser.name,
      customerId: selectedCustomer?.id || undefined,
      customerName: selectedCustomer?.name || undefined,
      tableNumber: isTakeaway ? "กลับบ้าน" : (tableNumber || "โต๊ะทั่วไป"),
      cookingStartTime: new Date().toISOString()
    };

    onPlaceOrder(orderData);

    const fullOrderReceipt = {
      ...orderData,
      id: `KPR-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString()
    };

    setLastPlacedOrder(fullOrderReceipt);
    setShowReceipt(true);

    // Clear POS State
    setBasket([]);
    setSelectedCustomer(null);
    setSelectedPromo(null);
    setCustomDiscount(0);
    setTableNumber("");
    setOrderNote("");
    setCashPaid("");
  };

  return (
    <div className="flex h-[calc(100vh-40px)] gap-4 p-4" id="pos-view-container">
      {/* Menu / Selection Section (Left) */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/40 rounded-2xl border border-slate-800/80 overflow-hidden">
        {/* Search & Categories Bar */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="ค้นหาเมนูกะเพรา / เครื่องดื่ม..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-red-600 transition-all"
            />
          </div>
          {/* Table Number */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="เลขโต๊ะ"
              value={tableNumber}
              disabled={isTakeaway}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-20 px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs text-center focus:outline-none focus:ring-1 focus:ring-red-600 transition-all disabled:opacity-40"
            />
            <button
              onClick={() => setIsTakeaway(!isTakeaway)}
              className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                isTakeaway 
                  ? "bg-amber-600/25 border-amber-500/50 text-amber-400"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              กลับบ้าน
            </button>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="px-4 py-2 bg-slate-950/20 flex gap-2 overflow-x-auto border-b border-slate-800/60 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-red-600 text-white shadow-md shadow-red-600/10"
                  : "bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => addToBasket(item)}
              className="group bg-[#11141a]/90 hover:bg-slate-900 border border-slate-800/70 rounded-2xl overflow-hidden cursor-pointer hover:border-red-500/30 transition-all duration-300 flex flex-col justify-between shadow-lg shadow-black/10"
              id={`pos-item-${item.id}`}
            >
              <div className="relative h-28 w-full bg-slate-950">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                />
                <div className="absolute top-2 right-2 bg-slate-950/85 px-2 py-1 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-red-400 font-mono font-bold">฿{item.price}</span>
                </div>
                {item.category === ItemCategory.BASIL && (
                  <span className="absolute bottom-2 left-2 bg-red-600/90 text-white font-semibold text-[9px] px-2 py-0.5 rounded-md">
                    ผัดกระทะร้อน
                  </span>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-xs font-bold text-slate-200 group-hover:text-red-400 transition-colors line-clamp-1">{item.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] font-mono text-slate-500">{item.category}</span>
                  <span className="w-5 h-5 bg-red-600/10 group-hover:bg-red-600 text-red-500 group-hover:text-white rounded-md flex items-center justify-center transition-all">
                    <Plus className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Basket / Cart Panel (Right) */}
      <div className="w-96 flex flex-col bg-[#11141a] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4 text-red-500" />
            <h2 className="text-xs font-bold text-white tracking-wider">ตะกร้าออเดอร์</h2>
          </div>
          <span className="bg-red-600/15 text-red-400 font-bold font-mono text-xs px-2.5 py-0.5 rounded-full">
            {basket.reduce((sum, item) => sum + item.quantity, 0)} รายการ
          </span>
        </div>

        {/* Selected Customer Bar */}
        <div className="p-3 bg-slate-900/40 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center text-slate-300">
              <User className="w-3.5 h-3.5" />
            </div>
            {selectedCustomer ? (
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">{selectedCustomer.name}</p>
                <p className="text-[9px] text-amber-500 font-mono">แต้มสะสม: {selectedCustomer.points} pts</p>
              </div>
            ) : (
              <span className="text-xs text-slate-500">ไม่ได้เลือกลูกค้าสมาชิก</span>
            )}
          </div>
          {/* Quick Select Customer Modal trigger or dropdown */}
          <select
            className="bg-slate-900 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1 max-w-[130px] focus:outline-none"
            onChange={(e) => {
              const cust = customers.find(c => c.id === e.target.value);
              setSelectedCustomer(cust || null);
            }}
            value={selectedCustomer?.id || ""}
          >
            <option value="">-- สมาชิก --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Items List inside Basket */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {basket.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-600">
              <UtensilsCrossed className="w-10 h-10 mb-2.5 text-slate-700" />
              <p className="text-xs font-semibold">ตะกร้าว่างเปล่า</p>
              <p className="text-[10px] text-slate-600 mt-1">คลิกเลือกรายการอาหารด้านซ้ายเพื่อรับออเดอร์</p>
            </div>
          ) : (
            basket.map((item, basketIdx) => {
              const toppingsCost = item.toppings.reduce((sum, t) => sum + t.price, 0);
              const singleTotal = item.price + toppingsCost;
              return (
                <div key={item.menuItemId} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-red-500 font-mono font-bold mt-0.5">฿{singleTotal} / จาน</p>
                    </div>
                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-1.5 ml-2">
                      <button 
                        onClick={() => updateQuantity(basketIdx, -1)}
                        className="w-5 h-5 bg-slate-800 text-slate-400 hover:text-white rounded flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-200 min-w-[14px] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(basketIdx, 1)}
                        className="w-5 h-5 bg-slate-800 text-slate-400 hover:text-white rounded flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Toppings Options (Pills) */}
                  <div className="space-y-1 bg-slate-950/40 p-2 rounded-lg">
                    <p className="text-[9px] text-slate-500 font-semibold">เพิ่มเครื่องเคียง/ท็อปปิ้ง:</p>
                    <div className="flex flex-wrap gap-1">
                      {toppingsList.map(topping => {
                        const isAdded = item.toppings.some(t => t.name === topping.name);
                        return (
                          <button
                            key={topping.name}
                            onClick={() => toggleTopping(basketIdx, topping)}
                            className={`text-[9px] px-2 py-0.5 rounded-md border transition-all ${
                              isAdded 
                                ? "bg-red-950/40 border-red-500/50 text-red-400 font-semibold"
                                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            {topping.name.replace("เพิ่ม", "")} (+{topping.price})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes input */}
                  <input
                    type="text"
                    placeholder="ระบุหมายเหตุพิเศษ (เช่น เผ็ดน้อย, ไข่ดาวไม่สุก)"
                    value={item.note}
                    onChange={(e) => updateItemNote(basketIdx, e.target.value)}
                    className="w-full px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Payment & Summary Block */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3.5">
          {/* Promotions Select */}
          <div className="flex items-center justify-between gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Tag className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold">โปรโมชั่น:</span>
            </div>
            <select
              className="bg-slate-950 border border-slate-800 text-[10px] text-slate-300 rounded-lg px-2 py-1 max-w-[180px] focus:outline-none"
              onChange={(e) => {
                const promo = promotions.find(p => p.id === e.target.value);
                setSelectedPromo(promo || null);
              }}
              value={selectedPromo?.id || ""}
            >
              <option value="">-- เลือกโปรโมชั่น --</option>
              {promotions.filter(p => p.isActive).map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Money inputs */}
          <div className="grid grid-cols-3 gap-2">
            {["เงินสด", "พร้อมเพย์", "QR Payment"].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method as any)}
                className={`py-2 rounded-xl border text-[10px] font-bold transition-all flex flex-col items-center justify-center space-y-1 ${
                  paymentMethod === method
                    ? "bg-red-600/20 border-red-500 text-red-400"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{method}</span>
              </button>
            ))}
          </div>

          {/* Cash input when Cash selected */}
          {paymentMethod === "เงินสด" && (
            <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] font-semibold text-slate-400">รับเงินสด:</span>
              <input
                type="number"
                placeholder="ยอดเงินลูกค้าจ่าย"
                value={cashPaid}
                onChange={(e) => setCashPaid(e.target.value)}
                className="flex-1 bg-transparent text-right text-xs font-mono font-bold text-slate-200 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">บาท</span>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>รวมยอดสินค้า</span>
              <span className="font-mono">฿{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>ส่วนลด</span>
                <span className="font-mono">-฿{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-200 font-bold border-t border-slate-800/80 pt-2 text-sm">
              <span>ยอดสุทธิ</span>
              <span className="text-red-500 font-mono">฿{total}</span>
            </div>
            {paymentMethod === "เงินสด" && cashPaid && (
              <div className="flex justify-between text-amber-400 font-semibold pt-1">
                <span>เงินทอน</span>
                <span className="font-mono">฿{changeDue}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleCheckout}
            disabled={basket.length === 0}
            className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-40 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-red-600/15"
          >
            <Sparkles className="w-4 h-4" />
            <span>พิมพ์ใบเสร็จ & ส่งครัว (KDS)</span>
          </button>
        </div>
      </div>

      {/* Receipt Modal Overlay */}
      {showReceipt && lastPlacedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white text-slate-900 w-80 p-5 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-300">
              <h3 className="text-xs font-bold font-mono tracking-wider text-slate-500">THERMAL RECEIPT</h3>
              <button 
                onClick={() => setShowReceipt(false)}
                className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded font-semibold transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
            {/* Printable Area */}
            <div className="flex-1 overflow-y-auto py-4 text-center font-mono text-[11px] space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold tracking-tight text-black">ครัวกะเพรา (KAPRAO POS)</h4>
                <p className="text-[10px] text-slate-500">สาขาลาดพร้าว 101 - Enterprise</p>
                <p className="text-[10px] text-slate-400">โทร: 081-234-5678</p>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-2 text-left space-y-1 text-slate-600">
                <p>บิลเลขที่: {lastPlacedOrder.id}</p>
                <p>วันที่: {new Date(lastPlacedOrder.timestamp).toLocaleString("th-TH")}</p>
                <p>แคชเชียร์: {lastPlacedOrder.cashierName}</p>
                <p>สถานที่: {lastPlacedOrder.tableNumber}</p>
                {lastPlacedOrder.customerName && <p>สมาชิก: {lastPlacedOrder.customerName}</p>}
              </div>

              <div className="border-t border-dashed border-slate-200 py-2 text-left space-y-2">
                <div className="flex justify-between font-bold text-black border-b border-dashed border-slate-200 pb-1">
                  <span>เมนู</span>
                  <span>รวม</span>
                </div>
                {lastPlacedOrder.items.map((item: any, idx: number) => {
                  const itemToppingsCost = item.toppings.reduce((s: number, t: any) => s + t.price, 0);
                  const totalItemPrice = (item.price + itemToppingsCost) * item.quantity;
                  return (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between text-black">
                        <span>{item.name} x{item.quantity}</span>
                        <span>฿{totalItemPrice}</span>
                      </div>
                      {item.toppings.map((t: any, tid: number) => (
                        <p key={tid} className="text-[9px] text-slate-500 pl-2">+ {t.name} (+฿{t.price})</p>
                      ))}
                      {item.note && <p className="text-[9px] text-red-500 pl-2">* โน้ต: {item.note}</p>}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-dashed border-slate-200 pt-2 text-right space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span>มูลค่ารวม:</span>
                  <span>฿{lastPlacedOrder.subtotal}</span>
                </div>
                {lastPlacedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>ส่วนลด:</span>
                    <span>-฿{lastPlacedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-black font-bold text-sm border-t border-dashed border-slate-200 pt-1.5">
                  <span>สุทธิ:</span>
                  <span>฿{lastPlacedOrder.total}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>ชำระผ่าน:</span>
                  <span>{lastPlacedOrder.paymentMethod}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-300 pt-3 text-center space-y-2 text-[9px] text-slate-400">
                <p>ขอขอบคุณที่ใช้บริการ "ครัวกะเพรา"</p>
                <p className="text-[8px]">Google Sheets & KDS Sync: Success</p>
                <div className="flex justify-center py-1">
                  {/* Mock barcode or qr */}
                  <div className="w-32 h-6 bg-slate-200 border border-slate-300 flex items-center justify-center text-[7px] tracking-[6px] text-slate-600">
                    ||||||||||||||||||||||||
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
