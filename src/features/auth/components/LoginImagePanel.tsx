import React from "react";
import cakeImage from "@/assets/cake-login.svg";

export const LoginImagePanel = () => {
  return (
    <div className="hidden md:flex w-1/2 bg-[#F3EFE0] items-center justify-center relative">
      <img
        src={cakeImage}
        alt="Pastel"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/5 mix-blend-multiply"></div>
    </div>
  );
};