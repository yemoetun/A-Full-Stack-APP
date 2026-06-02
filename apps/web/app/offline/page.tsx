export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M6.343 17.657a9 9 0 010-12.728M9.172 15.536a5 5 0 010-7.072M12 12h.01" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You're offline</h1>
        <p className="text-gray-500 mb-6">Check your internet connection and try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
