import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import StatCard from './StatCard';
import { Child, Invoice, InvoiceStatus, AttendanceRecord, AttendanceStatus } from '../types';

interface DashboardProps {
  children: Child[];
  invoices: Invoice[];
  attendance: AttendanceRecord[];
}

const processAttendanceForChart = (attendance: AttendanceRecord[], totalChildren: number) => {
    const weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const last7Days = new Map<string, { date: Date; present: number }>();

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        last7Days.set(dateString, { date, present: 0 });
    }

    attendance.forEach(record => {
        if (last7Days.has(record.date)) {
            const dayData = last7Days.get(record.date)!;
            dayData.present += 1;
        }
    });

    return Array.from(last7Days.values()).map(data => ({
        name: weekdays[data.date.getDay()],
        'حضور': data.present,
        'غياب': totalChildren - data.present,
    }));
};


const Dashboard: React.FC<DashboardProps> = ({ children, invoices, attendance }) => {
  const totalChildren = children.length;
  const today = new Date().toISOString().split('T')[0];
  const presentToday = attendance.filter(a => a.date === today && a.status === AttendanceStatus.Present).length;
  const unpaidInvoices = invoices.filter(i => i.status === InvoiceStatus.Unpaid || i.status === InvoiceStatus.Overdue).length;
  const recentCheckIns = attendance.filter(a => a.date === today).sort((a,b) => (b.checkIn || '').localeCompare(a.checkIn || '')).slice(0, 5);
  
  const chartData = processAttendanceForChart(attendance, totalChildren);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="إجمالي الأطفال"
          value={totalChildren.toString()}
          icon="fa-solid fa-children"
          color="bg-sky-500"
        />
        <StatCard
          title="الحضور اليومي"
          value={`${presentToday} / ${totalChildren}`}
          icon="fa-solid fa-clipboard-user"
          color="bg-emerald-500"
        />
        <StatCard
          title="فواتير غير مدفوعة"
          value={unpaidInvoices.toString()}
          icon="fa-solid fa-file-invoice-dollar"
          color="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">إحصائيات الحضور لآخر 7 أيام</h3>
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="حضور" fill="#38bdf8" name="حضور" />
                <Bar dataKey="غياب" fill="#f43f5e" name="غياب" />
            </BarChart>
            </ResponsiveContainer>
        </div>
         <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">آخر الأنشطة اليوم</h3>
            {recentCheckIns.length > 0 ? (
                <ul className="space-y-3">
                    {recentCheckIns.map(record => (
                        <li key={record.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                                    {record.childName.charAt(0)}
                                </span>
                                <div>
                                    <p className="font-medium text-gray-700">{record.childName}</p>
                                    <p className="text-xs text-gray-500">حالة: {record.checkOut ? 'انصرف' : 'حاضر'}</p>
                                </div>
                            </div>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-md">{record.checkOut || record.checkIn}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center text-gray-500 py-10">
                    <i className="fa-solid fa-users-slash text-4xl text-gray-300"></i>
                    <p className="mt-2">لا توجد أنشطة مسجلة اليوم.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;