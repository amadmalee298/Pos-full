import React, { useState } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Zap, 
  Sparkles, 
  Cpu, 
  ArrowUpRight, 
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import { Order, MenuItem, InventoryItem, Expense } from "../types";

interface DashboardProps {
  orders: Order[];
  menuItems: MenuItem[];
  inventory: InventoryItem[];
  expenses: Expense[];
  onTriggerAI: (type: string, data: any) => Promise<any>;
}

export default function DashboardView({
  orders,
  menuItems,
  inventory,
  expenses,
  onTriggerAI
}: DashboardProps) {
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiType, setAiType] = useState<string>("");

  // Calculate standard POS metrics
  const todayOrders = orders.filter(o => {
    const today = new Date().toDateString();
    return new Date(o.timestamp).toDateString() === today;
  });

  const totalSalesToday = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = todayOrders.length;
  const averageBill = totalOrdersCount > 0 ? Math.round(totalSalesToday / totalOrdersCount) : 0;

  // Inventory Cost estimate
  const lowStockItems = inventory.filter(i => i.currentStock <= i.minStock);

  // Total monthly expenses sum
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Total revenue of all orders
  const totalRevenueAllTime = orders.reduce((sum, o) => sum + o.total, 0);

  // Profit/Loss calculation
  const totalFoodCostAllTime = orders.reduce((sum, o) => {
    return sum + o.items.reduce((s, item) => {
      // Find food cost of this menu item
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      const costPerPlate = menuItem ? menuItem.cost : 20; // fallback cost
      return s + (costPerPlate * item.quantity);
    }, 0);
  }, 0);

  const netProfitAllTime = totalRevenueAllTime - totalFoodCostAllTime - totalExpenses;
  const foodCostPercent = totalRevenueAllTime > 0 ? Math.round((totalFoodCostAllTime / totalRevenueAllTime) * 100) : 0;

  // Top selling menu calculations
  const menuSalesMap: Record<string, number> = {};
  orders.forEach(o => {
    o.items.forEach(item => {
      menuSalesMap[item.name] = (menuSalesMap[item.name] || 0) + item.quantity;
    });
  });

  const sortedBestSellers = Object.entries(menuSalesMap)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 3);

  // Break even progress percentage (target is monthly expenses)
  const breakEvenTarget = totalExpenses || 25000;
  const breakEvenProgress = Math.min(100, Math.round((totalRevenueAllTime / breakEvenTarget) * 100));

  // Triggering the server-side AI analyst
  const runAIAnalysis = async (type: string) => {
    setAiLoading(true);
    setAiType(type);
    setAiResult(null);

    let dataToAnalyze = {};
    if (type === "profit-cost") {
      dataToAnalyze = menuItems.map(m => ({ name: m.name, price: m.price, estimatedCost: m.cost }));
    } else if (type === "sales-forecast") {
      dataToAnalyze = orders.map(o => ({ date: o.timestamp, total: o.total, itemsCount: o.items.length }));
    } else if (type === "purchase-recommendation") {
      dataToAnalyze = inventory.map(i => ({ name: i.name, current: i.currentStock, min: i.minStock, unit: i.unit }));
    } else if (type === "promo-generator") {
      dataToAnalyze = menuItems.slice(0, 4).map(m => ({ name: m.name, price: m.price }));
    }

    try {
      const response = await onTriggerAI(type, dataToAnalyze);
      if (response && response.success) {
        setAiResult(response.analysis);
      }
    } catch (e) {
      console.error("AI client error", e);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-40px)]" id="dashboard-view-container">
      {/* Banner / Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-slate-950 to-[#11141a] p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-md font-bold text-white tracking-wider font-display">แผงควบคุมหลัก (Enterprise POS Dashboard)</h2>
          <p className="text-[10px] text-slate-400 mt-1">สรุปข้อมูลขาย หน้าร้าน ครัว บัญชี และวัตถุดิบอัตโนมัติ</p>
        </div>
        <div className="flex items-center space-x-2 text-[11px] bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
          <Calendar className="w-4 h-4 text-red-500" />
          <span>รอบยอดขาย: วันนี้ ({new Date().toLocaleDateString("th-TH")})</span>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        
        {/* Metric 1 */}
        <div className="bg-[#11141a]/95 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-slate-500">ยอดขายรวมวันนี้</span>
            <span className="p-1.5 bg-red-600/10 text-red-400 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-mono font-bold text-slate-100">฿{totalSalesToday.toLocaleString()}</h3>
            <p className="text-[9px] text-emerald-400 flex items-center space-x-0.5 mt-0.5">
              <ArrowUpRight className="w-2.5 h-2.5" />
              <span>+15% เทียบเมื่อวาน</span>
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#11141a]/95 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-slate-500">กำไรสุทธิคาดการณ์</span>
            <span className="p-1.5 bg-emerald-600/10 text-emerald-400 rounded-lg">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-mono font-bold text-slate-100">฿{netProfitAllTime.toLocaleString()}</h3>
            <p className="text-[9px] text-slate-500 mt-0.5">หักต้นทุนอาหาร & ค่าใช้จ่ายแล้ว</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#11141a]/95 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-slate-500">สัดส่วน Food Cost %</span>
            <span className="p-1.5 bg-indigo-600/10 text-indigo-400 rounded-lg">
              <PieChart className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-mono font-bold text-indigo-400">{foodCostPercent}%</h3>
            <p className="text-[9px] text-slate-500 mt-0.5">เกณฑ์อุตสาหกรรมดีเยี่ยม (ต่ำกว่า 35%)</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#11141a]/95 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-slate-500">จำนวนออเดอร์วันนี้</span>
            <span className="p-1.5 bg-amber-600/10 text-amber-400 rounded-lg">
              <ShoppingBag className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-mono font-bold text-slate-100">{totalOrdersCount} บิล</h3>
            <p className="text-[9px] text-amber-400 flex items-center space-x-1 mt-0.5">
              <span>บิลเฉลี่ย: ฿{averageBill}</span>
            </p>
          </div>
        </div>

      </div>

      {/* Main Grid: AI Assistant & Visual Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Left: AI Assistant & Smart Analytics (7 columns) */}
        <div className="xl:col-span-7 bg-[#11141a] rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-red-500 animate-spin" />
              <h3 className="text-xs font-bold text-white tracking-wider">AI วิเคราะห์อัจฉริยะ (Kaprao AI Analyst)</h3>
            </div>
            <span className="text-[9px] bg-red-600/20 text-red-400 border border-red-500/20 font-bold px-2 py-0.5 rounded-full">
              Gemini Integrated
            </span>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
            {/* AI Control Buttons Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => runAIAnalysis("profit-cost")}
                className="p-3.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-slate-600 group-hover:text-red-500 transition-colors" />
                </div>
                <h4 className="text-[11px] font-bold text-slate-200 mt-2.5">วิเคราะห์กำไร & ต้นทุนอาหาร</h4>
                <p className="text-[9px] text-slate-500 mt-1 line-clamp-1">วิเคราะห์สูตรกะเพราและ Portion</p>
              </button>

              <button
                onClick={() => runAIAnalysis("sales-forecast")}
                className="p-3.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-slate-600 group-hover:text-red-500 transition-colors" />
                </div>
                <h4 className="text-[11px] font-bold text-slate-200 mt-2.5">คาดการณ์ยอดขายรายสัปดาห์</h4>
                <p className="text-[9px] text-slate-500 mt-1 line-clamp-1">ทำนายยอดสั่งกะเพราล่วงหน้า 7 วัน</p>
              </button>

              <button
                onClick={() => runAIAnalysis("purchase-recommendation")}
                className="p-3.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-slate-600 group-hover:text-red-500 transition-colors" />
                </div>
                <h4 className="text-[11px] font-bold text-slate-200 mt-2.5">คำนวณวัตถุดิบขาดสต๊อกด่วน</h4>
                <p className="text-[9px] text-slate-500 mt-1 line-clamp-1">คำนวณผัก/หมูบด/พริกแห้งขาด</p>
              </button>

              <button
                onClick={() => runAIAnalysis("promo-generator")}
                className="p-3.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-slate-600 group-hover:text-red-500 transition-colors" />
                </div>
                <h4 className="text-[11px] font-bold text-slate-200 mt-2.5">สร้างโปรโมชั่นอัตโนมัติ</h4>
                <p className="text-[9px] text-slate-500 mt-1 line-clamp-1">ดึงลูกค้าช่วงบ่ายที่ยอดขายตก</p>
              </button>
            </div>

            {/* AI Output Window */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 min-h-[160px] flex flex-col justify-between">
              {aiLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-6">
                  <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-300">
                      {aiType === "profit-cost" && "กำลังจำลองสูตรและคำนวณ Food Cost..."}
                      {aiType === "sales-forecast" && "กำลังวิเคราะห์ประวัติออเดอร์ด้วยแบบจำลองอนุกรมเวลา..."}
                      {aiType === "purchase-recommendation" && "กำลังตรวจสอบพริกและไข่ไก่เหลือในคลัง..."}
                      {aiType === "promo-generator" && "กำลังออกแบบเซ็ตคอมโบกะเพราพริกแห้ง..."}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">ส่งคำขอไปที่เซิร์ฟเวอร์ Gemini ...</p>
                  </div>
                </div>
              ) : aiResult ? (
                <div className="space-y-3.5 text-xs">
                  {/* Common Title */}
                  <div className="flex items-center space-x-1.5 border-b border-slate-800/60 pb-2">
                    <Sparkles className="w-3.5 h-3.5 text-red-500" />
                    <span className="font-bold text-red-400 uppercase tracking-wider font-mono text-[10px]">
                      {aiType === "profit-cost" && "Food Cost & Margins Report"}
                      {aiType === "sales-forecast" && "7-Day Sales Projections"}
                      {aiType === "purchase-recommendation" && "Procurement & Shortages Alert"}
                      {aiType === "promo-generator" && "Auto Promo Concepts Generated"}
                    </span>
                  </div>

                  {/* Profit Margin Analysis Layout */}
                  {aiType === "profit-cost" && (
                    <div className="space-y-3">
                      <p className="text-slate-300 leading-relaxed text-[11px]">{aiResult.summary}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {aiResult.itemAnalysis?.map((itm: any, idx: number) => (
                          <div key={idx} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-slate-200 truncate max-w-[120px]">{itm.name}</p>
                              <p className="text-[9px] text-slate-400">ต้นทุนสะสม: {itm.foodCostPercent}%</p>
                            </div>
                            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                              itm.status === "Good" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                            }`}>{itm.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sales Forecast layout */}
                  {aiType === "sales-forecast" && (
                    <div className="space-y-3">
                      <p className="text-slate-300 text-[11px] leading-relaxed">{aiResult.forecastSummary}</p>
                      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {aiResult.predictedSales?.map((f: any, idx: number) => (
                          <div key={idx} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 min-w-[75px] text-center">
                            <p className="text-slate-400 text-[9px] font-bold">{f.day}</p>
                            <p className="text-slate-200 font-bold font-mono text-xs mt-1">฿{f.expectedRevenue}</p>
                            <p className="text-[9px] text-emerald-400 font-mono font-medium mt-0.5">{f.predictedOrders} บิล</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] bg-red-950/20 border border-red-950/30 text-red-400 p-2 rounded-lg leading-relaxed">
                        💡 <strong>เทรนด์กะเพรายอดนิยม:</strong> {aiResult.peakBasilTrend}
                      </p>
                    </div>
                  )}

                  {/* Procurement shortage layout */}
                  {aiType === "purchase-recommendation" && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-red-950/25 border border-red-500/20 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-300 font-semibold">ระดับความตึงตัวของคลังผักใบกะเพรา:</span>
                        <span className="bg-red-600 text-white font-bold font-mono text-[9px] px-2 py-0.5 rounded">
                          {aiResult.urgency}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {aiResult.criticalShortages?.map((sh: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-[11px] p-1.5 bg-slate-900 rounded border border-slate-800/80">
                            <span className="font-bold text-slate-300">{sh.ingredient}</span>
                            <div className="text-right">
                              <p className="text-amber-500 font-semibold text-[10px]">แนะนำสั่งด่วน: {sh.suggestedPurchase}</p>
                              <p className="text-[9px] text-slate-500">คงเหลือ: {sh.currentStock}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed italic">*คำปรึกษาคู่จัดส่ง: {aiResult.supplierAdvice}</p>
                    </div>
                  )}

                  {/* Promo concepts layout */}
                  {aiType === "promo-generator" && (
                    <div className="space-y-3">
                      <p className="text-slate-300 text-[11px] leading-relaxed">{aiResult.promoSummary}</p>
                      <div className="space-y-2">
                        {aiResult.promotions?.map((p: any, idx: number) => (
                          <div key={idx} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                            <div className="flex justify-between items-center">
                              <h5 className="font-bold text-slate-200">{p.title}</h5>
                              <span className="bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded text-[9px]">{p.discountRate}</span>
                            </div>
                            <p className="text-slate-400 text-[10px] mt-1">{p.description}</p>
                            <span className="text-[9px] text-slate-500 font-mono mt-1.5 block">เป้าหมาย: {p.targetGroup}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-600">
                  <Cpu className="w-8 h-8 mb-2 text-slate-700" />
                  <p className="text-[11px] font-semibold">หน้าต่างสรุปผลวิเคราะห์ AI</p>
                  <p className="text-[10px] text-slate-600 mt-1">กรุณากดคลิกฟีเจอร์ AI เมนูด้านบนเพื่อเริ่มต้นดึงข้อมูลจากระบบ</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Best Sellers & Break Even (5 columns) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          
          {/* Break-Even Progress widget */}
          <div className="bg-[#11141a] p-4 rounded-2xl border border-slate-800 shadow-lg">
            <h3 className="text-xs font-bold text-slate-300 tracking-wider flex items-center space-x-1.5 mb-3.5">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>จุดคุ้มทุนสะสมประจำเดือน (Break-even Progress)</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">ยอดสะสม: ฿{totalRevenueAllTime.toLocaleString()}</span>
                <span className="text-slate-300">เป้าหมาย (Fix cost): ฿{breakEvenTarget.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 border border-slate-800/80">
                <div 
                  className="bg-gradient-to-r from-red-600 to-amber-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${breakEvenProgress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-amber-500 font-bold">{breakEvenProgress}% คุ้มทุน</span>
                <span className="text-slate-500">ขาดอีก ฿{(Math.max(0, breakEvenTarget - totalRevenueAllTime)).toLocaleString()} จะคุ้มค่าใช้จ่ายคงที่</span>
              </div>
            </div>
          </div>

          {/* Top Selling Menus card */}
          <div className="bg-[#11141a] p-4 rounded-2xl border border-slate-800 shadow-lg flex-1">
            <h3 className="text-xs font-bold text-slate-300 tracking-wider flex items-center space-x-1.5 mb-3.5">
              <Sparkles className="w-4 h-4 text-red-500 animate-pulse" />
              <span>กะเพราขายดีที่สุด (Best-Sellers)</span>
            </h3>

            <div className="space-y-3">
              {sortedBestSellers.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-6">ไม่มีประวัติจำหน่ายวันนี้</p>
              ) : (
                sortedBestSellers.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-red-600/10 text-red-400 font-bold font-mono text-xs rounded-lg flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <span className="text-xs font-semibold text-slate-200">{item.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">{item.qty} จาน</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Stock warning capsule */}
          {lowStockItems.length > 0 && (
            <div className="bg-red-950/20 border border-red-900/60 p-4 rounded-2xl flex items-center space-x-3 shadow-lg">
              <AlertTriangle className="w-6 h-6 text-red-500 animate-bounce flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-red-400">วัตถุดิบขาดแคลนใกล้หมดคลัง!</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">มีวัตถุดิบทั้งหมด {lowStockItems.length} รายการที่ต่ำกว่าเกณฑ์ขั้นต่ำ กรุณากดตรวจสอบระบบเพื่อสั่งซื้อด่วน</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
