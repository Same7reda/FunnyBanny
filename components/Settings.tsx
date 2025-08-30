import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { NurserySettings } from '../types';

interface SettingsProps {
    settings: NurserySettings | null;
    onSave: (settings: NurserySettings) => Promise<void>;
}

const NurseryQrCode: React.FC = () => {
    const qrRef = useRef<HTMLCanvasElement>(null);
    const nurseryQrData = JSON.stringify({ type: 'nursery-check-in', nurseryId: 'funny-banny' });

    useEffect(() => {
        if (qrRef.current) {
            QRCode.toCanvas(qrRef.current, nurseryQrData, { width: 200, margin: 2 }, (error) => {
                if (error) console.error('QRCode generation error:', error);
            });
        }
    }, [nurseryQrData]);

    const handlePrint = () => {
       const canvas = qrRef.current;
       if (!canvas) return;
       const dataUrl = canvas.toDataURL();
       const windowContent = `
        <!DOCTYPE html>
        <html>
            <head><title>Print QR Code</title></head>
            <body style="text-align: center; font-family: sans-serif;">
                <h2>Funny Banny - QR Code</h2>
                <p>يرجى مسح هذا الرمز لتسجيل حضور وانصراف الموظفين</p>
                <img src="${dataUrl}" style="width: 300px; height: 300px;" />
            </body>
        </html>
       `;
       const printWin = window.open('', '', 'width=400,height=400');
       printWin?.document.write(windowContent);
       printWin?.document.close();
       printWin?.focus();
       printWin?.print();
       printWin?.close();
    }

    return (
        <div className="mt-8">
             <h4 className="text-lg font-medium text-gray-700">رمز QR الخاص بالحضانة</h4>
             <p className="text-sm text-gray-500 mt-2">
                يمكن للموظفين مسح هذا الرمز عبر بوابتهم الخاصة لتسجيل الحضور والانصراف.
            </p>
            <div className="mt-4 p-4 border rounded-lg flex flex-col items-center gap-4 bg-gray-50">
                <canvas ref={qrRef}></canvas>
                <button 
                    onClick={handlePrint}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                    طباعة الرمز
                </button>
            </div>
        </div>
    );
}


const Settings: React.FC<SettingsProps> = ({ settings, onSave }) => {
    const [formData, setFormData] = useState<NurserySettings>({
        checkInStartTime: '07:00',
        checkInEndTime: '10:00',
        checkOutStartTime: '13:00',
        checkOutEndTime: '16:00',
        nextDueDateStrategy: 'first_day_next_month',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        if (settings) {
            setFormData({
                nextDueDateStrategy: 'first_day_next_month', // default for older settings
                ...settings,
            });
        }
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveMessage('');
        setSaveError('');
        try {
            await onSave(formData);
            setSaveMessage('تم حفظ الإعدادات بنجاح!');
        } catch (error) {
            setSaveError('فشل حفظ الإعدادات. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsSaving(false);
            setTimeout(() => {
                setSaveMessage('');
                setSaveError('');
            }, 3000);
        }
    };

    return (
        <div className="p-4 md:p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">إعدادات النظام</h3>
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <h4 className="text-lg font-medium text-gray-700">أوقات تسجيل الحضور والانصراف</h4>
                        <p className="text-sm text-gray-500 mt-1">
                            حدد النوافذ الزمنية المسموح بها لمسح رمز QR لتسجيل الدخول والخروج.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label htmlFor="checkInStartTime" className="block text-sm font-medium text-gray-700">بداية وقت الحضور</label>
                                <input
                                    type="time"
                                    name="checkInStartTime"
                                    id="checkInStartTime"
                                    value={formData.checkInStartTime}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="checkInEndTime" className="block text-sm font-medium text-gray-700">نهاية وقت الحضور</label>
                                <input
                                    type="time"
                                    name="checkInEndTime"
                                    id="checkInEndTime"
                                    value={formData.checkInEndTime}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                             <div>
                                <label htmlFor="checkOutStartTime" className="block text-sm font-medium text-gray-700">بداية وقت الانصراف</label>
                                <input
                                    type="time"
                                    name="checkOutStartTime"
                                    id="checkOutStartTime"
                                    value={formData.checkOutStartTime}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                             <div>
                                <label htmlFor="checkOutEndTime" className="block text-sm font-medium text-gray-700">نهاية وقت الانصراف</label>
                                <input
                                    type="time"
                                    name="checkOutEndTime"
                                    id="checkOutEndTime"
                                    value={formData.checkOutEndTime}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h4 className="text-lg font-medium text-gray-700">إعدادات الفواتير</h4>
                        <p className="text-sm text-gray-500 mt-1">
                            تحديد استراتيجية تاريخ الاستحقاق للفاتورة التالية التي يتم إنشاؤها تلقائياً بعد الدفع.
                        </p>
                        <div className="mt-4">
                            <label htmlFor="nextDueDateStrategy" className="block text-sm font-medium text-gray-700">استراتيجية تاريخ الاستحقاق</label>
                            <select
                                name="nextDueDateStrategy"
                                id="nextDueDateStrategy"
                                value={formData.nextDueDateStrategy}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            >
                                <option value="first_day_next_month">أول يوم في الشهر التالي</option>
                                <option value="last_day_next_month">آخر يوم في الشهر التالي</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex justify-end items-center pt-2 h-8">
                         {saveMessage && <p className="text-sm text-emerald-600 mr-4">{saveMessage}</p>}
                         {saveError && <p className="text-sm text-rose-600 mr-4">{saveError}</p>}
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors disabled:bg-sky-300 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                        </button>
                    </div>
                </form>

                <div className="border-t my-6"></div>
                
                <NurseryQrCode />

            </div>
        </div>
    );
};

export default Settings;