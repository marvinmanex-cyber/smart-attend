'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '@/context/AuthContext';
import { FirestoreService } from '@/services/firestore_service';
import { AlertCircle, CheckCircle, Loader, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ScanStatus = 'idle' | 'scanning' | 'processing' | 'success' | 'error';

export default function AttendanceScanPage() {
  const router = useRouter();
  const { user, status } = useAuth();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [message, setMessage] = useState('');
  const [scannedData, setScannedData] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Initialize scanner
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (user?.role !== 'student') {
      setMessage('Only students can access this page');
      setScanStatus('error');
      return;
    }

    const initScanner = async () => {
      try {
        // Check if html5-qrcode is supported
        if (!Html5Qrcode.getCameraPermission) {
          throw new Error('Camera not supported in your browser');
        }

        scannerRef.current = new Html5Qrcode('qr-scanner-container');
        setScanStatus('scanning');

        // Start scanning
        await scannerRef.current.start(
          { facingMode: 'environment' }, // Use back camera on mobile
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250,
            },
          },
          async (decodedText) => {
            // Handle successful scan
            if (!isScanning) {
              setIsScanning(true);
              await handleScan(decodedText);
            }
          },
          (errorMessage) => {
            // Suppress error logs during scanning
          }
        );
      } catch (err) {
        const error = err as Error;
        setMessage(
          `Camera Error: ${error.message}. Please check camera permissions.`
        );
        setScanStatus('error');
      }
    };

    if (status === 'authenticated' && user?.role === 'student') {
      initScanner();
    }

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
          })
          .catch((err) => console.error('Error stopping scanner:', err));
      }
    };
  }, [status, user, router, isScanning]);

  // Handle QR code scan
  const handleScan = async (scannedCode: string) => {
    try {
      setScanStatus('processing');
      setScannedData(scannedCode);
      setMessage('Processing attendance...');

      // Parse QR code data
      // Expected format: sessionId or sessionId,courseId
      const parts = scannedCode.split(',');
      const sessionId = parts[0]?.trim();
      const courseId = parts[1]?.trim();

      if (!sessionId) {
        throw new Error('Invalid QR code format');
      }

      if (!user?.uid || !user?.name) {
        throw new Error('User information not found');
      }

      // Call markAttendance from Firestore
      await FirestoreService.markAttendance(
        sessionId,
        user.uid,
        user.name,
        courseId || '' // courseId is optional, can be retrieved from session
      );

      setScanStatus('success');
      setMessage('✓ Attendance marked successfully!');

      // Redirect after 2 seconds
      setTimeout(() => {
        resetScanner();
      }, 2000);
    } catch (err) {
      const error = err as Error;
      setScanStatus('error');
      setMessage(error.message || 'Failed to mark attendance');
      setIsScanning(false);

      // Reset scanner to allow retry
      setTimeout(() => {
        resetScanner();
      }, 3000);
    }
  };

  // Reset scanner for next scan
  const resetScanner = () => {
    setScanStatus('scanning');
    setMessage('');
    setScannedData('');
    setIsScanning(false);
  };

  // Manual retry
  const handleRetry = () => {
    resetScanner();
  };

  // Go back
  const handleGoBack = () => {
    router.back();
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || user?.role !== 'student') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 mb-4">
            {status === 'unauthenticated'
              ? 'Please log in first'
              : 'Only students can access this page'}
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden pb-20 md:pb-0">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white shadow-md">
        <div className="flex items-center justify-between p-3 md:p-4 px-4 md:px-6 max-w-full">
          <button
            onClick={handleGoBack}
            className="text-gray-600 hover:text-gray-800 transition p-2 -m-2"
          >
            <X className="w-5 md:w-6 h-5 md:h-6" />
          </button>
          <h1 className="text-base md:text-lg font-bold text-gray-800 text-center flex-1">Scan Attendance</h1>
          <div className="w-5 md:w-6"></div>
        </div>
      </div>

      {/* Scanner Container - Responsive */}
      <div className="absolute top-16 md:top-20 left-0 right-0 bottom-0 flex flex-col items-center justify-center p-3 md:p-4">
        {/* QR Scanner - Mobile optimized */}
        <div className="relative w-full max-w-sm md:max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl bg-black">
          <div id="qr-scanner-container" className="w-full h-full" />

          {/* Scanner Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-10 h-10 md:w-12 md:h-12 border-t-4 border-l-4 border-green-400"></div>
            <div className="absolute top-0 right-0 w-10 h-10 md:w-12 md:h-12 border-t-4 border-r-4 border-green-400"></div>
            <div className="absolute bottom-0 left-0 w-10 h-10 md:w-12 md:h-12 border-b-4 border-l-4 border-green-400"></div>
            <div className="absolute bottom-0 right-0 w-10 h-10 md:w-12 md:h-12 border-b-4 border-r-4 border-green-400"></div>

            {/* Scanning animation */}
            {scanStatus === 'scanning' && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 md:w-64 h-1 bg-green-400 opacity-50 animate-pulse rounded-full"></div>
            )}
          </div>
        </div>

        {/* Status Message - Mobile optimized */}
        <div className="mt-6 md:mt-8 text-center w-full px-4 max-w-md">
          {/* Scanning State */}
          {scanStatus === 'scanning' && !message && (
            <div className="space-y-3">
              <Loader className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              <p className="text-gray-700 font-medium text-sm md:text-base">Point camera at QR code</p>
              <p className="text-xs md:text-sm text-gray-500">
                Make sure QR code is within frame
              </p>
            </div>
          )}

          {/* Processing State */}
          {scanStatus === 'processing' && (
            <div className="space-y-3">
              <Loader className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              <p className="text-gray-700 font-medium text-sm md:text-base">{message}</p>
            </div>
          )}

          {/* Success State */}
          {scanStatus === 'success' && (
            <div className="space-y-3">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <p className="text-gray-700 font-medium text-base md:text-lg">{message}</p>
              {scannedData && (
                <p className="text-xs text-gray-500 break-all">
                  Session: {scannedData.substring(0, 20)}...
                </p>
              )}
            </div>
          )}

          {/* Error State */}
          {scanStatus === 'error' && (
            <div className="space-y-3">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <p className="text-gray-700 font-medium text-sm md:text-base">{message}</p>
              <button
                onClick={handleRetry}
                className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Info - Bottom (Mobile optimized) */}
      <div className="fixed bottom-24 md:bottom-4 left-4 right-4 bg-white rounded-lg shadow-md p-3 md:p-4 max-w-md mx-auto text-xs md:text-sm">
        <p className="text-gray-600">
          <span className="font-semibold">Student:</span> {user?.name}
        </p>
        <p className="text-gray-500 text-xs">
          {user?.matricNumber && `Matric: ${user.matricNumber}`}
        </p>
      </div>
    </div>
  );
          <h1 className="text-lg font-bold text-gray-800">Scan Attendance</h1>
          <div className="w-6"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Scanner Container */}
      <div className="absolute top-16 left-0 right-0 bottom-0 flex flex-col items-center justify-center p-4">
        {/* QR Scanner */}
        <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl bg-black">
          <div id="qr-scanner-container" className="w-full h-full" />

          {/* Scanner Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-green-400"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-green-400"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-green-400"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-green-400"></div>

            {/* Scanning animation */}
            {scanStatus === 'scanning' && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-1 bg-green-400 opacity-50 animate-pulse rounded-full"></div>
            )}
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-8 text-center max-w-md">
          {/* Scanning State */}
          {scanStatus === 'scanning' && !message && (
            <div className="space-y-3">
              <Loader className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              <p className="text-gray-700 font-medium">Point camera at QR code</p>
              <p className="text-sm text-gray-500">
                Make sure QR code is within frame
              </p>
            </div>
          )}

          {/* Processing State */}
          {scanStatus === 'processing' && (
            <div className="space-y-3">
              <Loader className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              <p className="text-gray-700 font-medium">{message}</p>
            </div>
          )}

          {/* Success State */}
          {scanStatus === 'success' && (
            <div className="space-y-3">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <p className="text-gray-700 font-medium text-lg">{message}</p>
              {scannedData && (
                <p className="text-xs text-gray-500 break-all">
                  Session ID: {scannedData}
                </p>
              )}
            </div>
          )}

          {/* Error State */}
          {scanStatus === 'error' && (
            <div className="space-y-3">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <p className="text-gray-700 font-medium text-lg">{message}</p>
              <button
                onClick={handleRetry}
                className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Info - Bottom */}
      <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-md p-3 max-w-md mx-auto text-sm">
        <p className="text-gray-600">
          <span className="font-semibold">Student:</span> {user?.name}
        </p>
        <p className="text-gray-500 text-xs">
          {user?.matricNumber && `Matric: ${user.matricNumber}`}
        </p>
      </div>
    </div>
  );
}
