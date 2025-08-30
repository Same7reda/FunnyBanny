import React, { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, get, set, push, update, remove } from 'firebase/database';
import { auth, db, secondaryAuth } from './firebase';

import { ViewType, Child, Staff, Invoice, AttendanceRecord, NewChild, InvoiceStatus, NewStaff, NewInvoice, StaffAttendanceRecord, NurserySettings, AttendanceStatus, NewStaffAttendanceRecord, UserRole, UserProfile, NewAttendanceRecord } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ChildrenManagement from './components/ChildrenManagement';
import StaffManagement from './components/StaffManagement';
import Attendance from './components/Attendance';
import Invoicing from './components/Invoicing';
import Login from './components/Login';
import Settings from './components/Settings';
import StaffPortal from './components/portals/StaffPortal';
import ParentPortal from './components/portals/ParentPortal';
import ConfirmationModal from './components/ConfirmationModal';
import AlertModal from './components/AlertModal';
import Reports from './components/Reports';


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [children, setChildren] = useState<Child[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendanceRecord[]>([]);
  const [settings, setSettings] = useState<NurserySettings | null>(null);
  
  const [isCreatingAccounts, setIsCreatingAccounts] = useState(false);
  
  const [alertInfo, setAlertInfo] = useState<{ title: string; message: string | React.ReactNode; type: 'success' | 'error' } | null>(null);
  const [confirmationInfo, setConfirmationInfo] = useState<{ title: string; message: React.ReactNode; onConfirm: () => void } | null>(null);


  const fetchData = useCallback(async () => {
      setLoading(true);
      setConnectionError(null);
      try {
        const processSnapshot = (snapshot: any) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                return Object.keys(data).map(key => ({ id: key, ...data[key] }));
            }
            return [];
        };

        const [childrenSnap, staffSnap, invoicesSnap, attendanceSnap, staffAttendanceSnap, settingsSnap] = await Promise.all([
            get(ref(db, "children")),
            get(ref(db, "staff")),
            get(ref(db, "invoices")),
            get(ref(db, "attendance")),
            get(ref(db, "staffAttendance")),
            get(ref(db, "settings/nursery")),
        ]);

        const rawInvoices = processSnapshot(invoicesSnap);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Compare dates only
        const updates: { [key: string]: any } = {};
        let needsUpdate = false;

        rawInvoices.forEach((invoice: Invoice) => {
            if (invoice.status === InvoiceStatus.Unpaid) {
                const dueDate = new Date(invoice.dueDate);
                if (dueDate < today) {
                    invoice.status = InvoiceStatus.Overdue;
                    updates[`/invoices/${invoice.id}/status`] = InvoiceStatus.Overdue;
                    needsUpdate = true;
                }
            }
        });

        if (needsUpdate) {
            await update(ref(db), updates);
        }

        setChildren(processSnapshot(childrenSnap));
        setStaff(processSnapshot(staffSnap));
        setInvoices(rawInvoices);
        setAttendance(processSnapshot(attendanceSnap));
        setStaffAttendance(processSnapshot(staffAttendanceSnap));

        if (settingsSnap.exists()) {
            setSettings(settingsSnap.val() as NurserySettings);
        } else {
            // Set default settings if none exist
            const defaultSettings: NurserySettings = {
                checkInStartTime: '07:00',
                checkInEndTime: '10:00',
                checkOutStartTime: '13:00',
                checkOutEndTime: '16:00',
                nextDueDateStrategy: 'first_day_next_month',
            };
            await set(ref(db, "settings/nursery"), defaultSettings);
            setSettings(defaultSettings);
        }

      } catch (error: any) {
        console.error("Error fetching data: ", error);
        if (error.code === 'unavailable' || (error.message && error.message.includes('Failed to fetch'))) {
             setConnectionError("لا يمكن الوصول إلى قاعدة البيانات. يرجى التحقق من اتصالك بالإنترنت.");
        } else {
            setConnectionError("حدث خطأ غير متوقع أثناء تحميل البيانات.");
        }
      } finally {
        setLoading(false);
      }
  }, []);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userProfileRef = ref(db, `users/${currentUser.uid}`);
        const userProfileSnap = await get(userProfileRef);
        if (userProfileSnap.exists()) {
            const profile = userProfileSnap.val() as UserProfile;
            setUserRole(profile.role);
        } else {
            setUserRole('admin');
        }
        await fetchData();
      } else {
        setUserRole(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchData]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserRole(null);
      setChildren([]);
      setStaff([]);
      setInvoices([]);
      setAttendance([]);
      setStaffAttendance([]);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // --- Generic CRUD ---
  const performDelete = async (path: string, ids: string[], entityName: string) => {
    setConfirmationInfo({
        title: `تأكيد حذف ${entityName}`,
        message: `هل أنت متأكد من رغبتك في حذف ${ids.length} ${ids.length > 1 ? 'عناصر' : 'عنصر'}؟ لا يمكن التراجع عن هذا الإجراء.`,
        onConfirm: async () => {
            setConfirmationInfo(null);
            try {
                const updates: { [key: string]: null } = {};
                ids.forEach(id => {
                    updates[`/${path}/${id}`] = null;
                });
                await update(ref(db), updates);
                await fetchData();
                setAlertInfo({ title: 'نجاح', message: `تم حذف ${entityName} بنجاح.`, type: 'success' });
            } catch (error) {
                console.error(`Error deleting ${path}:`, error);
                setAlertInfo({ title: 'خطأ', message: `فشل حذف ${entityName}.`, type: 'error' });
            }
        }
    });
  };

  // --- Entity Specific Handlers ---
  
  const handleAddChild = async (childData: NewChild) => {
      try {
          const qrCodeId = crypto.randomUUID();
          const dataToAdd = { ...childData, qrCodeId };
          const newChildRef = push(ref(db, 'children'));
          await set(newChildRef, dataToAdd);
          await fetchData();
      } catch (error) {
          console.error("Error adding child: ", error);
      }
  };

  const handleUpdateChild = async (childData: Child) => {
      try {
          const childRef = ref(db, `children/${childData.id}`);
          const { id, ...dataToUpdate } = childData;
          await update(childRef, dataToUpdate);
          await fetchData();
      } catch (error) {
          console.error("Error updating child: ", error);
      }
  };
  const handleDeleteChildren = (ids: string[]) => performDelete('children', ids, 'الأطفال');

  const handleAddStaff = async (staffData: NewStaff) => {
      try {
          const qrCodeId = crypto.randomUUID();
          const dataToAdd = { ...staffData, qrCodeId };
          const newStaffRef = push(ref(db, 'staff'));
          await set(newStaffRef, dataToAdd);
          await fetchData();
      } catch (error) {
          console.error("Error adding staff: ", error);
      }
  };

  const handleUpdateStaff = async (staffData: Staff) => {
      try {
          const staffRef = ref(db, `staff/${staffData.id}`);
          const { id, ...dataToUpdate } = staffData;
          await update(staffRef, dataToUpdate);
          await fetchData();
      } catch (error) {
          console.error("Error updating staff: ", error);
      }
  };
  const handleDeleteStaff = (ids: string[]) => performDelete('staff', ids, 'الموظفين');
  
    const handleAddInvoice = async (invoiceData: NewInvoice) => {
        try {
            const newInvoiceRef = push(ref(db, 'invoices'));
            await set(newInvoiceRef, invoiceData);
            await fetchData();
        } catch (error) {
            console.error("Error adding invoice: ", error);
        }
    };

    const handleUpdateInvoice = async (invoiceData: Invoice) => {
        try {
            const invoiceRef = ref(db, `invoices/${invoiceData.id}`);
            const { id, ...dataToUpdate } = invoiceData;
            await update(invoiceRef, dataToUpdate);
            await fetchData();
        } catch (error) {
            console.error("Error updating invoice: ", error);
        }
    };
    
    const handleDeleteInvoices = (ids: string[]) => performDelete('invoices', ids, 'الفواتير');

    const getNextDueDate = (currentDueDateStr: string): string => {
        const currentDueDate = new Date(currentDueDateStr);
        // Create a new date object to avoid modifying the original
        const nextDate = new Date(currentDueDate.valueOf());
        
        // Move to the next month. setMonth handles year change automatically.
        nextDate.setMonth(nextDate.getMonth() + 1);

        if (settings?.nextDueDateStrategy === 'last_day_next_month') {
            // To get the last day of the new month, we go to the start of the month *after* it, then subtract one day.
            const year = nextDate.getFullYear();
            const month = nextDate.getMonth();
            return new Date(year, month + 1, 0).toISOString().split('T')[0];
        } else { // Default to 'first_day_next_month'
            nextDate.setDate(1);
            return nextDate.toISOString().split('T')[0];
        }
    };

    const handleMarkInvoicesAsPaid = (invoiceIds: string[]) => {
        if (invoiceIds.length === 0) return;
        setConfirmationInfo({
            title: 'تأكيد الدفع',
            message: `هل أنت متأكد من تعليم ${invoiceIds.length} فاتورة كـ "مدفوعة"؟ هذا الإجراء نهائي وسيتم إنشاء فواتير جديدة للشهر التالي تلقائياً.`,
            onConfirm: async () => {
                setConfirmationInfo(null);
                try {
                    const updates: { [key: string]: any } = {};
                    const invoicesToUpdate = invoices.filter(inv => invoiceIds.includes(inv.id) && inv.status !== InvoiceStatus.Paid);
                    
                    if (invoicesToUpdate.length === 0) {
                        setAlertInfo({title: 'تنبيه', message: 'الفواتير المحددة مدفوعة بالفعل.', type: 'error'});
                        return;
                    }

                    for (const invoice of invoicesToUpdate) {
                        // 1. Mark current invoice as paid
                        updates[`/invoices/${invoice.id}/status`] = InvoiceStatus.Paid;
                        updates[`/invoices/${invoice.id}/paymentDate`] = new Date().toISOString().split('T')[0];

                        // 2. Create next invoice
                        const newInvoice: NewInvoice = {
                            childId: invoice.childId,
                            childName: invoice.childName,
                            amount: invoice.amount,
                            issueDate: new Date().toISOString().split('T')[0],
                            dueDate: getNextDueDate(invoice.dueDate),
                            status: InvoiceStatus.Unpaid,
                            paymentDate: null,
                        };
                        const newInvoiceRefKey = push(ref(db, 'invoices')).key;
                        if(newInvoiceRefKey) {
                           updates[`/invoices/${newInvoiceRefKey}`] = newInvoice;
                        }
                    }

                    await update(ref(db), updates);
                    await fetchData();
                    setAlertInfo({ title: 'نجاح', message: 'تم تحديث الفواتير وإنشاء الفواتير الجديدة بنجاح.', type: 'success' });

                } catch (error) {
                    console.error("Error marking invoices as paid: ", error);
                    setAlertInfo({ title: 'خطأ', message: 'فشل تحديث الفواتير.', type: 'error' });
                }
            }
        });
    };
  
  const handleUpdateChildAttendance = async (record: AttendanceRecord | NewAttendanceRecord) => {
      try {
          if ('id' in record) {
              const attendanceRef = ref(db, `attendance/${record.id}`);
              const { id, ...dataToUpdate } = record;
              await update(attendanceRef, dataToUpdate);
          } else {
              const newRecordRef = push(ref(db, 'attendance'));
              await set(newRecordRef, record);
          }
          await fetchData();
      } catch (error) {
          console.error("Error updating attendance: ", error);
      }
  };

  const handleDeleteChildAttendance = (ids: string[]) => performDelete('attendance', ids, 'سجلات الحضور');


  const handleUpdateStaffAttendance = async (record: StaffAttendanceRecord | Omit<StaffAttendanceRecord, 'id'>) => {
    try {
        if ('id' in record) {
            const attendanceRef = ref(db, `staffAttendance/${record.id}`);
            const { id, ...dataToUpdate } = record;
            await update(attendanceRef, dataToUpdate);
        } else {
            const newRecordRef = push(ref(db, 'staffAttendance'));
            await set(newRecordRef, record);
        }
        await fetchData();
    } catch (error) {
        console.error("Error updating staff attendance: ", error);
    }
  };

  const handleUpdateSettings = async (newSettings: NurserySettings) => {
    try {
        const settingsRef = ref(db, 'settings/nursery');
        await set(settingsRef, newSettings);
        setSettings(newSettings);
    } catch (error) {
        console.error("Error updating settings: ", error);
        throw error;
    }
  };

  const handleQrScan = async (decodedText: string): Promise<string> => {
    try {
        if (!settings) {
            return "إعدادات النظام غير محملة. يرجى المحاولة مرة أخرى.";
        }
        
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const nowTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // HH:MM format

        const isCheckInTime = nowTime >= settings.checkInStartTime && nowTime <= settings.checkInEndTime;
        const isCheckOutTime = nowTime >= settings.checkOutStartTime && nowTime <= settings.checkOutEndTime;

        let scanAction: 'check-in' | 'check-out';

        if (isCheckInTime) {
            scanAction = 'check-in';
        } else if (isCheckOutTime) {
            scanAction = 'check-out';
        } else {
            return `التسجيل غير متاح الآن. مواعيد الحضور (${settings.checkInStartTime}-${settings.checkInEndTime}) والانصراف (${settings.checkOutStartTime}-${settings.checkOutEndTime}).`;
        }
        
        const { type, id: qrCodeId } = JSON.parse(decodedText);
        const checkInTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });


        if (type === 'child') {
            const child = children.find(c => c.qrCodeId === qrCodeId);
            if (!child) return "لم يتم العثور على الطفل.";
            const existingRecord = attendance.find(a => a.childId === child.id && a.date === today);

            if (scanAction === 'check-in') {
                if (existingRecord) return `${child.name} قد سجل حضوره بالفعل اليوم.`;
                const newRecord: NewAttendanceRecord = { childId: child.id, childName: child.name, date: today, checkIn: checkInTime, checkOut: null, status: AttendanceStatus.Present };
                await handleUpdateChildAttendance(newRecord);
                return `تم تسجيل حضور ${child.name} بنجاح.`;
            } else { // 'check-out'
                if (!existingRecord) return `${child.name} لم يسجل حضوره بعد.`;
                if (existingRecord.checkOut) return `تم تسجيل انصراف ${child.name} بالفعل اليوم.`;
                await handleUpdateChildAttendance({ ...existingRecord, checkOut: checkInTime });
                return `تم تسجيل انصراف ${child.name} بنجاح.`;
            }
        }
        
        else if (type === 'staff') {
            const staffMember = staff.find(s => s.qrCodeId === qrCodeId);
            if (!staffMember) return "لم يتم العثور على الموظف.";
            const existingRecord = staffAttendance.find(a => a.staffId === staffMember.id && a.date === today);
            
             if (scanAction === 'check-in') {
                if (existingRecord) return `قد سجل ${staffMember.name} حضوره بالفعل اليوم.`;
                const newRecord: NewStaffAttendanceRecord = { staffId: staffMember.id, staffName: staffMember.name, date: today, checkIn: checkInTime, checkOut: null, status: AttendanceStatus.Present };
                await handleUpdateStaffAttendance(newRecord);
                return `تم تسجيل حضور ${staffMember.name} بنجاح.`;
            } else { // 'check-out'
                if (!existingRecord) return `${staffMember.name} لم يسجل حضوره بعد.`;
                if (existingRecord.checkOut) return `تم تسجيل انصراف ${staffMember.name} بالفعل اليوم.`;
                await handleUpdateStaffAttendance({ ...existingRecord, checkOut: checkInTime });
                return `تم تسجيل انصراف ${staffMember.name} بنجاح.`;
            }
        } 
        
        else if (type === 'nursery-check-in' && userRole === 'staff') {
            const loggedInStaff = staff.find(s => s.accountId === user?.uid);
            if (!loggedInStaff) return "خطأ: لم يتم العثور على بيانات الموظف.";
            const existingRecord = staffAttendance.find(a => a.staffId === loggedInStaff.id && a.date === today);

            if (scanAction === 'check-in') {
                if (existingRecord) return `أهلاً ${loggedInStaff.name}! لقد سجلت حضورك بالفعل.`;
                const newRecord: NewStaffAttendanceRecord = { staffId: loggedInStaff.id, staffName: loggedInStaff.name, date: today, checkIn: checkInTime, checkOut: null, status: AttendanceStatus.Present };
                await handleUpdateStaffAttendance(newRecord);
                return `تم تسجيل حضورك بنجاح، ${loggedInStaff.name}.`;
            } else { // 'check-out'
                if (!existingRecord) return `يجب تسجيل الحضور أولاً، ${loggedInStaff.name}.`;
                if (existingRecord.checkOut) return `أهلاً بعودتك ${loggedInStaff.name}! لقد سجلت انصرافك بالفعل.`;
                await handleUpdateStaffAttendance({ ...existingRecord, checkOut: checkInTime });
                return `تم تسجيل انصرافك بنجاح، ${loggedInStaff.name}.`;
            }
        }
        else {
            return "رمز QR غير صالح أو ليس لديك الصلاحية لمسحه.";
        }
    } catch (error) {
        console.error("Error handling QR scan:", error);
        return "خطأ في قراءة الرمز. حاول مرة أخرى.";
    }
  };
  
  // --- Account Creation ---
    const generatePassword = (length = 8) => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let retVal = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
    };

    const handleCreateStaffAccounts = async (staffIds: string[]) => {
        setIsCreatingAccounts(true);
        const newCredentials = [];
        const updates: { [key: string]: any } = {};
        
        const staffToUpdate = staff.filter(s => staffIds.includes(s.id) && !s.accountId && s.email);

        if (staffToUpdate.length === 0) {
            setAlertInfo({ title: 'تنبيه', message: "لم يتم تحديد موظفين صالحين لإنشاء حسابات (يجب وجود بريد إلكتروني وعدم وجود حساب مسبق).", type: 'error' });
            setIsCreatingAccounts(false);
            return;
        }

        for (const staffMember of staffToUpdate) {
            const password = generatePassword();
            try {
                const userCredential = await createUserWithEmailAndPassword(secondaryAuth, staffMember.email, password);
                const uid = userCredential.user.uid;
                
                updates[`/staff/${staffMember.id}/accountId`] = uid;
                updates[`/users/${uid}`] = { role: 'staff', linkId: staffMember.id };

                newCredentials.push({
                    name: staffMember.name,
                    email: staffMember.email,
                    password: password,
                    phone: staffMember.phone
                });
            } catch(error: any) {
                console.error(`Failed to create account for ${staffMember.name}:`, error);
                setAlertInfo({title: 'خطأ', message: `فشل إنشاء حساب لـ ${staffMember.name}. قد يكون البريد الإلكتروني مستخدماً بالفعل.`, type: 'error'});
            }
        }
        
        try {
            if (Object.keys(updates).length > 0) {
                await update(ref(db), updates);
                await fetchData();
                setAlertInfo({ title: 'تم إنشاء الحسابات بنجاح', message: 'تم إنشاء الحسابات الجديدة. يرجى إبلاغ الموظفين ببيانات الدخول الخاصة بهم.', type: 'success' });
            }
        } catch (error) {
            console.error("Error creating staff accounts: ", error);
            setAlertInfo({ title: 'خطأ', message: "حدث خطأ أثناء تحديث قاعدة البيانات.", type: 'error' });
        } finally {
            setIsCreatingAccounts(false);
        }
    };
    
    const handleCreateParentAccounts = async (childIds: string[]) => {
        setIsCreatingAccounts(true);
        const newCredentials = [];
        const updates: { [key: string]: any } = {};

        const childrenToUpdate = children.filter(c => childIds.includes(c.id) && !c.guardian.accountId && c.guardian.email);

        if (childrenToUpdate.length === 0) {
            setAlertInfo({ title: 'تنبيه', message: "لم يتم تحديد أطفال صالحين لإنشاء حسابات (يجب وجود بريد إلكتروني لولي الأمر وعدم وجود حساب مسبق).", type: 'error' });
            setIsCreatingAccounts(false);
            return;
        }

        for (const child of childrenToUpdate) {
            const password = generatePassword();
            try {
                const userCredential = await createUserWithEmailAndPassword(secondaryAuth, child.guardian.email, password);
                const uid = userCredential.user.uid;

                updates[`/children/${child.id}/guardian/accountId`] = uid;
                updates[`/users/${uid}`] = { role: 'parent', linkId: child.id };
                
                newCredentials.push({
                    name: child.guardian.name,
                    email: child.guardian.email,
                    password: password,
                    phone: child.guardian.phone
                });
            } catch(error: any) {
                console.error(`Failed to create account for ${child.guardian.name}:`, error);
                setAlertInfo({title: 'خطأ', message: `فشل إنشاء حساب لـ ${child.guardian.name}. قد يكون البريد الإلكتروني مستخدماً بالفعل.`, type: 'error'});
            }
        }
        
        try {
            if (Object.keys(updates).length > 0) {
                await update(ref(db), updates);
                await fetchData();
                 setAlertInfo({ title: 'تم إنشاء الحسابات بنجاح', message: 'تم إنشاء حسابات أولياء الأمور الجديدة. يرجى إبلاغهم ببيانات الدخول الخاصة بهم.', type: 'success' });
            }
        } catch (error) {
            console.error("Error creating parent accounts: ", error);
            setAlertInfo({ title: 'خطأ', message: "حدث خطأ أثناء تحديث قاعدة البيانات.", type: 'error' });
        } finally {
            setIsCreatingAccounts(false);
        }
    };


  // --- Render Logic ---

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-100"><div className="text-lg font-medium text-gray-600">جاري التحميل...</div></div>;
  }

  if (!user) {
    return <Login />;
  }
  
  if (connectionError) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-100 text-center p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ في الاتصال</h2>
        <p className="text-gray-700 mb-6">{connectionError}</p>
        <button
          onClick={fetchData}
          className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // --- Role-based Portals ---
  if (userRole === 'staff') {
    const staffMember = staff.find(s => s.accountId === user.uid);
    if (!staffMember) return <div className="flex h-screen items-center justify-center">خطأ: لم يتم العثور على ملف الموظف.</div>
    return <StaffPortal 
        staffMember={staffMember}
        attendance={staffAttendance.filter(a => a.staffId === staffMember.id)}
        onScan={handleQrScan}
        onLogout={handleLogout}
        userEmail={user.email}
    />
  }

  if (userRole === 'parent') {
      const child = children.find(c => c.guardian.accountId === user.uid);
      if (!child) return <div className="flex h-screen items-center justify-center">خطأ: لم يتم ربط الحساب بأي طفل.</div>
      return <ParentPortal
        child={child}
        attendance={attendance.filter(a => a.childId === child.id)}
        invoices={invoices.filter(i => i.childId === child.id)}
        onLogout={handleLogout}
        userEmail={user.email}
      />
  }

  // --- Admin Portal ---
  const renderAdminView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard children={children} invoices={invoices} attendance={attendance} />;
      case 'children':
        return <ChildrenManagement children={children} onAddChild={handleAddChild} onUpdateChild={handleUpdateChild} onDeleteChildren={handleDeleteChildren} onCreateAccounts={handleCreateParentAccounts} isCreatingAccounts={isCreatingAccounts} />;
      case 'staff':
        return <StaffManagement staff={staff} onAddStaff={handleAddStaff} onUpdateStaff={handleUpdateStaff} onDeleteStaff={handleDeleteStaff} onCreateAccounts={handleCreateStaffAccounts} isCreatingAccounts={isCreatingAccounts} />;
      case 'attendance':
        return <Attendance 
            children={children} 
            staff={staff} 
            childAttendance={attendance} 
            staffAttendance={staffAttendance} 
            onUpdateChildAttendance={handleUpdateChildAttendance}
            onDeleteChildAttendance={handleDeleteChildAttendance} 
        />;
      case 'invoicing':
        return <Invoicing invoices={invoices} children={children} onAddInvoice={handleAddInvoice} onUpdateInvoice={handleUpdateInvoice} onMarkAsPaid={handleMarkInvoicesAsPaid} onDeleteInvoices={handleDeleteInvoices} />;
      case 'settings':
        return <Settings settings={settings} onSave={handleUpdateSettings} />;
      case 'reports':
        return <Reports children={children} staff={staff} invoices={invoices} attendance={attendance} />;
      default:
        return <Dashboard children={children} invoices={invoices} attendance={attendance} />;
    }
  };

  if (userRole === 'admin') {
    return (
        <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
        <Sidebar 
            currentView={currentView} 
            setView={setCurrentView}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
            <Header 
                view={currentView} 
                onMenuClick={() => setIsSidebarOpen(true)}
                onLogout={handleLogout}
                userEmail={user.email}
            />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100">
             {alertInfo && (
                <AlertModal 
                    isOpen={true}
                    onClose={() => setAlertInfo(null)}
                    title={alertInfo.title}
                    message={alertInfo.message}
                    type={alertInfo.type}
                />
            )}
            {confirmationInfo && (
                <ConfirmationModal
                    isOpen={true}
                    onClose={() => setConfirmationInfo(null)}
                    title={confirmationInfo.title}
                    message={confirmationInfo.message}
                    onConfirm={confirmationInfo.onConfirm}
                />
            )}
            {renderAdminView()}
            </main>
        </div>
        </div>
    );
  }

  // Fallback loading state while role is being determined
  return <div className="flex h-screen items-center justify-center bg-gray-100"><div className="text-lg font-medium text-gray-600">جاري التحقق من الصلاحيات...</div></div>;
};

export default App;