import React, { useState, useMemo } from 'react';
import { Child, AttendanceRecord, Invoice, InvoiceStatus, AttendanceStatus } from '../../types';

interface ParentPortalProps {
    child: Child;
    attendance: AttendanceRecord[];
    invoices: Invoice[];
    onLogout: () => void;
    userEmail: string | null;
}

type FilterType = 'this_month' | 'last_month' | 'all_time';

const ParentPortal: React.FC<ParentPortalProps> = ({ child, attendance, invoices, onLogout, userEmail }) => {
    const [filter, setFilter] = useState<FilterType>('this_month');
    
    const today = new Date();
    const todaysAttendance = attendance.find(a => a.date === today.toISOString().split('T')[0]);

    const getStatusClass = (status: InvoiceStatus) => {
        switch (status) {
          case InvoiceStatus.Paid: return 'bg-emerald-100 text-emerald-800';
          case InvoiceStatus.Unpaid: return 'bg-amber-100 text-amber-800';
          case InvoiceStatus.Overdue: return 'bg-rose-100 text-rose-800';
          default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredData = useMemo(() => {
        const now = new Date();
        const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const filterPredicate = (dateStr: string) => {
            const date = new Date(dateStr);
            switch (filter) {
                case 'this_month':
                    return date >= firstDayThisMonth;
                case 'last_month':
                    return date >= firstDayLastMonth && date <= lastDayLastMonth;
                case 'all_time':
                default:
                    return true;
            }
        };

        const filteredAttendance = attendance.filter(a => filterPredicate(a.date));
        const filteredInvoices = invoices.filter(i => filterPredicate(i.issueDate));
        
        const daysPresent = filteredAttendance.filter(a => a.status === AttendanceStatus.Present).length;
        const totalPaid = filteredInvoices.filter(i => i.status === InvoiceStatus.Paid).reduce((sum, inv) => sum + inv.amount, 0);

        return { filteredAttendance, filteredInvoices, daysPresent, totalPaid };

    }, [filter, attendance, invoices]);

    const filterButtons: { label: string, value: FilterType }[] = [
        { label: 'هذا الشهر', value: 'this_month' },
        { label: 'الشهر الماضي', value: 'last_month' },
        { label: 'كل الأوقات', value: 'all_time' },
    ];

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            <header className="bg-white shadow-md p-4 flex justify-between items-center">
                <h1 className="text-xl md:text-2xl font-bold text-sky-600">بوابة ولي الأمر</h1>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                     <div className="mr-3 hidden md:block text-right">
                        <p className="font-semibold text-gray-800">{child.guardian.name}</p>
                        <p className="text-sm text-gray-500">{userEmail}</p>
                    </div>
                    <button onClick={onLogout} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700" aria-label="تسجيل الخروج">
                        <i className="fa-solid fa-right-from-bracket h-6 w-6"></i>
                    </button>
                </div>
            </header>

            <main className="p-4 md:p-8 space-y-8">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-800">مرحباً بك، {child.guardian.name}</h2>
                    <p className="text-gray-600">هنا يمكنك متابعة كل ما يخص {child.name}.</p>
                </div>

                {/* Today's Attendance Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                     <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-clipboard-user h-6 w-6 text-sky-500"></i>
                        <span>حالة الحضور اليوم</span>
                    </h3>
                    {todaysAttendance ? (
                        <div className="space-y-3 text-center">
                            <p className="text-lg font-medium">
                                <span className={`px-3 py-1 rounded-full text-white ${todaysAttendance.status === AttendanceStatus.Present ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                    {todaysAttendance.status}
                                </span>
                            </p>
                            <div className="flex justify-around text-sm text-gray-600">
                                <p><strong>وقت الحضور:</strong> {todaysAttendance.checkIn}</p>
                                <p><strong>وقت الانصراف:</strong> {todaysAttendance.checkOut || 'لم يسجل بعد'}</p>
                            </div>
                        </div>
                    ) : (
                         <div className="text-center">
                             <p className="text-lg font-medium">
                                <span className="px-3 py-1 rounded-full text-white bg-gray-400">
                                   لم يتم تسجيل الحضور بعد
                                </span>
                            </p>
                         </div>
                    )}
                </div>

                 {/* Reports Section */}
                 <div className="bg-white p-6 rounded-lg shadow-md">
                     <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                             <i className="fa-solid fa-chart-line h-6 w-6 text-sky-500"></i>
                             <span>التقارير</span>
                        </h3>
                         <div className="flex items-center gap-2">
                            {filterButtons.map(btn => (
                                 <button 
                                    key={btn.value}
                                    onClick={() => setFilter(btn.value)}
                                    className={`px-3 py-1 text-sm rounded-full ${filter === btn.value ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                 >
                                    {btn.label}
                                 </button>
                            ))}
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-sky-50 p-4 rounded-lg text-center">
                            <p className="text-sm font-medium text-sky-800">أيام الحضور</p>
                            <p className="text-3xl font-bold text-sky-900">{filteredData.daysPresent}</p>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-lg text-center">
                            <p className="text-sm font-medium text-emerald-800">إجمالي المدفوعات</p>
                            <p className="text-3xl font-bold text-emerald-900">{filteredData.totalPaid.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</p>
                        </div>
                     </div>

                     <div className="space-y-4">
                         {filteredData.filteredInvoices.length > 0 ? filteredData.filteredInvoices.map(invoice => (
                             <div key={invoice.id} className="bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                                <div>
                                    <p className="font-bold text-gray-800">فاتورة #{invoice.id.substring(0,8)}</p>
                                    <p className="text-sm text-gray-600">تاريخ الاستحقاق: {invoice.dueDate}</p>
                                </div>
                                <div className="font-semibold text-lg text-gray-700">
                                    {invoice.amount.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(invoice.status)}`}>
                                        {invoice.status}
                                    </span>
                                    {invoice.status !== InvoiceStatus.Paid && (
                                        <button className="bg-emerald-500 text-white text-sm px-4 py-1 rounded-lg hover:bg-emerald-600 transition-colors">
                                            دفع الآن
                                        </button>
                                    )}
                                </div>
                             </div>
                        )) : (
                            <p className="text-center text-gray-500 py-4">لا توجد فواتير لهذه الفترة.</p>
                        )}
                    </div>
                 </div>

            </main>
        </div>
    );
};

export default ParentPortal;