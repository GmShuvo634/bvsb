import { NextPageContext } from 'next';
import React from 'react';

interface ErrorProps {
  statusCode?: number;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
}

function Error({ statusCode, hasGetInitialPropsRun, err }: ErrorProps) {
  if (!hasGetInitialPropsRun && err) {
    // getInitialProps was not called on the client, log the error
    console.error('Client-side error:', err);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center p-8 bg-[#111016] rounded-lg border border-[#b66dff] max-w-md w-full mx-4">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-[#b66dff] mb-2">
            {statusCode || 'Error'}
          </h1>
          <h2 className="text-2xl font-bold text-[#fff699] mb-4">
            {statusCode === 404
              ? 'Page Not Found'
              : statusCode === 500
              ? 'Server Error'
              : 'Something went wrong'}
          </h2>
        </div>
        
        <p className="text-white mb-6">
          {statusCode === 404
            ? 'The page you are looking for does not exist.'
            : statusCode === 500
            ? 'A server error occurred. Please try again later.'
            : 'An unexpected error occurred. Please try again.'}
        </p>
        
        <div className="space-y-3">
          <button
            className="w-full px-4 py-2 bg-[#b66dff] text-white rounded hover:bg-[#9d5ce6] transition-colors font-medium"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
          
          <button
            className="w-full px-4 py-2 bg-transparent border border-[#b66dff] text-[#b66dff] rounded hover:bg-[#b66dff] hover:text-white transition-colors font-medium"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
          
          <a
            href="/"
            className="block w-full px-4 py-2 bg-transparent border border-[#fff699] text-[#fff699] rounded hover:bg-[#fff699] hover:text-black transition-colors font-medium text-center"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode, hasGetInitialPropsRun: true };
};

export default Error;
