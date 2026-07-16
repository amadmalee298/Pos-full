import React, { useState } from "react";
import { 
  Database, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Plus, 
  Check, 
  Send, 
  HelpCircle,
  Layers,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Sliders,
  DollarSign,
  Clock,
  Sparkles
} from "lucide-react";
import { 
  MenuItem, 
  InventoryItem, 
  Order, 
  Customer, 
  Expense, 
  StockCard, 
  Promotion,
  OrderStatus
} from "../types";

interface GoogleSheetsProps {
  menuItems: MenuItem[];
  inventory: InventoryItem[];
  orders: Order[];
  customers: Customer[];
  expenses: Expense[];
  stockCards: StockCard[];
  promotions: Promotion[];
  syncStatus: "connected" | "offline" | "syncing";
  onToggleNetwork: () => void;
  onPlaceOrder: (order: Omit<Order, "id" | "timestamp">) => void;
  pendingSyncCount: number;
}

export default function GoogleSheetsSiteView({
  menuItems,
  inventory,
  orders,
  customers,
  expenses,
  stockCards,
  promotions,
  syncStatus,
  onToggleNetwork,
  onPlaceOrder,
  pendingSyncCount
}: GoogleSheetsProps) {
  // Spreadsheet simulation active tab
  const [activeSheetTab, setActiveSheetTab] = useState<string>("Orders");
  
  // Custom Apps script URL
  const [appsScriptUrl, setAppsScriptUrl] = useState("https://script.google.com/macros/s/AKfycbz_KAPRAO_AppsScriptWebhook/exec");
  
  // Simulated Google Site Customer Ordering State
  const [siteTopping, setSiteTopping] = useState<string[]>([]);
  const [siteNote, setSiteNote] = useState("");
  const [siteTable, setSiteTable] = useState("โต๊ะ 5 (QR Google Site)");
  const [siteSelectedMenuItem, setSiteSelectedMenuItem] = useState<MenuItem>(menuItems[0]);
  const [siteOrderSuccess, setSiteOrderSuccess] = useState(false);

  const sheetTabs = [
    "Orders", "Inventory", "StockCard", "Menu", "Customers", "Expenses", "Promotions"
  ];

  const handleCustomerSiteOrder = () => {
    const toppings = siteTopping.map(t => ({ name: t, price: 10 }));
    const toppingsCost = toppings.length * 10;
    const itemTotal = siteSelectedMenuItem.price + toppingsCost;

    const mockOrder = {
      items: [{
        menuItemId: siteSelectedMenuItem.id,
        name: siteSelectedMenuItem.name,
        price: siteSelectedMenuItem.price,
        quantity: 1,
        toppings,
        note: siteNote || "สั่งซื้อผ่าน Google Site QR Code"
      }],
      subtotal: itemTotal,
      discount: 0,
      total: itemTotal,
      paymentMethod: "QR Payment" as any,
      status: OrderStatus.QUEUE,
      cashierName: "QR Self-Service (Google Site)",
      customerName: "ลูกค้าออนไลน์",
      tableNumber: siteTable,
    };

    onPlaceOrder(mockOrder);
    setSiteOrderSuccess(true);
    setTimeout(() => {
      setSiteOrderSuccess(false);
      setSiteNote("");
      setSiteTopping([]);
    }, 4000);
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-40px)]" id="google-sheets-site-view">
      
      {/* Title banner */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white font-display tracking-wider">แพลตฟอร์มบูรณาการ Google Workspace (Sheets & Apps Script & Site)</h2>
          <p className="text-[10px] text-slate-400 mt-1">จำลองระบบฐานข้อมูล Google Sheets ออฟไลน์ซิงก์ และหน้าเว็บไซต์สั่งกะเพราสำหรับลูกค้า</p>
        </div>
        <button
          onClick={onToggleNetwork}
          className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
            syncStatus === "offline"
              ? "bg-red-500/20 border-red-500 text-red-400"
              : "bg-emerald-500/20 border-emerald-500 text-emerald-400"
          }`}
        >
          {syncStatus === "offline" ? <WifiOff className="w-4 h-4 animate-pulse" /> : <Wifi className="w-4 h-4" />}
          <span>โหมดจำลอง: {syncStatus === "offline" ? "ดึงสายเน็ตออก (Offline)" : "ออนไลน์เชื่อมต่อดี"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Left: Google Sheets Live database viewer (7 columns) */}
        <div className="xl:col-span-7 bg-[#11141a] rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-200">Google Sheets Live Spreadsheet</h3>
            </div>
            {pendingSyncCount > 0 && (
              <span className="bg-amber-500 text-slate-950 font-bold font-mono text-[9px] px-2 py-0.5 rounded-full animate-pulse">
                มี {pendingSyncCount} รายการค้างในคลังสมาร์ทโฟน
              </span>
            )}
          </div>

          {/* Sheets configuration URL */}
          <div className="p-3 bg-slate-950/40 border-b border-slate-800/60 flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono font-bold whitespace-nowrap">Apps Script URL:</span>
            <input
              type="text"
              value={appsScriptUrl}
              onChange={e => setAppsScriptUrl(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800/80 rounded px-2 py-1 text-[10px] text-slate-400 font-mono focus:outline-none"
            />
          </div>

          {/* Sheets tabs */}
          <div className="px-3 py-1 bg-slate-950/20 border-b border-slate-800/40 flex gap-1.5 overflow-x-auto no-scrollbar">
            {sheetTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveSheetTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-all ${
                  activeSheetTab === tab
                    ? "bg-emerald-600 text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Live Data Grid Table */}
          <div className="flex-1 overflow-auto max-h-[360px] min-h-[300px]">
            {activeSheetTab === "Orders" && (
              <table className="w-full text-[10px] font-mono text-slate-300">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 font-bold uppercase text-slate-500">
                    <th className="p-2 border-r border-slate-800">timestamp</th>
                    <th className="p-2 border-r border-slate-800">id</th>
                    <th className="p-2 border-r border-slate-800">total</th>
                    <th className="p-2 border-r border-slate-800">payment</th>
                    <th className="p-2 border-r border-slate-800">table</th>
                    <th className="p-2">items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orders.map((o, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30">
                      <td className="p-2 border-r border-slate-800/50">{new Date(o.timestamp).toLocaleTimeString()}</td>
                      <td className="p-2 border-r border-slate-800/50 text-red-400 font-bold">{o.id}</td>
                      <td className="p-2 border-r border-slate-800/50 text-emerald-400">฿{o.total}</td>
                      <td className="p-2 border-r border-slate-800/50">{o.paymentMethod}</td>
                      <td className="p-2 border-r border-slate-800/50 font-bold text-slate-200">{o.tableNumber}</td>
                      <td className="p-2 max-w-[120px] truncate">{o.items.map(i => `${i.name} x${i.quantity}`).join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeSheetTab === "Inventory" && (
              <table className="w-full text-[10px] font-mono text-slate-300">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 font-bold uppercase text-slate-500">
                    <th className="p-2 border-r border-slate-800">id</th>
                    <th className="p-2 border-r border-slate-800">name</th>
                    <th className="p-2 border-r border-slate-800">currentStock</th>
                    <th className="p-2 border-r border-slate-800">minStock</th>
                    <th className="p-2">pricePerUnit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {inventory.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30">
                      <td className="p-2 border-r border-slate-800/50 text-slate-400">{inv.id}</td>
                      <td className="p-2 border-r border-slate-800/50 text-slate-200 font-bold">{inv.name}</td>
                      <td className="p-2 border-r border-slate-800/50 text-right font-bold text-emerald-400">{inv.currentStock} {inv.unit}</td>
                      <td className="p-2 border-r border-slate-800/50 text-right text-slate-500">{inv.minStock}</td>
                      <td className="p-2 text-right">฿{inv.averagePricePerUnit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeSheetTab === "StockCard" && (
              <table className="w-full text-[10px] font-mono text-slate-300">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 font-bold uppercase text-slate-500">
                    <th className="p-2 border-r border-slate-800">timestamp</th>
                    <th className="p-2 border-r border-slate-800">ingredient</th>
                    <th className="p-2 border-r border-slate-800">action</th>
                    <th className="p-2 border-r border-slate-800">qty</th>
                    <th className="p-2 border-r border-slate-800">prev → new</th>
                    <th className="p-2">note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stockCards.map((sc, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30">
                      <td className="p-2 border-r border-slate-800/50">{new Date(sc.timestamp).toLocaleTimeString()}</td>
                      <td className="p-2 border-r border-slate-800/50 font-bold">{sc.ingredientName}</td>
                      <td className="p-2 border-r border-slate-800/50 text-amber-500">{sc.action}</td>
                      <td className="p-2 border-r border-slate-800/50">{sc.quantity}</td>
                      <td className="p-2 border-r border-slate-800/50">{sc.previousStock} → {sc.newStock}</td>
                      <td className="p-2 text-slate-400 truncate max-w-[100px]">{sc.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeSheetTab === "Menu" && (
              <table className="w-full text-[10px] font-mono text-slate-300">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 font-bold uppercase text-slate-500">
                    <th className="p-2 border-r border-slate-800">id</th>
                    <th className="p-2 border-r border-slate-800">name</th>
                    <th className="p-2 border-r border-slate-800">category</th>
                    <th className="p-2 text-right">price</th>
                    <th className="p-2 text-right">recipeCost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {menuItems.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30">
                      <td className="p-2 border-r border-slate-800/50">{m.id}</td>
                      <td className="p-2 border-r border-slate-800/50 text-slate-200 font-bold">{m.name}</td>
                      <td className="p-2 border-r border-slate-800/50">{m.category}</td>
                      <td className="p-2 border-r border-slate-800/50 text-right">฿{m.price}</td>
                      <td className="p-2 text-right">฿{m.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeSheetTab === "Customers" && (
              <table className="w-full text-[10px] font-mono text-slate-300">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 font-bold uppercase text-slate-500">
                    <th className="p-2 border-r border-slate-800">id</th>
                    <th className="p-2 border-r border-slate-800">name</th>
                    <th className="p-2 border-r border-slate-800">phone</th>
                    <th className="p-2 text-right">points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {customers.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30">
                      <td className="p-2 border-r border-slate-800/50 text-red-400 font-bold">{c.id}</td>
                      <td className="p-2 border-r border-slate-800/50 font-bold text-slate-200">{c.name}</td>
                      <td className="p-2 border-r border-slate-800/50">{c.phone}</td>
                      <td className="p-2 text-right text-amber-500">{c.points} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeSheetTab === "Expenses" && (
              <table className="w-full text-[10px] font-mono text-slate-300">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 font-bold uppercase text-slate-500">
                    <th className="p-2 border-r border-slate-800">date</th>
                    <th className="p-2 border-r border-slate-800">category</th>
                    <th className="p-2 border-r border-slate-800">amount</th>
                    <th className="p-2">note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {expenses.map((e, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30">
                      <td className="p-2 border-r border-slate-800/50">{e.date}</td>
                      <td className="p-2 border-r border-slate-800/50 font-bold text-slate-300">{e.category}</td>
                      <td className="p-2 border-r border-slate-800/50 text-red-400">-฿{e.amount}</td>
                      <td className="p-2 text-slate-400 max-w-[100px] truncate">{e.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeSheetTab === "Promotions" && (
              <table className="w-full text-[10px] font-mono text-slate-300">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 font-bold uppercase text-slate-500">
                    <th className="p-2 border-r border-slate-800">code</th>
                    <th className="p-2 border-r border-slate-800">title</th>
                    <th className="p-2 border-r border-slate-800">discount</th>
                    <th className="p-2">target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {promotions.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30">
                      <td className="p-2 border-r border-slate-800/50 font-bold text-red-400">{p.code}</td>
                      <td className="p-2 border-r border-slate-800/50 text-slate-200">{p.title}</td>
                      <td className="p-2 border-r border-slate-800/50 text-emerald-400">{p.discountRate}</td>
                      <td className="p-2 text-slate-400 truncate max-w-[100px]">{p.targetGroup}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-slate-950 p-3 text-center border-t border-slate-800 text-[10px] text-slate-500">
            * ระบบทำการจำลองโครงสร้างตารางข้อมูล Google Sheets 21 แท็บที่เชื่อมโยงกันแบบเรียลไทม์
          </div>
        </div>

        {/* Right: Simulated Customer-Facing QR Google Site Menu ordering (5 columns) */}
        <div className="xl:col-span-5 bg-[#11141a] rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-bold text-white tracking-wider">เว็บไซต์สั่งอาหารลูกค้า (QR Menu Google Site)</h3>
          </div>

          <div className="p-4 flex-1 flex flex-col items-center justify-center bg-slate-950/20">
            {/* Phone Bezel */}
            <div className="w-72 bg-slate-900 border-4 border-slate-800 rounded-[30px] p-3 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[460px]">
              
              {/* Phone Speaker & Camera notches */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-b-xl flex items-center justify-center z-20">
                <span className="w-1.5 h-1.5 bg-slate-950 rounded-full mr-2"></span>
                <span className="w-10 h-1 bg-slate-900 rounded-full"></span>
              </div>

              {/* Phone Content Header */}
              <div className="pt-5 pb-2.5 border-b border-slate-800 text-center bg-gradient-to-b from-red-950/20 to-slate-900/40 rounded-t-2xl">
                <h4 className="text-[10px] font-bold text-white tracking-wide">ครัวกะเพราเดลิเวอรี (Google Site)</h4>
                <p className="text-[7.5px] text-red-500 font-mono font-bold mt-0.5">SCAN TO BROWSE & ORDER</p>
              </div>

              {/* Phone Inner Scroll */}
              <div className="flex-1 overflow-y-auto py-3.5 space-y-3 px-1">
                {siteOrderSuccess ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2">
                    <div className="w-9 h-9 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    <h5 className="text-[11px] font-bold text-white">ส่งคิวอาหารเข้าครัวเรียบร้อย!</h5>
                    <p className="text-[9px] text-slate-400 leading-relaxed">กรุณารอรับประทานที่โต๊ะออเดอร์ของท่าน คิวอาหารจะเด้งขึ้นหน้าจอ KDS ทันที</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-[8px] text-slate-500 font-bold mb-1">1. เลือกเมนูกะเพราที่ท่านต้องการ:</label>
                      <select
                        value={siteSelectedMenuItem.id}
                        onChange={e => {
                          const m = menuItems.find(item => item.id === e.target.value);
                          if (m) setSiteSelectedMenuItem(m);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-[10px] text-slate-300 focus:outline-none"
                      >
                        {menuItems.map(m => (
                          <option key={m.id} value={m.id}>{m.name} (฿{m.price})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[8px] text-slate-500 font-bold mb-0.5">2. เพิ่มไข่ดาว/เคียง:</label>
                      <div className="grid grid-cols-2 gap-1 text-[8.5px]">
                        {["ไข่ดาวลาวาเยิ้มๆ", "ไข่ต้มยางมะตูม"].map(topping => {
                          const isSelected = siteTopping.includes(topping);
                          return (
                            <button
                              key={topping}
                              onClick={() => {
                                if (isSelected) {
                                  setSiteTopping(siteTopping.filter(t => t !== topping));
                                } else {
                                  setSiteTopping([...siteTopping, topping]);
                                }
                              }}
                              className={`py-1 rounded border text-left px-2 transition-all truncate ${
                                isSelected 
                                  ? "bg-red-600/10 border-red-500 text-red-400 font-semibold"
                                  : "bg-slate-950 border-slate-800 text-slate-400"
                              }`}
                            >
                              {topping} (+฿10)
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] text-slate-500 font-bold mb-1">3. หมายเหตุพิเศษ:</label>
                      <input
                        type="text"
                        placeholder="เผ็ดแห้งๆ ไม่ใส่น้ำตาล..."
                        value={siteNote}
                        onChange={e => setSiteNote(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-[9.5px] text-slate-300 focus:outline-none"
                      />
                    </div>

                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/60 flex justify-between items-center text-[9px] font-mono">
                      <span className="text-slate-500">รวมราคาจ่ายเงินสุทธิ:</span>
                      <span className="font-bold text-red-400">฿{siteSelectedMenuItem.price + siteTopping.length * 10}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Phone Footer Order Trigger */}
              {!siteOrderSuccess && (
                <button
                  onClick={handleCustomerSiteOrder}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-3 rounded-xl text-[10px] transition-all flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>ส่งออเดอร์จากโทรศัพท์ (โต๊ะ 5)</span>
                </button>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
