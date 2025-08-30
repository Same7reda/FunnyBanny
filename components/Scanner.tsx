import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

interface ScannerProps {
    onScan: (decodedText: string) => Promise<string>;
}

const Scanner: React.FC<ScannerProps> = ({ onScan }) => {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    // Using a ref to prevent multiple scans from being processed simultaneously
    const isProcessing = useRef(false);

    useEffect(() => {
        const onScanSuccess = async (decodedText: string, decodedResult: any) => {
            if (isProcessing.current) {
                return;
            }
            isProcessing.current = true;
            
            if(scannerRef.current) {
                scannerRef.current.pause(true);
            }

            setScanError(null);
            try {
                const resultMessage = await onScan(decodedText);
                setScanResult(resultMessage);
            } catch (e) {
                setScanError("حدث خطأ أثناء معالجة الرمز.");
            } finally {
                // Reset after a delay
                setTimeout(() => {
                    setScanResult(null);
                    setScanError(null);
                    if (scannerRef.current) {
                       try {
                         scannerRef.current.resume();
                       } catch(e) {
                         console.error("Error resuming scanner", e);
                       }
                    }
                    isProcessing.current = false;
                }, 3000);
            }
        };

        const onScanFailure = (error: any) => {
            // This callback is called frequently, so we don't log errors here.
        };

        // Check if scanner is already initialized
        if (!scannerRef.current) {
            const scanner = new Html5QrcodeScanner(
                'qr-reader',
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    supportedScanTypes: [], // Use all supported scan types
                },
                /* verbose= */ false,
            );
            scanner.render(onScanSuccess, onScanFailure);
            scannerRef.current = scanner;
        }


        return () => {
            if (scannerRef.current && scannerRef.current.getState()) {
                 scannerRef.current.clear().catch(error => {
                    console.error('Failed to clear scanner.', error);
                });
                scannerRef.current = null;
            }
        };
    }, [onScan]);

    return (
        <div className="p-4 md:p-8 flex flex-col items-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">مسح رمز QR لتسجيل الحضور</h3>
            <div id="qr-reader" className="w-full max-w-sm md:max-w-md border-2 rounded-lg shadow-lg overflow-hidden"></div>
            {scanResult && (
                <div className="mt-4 p-3 w-full max-w-sm md:max-w-md rounded-md bg-emerald-100 text-emerald-800 text-center font-semibold transition-opacity duration-300">
                    {scanResult}
                </div>
            )}
            {scanError && (
                 <div className="mt-4 p-3 w-full max-w-sm md:max-w-md rounded-md bg-rose-100 text-rose-800 text-center font-semibold transition-opacity duration-300">
                    {scanError}
                </div>
            )}
            {!scanResult && !scanError && (
                 <p className="mt-4 text-gray-500">يرجى توجيه الكاميرا إلى رمز QR.</p>
            )}
        </div>
    );
};

export default Scanner;
