import React, { useState, useMemo } from 'react';
import { Staff, StaffAttendanceRecord, AttendanceStatus } from '../../types';
import Scanner from '../Scanner';
import Modal from '../Modal';

interface StaffPortalProps {
    staffMember: Staff;
    attendance: StaffAttendanceRecord[];
    onScan: (decodedText: string) => Promise<string>;
    onLogout: () => void;
    userEmail: string | null;
}

type FilterType = 'this_month' | 'last_month' | 'all_time';

const StaffPortal: React.FC<StaffPortalProps> = ({ staffMember, attendance, onScan, onLogout, userEmail }) => {
    const [isScannerOpen, setScannerOpen] = useState(false);
    const [filter, setFilter] = useState<FilterType>('this_month');

    const today = new Date().toISOString().split('T')[0];
    const todaysAttendance = attendance.find(a => a.date === today);
    
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
        const daysPresent = filteredAttendance.filter(a => a.status === AttendanceStatus.Present).length;

        return { filteredAttendance, daysPresent };

    }, [filter, attendance]);


    const filterButtons: { label: string, value: FilterType }[] = [
        { label: 'هذا الشهر', value: 'this_month' },
        { label: 'الشهر الماضي', value: 'last_month' },
        { label: 'كل الأوقات', value: 'all_time' },
    ];
    
    return (
         <div className="min-h-screen bg-slate-100 font-sans">
            <header className="bg-white shadow-md p-4 flex justify-between items-center">
                <h1 className="text-xl md:text-2xl font-bold text-sky-600">بوابة الموظفين</h1>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                     <div className="mr-3 hidden md:block text-right">
                        <p className="font-semibold text-gray-800">{staffMember.name}</p>
                        <p className="text-sm text-gray-500">{userEmail}</p>
                    </div>
                    <button onClick={onLogout} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700" aria-label="تسجيل الخروج">
                        <i className="fa-solid fa-right-from-bracket h-6 w-6"></i>
                    </button>
                </div>
            </header>

            <main className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
                 <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-800">أهلاً بك، {staffMember.name}</h2>
                    <p className="text-gray-600">يمكنك تسجيل حضورك أو متابعة سجلك من هنا.</p>
                </div>
                
                {/* Scan Button & Today's Status */}
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
                    <button
                        onClick={() => setScannerOpen(true)}
                        className="w-full md:w-auto bg-sky-500 text-white px-8 py-4 rounded-lg hover:bg-sky-600 transition-colors flex items-center justify-center gap-3 text-lg font-bold"
                    >
                        <i className="fa-solid fa-qrcode h-8 w-8"></i>
                        <span>مسح QR للحضور/الانصراف</span>
                    </button>
                    <div className="text-center md:text-right">
                        <p className="font-semibold text-gray-700">حالة اليوم ({today})</p>
                        {todaysAttendance ? (
                             <div className="text-sm text-gray-600">
                                <p><strong>الحضور:</strong> {todaysAttendance.checkIn}</p>
                                <p><strong>الانصراف:</strong> {todaysAttendance.checkOut || 'لم يسجل بعد'}</p>
                            </div>
                        ) : (
                            <p className="text-gray-500">لم يتم تسجيل الحضور بعد</p>
                        )}
                    </div>
                </div>

                {/* Recent Attendance */}
                 <div className="bg-white p-6 rounded-lg shadow-md">
                     <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">سجل الحضور</h3>
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

                     <div className="bg-sky-50 p-4 rounded-lg text-center mb-4">
                        <p className="text-sm font-medium text-sky-800">إجمالي أيام الحضور</p>
                        <p className="text-3xl font-bold text-sky-900">{filteredData.daysPresent}</p>
                    </div>

                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">التاريخ</th>
                                    <th scope="col" className="px-6 py-3">الحضور</th>
                                    <th scope="col" className="px-6 py-3">الانصراف</th>
                                    <th scope="col" className="px-6 py-3">الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.filteredAttendance.length > 0 ? filteredData.filteredAttendance.map(record => (
                                    <tr key={record.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{record.date}</td>
                                        <td className="px-6 py-4">{record.checkIn || '-'}</td>
                                        <td className="px-6 py-4">{record.checkOut || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.status === AttendanceStatus.Present ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-4 text-gray-500">لا يوجد سجلات لهذه الفترة.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                     </div>
                 </div>

            </main>
            
            {isScannerOpen && (
                 <Modal isOpen={isScannerOpen} onClose={() => setScannerOpen(false)} title="مسح رمز الحضانة">
                    <Scanner onScan={onScan} />
                </Modal>
            )}
         </div>
    );
};

export default StaffPortal;