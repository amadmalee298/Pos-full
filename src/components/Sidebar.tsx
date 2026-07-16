import React from "react";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ChefHat, 
  BookOpen, 
  Package, 
  Users, 
  DollarSign, 
  Settings, 
  Globe, 
  RefreshCw,
  LogOut,
  UserCheck
} from "lucide-react";
import { UserRole } from "../types";

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  currentUser: { name: string; role: UserRole };
  onLogout: () => void;
  syncStatus: "connected" | "offline" | "syncing";
  pendingSyncCount: number;
  triggerSheetsSync: () => void;
}

export default function Sidebar({
  currentTab,
  setTab,
  currentUser,
  onLogout,
  syncStatus,
  pendingSyncCount,
  triggerSheetsSync
}: SidebarProps) {
  
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "pos", label: "หน้า POS (รับออเดอร์)", icon: ShoppingBag, badge: 0 },
    { id: "kitchen", label: "ครัว (KDS)", icon: ChefHat },
    { id: "menu", label: "เมนู & สูตรอาหาร", icon: BookOpen },
    { id: "inventory", label: "คลังวัตถุดิบ (Stock)", icon: Package },
    { id: "accounting", label: "บัญชี & การเงิน (P&L)", icon: DollarSign },
    { id: "customers", label: "ลูกค้า & พนักงาน", icon: Users },
    { id: "google-sheets", label: "Google Sheets & Site", icon: Globe },
    { id: "settings", label: "ตั้งค่าร้านค้า", icon: Settings },
  ];

  return (
    <aside className="w-68 bg-[#11141a] border-r border-[#1e293b] flex flex-col justify-between h-screen sticky top-0" id="kaprao-sidebar">
      {/* Brand Logo & Name */}
      <div>
        <div className="p-5 border-b border-[#1e293b] bg-gradient-to-r from-red-950/40 to-slate-900 flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-display font-bold text-lg text-white shadow-lg shadow-red-600/20 animate-pulse">
            กพ
          </div>
          <div>
            <h1 className="font-display font-bold tracking-tight text-white text-md">KAPRAO POS</h1>
            <span className="text-[10px] text-red-500 font-mono tracking-wider font-semibold">ENTERPRISE OS v2.1</span>
          </div>
        </div>

        {/* User Info Capsule */}
        <div className="mx-4 my-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center space-x-3">
          <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xs font-semibold text-slate-200 truncate">{currentUser.name}</h2>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <p className="text-[10px] text-slate-400 font-mono font-medium">{currentUser.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 font-medium text-xs ${
                  isActive
                    ? "bg-red-600/95 text-white shadow-md shadow-red-600/15"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
                id={`sidebar-tab-${item.id}`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === "pos" && pendingSyncCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 font-bold font-mono text-[9px] px-1.5 py-0.5 rounded-full">
                    {pendingSyncCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cloud Sync Status Indicator & Log out */}
      <div className="p-4 border-t border-[#1e293b] bg-slate-950/30">
        <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 mb-3">
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-medium">Google Sheets DB</p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${
                syncStatus === "connected" ? "bg-emerald-500" : syncStatus === "syncing" ? "bg-amber-400 animate-spin" : "bg-red-500"
              }`}></span>
              <span className="text-[10px] font-mono font-semibold text-slate-300 capitalize">
                {syncStatus === "connected" ? "เรียบร้อย" : syncStatus === "syncing" ? "กำลังซิงก์..." : "ออฟไลน์สะสม"}
              </span>
            </div>
          </div>
          <button 
            onClick={triggerSheetsSync}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
            title="Sync Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === "syncing" ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>

        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:border-red-900/60 hover:bg-red-950/20 text-slate-400 hover:text-red-400 transition-all text-xs font-semibold"
          id="btn-logout"
        >
          <LogOut className="w-4 h-4" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}
