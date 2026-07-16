import React, { useState } from "react";
import { 
  Plus, 
  DollarSign, 
  PieChart, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Percent, 
  Briefcase 
} from "lucide-react";
import { Expense, CashBookEntry, BalanceSheet, ProfitLoss, Order, MenuItem } from "../types";

interface AccountingProps {
  expenses: Expense[];
  cashBook: CashBookEntry[];
  orders: Order[];
  menuItems: MenuItem[];
  onAddExpense: (expense: Omit<Expense, "id">) => void;
  balanceSheetData: BalanceSheet;
}

export default function AccountingView({
  expenses,
  cashBook,
  orders,
  menuItems,
  onAddExpense,
  balanceSheetData
}: AccountingProps) {
  // Add Expense Form State
  const [expenseCategory, setExpenseCategory] = useState<"ค่าเช่า" | "ค่าแรง" | "ค่าไฟ" | "ค่าน้ำ" | "วัตถุดิบ" | "อื่นๆ">("อื่นๆ");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseNote, setExpenseNote] = useState("");

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount) return;

    onAddExpense({
      date: new Date().toISOString().split('T')[0],
      category: expenseCategory,
      amount: parseFloat(expenseAmount),
      note: expenseNote
    });

    setExpenseAmount("");
    setExpenseNote("");
  };

  // Dynamically calculate Real Profit & Loss
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  // COGS based on recipe settings
  const totalCogs = orders.reduce((sum, o) => {
    return sum + o.items.reduce((s, item) => {
      const matchItem = menuItems.find(m => m.id === item.menuItemId);
      const c = matchItem ? matchItem.cost : 20;
      return s + (c * item.quantity);
    }, 0);
  }, 0);

  const totalOperatingExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalCogs - totalOperatingExpenses;
  const cogsPercent = totalRevenue > 0 ? Math.round((totalCogs / totalRevenue) * 100) : 0;
  const netProfitPercent = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-40px)]" id="accounting-view-container">
      {/* Header Banner */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-white font-display tracking-wider">ระบบงบบัญชีและการเงิน (Accounting & Cash Book)</h2>
          <p className="text-[10px] text-slate-400 mt-1">งบกำไรขาดทุน (P&L) งบดุล (Balance Sheet) และสมุดเงินสดรายวันประเมินความคุ้มทุน</p>
        </div>
      </div>

      {/* Top Cards (Revenue, Expenses, Net Profit) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Revenues */}
        <div className="bg-[#11141a] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <TrendingUp className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">รายรับรวม (Revenues)</p>
              <h3 className="text-md font-mono font-bold text-slate-200">฿{totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
          <span className="text-xs text-slate-500">POS Sales</span>
        </div>

        {/* Operating Expenses */}
        <div className="bg-[#11141a] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">รายจ่ายดำเนินการ (OPEX)</p>
              <h3 className="text-md font-mono font-bold text-slate-200">฿{totalOperatingExpenses.toLocaleString()}</h3>
            </div>
          </div>
          <span className="text-xs text-slate-500">Expenses</span>
        </div>

        {/* Net Profit */}
        <div className="bg-[#11141a] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <DollarSign className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">กำไรสุทธิประเมิน (Net Profit)</p>
              <h3 className={`text-md font-mono font-bold ${netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                ฿{netProfit.toLocaleString()}
              </h3>
            </div>
          </div>
          <span className="text-xs text-slate-500">P&L Status</span>
        </div>

      </div>

      {/* Main Grid: Profit & Loss Statement vs Balance Sheet */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Left Column: P&L Worksheet (7 columns) */}
        <div className="xl:col-span-7 bg-[#11141a] rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-200">งบกำไรขาดทุนสะสม (Profit & Loss Statement)</h3>
          </div>

          <div className="p-4 space-y-4">
            
            {/* P&L Table Form */}
            <div className="space-y-2 text-xs border-b border-slate-800 pb-4">
              <div className="flex justify-between font-bold text-slate-300">
                <span>1. รายรับขายจากหน้าร้าน (Gross POS Revenue)</span>
                <span className="font-mono text-emerald-400">฿{totalRevenue.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-slate-500 italic pl-4">หัก: ต้นทุนจัดสรรวัตถุดิบ (COGS - Recipe cost value)</p>
              
              <div className="flex justify-between font-medium text-slate-400 pl-4 border-l border-slate-800">
                <span>ต้นทุนอาหาร (Food Cost)</span>
                <span className="font-mono text-red-400">-฿{totalCogs.toLocaleString()}</span>
              </div>

              <div className="flex justify-between font-bold text-slate-300 pt-2">
                <span>กำไรขั้นต้น (Gross Profit)</span>
                <span className="font-mono">฿{(totalRevenue - totalCogs).toLocaleString()}</span>
              </div>
            </div>

            {/* Expenses breakdown */}
            <div className="space-y-2 text-xs border-b border-slate-800 pb-4">
              <p className="text-slate-300 font-bold">2. รายจ่ายดำเนินการร้านค้า (Operating Expenses - OPEX)</p>
              {expenses.map((e, idx) => (
                <div key={idx} className="flex justify-between text-slate-400 pl-4 border-l border-slate-800">
                  <span>{e.category} ({e.note})</span>
                  <span className="font-mono text-red-400">-฿{e.amount}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-slate-300 pt-2 pl-4">
                <span>รวมค่าใช้จ่ายคงที่</span>
                <span className="font-mono text-red-500">-฿{totalOperatingExpenses.toLocaleString()}</span>
              </div>
            </div>

            {/* Net Profits with gauges */}
            <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">กำไรสุทธิหลังหักภาษีประเมิน (EBT)</p>
                <h4 className={`text-lg font-mono font-bold ${netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  ฿{netProfit.toLocaleString()} ({netProfitPercent}%)
                </h4>
              </div>
              <div className="flex items-center space-x-2">
                <Percent className="w-5 h-5 text-indigo-400 animate-pulse" />
                <span className="text-xs text-slate-400 font-bold">สัดส่วน Margin สะสม</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Balance Sheet & Expense input (5 columns) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          
          {/* Quick Expense Logger */}
          <div className="bg-[#11141a] p-4 rounded-2xl border border-slate-800 shadow-lg space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5 border-b border-slate-800/60 pb-2">
              <Briefcase className="w-4 h-4 text-red-500" />
              <span>บันทึกรายจ่ายด่วน (Log Expense)</span>
            </h3>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold mb-1">หมวดหมู่รายจ่าย</label>
                  <select
                    value={expenseCategory}
                    onChange={e => setExpenseCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none"
                  >
                    <option value="ค่าเช่า">ค่าเช่า</option>
                    <option value="ค่าแรง">ค่าแรง</option>
                    <option value="ค่าไฟ">ค่าไฟ</option>
                    <option value="ค่าน้ำ">ค่าน้ำ</option>
                    <option value="วัตถุดิบ">วัตถุดิบ</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold mb-1">จำนวนเงิน (บาท)</label>
                  <input
                    type="number"
                    placeholder="300"
                    value={expenseAmount}
                    onChange={e => setExpenseAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none text-center"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-slate-500 font-bold mb-1">คำอธิบายเพิ่มเติม</label>
                <input
                  type="text"
                  placeholder="เช่น ซื้อแก๊สหุงต้ม ปิคนิค 1 ถัง"
                  value={expenseNote}
                  onChange={e => setExpenseNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ยืนยันบันทึกบัญชี / หักยอดสมุดเงินสด</span>
              </button>
            </form>
          </div>

          {/* Balance Sheet Ledger (งบดุล) */}
          <div className="bg-[#11141a] p-4 rounded-2xl border border-slate-800 shadow-lg flex-1">
            <h3 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5 border-b border-slate-800/60 pb-2 mb-3">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>งบดุลเสมือนจริง (Balance Sheet Ledger)</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              
              {/* Assets list */}
              <div className="space-y-1">
                <p className="text-emerald-400 font-bold text-[10px] uppercase">1. สินทรัพย์ทั้งหมด (Assets)</p>
                {balanceSheetData.assets.map((as, id) => (
                  <div key={id} className="flex justify-between pl-3 border-l border-emerald-950/40 text-slate-400">
                    <span>{as.name}</span>
                    <span className="font-mono">฿{as.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Liabilities */}
              <div className="space-y-1">
                <p className="text-red-400 font-bold text-[10px] uppercase">2. หนี้สินค้างจ่าย (Liabilities)</p>
                {balanceSheetData.liabilities.map((lb, id) => (
                  <div key={id} className="flex justify-between pl-3 border-l border-red-950/40 text-slate-400">
                    <span>{lb.name}</span>
                    <span className="font-mono">฿{lb.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Equity */}
              <div className="space-y-1">
                <p className="text-indigo-400 font-bold text-[10px] uppercase">3. ส่วนของผู้ถือหุ้น (Equity)</p>
                {balanceSheetData.equity.map((eq, id) => (
                  <div key={id} className="flex justify-between pl-3 border-l border-indigo-950/40 text-slate-400">
                    <span>{eq.name}</span>
                    <span className="font-mono">฿{eq.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
