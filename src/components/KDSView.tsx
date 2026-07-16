import React, { useEffect, useState } from "react";
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Flame, 
  CheckSquare, 
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { Order, OrderStatus } from "../types";

interface KDSProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export default function KDSView({
  orders,
  onUpdateOrderStatus
}: KDSProps) {
  const [now, setNow] = useState<number>(Date.now());

  // Real-time ticking timers
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateWaitTime = (timestampStr: string) => {
    const msDiff = now - new Date(timestampStr).getTime();
    const minutes = Math.floor(msDiff / 60000);
    const seconds = Math.floor((msDiff % 60000) / 1000);
    return {
      text: `${minutes}น. ${seconds}ว.`,
      isUrgent: minutes >= 10,
      isWarning: minutes >= 5 && minutes < 10
    };
  };

  // Group active orders
  const queueOrders = orders.filter(o => o.status === OrderStatus.QUEUE);
  const cookingOrders = orders.filter(o => o.status === OrderStatus.COOKING);
  const readyOrders = orders.filter(o => o.status === OrderStatus.READY);

  return (
    <div className="p-4 flex flex-col h-[calc(100vh-40px)] gap-4" id="kds-view-container">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wider font-display">ระบบจัดการออเดอร์ในครัว (Kitchen Display - KDS)</h2>
          <p className="text-[10px] text-slate-400 mt-1">คิวออเดอร์เข้าครัวแบบเรียลไทม์ เชื่อมโยงสต๊อกวัตถุดิบอัตโนมัติ</p>
        </div>
        
        {/* KDS Kitchen Stats Bar */}
        <div className="flex gap-4">
          <div className="px-3.5 py-2 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center space-x-3.5">
            <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
            <div>
              <p className="text-[9px] text-slate-500 font-bold">รอปรุงอาหาร</p>
              <p className="text-xs font-mono font-bold text-slate-200">{queueOrders.length} บิล</p>
            </div>
          </div>
          <div className="px-3.5 py-2 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center space-x-3.5">
            <Flame className="w-5 h-5 text-red-500 animate-pulse" />
            <div>
              <p className="text-[9px] text-slate-500 font-bold">กำลังปรุงอาหาร</p>
              <p className="text-xs font-mono font-bold text-slate-200">{cookingOrders.length} บิล</p>
            </div>
          </div>
          <div className="px-3.5 py-2 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center space-x-3.5">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-[9px] text-slate-500 font-bold">ปรุงเสร็จพร้อมเสิร์ฟ</p>
              <p className="text-xs font-mono font-bold text-slate-200">{readyOrders.length} บิล</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main KDS Board Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden min-h-0">
        
        {/* Column 1: Queue (รอทำ) */}
        <div className="bg-slate-900/30 rounded-2xl border border-slate-800/80 flex flex-col overflow-hidden">
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
              <h3 className="text-xs font-bold text-slate-200 tracking-wide">คิวออเดอร์ใหม่ ({queueOrders.length})</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {queueOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-600">
                <CheckSquare className="w-8 h-8 mb-2 text-slate-700" />
                <p className="text-[11px] font-medium">ไม่มีคิวค้าง</p>
              </div>
            ) : (
              queueOrders.map(order => {
                const wait = calculateWaitTime(order.timestamp);
                return (
                  <div key={order.id} className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80 space-y-3 shadow-lg shadow-black/10">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-red-400 font-mono">{order.id}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-md">
                        {order.tableNumber}
                      </span>
                    </div>
                    
                    {/* Item lines */}
                    <div className="space-y-1.5 border-y border-slate-800/60 py-2.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-xs">
                          <div className="flex justify-between text-slate-200 font-semibold">
                            <span>{item.name} <span className="text-red-500 font-mono font-bold">x{item.quantity}</span></span>
                          </div>
                          {item.toppings.map((t, tid) => (
                            <p key={tid} className="text-[10px] text-amber-500 pl-2">+ {t.name}</p>
                          ))}
                          {item.note && (
                            <p className="text-[10px] text-red-400 pl-2 bg-red-950/10 p-1 rounded border border-red-950/20 mt-1 font-medium">
                              * {item.note}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className={`flex items-center space-x-1 text-[10px] font-mono font-bold ${
                        wait.isUrgent ? "text-red-500 animate-pulse" : wait.isWarning ? "text-amber-500" : "text-slate-400"
                      }`}>
                        <Clock className="w-3 h-3" />
                        <span>รอมาแล้ว: {wait.text}</span>
                      </div>
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, OrderStatus.COOKING)}
                        className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-[10px] transition-all flex items-center space-x-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>เริ่มปรุง</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Cooking (กำลังปรุง) */}
        <div className="bg-slate-900/30 rounded-2xl border border-slate-800/80 flex flex-col overflow-hidden">
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              <h3 className="text-xs font-bold text-slate-200 tracking-wide">กำลังลงกระทะผัด ({cookingOrders.length})</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {cookingOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-600">
                <Flame className="w-8 h-8 mb-2 text-slate-700" />
                <p className="text-[11px] font-medium">ไม่มีออเดอร์ผัดอยู่</p>
              </div>
            ) : (
              cookingOrders.map(order => {
                const wait = calculateWaitTime(order.timestamp);
                return (
                  <div key={order.id} className="bg-slate-950/50 p-3.5 rounded-xl border border-red-950/20 space-y-3 shadow-lg shadow-black/10">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-red-400 font-mono">{order.id}</span>
                      <span className="text-[10px] bg-red-600/10 text-red-400 font-bold px-2 py-0.5 rounded-md border border-red-500/20">
                        {order.tableNumber}
                      </span>
                    </div>

                    {/* Item lines */}
                    <div className="space-y-1.5 border-y border-slate-800/60 py-2.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-xs">
                          <div className="flex justify-between text-slate-200 font-semibold">
                            <span>{item.name} <span className="text-red-500 font-mono font-bold">x{item.quantity}</span></span>
                          </div>
                          {item.toppings.map((t, tid) => (
                            <p key={tid} className="text-[10px] text-amber-500 pl-2">+ {t.name}</p>
                          ))}
                          {item.note && (
                            <p className="text-[10px] text-red-400 pl-2 bg-red-950/10 p-1 rounded border border-red-950/20 mt-1 font-medium">
                              * {item.note}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className={`flex items-center space-x-1 text-[10px] font-mono font-bold ${
                        wait.isUrgent ? "text-red-500 animate-pulse" : wait.isWarning ? "text-amber-500" : "text-slate-400"
                      }`}>
                        <Clock className="w-3 h-3" />
                        <span>เริ่มมานาน: {wait.text}</span>
                      </div>
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, OrderStatus.READY)}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition-all flex items-center space-x-1 cursor-pointer"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>เสร็จแล้ว</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 3: Ready (ปรุงเสร็จพร้อมเสิร์ฟ) */}
        <div className="bg-slate-900/30 rounded-2xl border border-slate-800/80 flex flex-col overflow-hidden">
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
              <h3 className="text-xs font-bold text-slate-200 tracking-wide">ปรุงเสร็จ/รอเสิร์ฟ ({readyOrders.length})</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {readyOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-600">
                <CheckCircle className="w-8 h-8 mb-2 text-slate-700" />
                <p className="text-[11px] font-medium">ไม่มีอาหารพร้อมเสิร์ฟ</p>
              </div>
            ) : (
              readyOrders.map(order => {
                return (
                  <div key={order.id} className="bg-slate-950/50 p-3.5 rounded-xl border border-emerald-950/20 space-y-3 shadow-lg shadow-black/10">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-emerald-400 font-mono">{order.id}</span>
                      <span className="text-[10px] bg-emerald-600/10 text-emerald-400 font-bold px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {order.tableNumber}
                      </span>
                    </div>

                    {/* Item lines */}
                    <div className="space-y-1.5 border-y border-slate-800/60 py-2.5 text-slate-400">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-xs line-through opacity-70">
                          <div className="flex justify-between font-semibold">
                            <span>{item.name} x{item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, OrderStatus.COMPLETED)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition-all flex items-center space-x-1 cursor-pointer"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>เช็คบิล/เสิร์ฟแล้ว</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
