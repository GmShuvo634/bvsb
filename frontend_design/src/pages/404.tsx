import React from 'react';
import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center p-8 bg-[#111016] rounded-lg border border-[#b66dff] max-w-md w-full mx-4">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-[#b66dff] mb-2">404</h1>
          <h2 className="text-2xl font-bold text-[#fff699] mb-4">
            Page Not Found
          </h2>
        </div>
        
        <p className="text-white mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        
        <div className="space-y-3">
          <button
            className="w-full px-4 py-2 bg-transparent border border-[#b66dff] text-[#b66dff] rounded hover:bg-[#b66dff] hover:text-white transition-colors font-medium"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
          
          <Link
            href="/"
            className="block w-full px-4 py-2 bg-[#b66dff] text-white rounded hover:bg-[#9d5ce6] transition-colors font-medium text-center"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
