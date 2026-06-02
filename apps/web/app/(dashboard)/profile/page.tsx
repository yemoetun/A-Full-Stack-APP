import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="you@example.com"
          />
        </div>
        <button className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700">
          Save changes
        </button>
      </div>
    </div>
  );
}
