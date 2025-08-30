import React, { useState, useEffect } from 'react';
import { Staff, NewStaff } from '../types';
import Modal from './Modal';
import QrCodeModal from './QrCodeModal';

interface StaffManagementProps {
  staff: Staff[];
  onAddStaff: (staff: NewStaff) => void;
  onUpdateStaff: (staff: Staff) => void;
  onDeleteStaff: (staffIds: string[]) => void;
  onCreateAccounts: (staffIds: string[]) => void;
  isCreatingAccounts: boolean;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ staff, onAddStaff, onUpdateStaff, onDeleteStaff, onCreateAccounts, isCreatingAccounts }) => {
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isQrModalOpen, setQrModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

  const handleAddClick = () => {
    setSelectedStaff(null);
    setFormModalOpen(true);
  };
  
  const handleEditClick = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setFormModalOpen(true);
  };

   const handleDeleteClick = (staffMember: Staff) => {
    onDeleteStaff([staffMember.id]);
  };

  const handleQrClick = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setQrModalOpen(true);
  };

  const handleSave = (staffData: Staff | NewStaff) => {
    if ('id' in staffData && staffData.id) {
      onUpdateStaff(staffData as Staff);
    } else {
      onAddStaff(staffData as NewStaff);
    }
    setFormModalOpen(false);
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedStaffIds(staff.map(s => s.id));
    } else {
        setSelectedStaffIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedStaffIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

 const handleBulkAction = (action: 'createAccount' | 'delete') => {
      if (action === 'createAccount') {
          onCreateAccounts(selectedStaffIds);
      } else if (action === 'delete') {
          onDeleteStaff(selectedStaffIds);
      }
      setSelectedStaffIds([]);
  }

  return (
    <div className="p-4 md:p-8">
       <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">قائمة الموظفين</h3>
        <button
          onClick={handleAddClick}
          className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i>
          <span>إضافة موظف</span>
        </button>
      </div>

      {selectedStaffIds.length > 0 && (
          <div className="bg-sky-100 border-l-4 border-sky-500 text-sky-800 p-4 mb-4 rounded-r-lg flex justify-between items-center shadow flex-wrap gap-2">
              <p className="font-medium">{selectedStaffIds.length} موظف محدد</p>
              <div className="flex gap-2">
                 <button
                    onClick={() => handleBulkAction('createAccount')}
                    disabled={isCreatingAccounts}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed transition-colors"
                >
                    {isCreatingAccounts ? 'جاري الإنشاء...' : 'إنشاء حسابات'}
                </button>
                <button
                    onClick={() => handleBulkAction('delete')}
                    className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors"
                >
                    حذف المحدد
                </button>
              </div>
          </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="p-4">
                    <input type="checkbox" onChange={handleSelectAll} checked={staff.length > 0 && selectedStaffIds.length === staff.length} />
                  </th>
                  <th scope="col" className="px-6 py-3">الاسم</th>
                  <th scope="col" className="px-6 py-3">الوظيفة</th>
                  <th scope="col" className="px-6 py-3">رقم الجوال</th>
                  <th scope="col" className="px-6 py-3">الحساب</th>
                  <th scope="col" className="px-6 py-3">إجراءات</th>
                </tr>
            </thead>
            <tbody>
                {staff.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-500">
                            <i className="fa-solid fa-users-viewfinder text-4xl text-gray-300"></i>
                            <p className="mt-2">لا يوجد موظفون مسجلون حالياً.</p>
                            <p className="text-sm">ابدأ بإضافة موظف جديد من الزر أعلاه.</p>
                        </td>
                    </tr>
                ) : (
                    staff.map(member => (
                    <tr key={member.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="p-4">
                          <input type="checkbox" checked={selectedStaffIds.includes(member.id)} onChange={() => handleSelectOne(member.id)} />
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{member.name}</td>
                        <td className="px-6 py-4">{member.role}</td>
                        <td className="px-6 py-4">{member.phone}</td>
                        <td className="px-6 py-4">
                          {member.accountId ? (
                              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">تم الإنشاء</span>
                          ) : (
                              <button onClick={() => onCreateAccounts([member.id])} disabled={isCreatingAccounts} className="font-medium text-emerald-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed text-xs">إنشاء حساب</button>
                          )}
                        </td>
                        <td className="px-6 py-4 space-x-2 rtl:space-x-reverse">
                          <button onClick={() => handleEditClick(member)} className="font-medium text-sky-600 hover:underline">تعديل</button>
                          <button onClick={() => handleDeleteClick(member)} className="font-medium text-rose-600 hover:underline">حذف</button>
                          <button onClick={() => handleQrClick(member)} className="font-medium text-indigo-600 hover:underline">QR Code</button>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
             {staff.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <i className="fa-solid fa-users-viewfinder text-4xl text-gray-300"></i>
                    <p className="mt-2">لا يوجد موظفون مسجلون حالياً.</p>
                    <p className="text-sm">ابدأ بإضافة موظف جديد من الزر أعلاه.</p>
                </div>
            ) : (
                <div className="space-y-4 p-4">
                {staff.map(member => (
                    <div key={member.id} className="bg-gray-50 p-4 rounded-lg shadow">
                        <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-3">
                                <input type="checkbox" checked={selectedStaffIds.includes(member.id)} onChange={() => handleSelectOne(member.id)} />
                                <p className="font-bold text-gray-800">{member.name}</p>
                             </div>
                             <div className="space-x-2 rtl:space-x-reverse">
                                <button onClick={() => handleEditClick(member)} className="font-medium text-sky-600 hover:underline text-sm">تعديل</button>
                                <button onClick={() => handleDeleteClick(member)} className="font-medium text-rose-600 hover:underline text-sm">حذف</button>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>الوظيفة:</strong> {member.role}</p>
                            <p><strong>رقم الجوال:</strong> {member.phone}</p>
                        </div>
                         <div className="border-t mt-3 pt-3 flex justify-between items-center">
                          {member.accountId ? (
                              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">تم إنشاء الحساب</span>
                          ) : (
                              <button onClick={() => onCreateAccounts([member.id])} disabled={isCreatingAccounts} className="font-medium text-emerald-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed text-sm">إنشاء حساب</button>
                          )}
                          <button onClick={() => handleQrClick(member)} className="font-medium text-indigo-600 hover:underline text-sm">عرض QR Code</button>
                        </div>
                    </div>
                ))}
                </div>
            )}
        </div>
      </div>
       {isFormModalOpen && (
        <StaffFormModal
            staffMember={selectedStaff}
            onClose={() => setFormModalOpen(false)}
            onSave={handleSave}
        />
      )}
       {isQrModalOpen && selectedStaff && (
          <QrCodeModal 
            person={selectedStaff}
            personType="staff"
            onClose={() => setQrModalOpen(false)}
          />
      )}
    </div>
  );
};

// --- Staff Form Modal ---
interface StaffFormModalProps {
    staffMember: Staff | null;
    onClose: () => void;
    onSave: (staff: Staff | NewStaff) => void;
}

const StaffFormModal: React.FC<StaffFormModalProps> = ({ staffMember, onClose, onSave }) => {
    const [formData, setFormData] = useState<Staff | NewStaff>(staffMember || {
        name: '',
        role: 'معلمة',
        specialization: '',
        phone: '',
        qrCodeId: '',
        email: '',
    });
    
    useEffect(() => {
        if(staffMember) {
            setFormData(staffMember);
        }
    }, [staffMember]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setFormData(prev => ({...prev, name: newName}));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedState = { ...formData, [name]: value };
        if (name === 'role') {
            updatedState.role = value as Staff['role'];
        }
        setFormData(updatedState);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let dataToSave = { ...formData };
        if (!dataToSave.email && dataToSave.name) {
             const sanitizedName = dataToSave.name.trim().toLowerCase().replace(/\s+/g, '.');
             dataToSave.email = `${sanitizedName}@funnybanny.com`;
        }

        onSave(dataToSave);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={staffMember ? 'تعديل بيانات موظف' : 'إضافة موظف جديد'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">الاسم</label>
                    <input type="text" name="name" value={formData.name} onChange={handleNameChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">الوظيفة</label>
                    <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                        <option value="معلمة">معلمة</option>
                        <option value="مشرفة">مشرفة</option>
                        <option value="إداري">إداري</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">التخصص / المادة (اختياري)</label>
                    <input type="text" name="specialization" value={formData.specialization || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                </div>
                <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">إلغاء</button>
                    <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600">حفظ</button>
                </div>
            </form>
        </Modal>
    );
};

export default StaffManagement;