import React from "react";

interface LoginHeaderProps {
  logoSrc: string;
}

export const LoginHeader: React.FC<LoginHeaderProps> = ({ logoSrc }) => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-3">
        <img src={logoSrc} alt="Logo" className="w-80 h-80 object-cover" />
      </div>
    </div>
  );
};