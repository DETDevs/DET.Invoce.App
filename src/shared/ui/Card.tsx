import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div
      className={`bg-[#FDFBF7] rounded-2xl p-5 shadow-sm border border-stone-100 ${className}`}
    >
      {children}
    </div>
  );
};
