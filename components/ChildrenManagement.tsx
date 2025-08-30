import React, { useState, useEffect } from 'react';
import { Child, NewChild, Guardian } from '../types';
import Modal from './Modal';
import QrCodeModal from './QrCodeModal';

interface ChildrenManagementProps {
  children: Child[];
  onAddChild: (child: NewChild) => void;
  onUpdateChild: (child: Child) => void;
  onDeleteChildren: (childIds: string[]) => void;
  onCreateAccounts: (childIds: string[]) => void;
  isCreatingAccounts: boolean;
}

const ChildrenManagement: React.FC<ChildrenManagementProps> = ({ children, onAddChild, onUpdateChild, onDeleteChildren, onCreateAccounts, isCreatingAccounts }) => {
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isQrModalOpen, setQrModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>([]);

  const handleAddClick = () => {
    setSelectedChild(null);
    setFormModalOpen(true);
  };
  
  const handleEditClick = (child: Child) => {
    setSelectedChild(child);
    setFormModalOpen(true);
  };
  
  const handleQrClick = (child: Child) => {
    setSelectedChild(child);
    setQrModalOpen(true);
  };

  const handleDeleteClick = (child: Child) => {
      onDeleteChildren([child.id]);
  }

  const handleSave = (childData: Child | NewChild) => {
    if ('id' in childData && childData.id) {
      onUpdateChild(childData as Child);
    } else {
      onAddChild(childData as NewChild);
    }
    setFormModalOpen(false);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedChildrenIds(children.map(c => c.id));
    } else {
        setSelectedChildrenIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedChildrenIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action: 'createAccount' | 'delete') => {
      if (action === 'createAccount') {
          onCreateAccounts(selectedChildrenIds);
      } else if (action === 'delete') {
          onDeleteChildren(selectedChildrenIds);
      }
      setSelectedChildrenIds([]);
  }


  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">قائمة الأطفال</h3>
        <button
          onClick={handleAddClick}
          className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i>
          <span>إضافة طفل</span>
        </button>
      </div>
      
      {selectedChildrenIds.length > 0 && (
          <div className="bg-sky-100 border-l-4 border-sky-500 text-sky-800 p-4 mb-4 rounded-r-lg flex justify-between items-center shadow flex-wrap gap-2">
              <p className="font-medium">{selectedChildrenIds.length} طفل محدد</p>
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
                    <input type="checkbox" onChange={handleSelectAll} checked={children.length > 0 && selectedChildrenIds.length === children.length} />
                  </th>
                  <th scope="col" className="px-6 py-3">الاسم</th>
                  <th scope="col" className="px-6 py-3">العمر</th>
                  <th scope="col" className="px-6 py-3">ولي الأمر</th>
                  <th scope="col" className="px-6 py-3">الحساب</th>
                  <th scope="col" className="px-6 py-3">إجراءات</th>
                </tr>
            </thead>
            <tbody>
                {children.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-500">
                            <i className="fa-solid fa-child-reaching text-4xl text-gray-300"></i>
                            <p className="mt-2">لا يوجد أطفال مسجلون حالياً.</p>
                            <p className="text-sm">ابدأ بإضافة طفل جديد من الزر أعلاه.</p>
                        </td>
                    </tr>
                ) : (
                    children.map(child => (
                    <tr key={child.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="p-4">
                          <input type="checkbox" checked={selectedChildrenIds.includes(child.id)} onChange={() => handleSelectOne(child.id)} />
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{child.name}</td>
                        <td className="px-6 py-4">{child.age} سنوات</td>
                        <td className="px-6 py-4">{child.guardian.name} ({child.guardian.relation})</td>
                        <td className="px-6 py-4">
                            {child.guardian.accountId ? (
                                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">تم الإنشاء</span>
                            ) : (
                                <button onClick={() => onCreateAccounts([child.id])} disabled={isCreatingAccounts} className="font-medium text-emerald-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed text-xs">إنشاء حساب</button>
                            )}
                        </td>
                        <td className="px-6 py-4 space-x-2 rtl:space-x-reverse">
                          <button onClick={() => handleEditClick(child)} className="font-medium text-sky-600 hover:underline">تعديل</button>
                          <button onClick={() => handleDeleteClick(child)} className="font-medium text-rose-600 hover:underline">حذف</button>
                          <button onClick={() => handleQrClick(child)} className="font-medium text-indigo-600 hover:underline">QR Code</button>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
        
        {/* Mobile Cards */}
        <div className="md:hidden">
            {children.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <i className="fa-solid fa-child-reaching text-4xl text-gray-300"></i>
                    <p className="mt-2">لا يوجد أطفال مسجلون حالياً.</p>
                    <p className="text-sm">ابدأ بإضافة طفل جديد من الزر أعلاه.</p>
                </div>
            ) : (
                <div className="space-y-4 p-4">
                {children.map(child => (
                    <div key={child.id} className="bg-gray-50 p-4 rounded-lg shadow">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={selectedChildrenIds.includes(child.id)} onChange={() => handleSelectOne(child.id)} />
                          <p className="font-bold text-gray-800">{child.name}</p>
                        </div>
                         <div className="space-x-2 rtl:space-x-reverse">
                            <button onClick={() => handleEditClick(child)} className="font-medium text-sky-600 hover:underline text-sm">تعديل</button>
                            <button onClick={() => handleDeleteClick(child)} className="font-medium text-rose-600 hover:underline text-sm">حذف</button>
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>العمر:</strong> {child.age} سنوات</p>
                        <p><strong>ولي الأمر:</strong> {child.guardian.name} ({child.guardian.relation})</p>
                        <p><strong>الحالة الصحية:</strong> {child.healthStatus}</p>
                    </div>
                     <div className="border-t mt-3 pt-3 flex justify-between items-center">
                        {child.guardian.accountId ? (
                            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">تم إنشاء الحساب</span>
                        ) : (
                            <button onClick={() => onCreateAccounts([child.id])} disabled={isCreatingAccounts} className="font-medium text-emerald-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed text-sm">إنشاء حساب لولي الأمر</button>
                        )}
                        <button onClick={() => handleQrClick(child)} className="font-medium text-indigo-600 hover:underline text-sm">عرض QR Code</button>
                    </div>
                    </div>
                ))}
                </div>
            )}
        </div>
      </div>
      
      {isFormModalOpen && (
        <ChildFormModal
            child={selectedChild}
            onClose={() => setFormModalOpen(false)}
            onSave={handleSave}
        />
      )}
      {isQrModalOpen && selectedChild && (
          <QrCodeModal 
            person={selectedChild}
            personType="child"
            onClose={() => setQrModalOpen(false)}
          />
      )}
    </div>
  );
};

interface ChildFormModalProps {
    child: Child | null;
    onClose: () => void;
    onSave: (child: Child | NewChild) => void;
}

const ChildFormModal: React.FC<ChildFormModalProps> = ({ child, onClose, onSave }) => {
    const [formData, setFormData] = useState<Child | NewChild>(child || {
        name: '',
        age: 0,
        address: '',
        healthStatus: '',
        guardian: { name: '', relation: 'الأب', phone: '', email: '' },
        qrCodeId: '', // Will be set in App.tsx
    });

    useEffect(() => {
        // This effect ensures that if a child is passed, the form data is set correctly,
        // especially the guardian email which might be auto-generated.
        if (child) {
            setFormData(child);
        }
    }, [child]);


    const handleGuardianNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setFormData(prev => {
             const newGuardian = { ...prev.guardian, name: newName };
            return { ...prev, guardian: newGuardian };
        });
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'age' ? parseInt(value) || 0 : value }));
    };
    
    const handleGuardianChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newGuardian = { ...prev.guardian, [name]: value };
            if (name === 'relation') {
              newGuardian.relation = value as Guardian['relation'];
            }
            return { ...prev, guardian: newGuardian };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let dataToSave = { ...formData };
        
        // Auto-generate email only if it's a new entry or email is missing
        if (!dataToSave.guardian.email && dataToSave.guardian.name) {
             const sanitizedName = dataToSave.guardian.name.trim().toLowerCase().replace(/\s+/g, '.');
             dataToSave.guardian.email = `${sanitizedName}@funnybanny.com`;
        }

        onSave(dataToSave);
    };
    
    return (
        <Modal isOpen={true} onClose={onClose} title={child ? 'تعديل بيانات طفل' : 'إضافة طفل جديد'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">اسم الطفل</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">العمر</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">العنوان</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">الحالة الصحية</label>
                    <textarea name="healthStatus" value={formData.healthStatus} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                </div>
                <h4 className="text-lg font-semibold pt-2 border-t">بيانات ولي الأمر</h4>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">اسم ولي الأمر</label>
                    <input type="text" name="name" value={formData.guardian.name} onChange={handleGuardianNameChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">صلة القرابة</label>
                    <select name="relation" value={formData.guardian.relation} onChange={handleGuardianChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                        <option>الأب</option>
                        <option>الأم</option>
                        <option>آخر</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                    <input type="text" name="phone" value={formData.guardian.phone} onChange={handleGuardianChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                </div>
                <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">إلغاء</button>
                    <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600">حفظ</button>
                </div>
            </form>
        </Modal>
    );
};

export default ChildrenManagement;