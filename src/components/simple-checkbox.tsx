// src/components/simple-checkbox.tsx
"use client";
import * as React from "react";
import clsx from "clsx";

export interface SimpleCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  boxClassName?: string;
  id?: string;
}

export const SimpleCheckbox: React.FC<SimpleCheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled,
  className,
  boxClassName,
  id,
}) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  return (
    <label
      htmlFor={inputId}
      className={clsx(
        "inline-flex items-center gap-3 cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={clsx(
          "w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded border-2",
          checked
            ? "bg-[#e5c869] border-[#e5c869] text-black"
            : "bg-transparent border-[#e5c869]",
          boxClassName
        )}
      >
        {checked && (
          <svg
            viewBox="0 0 20 20"
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8
                 8a1 1 0 01-1.414 0l-4-4a1 1 0
                 011.414-1.414L8 12.586l7.293-7.293a1
                 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </span>
      {label ? (
        <span className="text-base sm:text-xl font-bold text-[#e5c869]">
          {label}
        </span>
      ) : null}
    </label>
  );
};

