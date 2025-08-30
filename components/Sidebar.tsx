import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, onClose }) => {
  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: 'fa-solid fa-house' },
    { id: 'children', label: 'إدارة الأطفال', icon: 'fa-solid fa-children' },
    { id: 'staff', label: 'إدارة الموظفين', icon: 'fa-solid fa-user-tie' },
    { id: 'attendance', label: 'الحضور والانصراف', icon: 'fa-solid fa-clipboard-user' },
    { id: 'invoicing', label: 'الفواتير والرسوم', icon: 'fa-solid fa-file-invoice-dollar' },
    { id: 'reports', label: 'التقارير', icon: 'fa-solid fa-chart-pie' },
    { id: 'settings', label: 'الإعدادات', icon: 'fa-solid fa-gear' },
  ];

  const handleItemClick = (view: ViewType) => {
    setView(view);
    onClose(); // Close sidebar on mobile after navigation
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      <aside
        className={`fixed md:relative flex flex-col h-full w-64 bg-white text-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-6 text-center border-b">
          <h1 className="text-2xl font-bold text-sky-600">Funny Banny</h1>
          <p className="text-sm text-gray-500">نظام الإدارة المتكامل</p>
        </div>
        <nav className="flex-1 px-4 py-6">
          <ul>
            {navItems.map(item => {
              const isActive = currentView === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.id as ViewType)}
                    className={`flex items-center w-full text-right px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-sky-100 hover:text-sky-700'
                    }`}
                  >
                    <i className={`${item.icon} w-6 text-center ml-3`}></i>
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Funny Banny
        </div>
      </aside>
    </>
  );
};

export default Sidebar;