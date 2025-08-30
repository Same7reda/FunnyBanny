import React, { useState } from 'react';
import { AttendanceRecord, AttendanceStatus, Child, Staff, StaffAttendanceRecord, NewAttendanceRecord } from '../types';
import Modal from './Modal';

interface AttendanceProps {
  children: Child[];
  staff: Staff[];
  childAttendance: AttendanceRecord[];
  staffAttendance: StaffAttendanceRecord[];
  onUpdateChildAttendance: (record: AttendanceRecord | NewAttendanceRecord) => void;
  onDeleteChildAttendance: (ids: string[]) => void;
}

type ActiveTab = 'children' | 'staff';

const Attendance: React.FC<AttendanceProps> = ({ 
    children, 
    staff, 
    childAttendance, 
    staffAttendance, 
    onUpdateChildAttendance,
    onDeleteChildAttendance
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('children');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleManualCheckIn = (childId: string, childName: string) => {
    const newRecord: NewAttendanceRecord = {
      childId,
      childName,
      date: selectedDate,
      checkIn: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      checkOut: null,
      status: AttendanceStatus.Present,
    };
    onUpdateChildAttendance(newRecord); 
  };

  const handleManualCheckOut = (record: AttendanceRecord) => {
    const updatedRecord = {
      ...record,
      checkOut: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
    onUpdateChildAttendance(updatedRecord);
  };

  const handleEditClick = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };
  
  const handleSaveEdit = (updatedRecord: AttendanceRecord) => {
    onUpdateChildAttendance(updatedRecord);
    setIsEditModalOpen(false);
    setSelectedRecord(null);
  };

  const todaysChildAttendance = childAttendance.filter(a => a.date === selectedDate);
  const todaysStaffAttendance = staffAttendance.filter(a => a.date === selectedDate);

  const getChildAttendanceRecord = (childId: string) => {
      return todaysChildAttendance.find(a => a.childId === childId);
  }

  const getStaffAttendanceRecord = (staffId: string) => {
      return todaysStaffAttendance.find(a => a.staffId === staffId);
  }
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      const recordsToDelete = todaysChildAttendance.map(r => r.id);
      if (e.target.checked) {
          setSelectedIds(recordsToDelete);
      } else {
          setSelectedIds([]);
      }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  const handleBulkDelete = () => {
    onDeleteChildAttendance(selectedIds);
    setSelectedIds([]);
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-gray-800">تقرير الحضور لليوم</h3>
        <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      
       {selectedIds.length > 0 && activeTab === 'children' && (
          <div className="bg-rose-100 border-l-4 border-rose-500 text-rose-800 p-4 mb-4 rounded-r-lg flex justify-between items-center shadow">
              <p className="font-medium">{selectedIds.length} سجل محدد</p>
              <button
                  onClick={handleBulkDelete}
                  className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors"
              >
                  حذف المحدد
              </button>
          </div>
      )}

      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-4 rtl:space-x-reverse" aria-label="Tabs">
            <button onClick={() => setActiveTab('children')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'children' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                الأطفال ({todaysChildAttendance.length} / {children.length})
            </button>
             <button onClick={() => setActiveTab('staff')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'staff' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                الموظفين ({todaysStaffAttendance.length} / {staff.length})
            </button>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {activeTab === 'children' ? (
            <ChildrenAttendanceTable 
                children={children}
                getAttendanceRecord={getChildAttendanceRecord}
                onManualCheckIn={handleManualCheckIn}
                onManualCheckOut={handleManualCheckOut}
                onEdit={handleEditClick}
                onDelete={(id) => onDeleteChildAttendance([id])}
                isToday={selectedDate === new Date().toISOString().split('T')[0]}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onSelectOne={handleSelectOne}
            />
        ) : (
            <StaffAttendanceTable 
                staff={staff}
                getAttendanceRecord={getStaffAttendanceRecord}
            />
        )}
      </div>

      {isEditModalOpen && selectedRecord && (
          <EditAttendanceModal 
            record={selectedRecord}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveEdit}
          />
      )}
    </div>
  );
};


interface ChildrenAttendanceTableProps {
    children: Child[];
    getAttendanceRecord: (childId: string) => AttendanceRecord | undefined;
    onManualCheckIn: (childId: string, childName: string) => void;
    onManualCheckOut: (record: AttendanceRecord) => void;
    onEdit: (record: AttendanceRecord) => void;
    onDelete: (id: string) => void;
    isToday: boolean;
    selectedIds: string[];
    onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectOne: (id: string) => void;
}

const ChildrenAttendanceTable: React.FC<ChildrenAttendanceTableProps> = ({ children, getAttendanceRecord, onManualCheckIn, onManualCheckOut, onEdit, onDelete, isToday, selectedIds, onSelectAll, onSelectOne }) => {
    return (
        <>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="p-4">
                      <input type="checkbox" onChange={onSelectAll} checked={children.length > 0 && selectedIds.length === children.map(c => getAttendanceRecord(c.id)?.id).filter(Boolean).length} />
                    </th>
                    <th scope="col" className="px-6 py-3">اسم الطفل</th>
                    <th scope="col" className="px-6 py-3">وقت الحضور</th>
                    <th scope="col" className="px-6 py-3">وقت الانصراف</th>
                    <th scope="col" className="px-6 py-3">الحالة</th>
                    <th scope="col" className="px-6 py-3">إجراءات</th>
                </tr>
            </thead>
            <tbody>
                {children.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-500">
                            <i className="fa-solid fa-child-reaching text-4xl text-gray-300"></i>
                            <p className="mt-2">لا يوجد أطفال مسجلون لعرض سجل الحضور.</p>
                        </td>
                    </tr>
                ) : (
                    children.map(child => {
                        const record = getAttendanceRecord(child.id);
                        const status = record ? record.status : AttendanceStatus.Absent;
                        return (
                            <tr key={child.id} className="bg-white border-b hover:bg-gray-50">
                                 <td className="p-4">
                                    {record && <input type="checkbox" checked={selectedIds.includes(record.id)} onChange={() => onSelectOne(record.id)} />}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">{child.name}</td>
                                <td className="px-6 py-4">{record?.checkIn || '-'}</td>
                                <td className="px-6 py-4">{record?.checkOut || '-'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === AttendanceStatus.Present ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                        {status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 space-x-2 rtl:space-x-reverse">
                                    {isToday && !record && <button onClick={() => onManualCheckIn(child.id, child.name)} className="font-medium text-emerald-600 hover:underline">تسجيل حضور</button>}
                                    {isToday && record && !record.checkOut && <button onClick={() => onManualCheckOut(record)} className="font-medium text-amber-600 hover:underline">تسجيل انصراف</button>}
                                    {record && <button onClick={() => onEdit(record)} className="font-medium text-sky-600 hover:underline">تعديل</button>}
                                    {record && <button onClick={() => onDelete(record.id)} className="font-medium text-rose-600 hover:underline">حذف</button>}
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
            </table>
        </div>
        {/* Mobile Cards */}
        <div className="md:hidden p-4">
            {children.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <i className="fa-solid fa-child-reaching text-4xl text-gray-300"></i>
                    <p className="mt-2">لا يوجد أطفال مسجلون لعرض سجل الحضور.</p>
                </div>
            ) : (
                <div className="space-y-4">
                 {children.map(child => {
                        const record = getAttendanceRecord(child.id);
                        const status = record ? record.status : AttendanceStatus.Absent;
                        return (
                             <div key={child.id} className="bg-gray-50 p-4 rounded-lg shadow space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                       {record && <input type="checkbox" checked={selectedIds.includes(record.id)} onChange={() => onSelectOne(record.id)} />}
                                       <p className="font-bold text-gray-800">{child.name}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === AttendanceStatus.Present ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{status}</span>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><strong>الحضور:</strong> {record?.checkIn || '-'}</p>
                                    <p><strong>الانصراف:</strong> {record?.checkOut || '-'}</p>
                                </div>
                                <div className="pt-2 border-t flex justify-end gap-3 text-sm">
                                     {isToday && !record && <button onClick={() => onManualCheckIn(child.id, child.name)} className="font-medium text-emerald-600 hover:underline">تسجيل حضور</button>}
                                    {isToday && record && !record.checkOut && <button onClick={() => onManualCheckOut(record)} className="font-medium text-amber-600 hover:underline">تسجيل انصراف</button>}
                                    {record && <button onClick={() => onEdit(record)} className="font-medium text-sky-600 hover:underline">تعديل</button>}
                                    {record && <button onClick={() => onDelete(record.id)} className="font-medium text-rose-600 hover:underline">حذف</button>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
        </>
    );
};


interface StaffAttendanceTableProps {
    staff: Staff[];
    getAttendanceRecord: (staffId: string) => StaffAttendanceRecord | undefined;
}

const StaffAttendanceTable: React.FC<StaffAttendanceTableProps> = ({ staff, getAttendanceRecord }) => {
    return (
         <>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">اسم الموظف</th>
                    <th scope="col" className="px-6 py-3">وقت الحضور</th>
                    <th scope="col" className="px-6 py-3">وقت الانصراف</th>
                    <th scope="col" className="px-6 py-3">الحالة</th>
                </tr>
            </thead>
            <tbody>
                 {staff.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="text-center py-10 text-gray-500">
                           <i className="fa-solid fa-users-viewfinder text-4xl text-gray-300"></i>
                           <p className="mt-2">لا يوجد موظفون مسجلون لعرض سجل الحضور.</p>
                        </td>
                    </tr>
                ) : (
                    staff.map(member => {
                        const record = getAttendanceRecord(member.id);
                        const status = record ? record.status : AttendanceStatus.Absent;
                        return (
                            <tr key={member.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{member.name}</td>
                                <td className="px-6 py-4">{record?.checkIn || '-'}</td>
                                <td className="px-6 py-4">{record?.checkOut || '-'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === AttendanceStatus.Present ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                        {status}
                                    </span>
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
            </table>
        </div>
        {/* Mobile Cards */}
        <div className="md:hidden p-4">
            {staff.length === 0 ? (
                 <div className="text-center py-10 text-gray-500">
                    <i className="fa-solid fa-users-viewfinder text-4xl text-gray-300"></i>
                    <p className="mt-2">لا يوجد موظفون مسجلون لعرض سجل الحضور.</p>
                </div>
            ) : (
                <div className="space-y-4">
                 {staff.map(member => {
                        const record = getAttendanceRecord(member.id);
                        const status = record ? record.status : AttendanceStatus.Absent;
                        return (
                             <div key={member.id} className="bg-gray-50 p-4 rounded-lg shadow space-y-3">
                                <div className="flex justify-between items-start">
                                    <p className="font-bold text-gray-800">{member.name}</p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === AttendanceStatus.Present ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{status}</span>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><strong>الحضور:</strong> {record?.checkIn || '-'}</p>
                                    <p><strong>الانصراف:</strong> {record?.checkOut || '-'}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
        </>
    );
}

interface EditAttendanceModalProps {
    record: AttendanceRecord;
    onClose: () => void;
    onSave: (record: AttendanceRecord) => void;
}

const EditAttendanceModal: React.FC<EditAttendanceModalProps> = ({ record, onClose, onSave }) => {
    const [checkIn, setCheckIn] = useState(record.checkIn || '');
    const [checkOut, setCheckOut] = useState(record.checkOut || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...record,
            checkIn: checkIn || null,
            checkOut: checkOut || null,
            status: checkIn ? AttendanceStatus.Present : AttendanceStatus.Absent,
        });
    };
    
    return (
        <Modal isOpen={true} onClose={onClose} title={`تعديل سجل ${record.childName}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">وقت الحضور</label>
                    <input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">وقت الانصراف</label>
                    <input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                 <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">إلغاء</button>
                    <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600">حفظ التعديلات</button>
                </div>
            </form>
        </Modal>
    )
}


export default Attendance;