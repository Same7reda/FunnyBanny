import React, { useState, useMemo } from 'react';
import { Invoice, InvoiceStatus, NewInvoice, Child } from '../types';
import Modal from './Modal';

interface InvoicingProps {
  invoices: Invoice[];
  children: Child[];
  onAddInvoice: (invoice: NewInvoice) => void;
  onUpdateInvoice: (invoice: Invoice) => void;
  onMarkAsPaid: (invoiceIds: string[]) => void;
  onDeleteInvoices: (invoiceIds: string[]) => void;
}

type InvoiceFilter = 'all' | InvoiceStatus;

const Invoicing: React.FC<InvoicingProps> = ({ invoices, children, onAddInvoice, onUpdateInvoice, onMarkAsPaid, onDeleteInvoices }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<InvoiceFilter>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { totalUnpaid, totalPaid } = useMemo(() => {
    return invoices.reduce((acc, invoice) => {
        if (invoice.status === InvoiceStatus.Unpaid || invoice.status === InvoiceStatus.Overdue) {
            acc.totalUnpaid += invoice.amount;
        } else if (invoice.status === InvoiceStatus.Paid) {
            acc.totalPaid += invoice.amount;
        }
        return acc;
    }, { totalUnpaid: 0, totalPaid: 0 });
  }, [invoices]);
  
  const filteredInvoices = useMemo(() => {
    if (filter === 'all') {
      return invoices;
    }
    return invoices.filter(invoice => invoice.status === filter);
  }, [invoices, filter]);
    
  const getStatusClass = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.Paid: return 'bg-emerald-100 text-emerald-800';
      case InvoiceStatus.Unpaid: return 'bg-amber-100 text-amber-800';
      case InvoiceStatus.Overdue: return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleAddClick = () => {
    setSelectedInvoice(null);
    setIsModalOpen(true);
  };
  
  const handleEditClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  }

  const handleSaveInvoice = (invoice: NewInvoice | Invoice) => {
    if ('id' in invoice) {
        onUpdateInvoice(invoice);
    } else {
        onAddInvoice(invoice);
    }
    setIsModalOpen(false);
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedIds(filteredInvoices.map(i => i.id));
    } else {
        setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  const handleBulkAction = (action: 'paid' | 'delete') => {
      if (action === 'delete') {
          onDeleteInvoices(selectedIds);
      } else if (action === 'paid') {
          const unpaidIds = selectedIds.filter(id => {
              const inv = invoices.find(i => i.id === id);
              return inv && inv.status !== InvoiceStatus.Paid;
          });
          onMarkAsPaid(unpaidIds);
      }
      setSelectedIds([]);
  };

  const filterButtons: { label: string, value: InvoiceFilter }[] = [
      { label: 'الكل', value: 'all' },
      { label: 'مدفوعة', value: InvoiceStatus.Paid },
      { label: 'غير مدفوعة', value: InvoiceStatus.Unpaid },
      { label: 'متأخرة', value: InvoiceStatus.Overdue },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">الفواتير والرسوم</h3>
        <button onClick={handleAddClick} className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors flex items-center gap-2">
          <i className="fa-solid fa-plus"></i>
          <span>إنشاء فاتورة</span>
        </button>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
                 <div className="p-3 rounded-full bg-rose-500 text-white w-12 h-12 flex items-center justify-center text-xl">
                    <i className="fa-solid fa-file-invoice-dollar"></i>
                 </div>
                 <div className="mr-4">
                    <p className="text-sm font-medium text-gray-500">إجمالي غير المدفوع</p>
                    <p className="text-2xl font-bold text-gray-800">{totalUnpaid.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</p>
                 </div>
            </div>
             <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
                 <div className="p-3 rounded-full bg-emerald-500 text-white w-12 h-12 flex items-center justify-center text-xl">
                    <i className="fa-solid fa-hand-holding-dollar"></i>
                 </div>
                 <div className="mr-4">
                    <p className="text-sm font-medium text-gray-500">إجمالي المدفوعات</p>
                    <p className="text-2xl font-bold text-gray-800">{totalPaid.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</p>
                 </div>
            </div>
       </div>

      {selectedIds.length > 0 && (
          <div className="bg-sky-100 border-l-4 border-sky-500 text-sky-800 p-4 mb-4 rounded-r-lg flex justify-between items-center shadow flex-wrap gap-2">
              <p className="font-medium">{selectedIds.length} فاتورة محددة</p>
              <div className="flex gap-2">
                 <button onClick={() => handleBulkAction('paid')} className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-emerald-600">تعليم كمدفوعة</button>
                 <button onClick={() => handleBulkAction('delete')} className="bg-rose-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-rose-600">حذف المحدد</button>
              </div>
          </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between flex-wrap gap-2">
            <p className="font-semibold text-gray-700">قائمة الفواتير</p>
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

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                 <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={filteredInvoices.length > 0 && selectedIds.length === filteredInvoices.length} /></th>
                <th scope="col" className="px-6 py-3">رقم الفاتورة</th>
                <th scope="col" className="px-6 py-3">اسم الطفل</th>
                <th scope="col" className="px-6 py-3">المبلغ</th>
                <th scope="col" className="px-6 py-3">تاريخ الاستحقاق</th>
                <th scope="col" className="px-6 py-3">الحالة</th>
                <th scope="col" className="px-6 py-3">إجراءات</th>
                </tr>
            </thead>
            <tbody>
                {filteredInvoices.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="text-center py-10 text-gray-500">
                            <i className="fa-solid fa-file-invoice text-4xl text-gray-300"></i>
                            <p className="mt-2">
                                {invoices.length === 0 
                                    ? "لا توجد فواتير مسجلة حالياً." 
                                    : "لا توجد فواتير تطابق الفلتر المحدد."}
                            </p>
                        </td>
                    </tr>
                ) : (
                    filteredInvoices.map(invoice => (
                    <tr key={invoice.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="p-4"><input type="checkbox" checked={selectedIds.includes(invoice.id)} onChange={() => handleSelectOne(invoice.id)} /></td>
                        <td className="px-6 py-4 font-medium text-gray-900">{invoice.id.substring(0, 8)}</td>
                        <td className="px-6 py-4">{invoice.childName}</td>
                        <td className="px-6 py-4">{invoice.amount.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</td>
                        <td className="px-6 py-4">{invoice.dueDate}</td>
                        <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(invoice.status)}`}>
                            {invoice.status}
                        </span>
                        </td>
                        <td className="px-6 py-4 space-x-2 rtl:space-x-reverse">
                            {invoice.status !== InvoiceStatus.Paid && (
                                 <button onClick={() => onMarkAsPaid([invoice.id])} className="font-medium text-emerald-600 hover:underline">تعليم كمدفوعة</button>
                            )}
                            <button onClick={() => handleEditClick(invoice)} className="font-medium text-sky-600 hover:underline">تعديل</button>
                            <button onClick={() => onDeleteInvoices([invoice.id])} className="font-medium text-rose-600 hover:underline">حذف</button>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
            {filteredInvoices.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <i className="fa-solid fa-file-invoice text-4xl text-gray-300"></i>
                    <p className="mt-2">
                        {invoices.length === 0 
                            ? "لا توجد فواتير مسجلة حالياً." 
                            : "لا توجد فواتير تطابق الفلتر المحدد."}
                    </p>
                </div>
            ) : (
              <div className="space-y-4 p-4">
                {filteredInvoices.map(invoice => (
                  <div key={invoice.id} className="bg-gray-50 p-4 rounded-lg shadow space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                         <input type="checkbox" checked={selectedIds.includes(invoice.id)} onChange={() => handleSelectOne(invoice.id)} />
                        <div>
                            <p className="font-bold text-gray-800">{invoice.childName}</p>
                            <p className="text-xs text-gray-500">فاتورة #{invoice.id.substring(0, 8)}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                       <p><strong>المبلغ:</strong> {invoice.amount.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</p>
                       <p><strong>تاريخ الاستحقاق:</strong> {invoice.dueDate}</p>
                    </div>
                    <div className="pt-2 border-t flex justify-end space-x-4 rtl:space-x-reverse text-sm">
                       {invoice.status !== InvoiceStatus.Paid && (
                            <button onClick={() => onMarkAsPaid([invoice.id])} className="font-medium text-emerald-600 hover:underline">تعليم كمدفوعة</button>
                       )}
                       <button onClick={() => handleEditClick(invoice)} className="font-medium text-sky-600 hover:underline">تعديل</button>
                       <button onClick={() => onDeleteInvoices([invoice.id])} className="font-medium text-rose-600 hover:underline">حذف</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {isModalOpen && (
        <InvoiceFormModal
            invoice={selectedInvoice}
            childrenList={children}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveInvoice}
        />
      )}
    </div>
  );
};


interface InvoiceFormModalProps {
    invoice: Invoice | null;
    childrenList: Child[];
    onClose: () => void;
    onSave: (invoice: NewInvoice | Invoice) => void;
}

const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({ invoice, childrenList, onClose, onSave }) => {
    const [childId, setChildId] = useState<string>('');
    const [amount, setAmount] = useState<number>(0);
    const [dueDate, setDueDate] = useState<string>('');
    
    React.useEffect(() => {
        if(invoice) {
            setChildId(invoice.childId);
            setAmount(invoice.amount);
            setDueDate(invoice.dueDate);
        } else {
            setDueDate(new Date().toISOString().split('T')[0]);
        }
    }, [invoice]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedChild = childrenList.find(c => c.id === childId);
        if (!selectedChild) return;

        if (invoice) { // Editing existing invoice
            const updatedInvoice: Invoice = {
                ...invoice,
                childId,
                childName: selectedChild.name,
                amount,
                dueDate,
            };
            onSave(updatedInvoice);
        } else { // Creating new invoice
            const newInvoice: NewInvoice = {
                childId: selectedChild.id,
                childName: selectedChild.name,
                amount: amount,
                issueDate: new Date().toISOString().split('T')[0],
                dueDate: dueDate,
                status: InvoiceStatus.Unpaid,
                paymentDate: null,
            };
            onSave(newInvoice);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={invoice ? 'تعديل فاتورة' : 'إنشاء فاتورة جديدة'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">اختر الطفل</label>
                    <select value={childId} onChange={(e) => setChildId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                        <option value="" disabled>-- اختر طفل --</option>
                        {childrenList.map(child => (
                            <option key={child.id} value={child.id}>{child.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">قيمة الفاتورة</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">تاريخ الاستحقاق</label>
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                </div>

                <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">إلغاء</button>
                    <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600">حفظ الفاتورة</button>
                </div>
            </form>
        </Modal>
    );
};


export default Invoicing;