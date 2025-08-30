import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: string; // Font Awesome class name
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center transition-transform transform hover:scale-105">
      <div className={`p-4 rounded-full ${color} text-white text-2xl w-16 h-16 flex items-center justify-center`}>
        <i className={icon}></i>
      </div>
      <div className="mr-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;