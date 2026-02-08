import React from "react";

interface LoginHeaderProps {
  logoSrc: string;
}

export const LoginHeader: React.FC<LoginHeaderProps> = ({ logoSrc }) => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-3">
        <img src={logoSrc} alt="Logo" className="w-20 h-14" />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-800 mb-1 tracking-tight">
        Dulces Momentos
      </h1>
      <p className="text-lg font-medium text-gray-600">¡Bienvenidos!</p>
    </div>
  );
};