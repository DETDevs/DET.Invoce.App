import React from "react";
import { Toaster } from "react-hot-toast";
import { LoginImagePanel } from "../components/LoginImagePanel";
import { LoginHeader } from "../components/LoginHeader";
import { LoginForm } from "../components/LoginForm";
import logoImage from "@/assets/Logotipo.png";

export const LoginPage = () => {
  return (
    <div className="min-h-screen w-full bg-[#FDFBF7] flex items-center justify-center p-4">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white w-full max-w-5xl h-[85vh] md:h-150 flex rounded-3xl shadow-2xl overflow-hidden">
        <LoginImagePanel />

        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-[#FDFBF7]">
          <div className="w-full max-w-sm">
            <LoginHeader logoSrc={logoImage} />
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};
