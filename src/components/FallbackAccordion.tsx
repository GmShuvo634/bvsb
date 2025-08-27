// src/components/FallbackAccordion.tsx
import React, { useState } from "react";

interface FallbackAccordionProps {
  title: string;
  content: string;
}

/**
 * Fallback accordion component that doesn't rely on Material Tailwind
 * Used as a backup if Material Tailwind context issues occur
 */
export const FallbackAccordion: React.FC<FallbackAccordionProps> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-600 rounded-lg mb-4 bg-gray-900">
      <button
        className="w-full text-left p-4 text-[#e5c869] text-xl font-semibold hover:text-[#9e8130] transition-colors duration-200 flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 pt-0 text-white text-lg leading-relaxed">
          {content}
        </div>
      )}
    </div>
  );
};

export default FallbackAccordion;
