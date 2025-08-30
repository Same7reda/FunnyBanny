import React from 'react';
import { ViewType } from '../types';

interface HeaderProps {
    view: ViewType;
    onMenuClick: () => void;
    onLogout: () => void;
    userEmail: string | null;
}

const viewTitles: Record<ViewType, string> = {
    dashboard: 'لوحة التحكم الرئيسية',
    children: 'إدارة بيانات الأطفال',
    staff: 'إدارة بيانات الموظفين',
    attendance: 'متابعة الحضور والإنصراف',
    invoicing: 'إدارة الرسوم والفواتير',
    settings: 'إعدادات النظام',
    reports: 'تقارير النظام',
};

const Header: React.FC<HeaderProps> = ({ view, onMenuClick, onLogout, userEmail }) => {
    const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';

    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
            <div className="flex items-center">
                <button onClick={onMenuClick} className="md:hidden text-gray-600 hover:text-gray-800 ml-4" aria-label="Open menu">
                    <i className="fa-solid fa-bars h-6 w-6"></i>
                </button>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-700 whitespace-nowrap">{viewTitles[view] || 'Funny Banny'}</h2>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-sky-200 flex items-center justify-center text-sky-600 font-bold">
                        {userInitial}
                    </div>
                    <div className="mr-3 hidden md:block">
                        <p className="font-semibold text-gray-800">المدير</p>
                        <p className="text-sm text-gray-500">{userEmail}</p>
                    </div>
                </div>
                <button onClick={onLogout} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700" aria-label="تسجيل الخروج">
                    <i className="fa-solid fa-right-from-bracket h-6 w-6"></i>
                </button>
            </div>
        </header>
    );
}

export default Header;