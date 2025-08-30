import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import Modal from './Modal';

interface QrCodeModalProps {
    person: { name: string; qrCodeId: string; };
    personType: 'child' | 'staff';
    onClose: () => void;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ person, personType, onClose }) => {
    const qrRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (qrRef.current && person.qrCodeId) {
            const qrCodeData = JSON.stringify({ type: personType, id: person.qrCodeId });
            QRCode.toCanvas(qrRef.current, qrCodeData, { width: 256, margin: 2 }, (error) => {
                if (error) console.error('QRCode generation error:', error);
            });
        }
    }, [person.qrCodeId, personType]);

    const handleShare = () => {
        const message = encodeURIComponent(`هذا هو رمز QR الخاص بـ ${person.name} لتسجيل الحضور في حضانة Funny Banny.`);
        const whatsappUrl = `https://wa.me/?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleDownload = () => {
        const canvas = qrRef.current;
        if (canvas) {
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `${person.name.replace(/\s+/g, '_')}-qrcode.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    return (
        <Modal isOpen={true} onClose={onClose} title={`رمز QR لـ ${person.name}`}>
            <div className="flex flex-col items-center justify-center space-y-4">
                <canvas ref={qrRef} className="w-64 h-64 border rounded-lg bg-white"></canvas>
                <p className="text-sm text-gray-500 text-center">استخدم هذا الرمز لتسجيل الحضور والانصراف.<br/>يمكنك طباعته وإلصاقه على حقيبة الطفل.</p>
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                    <button
                        onClick={handleDownload}
                        className="w-full bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors flex items-center justify-center gap-2"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        <span>تحميل الرمز</span>
                    </button>
                    <button
                        onClick={handleShare}
                        className="w-full bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.06 21.94L7.32 20.58C8.77 21.39 10.37 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.71 20.28 11.91C20.28 16.47 16.6 20.15 12.04 20.15C10.56 20.15 9.12 19.78 7.85 19.07L7.49 18.87L4.44 19.65L5.25 16.7L5.03 16.34C4.24 15 3.8 13.47 3.8 11.91C3.8 7.35 7.48 3.67 12.04 3.67ZM9.15 7.5C8.94 7.5 8.74 7.5 8.53 7.5C8.33 7.5 8.01 7.59 7.74 7.87C7.48 8.14 6.81 8.76 6.81 9.92C6.81 11.08 7.77 12.18 7.92 12.37C8.06 12.57 9.21 14.54 11.12 15.34C13.03 16.14 13.43 15.97 13.73 15.93C14.04 15.88 14.94 15.39 15.19 14.83C15.44 14.27 15.44 13.8 15.34 13.65C15.24 13.5 15.09 13.45 14.88 13.36C14.68 13.26 13.58 12.73 13.35 12.63C13.12 12.54 12.97 12.49 12.82 12.74C12.67 12.99 12.22 13.5 12.07 13.65C11.92 13.8 11.77 13.82 11.57 13.73C11.37 13.63 10.52 13.34 9.52 12.44C8.71 11.73 8.18 10.86 8.04 10.61C7.89 10.36 8.01 10.24 8.14 10.11C8.25 10 8.38 9.84 8.53 9.69C8.67 9.54 8.72 9.42 8.82 9.22C8.92 9.02 8.87 8.87 8.82 8.72C8.77 8.58 8.33 7.5 9.15 7.5Z"></path></svg>
                        <span>مشاركة عبر WhatsApp</span>
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default QrCodeModal;