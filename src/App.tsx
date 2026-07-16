import React, { useState, useEffect } from "react";
import { 
  UserCheck, 
  Sparkles, 
  Wifi, 
  WifiOff, 
  RotateCw, 
  Eye, 
  Settings as SettingsIcon,
  ShieldAlert,
  Bell,
  CheckCircle,
  HelpCircle,
  Database
} from "lucide-react";
import { 
  UserRole, 
  MenuItem, 
  InventoryItem, 
  Recipe, 
  Supplier, 
  Customer, 
  Promotion, 
  Employee, 
  Order, 
  OrderStatus, 
  StockCard, 
  StockCardAction, 
  Expense, 
  CashBookEntry,
  BalanceSheet
} from "./types";

import {
  initialMenuItems,
  initialInventory,
  initialRecipes,
  initialCustomers,
  initialPromotions,
  initialEmployees,
  initialExpenses,
  initialOrders,
  initialCashBook,
  generateFinanceSheet
} from "./data";

// Import custom views
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import POSView from "./components/POSView";
import KDSView from "./components/KDSView";
import MenuRecipeView from "./components/MenuRecipeView";
import InventoryView from "./components/InventoryView";
import AccountingView from "./components/AccountingView";
import CustomerEmployeeView from "./components/CustomerEmployeeView";
import GoogleSheetsSiteView from "./components/GoogleSheetsSiteView";

export default function App() {
  // Session Authentication state
  const [currentUser, setCurrentUser] = useState<{ name: string; role: UserRole } | null>(null);
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.CASHIER);

  // App Tabs State
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Global POS / Sheets Database State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [cashBook, setCashBook] = useState<CashBookEntry[]>(initialCashBook);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet>(generateFinanceSheet());

  // Offline / Sheets Sync states
  const [syncStatus, setSyncStatus] = useState<"connected" | "offline" | "syncing">("connected");
  const [pendingSyncQueue, setPendingSyncQueue] = useState<Omit<Order, "id" | "timestamp">[]>([]);
  const [alertNotification, setAlertNotification] = useState<string | null>(null);

  // App Store settings
  const [storeName, setStoreName] = useState("ครัวกะเพราเด็ด สาขาลาดพร้าว 101");
  const [storeTaxRate, setStoreTaxRate] = useState(7);
  const [printerIP, setPrinterIP] = useState("192.168.1.150");
  const [promptPayPhone, setPromptPayPhone] = useState("0812345678");

  // Auto trigger alerts
  useEffect(() => {
    // Alert if low stock is present
    const lowCount = inventory.filter(i => i.currentStock <= i.minStock).length;
    if (lowCount > 0) {
      triggerNotification(`เตือน: มีวัตถุดิบ ${lowCount} รายการในครัวใกล้หมดคลัง!`);
    }
  }, [inventory]);

  const triggerNotification = (message: string) => {
    setAlertNotification(message);
    // Play subtle system alert sound simulation
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(660, audioCtx.currentTime); // high friendly beep
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.log("Audio alert blocked by browser autoplay rules");
    }
    setTimeout(() => {
      setAlertNotification(null);
    }, 4500);
  };

  // Auth roles logins prefilled mapping
  const handleLogin = () => {
    let name = "แคชเชียร์ ใจดี";
    if (loginRole === UserRole.ADMIN) name = "อานนท์ เผาพริก";
    else if (loginRole === UserRole.MANAGER) name = "ผู้จัดการ พรทิพย์";
    else if (loginRole === UserRole.STAFF) name = "กุ๊ก สมัครใจ";

    setCurrentUser({ name, role: loginRole });
    triggerNotification(`ยินดีต้อนรับเข้าสู่ระบบ KAPRAO POS ในฐานะ ${loginRole}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab("dashboard");
  };

  // Place POS Order with full ingredient decrement and stock card logging!
  const handlePlaceOrder = (orderData: Omit<Order, "id" | "timestamp">) => {
    if (syncStatus === "offline") {
      // Buffer in offline queue
      setPendingSyncQueue([...pendingSyncQueue, orderData]);
      triggerNotification("แจ้งเตือน: บันทึกออเดอร์ในคลังระบบออฟไลน์ (IndexedDB Cached)");
      return;
    }

    // Process order in live system
    const orderId = `KPR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      timestamp: new Date().toISOString()
    };

    // 1. Decrement ingredients from inventory based on recipe!
    const updatedInventory = [...inventory];
    const newStockCards: StockCard[] = [];

    orderData.items.forEach(basketItem => {
      const matchRecipe = recipes.find(r => r.menuItemId === basketItem.menuItemId);
      if (matchRecipe) {
        matchRecipe.ingredients.forEach(recipeLine => {
          const ingIndex = updatedInventory.findIndex(i => i.id === recipeLine.ingredientId);
          if (ingIndex > -1) {
            const ing = updatedInventory[ingIndex];
            const deduction = recipeLine.quantity * basketItem.quantity;
            const previousStock = ing.currentStock;
            const newStock = Math.round(Math.max(0, previousStock - deduction) * 100) / 100;
            
            // mutate
            updatedInventory[ingIndex].currentStock = newStock;

            // log stock card
            newStockCards.push({
              id: `SC-${Math.floor(10000 + Math.random() * 90000)}`,
              timestamp: new Date().toISOString(),
              ingredientId: ing.id,
              ingredientName: ing.name,
              action: StockCardAction.POS_SALE,
              quantity: -deduction,
              previousStock,
              newStock,
              note: `ออเดอร์ขายบิล ${orderId}`,
              operator: currentUser?.name || "System POS"
            });
          }
        });
      }
    });

    setInventory(updatedInventory);
    if (newStockCards.length > 0) {
      setStockCards(prev => [...prev, ...newStockCards]);
    }

    // 2. Increment Customer Points if selected
    if (orderData.customerId) {
      setCustomers(prevCustomers => 
        prevCustomers.map(cust => {
          if (cust.id === orderData.customerId) {
            const addedPoints = Math.floor(orderData.total / 10); // 10 baht = 1 point
            return {
              ...cust,
              points: cust.points + addedPoints,
              purchaseHistory: [...cust.purchaseHistory, { orderId, date: new Date().toDateString(), amount: orderData.total }]
            };
          }
          return cust;
        })
      );
    }

    // 3. Append order & create cash ledger
    setOrders(prevOrders => [...prevOrders, newOrder]);
    
    setCashBook(prevCash => [
      ...prevCash,
      {
        id: `cb-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "Income",
        category: "ยอดขายอาหาร",
        amount: orderData.total,
        balance: (prevCash[prevCash.length - 1]?.balance || 35000) + orderData.total,
        reference: orderId,
        note: `ยอดจำหน่ายบิลกะเพรา ${orderId}`
      } as any
    ]);

    triggerNotification(`ออเดอร์ใหม่สำเร็จ! บิล ${orderId} ถูกส่งเข้าหน้าจอห้องครัวแล้ว`);
  };

  // KDS Cooking State Transition
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => 
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status,
            cookingEndTime: status === OrderStatus.READY ? new Date().toISOString() : o.cookingEndTime
          };
        }
        return o;
      })
    );

    let message = `บิล ${orderId} เริ่มลงเตาปรุงอาหาร`;
    if (status === OrderStatus.READY) message = `บิล ${orderId} ผัดเสร็จแล้ว พร้อมเสิร์ฟ!`;
    else if (status === OrderStatus.COMPLETED) message = `บิล ${orderId} จัดเสิร์ฟและชำระเงินเรียบร้อย`;

    triggerNotification(message);
  };

  // AI Analytics secure server gateway
  const handleTriggerAI = async (type: string, data: any) => {
    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data })
      });
      return await response.json();
    } catch (e) {
      console.error("AI fetch failed", e);
      return { success: false, error: "Network Error" };
    }
  };

  // Toggle Network Online / Offline Simulation
  const handleToggleNetwork = () => {
    if (syncStatus === "connected") {
      setSyncStatus("offline");
      triggerNotification("ตัดสายเน็ตสำเร็จ: เปิดใช้ระบบออฟไลน์สมบูรณ์ (Offline Mode)");
    } else {
      setSyncStatus("connected");
      triggerNotification("เชื่อมเน็ตสำเร็จ: ตรวจพบเครือข่าย Google Sheets");
    }
  };

  // Trigger manually synchronizing offline queue back to sheets
  const handleSheetsSync = () => {
    if (syncStatus === "offline") {
      triggerNotification("ไม่สามารถซิงก์ได้ เนื่องจากจำลองสถานะออฟไลน์อยู่ กรุณาเชื่อมต่อเครือข่ายก่อน");
      return;
    }

    if (pendingSyncQueue.length === 0) {
      triggerNotification("ไม่มีข้อมูลออฟไลน์ค้างซิงก์ในเครื่อง");
      return;
    }

    setSyncStatus("syncing");
    
    // Simulate Apps Script delay
    setTimeout(() => {
      // Dump queued orders into live system
      pendingSyncQueue.forEach(order => {
        handlePlaceOrder(order);
      });
      setPendingSyncQueue([]);
      setSyncStatus("connected");
      triggerNotification("อัพโหลดบิลค้างซิงก์ขึ้น Google Sheets & Apps Script สำเร็จ!");
    }, 2000);
  };

  // Add Item, Recipe, Expense, Customer, Employee, Promo callbacks
  const handleAddMenuItem = (item: Omit<MenuItem, "id">) => {
    const id = `m${menuItems.length + 1}`;
    setMenuItems([...menuItems, { ...item, id }]);
    triggerNotification(`เพิ่มเมนูอาหาร '${item.name}' สำเร็จ`);
  };

  const handleUpdateRecipe = (recipe: Recipe) => {
    setRecipes(prev => {
      const idx = prev.findIndex(r => r.menuItemId === recipe.menuItemId);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = recipe;
        return copy;
      }
      return [...prev, recipe];
    });

    // Sync menu items average cost
    setMenuItems(prev => 
      prev.map(m => {
        if (m.id === recipe.menuItemId) {
          return { ...m, cost: recipe.totalCost };
        }
        return m;
      })
    );
  };

  const handleAdjustStock = (ingredientId: string, delta: number, action: StockCardAction, note: string) => {
    setInventory(prev => 
      prev.map(ing => {
        if (ing.id === ingredientId) {
          const previousStock = ing.currentStock;
          let newStock = previousStock;
          if (action === StockCardAction.IN) newStock += delta;
          else if (action === StockCardAction.OUT) newStock = Math.max(0, previousStock - delta);
          else if (action === StockCardAction.ADJUST) newStock = delta;

          newStock = Math.round(newStock * 100) / 100;

          // append stock card
          setStockCards(prevCards => [
            ...prevCards,
            {
              id: `SC-${Math.floor(10000 + Math.random() * 90000)}`,
              timestamp: new Date().toISOString(),
              ingredientId,
              ingredientName: ing.name,
              action,
              quantity: action === StockCardAction.OUT ? -delta : delta,
              previousStock,
              newStock,
              note,
              operator: currentUser?.name || "System Manager"
            }
          ]);

          return { ...ing, currentStock: newStock };
        }
        return ing;
      })
    );
    triggerNotification("ปรับสต๊อกวัตถุดิบและจดประวัติ Stock Card เรียบร้อย");
  };

  const handleAddStockItem = (item: Omit<InventoryItem, "id">) => {
    const id = `i${inventory.length + 1}`;
    setInventory([...inventory, { ...item, id }]);
    triggerNotification(`จดทะเบียนวัตถุดิบสต๊อก '${item.name}' ใหม่สำเร็จ`);
  };

  const handleAddExpense = (exp: Omit<Expense, "id">) => {
    const id = `ex${expenses.length + 1}`;
    const newExp: Expense = { ...exp, id };
    setExpenses([...expenses, newExp]);

    setCashBook(prevCash => [
      ...prevCash,
      {
        id: `cb-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "Expense",
        category: exp.category,
        amount: exp.amount,
        balance: (prevCash[prevCash.length - 1]?.balance || 35000) - exp.amount,
        reference: id,
        note: `จ่ายค่า: ${exp.category} (${exp.note})`
      } as any
    ]);

    triggerNotification(`หักจ่ายงบบัญชี: จ่ายค่า${exp.category} ฿${exp.amount}`);
  };

  const handleAddCustomer = (cust: Omit<Customer, "id" | "purchaseHistory" | "couponIds">) => {
    const id = `c${customers.length + 1}`;
    setCustomers([...customers, { ...cust, id, purchaseHistory: [], couponIds: [] }]);
    triggerNotification(`สมัครสมาชิกร้าน: '${cust.name}' สำเร็จ`);
  };

  const handleAddEmployee = (emp: Omit<Employee, "id" | "status">) => {
    const id = `e${employees.length + 1}`;
    setEmployees([...employees, { ...emp, id, status: "Active" }]);
    triggerNotification(`รับสมัครพนักงาน '${emp.name}' บรรจุสำเร็จ`);
  };

  const handleAddPromotion = (promo: Omit<Promotion, "id" | "isActive">) => {
    const id = `cp${promotions.length + 1}`;
    setPromotions([...promotions, { ...promo, id, isActive: true }]);
    triggerNotification(`สร้างโปรโมชั่นบัตรส่วนลดโค้ด '${promo.code}' สำเร็จ`);
  };

  // State Stock cards storage (logs)
  const [stockCards, setStockCards] = useState<StockCard[]>([
    { id: "SC-1", timestamp: "2026-07-15T08:00:00Z", ingredientId: "i1", ingredientName: "เนื้อหมูบดอนามัย", action: StockCardAction.IN, quantity: 15.0, previousStock: 0, newStock: 15.0, note: "รับเข้าล็อตเช้า CP", operator: "ผู้จัดการ พรทิพย์" },
    { id: "SC-2", timestamp: "2026-07-15T08:15:00Z", ingredientId: "i6", ingredientName: "ไข่ไก่เบอร์ 2 (สดใหม่)", action: StockCardAction.IN, quantity: 180, previousStock: 0, newStock: 180, note: "แผงไข่ไก่จากตลาดไท", operator: "ผู้จัดการ พรทิพย์" }
  ]);

  // If not logged in, render the login page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center p-4 selection:bg-red-600 selection:text-white" id="login-container">
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-950/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-900/40 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-[#11141a]/95 border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-red-600 rounded-2xl mx-auto flex items-center justify-center font-display font-extrabold text-2xl text-white shadow-xl shadow-red-600/20 border border-red-500/30">
              กพ
            </div>
            <h2 className="mt-4 text-md font-extrabold font-display tracking-tight text-white uppercase">ครัวกะเพรา POS Enterprise</h2>
            <p className="text-[10px] text-slate-500 tracking-wider uppercase font-mono mt-1">Restaurant Operating System (ROS)</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold tracking-wider uppercase mb-2">เลือกบทบาทพนักงานเข้าสู่ระบบ</label>
              <div className="grid grid-cols-2 gap-2.5">
                {[UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER, UserRole.STAFF].map((role) => (
                  <button
                    key={role}
                    onClick={() => setLoginRole(role)}
                    className={`py-3.5 px-4 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1.5 ${
                      loginRole === role
                        ? "bg-red-600/10 border-red-500 text-red-400 font-extrabold shadow-lg shadow-red-600/5"
                        : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-mono">{role}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl text-[10px] text-slate-500 leading-relaxed font-mono">
              <span className="font-bold text-slate-400 flex items-center space-x-1 mb-1">
                <UserCheck className="w-3.5 h-3.5 text-red-500" />
                <span>จำลองชื่อพนักงานผู้ใช้เข้าสู่ระบบ:</span>
              </span>
              {loginRole === UserRole.ADMIN && "อานนท์ เผาพริก (ผู้ดูแลรหัสผ่าน & ความปลอดภัยเครื่อง)"}
              {loginRole === UserRole.MANAGER && "ผู้จัดการ พรทิพย์ (ผู้สั่งวัตถุดิบและปรับปรุงสูตร)"}
              {loginRole === UserRole.CASHIER && "แคชเชียร์ ใจดี (ผู้คิดเงิน ถือตังค์ และรับบิล)"}
              {loginRole === UserRole.STAFF && "กุ๊ก สมัครใจ (กุ๊กผัดหน้าร้านกะเพราควันขโมง)"}
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold py-3.5 px-4 rounded-2xl text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-red-600/15 cursor-pointer border border-red-500/20"
              id="btn-login-submit"
            >
              <span>ลงชื่อเข้าใช้งานเครื่อง (Unlock POS)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] flex selection:bg-red-600 selection:text-white" id="main-layout">
      {/* Sidebar navigation */}
      <Sidebar
        currentTab={activeTab}
        setTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        syncStatus={syncStatus}
        pendingSyncCount={pendingSyncQueue.length}
        triggerSheetsSync={handleSheetsSync}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 bg-[#0d0f12] relative overflow-hidden" id="tab-viewport">
        
        {/* Floating Notification Alerts */}
        {alertNotification && (
          <div className="fixed top-4 right-4 bg-red-600 border border-red-500 text-white px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center space-x-3 text-xs animate-bounce font-medium">
            <Bell className="w-4 h-4 animate-swing" />
            <span>{alertNotification}</span>
          </div>
        )}

        {/* Tab Routers */}
        {activeTab === "dashboard" && (
          <DashboardView
            orders={orders}
            menuItems={menuItems}
            inventory={inventory}
            expenses={expenses}
            onTriggerAI={handleTriggerAI}
          />
        )}

        {activeTab === "pos" && (
          <POSView
            menuItems={menuItems}
            customers={customers}
            promotions={promotions}
            currentUser={currentUser}
            onPlaceOrder={handlePlaceOrder}
          />
        )}

        {activeTab === "kitchen" && (
          <KDSView
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {activeTab === "menu" && (
          <MenuRecipeView
            menuItems={menuItems}
            recipes={recipes}
            inventory={inventory}
            onAddMenuItem={handleAddMenuItem}
            onUpdateRecipe={handleUpdateRecipe}
          />
        )}

        {activeTab === "inventory" && (
          <InventoryView
            inventory={inventory}
            stockCards={stockCards}
            onAdjustStock={handleAdjustStock}
            onAddStockItem={handleAddStockItem}
          />
        )}

        {activeTab === "accounting" && (
          <AccountingView
            expenses={expenses}
            cashBook={cashBook}
            orders={orders}
            menuItems={menuItems}
            onAddExpense={handleAddExpense}
            balanceSheetData={balanceSheet}
          />
        )}

        {activeTab === "customers" && (
          <CustomerEmployeeView
            customers={customers}
            employees={employees}
            promotions={promotions}
            onAddCustomer={handleAddCustomer}
            onAddEmployee={handleAddEmployee}
            onAddPromotion={handleAddPromotion}
          />
        )}

        {activeTab === "google-sheets" && (
          <GoogleSheetsSiteView
            menuItems={menuItems}
            inventory={inventory}
            orders={orders}
            customers={customers}
            expenses={expenses}
            stockCards={stockCards}
            promotions={promotions}
            syncStatus={syncStatus}
            onToggleNetwork={handleToggleNetwork}
            onPlaceOrder={handlePlaceOrder}
            pendingSyncCount={pendingSyncQueue.length}
          />
        )}

        {activeTab === "settings" && (
          <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-40px)]" id="settings-tab-container">
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <h2 className="text-sm font-bold text-white font-display tracking-wider">ตั้งค่าระบบร้านครัวกะเพรา (Restaurant Settings)</h2>
              <p className="text-[10px] text-slate-400 mt-1">ตั้งค่าชื่อร้าน อัตราภาษี เครื่องพิมพ์ และสลิปการจ่ายเงินผ่าน QR PromptPay</p>
            </div>

            <div className="max-w-2xl bg-[#11141a] rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold mb-1">ชื่อร้านค้า (Display Title)</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold mb-1">อัตราภาษีมูลค่าเพิ่ม (%)</label>
                  <input
                    type="number"
                    value={storeTaxRate}
                    onChange={e => setStoreTaxRate(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none text-center font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold mb-1">IP เครื่องพิมพ์ใบเสร็จ (LAN/Wifi)</label>
                  <input
                    type="text"
                    value={printerIP}
                    onChange={e => setPrinterIP(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold mb-1">เบอร์พร้อมเพย์รับเงิน (PromptPay Number)</label>
                  <input
                    type="text"
                    value={promptPayPhone}
                    onChange={e => setPromptPayPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none text-center font-bold font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-500 font-mono">
                <span>Database Sync Frequency: Realtime triggers</span>
                <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded text-[9px]">ONLINE SYNC</span>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
