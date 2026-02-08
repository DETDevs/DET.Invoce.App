import React from "react";

interface LoginInputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: string;
  alt: string;
}

export const LoginInput: React.FC<LoginInputProps> = ({
  type,
  placeholder,
  value,
  onChange,
  icon,
  alt,
}) => (
  <div className="relative group w-full">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <img
        src={icon}
        alt={alt}
        className="w-5 h-5 opacity-50 group-focus-within:opacity-100 transition-opacity"
      />
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] focus:border-transparent transition-all shadow-sm text-sm"
    />
  </div>
);