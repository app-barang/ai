"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  name?: string;
  /** Ikon pilihan di sebelah kiri (cth: Lock) */
  icon?: React.ElementType;
  className?: string;
  id?: string;
}

export default function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  disabled = false,
  required = false,
  autoComplete,
  name,
  icon: Icon,
  className,
  id,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textsec" />
      )}
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        className={cn(
          "h-12 w-full rounded-xl border border-gray-200 bg-bgalt pr-12 text-sm outline-none transition-colors placeholder:text-textsec focus:border-primary disabled:cursor-not-allowed disabled:opacity-60",
          Icon ? "pl-11" : "pl-4",
          className
        )}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        disabled={disabled}
        aria-label={show ? "Sembunyikan kata laluan" : "Papar kata laluan"}
        title={show ? "Sembunyikan kata laluan" : "Papar kata laluan"}
        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
