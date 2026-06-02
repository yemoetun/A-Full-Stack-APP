import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-bold text-brand-500 mb-4">404</p>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page not found</h2>
        <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
        <Link href="/dashboard" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
