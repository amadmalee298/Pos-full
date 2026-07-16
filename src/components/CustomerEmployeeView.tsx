import React, { useState } from "react";
import { 
  Plus, 
  User, 
  Award, 
  Tag, 
  Trash2, 
  Briefcase, 
  Phone, 
  Users, 
  Gift 
} from "lucide-react";
import { Customer, Employee, Promotion, UserRole } from "../types";

interface CustEmpProps {
  customers: Customer[];
  employees: Employee[];
  promotions: Promotion[];
  onAddCustomer: (cust: Omit<Customer, "id" | "purchaseHistory" | "couponIds">) => void;
  onAddEmployee: (emp: Omit<Employee, "id" | "status">) => void;
  onAddPromotion: (promo: Omit<Promotion, "id" | "isActive">) => void;
}

export default function CustomerEmployeeView({
  customers,
  employees,
  promotions,
  onAddCustomer,
  onAddEmployee,
  onAddPromotion
}: CustEmpProps) {
  // Tabs: Customers, Employees, Promotions
  const [activeSubTab, setActiveSubTab] = useState<"customers" | "employees" | "promotions">("customers");

  // Form states
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");

  const [empName, setEmpName] = useState("");
  const [empRole, setEmpRole] = useState<UserRole>(UserRole.STAFF);
  const [empSalary, setEmpSalary] = useState("");
  const [empPhone, setEmpPhone] = useState("");

  const [promoTitle, setPromoTitle] = useState("");
  const [promoDesc, setPromoDesc] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");
  const [promoGroup, setPromoGroup] = useState("ลูกค้าทั่วไป");
  const [promoCode, setPromoCode] = useState("");

  const handleAddCust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone) return;
    onAddCustomer({ name: custName, phone: custPhone, points: 50 }); // starting point gift
    setCustName("");
    setCustPhone("");
  };

  const handleAddEmp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName || !empSalary || !empPhone) return;
    onAddEmployee({
      name: empName,
      role: empRole,
      salary: parseFloat(empSalary),
      phone: empPhone
    });
    setEmpName("");
    setEmpSalary("");
    setEmpPhone("");
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle || !promoDiscount || !promoCode) return;
    onAddPromotion({
      title: promoTitle,
      description: promoDesc,
      discountRate: promoDiscount,
      targetGroup: promoGroup,
      code: promoCode
    });
    setPromoTitle("");
    setPromoDesc("");
    setPromoDiscount("");
    setPromoCode("");
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-40px)]" id="customer-employee-container">
      {/* Tab Switcher */}
      <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800 flex justify-between items-center flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab("customers")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === "customers" ? "bg-red-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>สมาชิก & คะแนนสะสม ({customers.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab("employees")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === "employees" ? "bg-red-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>พนักงาน & เงินเดือน ({employees.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab("promotions")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === "promotions" ? "bg-red-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>คูปอง & โปรโมชั่น ({promotions.length})</span>
          </button>
        </div>
      </div>

      {/* Main section based on active subtab */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Left Form (4 columns) */}
        <div className="xl:col-span-4 bg-[#11141a] p-4 rounded-2xl border border-slate-800 h-fit space-y-4 shadow-lg">
          
          {activeSubTab === "customers" && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center space-x-1.5">
                <Plus className="w-4 h-4 text-red-500" />
                <span>สมัครสมาชิกใหม่ (Register Member)</span>
              </h3>
              <form onSubmit={handleAddCust} className="space-y-3.5">
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold mb-1">ชื่อ-นามสกุล ลูกค้า</label>
                  <input
                    type="text"
                    placeholder="คุณสุรศักดิ์ สุขใจ"
                    value={custName}
                    onChange={e => setCustName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    placeholder="08X-XXX-XXXX"
                    value={custPhone}
                    onChange={e => setCustPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-red-600/10 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ยืนยันสมัคร (แถมฟรี 50 แต้ม)</span>
                </button>
              </form>
            </div>
          )}

          {activeSubTab === "employees" && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center space-x-1.5">
                <Plus className="w-4 h-4 text-red-500" />
                <span>เพิ่มข้อมูลพนักงานใหม่ (Add Staff)</span>
              </h3>
              <form onSubmit={handleAddEmp} className="space-y-3.5">
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold mb-1">ชื่อ-นามสกุล พนักงาน</label>
                  <input
                    type="text"
                    placeholder="สมหมาย ใฝ่ขยัน"
                    value={empName}
                    onChange={e => setEmpName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold mb-1">ตำแหน่ง</label>
                    <select
                      value={empRole}
                      onChange={e => setEmpRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none"
                    >
                      {Object.values(UserRole).map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold mb-1">เงินเดือน (บาท)</label>
                    <input
                      type="number"
                      placeholder="15000"
                      value={empSalary}
                      onChange={e => setEmpSalary(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none text-center"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold mb-1">เบอร์โทรติดต่อ</label>
                  <input
                    type="text"
                    placeholder="081-111-2222"
                    value={empPhone}
                    onChange={e => setEmpPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-red-600/10 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>บันทึกพนักงานบรรจุใหม่</span>
                </button>
              </form>
            </div>
          )}

          {activeSubTab === "promotions" && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center space-x-1.5">
                <Plus className="w-4 h-4 text-red-500" />
                <span>สร้างคูปองส่วนลดใหม่ (Create Promo)</span>
              </h3>
              <form onSubmit={handleAddPromo} className="space-y-3.5">
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold mb-1">หัวข้อโปรโมชั่น</label>
                  <input
                    type="text"
                    placeholder="ส่วนลดกะเพราฉลองสาขาใหม่"
                    value={promoTitle}
                    onChange={e => setPromoTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold mb-1">คำอธิบายคูปอง</label>
                  <input
                    type="text"
                    placeholder="ลด 15 บาทเมื่อสั่งบิลกะเพรา 150 บาทขึ้นไป"
                    value={promoDesc}
                    onChange={e => setPromoDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold mb-1">รหัสโค้ด (Code)</label>
                    <input
                      type="text"
                      placeholder="NEW15"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none text-center font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold mb-1">อัตราลด (เช่น 20 หรือ 10%)</label>
                    <input
                      type="text"
                      placeholder="15%"
                      value={promoDiscount}
                      onChange={e => setPromoDiscount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none text-center font-bold"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold mb-1">กลุ่มเป้าหมาย</label>
                  <input
                    type="text"
                    placeholder="ลูกค้าสั่งเวลาบ่ายโมงถึงบ่ายสาม"
                    value={promoGroup}
                    onChange={e => setPromoGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-red-600/10 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>บันทึกโค้ดคูปองส่วนลด</span>
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Right Data Table (8 columns) */}
        <div className="xl:col-span-8 bg-[#11141a] rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {activeSubTab === "customers" && "รายชื่อฐานข้อมูลลูกค้าสมาชิกสะสมแต้ม"}
              {activeSubTab === "employees" && "ตารางพนักงาน และอัตราจ้างรายเดือน"}
              {activeSubTab === "promotions" && "รายการบัตรคูปองและโปรโมชั่นส่วนลดที่เปิดใช้"}
            </h3>
          </div>

          <div className="flex-1 overflow-x-auto">
            {activeSubTab === "customers" && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                    <th className="p-3">รหัสสมาชิก</th>
                    <th className="p-3">ชื่อ-นามสกุล</th>
                    <th className="p-3">เบอร์โทรศัพท์</th>
                    <th className="p-3 text-right">คะแนนสะสม (Points)</th>
                    <th className="p-3">รางวัลสิทธิ์</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {customers.map(cust => (
                    <tr key={cust.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-mono font-bold text-red-400">{cust.id}</td>
                      <td className="p-3 font-semibold text-slate-200">{cust.name}</td>
                      <td className="p-3 text-slate-400 font-mono">{cust.phone}</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-500">{cust.points} pts</td>
                      <td className="p-3">
                        <span className="bg-amber-500/10 text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded border border-amber-500/10">
                          {cust.points >= 200 ? "พรีเมียมคลับ" : "สมาชิกระดับต้น"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeSubTab === "employees" && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                    <th className="p-3">รหัสพนักงาน</th>
                    <th className="p-3">ชื่อพนักงาน</th>
                    <th className="p-3">ตำแหน่ง (Role)</th>
                    <th className="p-3 text-right">ฐานอัตราเงินเดือน</th>
                    <th className="p-3 font-mono">เบอร์โทรศัพท์</th>
                    <th className="p-3">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-mono text-slate-500">{emp.id}</td>
                      <td className="p-3 font-bold text-slate-200">{emp.name}</td>
                      <td className="p-3 text-slate-400 font-semibold">{emp.role}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-200">฿{emp.salary.toLocaleString()}</td>
                      <td className="p-3 text-slate-400 font-mono">{emp.phone}</td>
                      <td className="p-3">
                        <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/10">
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeSubTab === "promotions" && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                    <th className="p-3">หัวข้อโปรโมชั่น</th>
                    <th className="p-3">คำอธิบาย</th>
                    <th className="p-3 font-mono text-center">คูปองโค้ด</th>
                    <th className="p-3 text-right">อัตราส่วนลด</th>
                    <th className="p-3">กลุ่มเป้าหมาย</th>
                    <th className="p-3">สถานะคูปอง</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {promotions.map(promo => (
                    <tr key={promo.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-slate-200">{promo.title}</td>
                      <td className="p-3 text-slate-400 max-w-xs truncate">{promo.description}</td>
                      <td className="p-3 text-center font-mono font-bold text-red-400 bg-red-950/10 border border-red-950/20 rounded-lg">{promo.code}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">฿{promo.discountRate}</td>
                      <td className="p-3 text-slate-500">{promo.targetGroup}</td>
                      <td className="p-3">
                        <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/10">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
