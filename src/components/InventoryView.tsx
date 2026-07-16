import React, { useState } from "react";
import { 
  Plus, 
  Minus, 
  Search, 
  FileText, 
  AlertTriangle, 
  Calendar, 
  Clipboard, 
  Settings,
  RefreshCw
} from "lucide-react";
import { InventoryItem, StockCard, StockCardAction } from "../types";

interface InventoryProps {
  inventory: InventoryItem[];
  stockCards: StockCard[];
  onAdjustStock: (ingredientId: string, delta: number, action: StockCardAction, note: string) => void;
  onAddStockItem: (item: Omit<InventoryItem, "id">) => void;
}

export default function InventoryView({
  inventory,
  stockCards,
  onAdjustStock,
  onAddStockItem
}: InventoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(inventory[0] || null);
  
  // Adjust stock input
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustNote, setAdjustNote] = useState("ตรวจนับสต๊อกหน้าร้าน");
  const [adjustAction, setAdjustAction] = useState<StockCardAction>(StockCardAction.ADJUST);

  // New stock item input
  const [newItemName, setNewItemName] = useState("");
  const [newItemMin, setNewItemMin] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("กก.");
  const [newItemPrice, setNewItemPrice] = useState("");

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdjust = () => {
    if (!selectedItem || !adjustQty) return;
    const qtyVal = parseFloat(adjustQty);
    onAdjustStock(selectedItem.id, qtyVal, adjustAction, adjustNote);
    
    // reset
    setAdjustQty("");
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemMin || !newItemPrice) return;

    onAddStockItem({
      name: newItemName,
      currentStock: 0,
      minStock: parseFloat(newItemMin),
      unit: newItemUnit,
      averagePricePerUnit: parseFloat(newItemPrice)
    });

    setNewItemName("");
    setNewItemMin("");
    setNewItemPrice("");
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-40px)]" id="inventory-view-container">
      {/* Title */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-white font-display tracking-wider">ระบบจัดการคลังวัตถุดิบ (Inventory & Stock Card)</h2>
          <p className="text-[10px] text-slate-400 mt-1">ตรวจสอบผัก/เนื้อ/พริก ตัดสต๊อกสูตรอาหารอัตโนมัติจาก POS และบันทึกประวัติ Stock Card</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Left: Stock table & New Stock item (7 columns) */}
        <div className="xl:col-span-7 bg-[#11141a] rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-slate-200">วัตถุดิบในคลังสินค้า ({inventory.length} รายการ)</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="ค้นหาวัตถุดิบ..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* New Stock Add Form */}
          <form onSubmit={handleAddNewItem} className="p-4 bg-slate-950/40 border-b border-slate-800/60 grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
            <div>
              <label className="block text-[9px] text-slate-500 font-bold mb-1">ชื่อวัตถุดิบสะสม</label>
              <input
                type="text"
                placeholder="พริกขี้หนูสวนสวนพรีเมียม"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 font-bold mb-1">หน่วยนับ</label>
              <select
                value={newItemUnit}
                onChange={e => setNewItemUnit(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none"
              >
                <option value="กก.">กก.</option>
                <option value="ฟอง">ฟอง</option>
                <option value="ลิตร">ลิตร</option>
                <option value="ถุง">ถุง</option>
                <option value="หน่วย">หน่วย</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 font-bold mb-1">ราคากลาง/หน่วย</label>
              <input
                type="number"
                placeholder="120"
                value={newItemPrice}
                onChange={e => setNewItemPrice(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มสต๊อก</span>
            </button>
          </form>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                  <th className="p-3">วัตถุดิบ</th>
                  <th className="p-3 text-right">จำนวนคงเหลือ</th>
                  <th className="p-3 text-right">เกณฑ์ขั้นต่ำ</th>
                  <th className="p-3 text-right">ราคากลาง</th>
                  <th className="p-3">หน่วย</th>
                  <th className="p-3">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredInventory.map(item => {
                  const isLow = item.currentStock <= item.minStock;
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`cursor-pointer transition-all ${
                        isSelected ? "bg-red-600/10" : "hover:bg-slate-900/40"
                      }`}
                    >
                      <td className="p-3 font-bold text-slate-200">{item.name}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-100">{item.currentStock}</td>
                      <td className="p-3 text-right font-mono text-slate-400">{item.minStock}</td>
                      <td className="p-3 text-right font-mono text-slate-400">฿{item.averagePricePerUnit}</td>
                      <td className="p-3 text-slate-400">{item.unit}</td>
                      <td className="p-3">
                        {isLow ? (
                          <span className="bg-red-500/15 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded border border-red-500/10 animate-pulse">
                            Low Stock
                          </span>
                        ) : (
                          <span className="bg-emerald-500/15 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/10">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Manual Adjust & Stock Card History Logs (5 columns) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          
          {/* Adjust Stock Panel */}
          {selectedItem ? (
            <div className="bg-[#11141a] p-4 rounded-2xl border border-slate-800 shadow-lg space-y-3">
              <h3 className="text-xs font-bold text-slate-200 tracking-wide">
                ปรับปรุงสต๊อก: <span className="text-red-400">{selectedItem.name}</span>
              </h3>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold mb-1">การดำเนินการ</label>
                  <select
                    value={adjustAction}
                    onChange={e => setAdjustAction(e.target.value as StockCardAction)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none"
                  >
                    <option value={StockCardAction.IN}>{StockCardAction.IN}</option>
                    <option value={StockCardAction.OUT}>{StockCardAction.OUT}</option>
                    <option value={StockCardAction.ADJUST}>{StockCardAction.ADJUST}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold mb-1">จำนวนหน่วย ({selectedItem.unit})</label>
                  <input
                    type="number"
                    placeholder="5.0"
                    step="0.1"
                    value={adjustQty}
                    onChange={e => setAdjustQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-slate-500 font-bold mb-1">หมายเหตุ / บันทึกประวัติ</label>
                <input
                  type="text"
                  placeholder="เช่น เบิกออกใช้สำหรับทอดไข่ดาวบิลเสีย"
                  value={adjustNote}
                  onChange={e => setAdjustNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none"
                />
              </div>

              <button
                onClick={handleAdjust}
                disabled={!adjustQty}
                className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-40 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-lg"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ยืนยันบันทึกประวัติ Stock Card</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#11141a] p-6 rounded-2xl border border-slate-800 text-center text-slate-600">
              <Clipboard className="w-8 h-8 mx-auto mb-2 text-slate-700" />
              <p className="text-xs">ไม่ได้เลือกวัตถุดิบเพื่อปรับสต๊อก</p>
            </div>
          )}

          {/* Stock Card Logs */}
          <div className="bg-[#11141a] rounded-2xl border border-slate-800 flex-1 flex flex-col overflow-hidden shadow-lg">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>ประวัติเคลื่อนไหววัตถุดิบ (Stock Card Log)</span>
              </h4>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {stockCards.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-6">ไม่มีประวัติความเคลื่อนไหว</p>
              ) : (
                stockCards.slice().reverse().map((card) => (
                  <div key={card.id} className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/80 text-[10px] space-y-1">
                    <div className="flex justify-between font-bold text-slate-300">
                      <span>{card.ingredientName}</span>
                      <span className={
                        card.action === StockCardAction.IN ? "text-emerald-400" : "text-amber-500"
                      }>{card.action} ({card.quantity > 0 ? `+${card.quantity}` : card.quantity})</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[9px] font-mono">
                      <span>สต๊อก: {card.previousStock} → {card.newStock}</span>
                      <span>{new Date(card.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-400 italic text-[9px] bg-slate-900/60 p-1 rounded mt-1 border border-slate-800/20">
                      โน้ต: {card.note} | โดย: {card.operator}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
