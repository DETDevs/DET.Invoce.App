import React, { useState } from "react";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { LoginInput } from "./LoginInput";
import lockIcon from "@/assets/password.svg";
import { Eye, EyeOff } from "lucide-react";

export const LoginForm = () => {
  const { password, setPassword, handleLogin } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      className="space-y-5 flex flex-col justify-center items-center"
      onSubmit={handleLogin}
    >
      <div className="relative w-full">
        <LoginInput
          type={showPassword ? "text" : "password"}
          placeholder="Clave de seguridad"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={lockIcon}
          alt="password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <button
        type="submit"
        className="w-1/2 py-3 bg-[#E8BC6E] hover:bg-[#dca34b] text-white font-bold rounded-xl shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all duration-200 mt-6 cursor-pointer"
      >
        Ingresar
      </button>
    </form>
  );
};
