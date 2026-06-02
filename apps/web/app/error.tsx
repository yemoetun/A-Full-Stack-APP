"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-500 mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
