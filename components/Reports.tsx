import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Child, Staff, Invoice, AttendanceRecord, InvoiceStatus, AttendanceStatus } from '../types';
import StatCard from './StatCard';

interface ReportsProps {
  children: Child[];
  staff: Staff[];
  invoices: Invoice[];
  attendance: AttendanceRecord[];
}

const Reports: React.FC<ReportsProps> = ({ children, staff, invoices, attendance }) => {
    
    // --- Financial Calculations ---
    const financialSummary = useMemo(() => {
        return invoices.reduce((acc, invoice) => {
            if (invoice.status === InvoiceStatus.Paid) {
                acc.totalPaid += invoice.amount;
                acc.paidCount += 1;
            } else {
                acc.totalUnpaid += invoice.amount;
                acc.unpaidCount += 1;
            }
            return acc;
        }, { totalPaid: 0, totalUnpaid: 0, paidCount: 0, unpaidCount: 0 });
    }, [invoices]);

    const financialPieData = [
        { name: 'مدفوع', value: financialSummary.paidCount },
        { name: 'غير مدفوع', value: financialSummary.unpaidCount },
    ];
    const COLORS = ['#10b981', '#f59e0b'];

    // --- Attendance Calculations ---
    const attendanceSummary = useMemo(() => {
        const totalDays = new Set(attendance.map(a => a.date)).size;
        const totalPresentRecords = attendance.filter(a => a.status === AttendanceStatus.Present).length;
        const avgAttendance = totalDays > 0 ? (totalPresentRecords / totalDays) : 0;
        
        return {
            avgDailyAttendance: avgAttendance.toFixed(1),
            totalPresent: totalPresentRecords,
            totalAbsent: (children.length * totalDays) - totalPresentRecords, // A rough estimate
        };
    }, [attendance, children]);
    
    // Attendance trend for the last 30 days
    const attendanceTrendData = useMemo(() => {
        const trend = new Map<string, number>();
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            trend.set(dateString, 0);
        }
        attendance.forEach(record => {
            if (trend.has(record.date) && record.status === AttendanceStatus.Present) {
                trend.set(record.date, trend.get(record.date)! + 1);
            }
        });
        return Array.from(trend.entries()).map(([date, count]) => ({
            date: new Date(date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }),
            'عدد الحضور': count,
        }));
    }, [attendance]);


  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">ملخص تقارير النظام</h2>
        <p className="text-gray-500 mt-1">نظرة شاملة على أداء الحضانة المالي والحضوري.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="إجمالي الأطفال" value={children.length.toString()} icon="fa-solid fa-children" color="bg-sky-500" />
        <StatCard title="إجمالي الموظفين" value={staff.length.toString()} icon="fa-solid fa-user-tie" color="bg-indigo-500" />
        <StatCard title="متوسط الحضور اليومي" value={attendanceSummary.avgDailyAttendance} icon="fa-solid fa-clipboard-user" color="bg-emerald-500" />
      </div>

      {/* Financial Reports */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">التقرير المالي</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col justify-center items-center">
             <h4 className="font-semibold text-gray-700 mb-2">حالة الفواتير</h4>
             <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie data={financialPieData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name">
                        {financialPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="md:col-span-2 space-y-4">
             <div className="bg-emerald-50 p-4 rounded-lg flex justify-between items-center">
                 <div>
                    <p className="text-sm font-medium text-emerald-800">إجمالي الإيرادات (المدفوع)</p>
                    <p className="text-2xl font-bold text-emerald-900">{financialSummary.totalPaid.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</p>
                 </div>
                 <i className="fa-solid fa-hand-holding-dollar text-3xl text-emerald-400"></i>
             </div>
             <div className="bg-amber-50 p-4 rounded-lg flex justify-between items-center">
                 <div>
                    <p className="text-sm font-medium text-amber-800">إجمالي المستحقات (غير مدفوع)</p>
                    <p className="text-2xl font-bold text-amber-900">{financialSummary.totalUnpaid.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</p>
                 </div>
                 <i className="fa-solid fa-file-invoice-dollar text-3xl text-amber-400"></i>
             </div>
          </div>
        </div>
      </div>

      {/* Attendance Reports */}
       <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">تقرير الحضور</h3>
        <div>
             <h4 className="font-semibold text-gray-700 mb-4 text-center">اتجاه الحضور لآخر 30 يوم</h4>
             <ResponsiveContainer width="100%" height={300}>
                 <BarChart data={attendanceTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="عدد الحضور" fill="#38bdf8" name="عدد الحضور" />
                </BarChart>
             </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default Reports;