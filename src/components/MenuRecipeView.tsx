import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  DollarSign, 
  Settings, 
  Utensils, 
  ChevronRight, 
  Layers,
  Percent
} from "lucide-react";
import { MenuItem, ItemCategory, Recipe, InventoryItem } from "../types";

interface MenuRecipeProps {
  menuItems: MenuItem[];
  recipes: Recipe[];
  inventory: InventoryItem[];
  onAddMenuItem: (item: Omit<MenuItem, "id">) => void;
  onUpdateRecipe: (recipe: Recipe) => void;
}

export default function MenuRecipeView({
  menuItems,
  recipes,
  inventory,
  onAddMenuItem,
  onUpdateRecipe
}: MenuRecipeProps) {
  // Menu Item Add Form State
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<ItemCategory>(ItemCategory.BASIL);
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemImage, setNewItemImage] = useState("https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80");
  
  // Recipe Config State
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(menuItems[0] || null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(
    recipes.find(r => r.menuItemId === menuItems[0]?.id) || null
  );

  // Temp ingredient line add
  const [recipeIngredientId, setRecipeIngredientId] = useState("");
  const [recipeQty, setRecipeQty] = useState("");

  const handleSelectMenuItem = (item: MenuItem) => {
    setSelectedMenuItem(item);
    const existingRecipe = recipes.find(r => r.menuItemId === item.id);
    if (existingRecipe) {
      setSelectedRecipe(existingRecipe);
    } else {
      setSelectedRecipe({
        id: `r-${item.id}`,
        menuItemId: item.id,
        menuItemName: item.name,
        ingredients: [],
        totalCost: 0,
        foodCostPercent: 0
      });
    }
  };

  const handleAddMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;

    onAddMenuItem({
      name: newItemName,
      category: newItemCategory,
      price: parseFloat(newItemPrice),
      cost: 0,
      image: newItemImage,
      status: "Available"
    });

    setNewItemName("");
    setNewItemPrice("");
  };

  // Recipe builder logic
  const handleAddRecipeIngredient = () => {
    if (!selectedRecipe || !recipeIngredientId || !recipeQty) return;

    const ing = inventory.find(i => i.id === recipeIngredientId);
    if (!ing) return;

    const qtyVal = parseFloat(recipeQty);
    const newIngredients = [...selectedRecipe.ingredients];
    const existingIdx = newIngredients.findIndex(li => li.ingredientId === recipeIngredientId);

    if (existingIdx > -1) {
      newIngredients[existingIdx].quantity += qtyVal;
    } else {
      newIngredients.push({
        ingredientId: recipeIngredientId,
        quantity: qtyVal,
        unit: ing.unit
      });
    }

    // Recalculate costs
    let newTotalCost = 0;
    newIngredients.forEach(line => {
      const dbIng = inventory.find(i => i.id === line.ingredientId);
      if (dbIng) {
        newTotalCost += line.quantity * dbIng.averagePricePerUnit;
      }
    });

    const finalCost = Math.round(newTotalCost * 100) / 100;
    const foodCostPercent = selectedMenuItem ? Math.round((finalCost / selectedMenuItem.price) * 100) : 0;

    const updatedRecipe = {
      ...selectedRecipe,
      ingredients: newIngredients,
      totalCost: finalCost,
      foodCostPercent
    };

    setSelectedRecipe(updatedRecipe);
    onUpdateRecipe(updatedRecipe);

    setRecipeQty("");
  };

  const handleRemoveRecipeIngredient = (ingId: string) => {
    if (!selectedRecipe) return;

    const newIngredients = selectedRecipe.ingredients.filter(i => i.ingredientId !== ingId);

    let newTotalCost = 0;
    newIngredients.forEach(line => {
      const dbIng = inventory.find(i => i.id === line.ingredientId);
      if (dbIng) {
        newTotalCost += line.quantity * dbIng.averagePricePerUnit;
      }
    });

    const finalCost = Math.round(newTotalCost * 100) / 100;
    const foodCostPercent = selectedMenuItem ? Math.round((finalCost / selectedMenuItem.price) * 100) : 0;

    const updatedRecipe = {
      ...selectedRecipe,
      ingredients: newIngredients,
      totalCost: finalCost,
      foodCostPercent
    };

    setSelectedRecipe(updatedRecipe);
    onUpdateRecipe(updatedRecipe);
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-40px)]" id="menu-recipe-view-container">
      {/* Header banner */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-white font-display tracking-wider">บริหารจัดการเมนูอาหาร & สูตรต้นทุน (Menu & Recipes)</h2>
          <p className="text-[10px] text-slate-400 mt-1">เพิ่มเมนูกะเพรา คำนวณสัดส่วนวัตถุดิบรายจาน และแสดงค่าเฉลี่ยอัตรากำไรทันที</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Left Column: Menu Items list + Create MenuItem (7 columns) */}
        <div className="xl:col-span-7 bg-[#11141a] rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-200">รายการเมนูทั้งหมดของร้าน ({menuItems.length})</h3>
          </div>

          {/* Quick Create form */}
          <form onSubmit={handleAddMenuItem} className="p-4 bg-slate-950/40 border-b border-slate-800/60 grid grid-cols-1 md:grid-cols-4 gap-2.5 items-end">
            <div>
              <label className="block text-[9px] text-slate-500 font-bold mb-1">ชื่อเมนูอาหารใหม่</label>
              <input
                type="text"
                placeholder="กะเพราหมูสับพิเศษ"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 font-bold mb-1">หมวดหมู่เมนู</label>
              <select
                value={newItemCategory}
                onChange={e => setNewItemCategory(e.target.value as ItemCategory)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none"
              >
                {Object.values(ItemCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 font-bold mb-1">ราคาขาย (บาท)</label>
              <input
                type="number"
                placeholder="80"
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
              <span>เพิ่มเมนู</span>
            </button>
          </form>

          {/* Menu Items list table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                  <th className="p-3">เมนูอาหาร</th>
                  <th className="p-3">หมวดหมู่</th>
                  <th className="p-3 text-right">ราคาขาย</th>
                  <th className="p-3 text-right">วัตถุดิบ (จาน)</th>
                  <th className="p-3 text-right">สัดส่วน Cost %</th>
                  <th className="p-3">ตัวเลือก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {menuItems.map(item => {
                  const r = recipes.find(rc => rc.menuItemId === item.id);
                  const isSelected = selectedMenuItem?.id === item.id;
                  const itemCost = r ? r.totalCost : item.cost;
                  const foodCostPct = item.price > 0 ? Math.round((itemCost / item.price) * 100) : 0;

                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => handleSelectMenuItem(item)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-red-600/10" : "hover:bg-slate-900/40"
                      }`}
                    >
                      <td className="p-3 flex items-center space-x-2.5">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-lg object-cover bg-slate-950" 
                        />
                        <span className="font-bold text-slate-200">{item.name}</span>
                      </td>
                      <td className="p-3 text-slate-400">{item.category}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-200">฿{item.price}</td>
                      <td className="p-3 text-right font-mono text-slate-400">
                        {itemCost > 0 ? `฿${itemCost}` : "ยังไม่ใส่สูตร"}
                      </td>
                      <td className="p-3 text-right font-mono font-bold">
                        {foodCostPct > 0 ? (
                          <span className={foodCostPct > 40 ? "text-red-400" : "text-emerald-400"}>
                            {foodCostPct}%
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400">
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recipe details configuration (5 columns) */}
        <div className="xl:col-span-5 bg-[#11141a] rounded-2xl border border-slate-800 flex flex-col shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200">สัดส่วนสูตรคำนวณต้นทุนต่อจาน</h3>
            <span className="text-[10px] bg-red-600/20 text-red-400 font-bold px-2.5 py-0.5 rounded-full font-mono">
              Recipe Config
            </span>
          </div>

          {selectedMenuItem ? (
            <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-800/60">
                  <img 
                    src={selectedMenuItem.image} 
                    alt={selectedMenuItem.name} 
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover" 
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{selectedMenuItem.name}</h4>
                    <p className="text-[10px] text-slate-500">หมวดหมู่: {selectedMenuItem.category} | ราคาขาย: ฿{selectedMenuItem.price}</p>
                  </div>
                </div>

                {/* Ingredients add inside recipe */}
                <div className="py-3.5 border-b border-slate-800/40 grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] text-slate-500 font-bold mb-1">เลือกวัตถุดิบสต๊อก</label>
                    <select
                      value={recipeIngredientId}
                      onChange={e => setRecipeIngredientId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-[11px] focus:outline-none"
                    >
                      <option value="">-- เลือกวัตถุดิบ --</option>
                      {inventory.map(i => (
                        <option key={i.id} value={i.id}>{i.name} (฿{i.averagePricePerUnit}/{i.unit})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold mb-1">ปริมาณใช้</label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        placeholder="0.1"
                        step="0.01"
                        value={recipeQty}
                        onChange={e => setRecipeQty(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-[11px] focus:outline-none text-center"
                      />
                      <button
                        onClick={handleAddRecipeIngredient}
                        className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-2.5 py-1.5 flex items-center justify-center transition-all cursor-pointer"
                        title="Add Ingredient to Recipe"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active recipe lines */}
                <div className="space-y-2 mt-3 max-h-[220px] overflow-y-auto">
                  <p className="text-[10px] text-slate-500 font-bold">ส่วนประกอบปัจจุบัน:</p>
                  {selectedRecipe && selectedRecipe.ingredients.length > 0 ? (
                    selectedRecipe.ingredients.map(line => {
                      const dbIng = inventory.find(i => i.id === line.ingredientId);
                      const unitCost = dbIng ? line.quantity * dbIng.averagePricePerUnit : 0;
                      return (
                        <div key={line.ingredientId} className="flex justify-between items-center p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80">
                          <div>
                            <p className="text-xs font-bold text-slate-200">{dbIng?.name || "ไม่ทราบวัตถุดิบ"}</p>
                            <p className="text-[10px] text-slate-500 font-mono">ปริมาณ: {line.quantity} {line.unit} | ตก ฿{unitCost.toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveRecipeIngredient(line.ingredientId)}
                            className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-600 text-center py-6">ยังไม่ได้เพิ่มวัตถุดิบคำนวณต้นทุน</p>
                  )}
                </div>
              </div>

              {/* Recipe Costing Summary Box */}
              {selectedRecipe && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 mt-3">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2.5 bg-red-600/10 text-red-500 rounded-xl">
                      <Percent className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">ต้นทุนอาหารรวมต่อจาน</p>
                      <h4 className="text-lg font-mono font-bold text-slate-100">฿{selectedRecipe.totalCost}</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">สัดส่วน Food Cost %</p>
                    <span className={`text-md font-mono font-bold ${
                      selectedRecipe.foodCostPercent > 40 ? "text-red-400" : "text-emerald-400"
                    }`}>{selectedRecipe.foodCostPercent}%</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 flex flex-col items-center justify-center text-center text-slate-600">
              <Utensils className="w-10 h-10 mb-2.5 text-slate-700" />
              <p className="text-xs font-semibold">ไม่ได้เลือกเมนูเพื่อกำหนดสูตร</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
