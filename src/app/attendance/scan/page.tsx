import dynamic from 'next/dynamic';

const ScannerClient = dynamic(() => import('./ScannerClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading scanner...</p>
      </div>
    </div>
  ),
});

export default function AttendanceScanPage() {
  return <ScannerClient />;
}