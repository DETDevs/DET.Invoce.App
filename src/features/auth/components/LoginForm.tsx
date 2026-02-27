import React, { useState } from "react";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { LoginInput } from "./LoginInput";
import lockIcon from "@/assets/password.svg";
import userIcon from "@/assets/useradmin.svg";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export const LoginForm = () => {
  const {
    username,
    setUsername,
    password,
    setPassword,
    handleLogin,
    isLoading,
  } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      className="space-y-5 flex flex-col justify-center items-center"
      onSubmit={handleLogin}
    >
      <div className="relative w-full">
        <LoginInput
          type="text"
          placeholder="Nombre de Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          icon={userIcon}
          alt="username"
        />
      </div>

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
        disabled={isLoading}
        className={`w-1/2 flex justify-center items-center py-3 font-bold rounded-xl shadow-md transition-all duration-200 mt-6 ${
          isLoading
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-[#E8BC6E] hover:bg-[#dca34b] text-white hover:shadow-lg transform active:scale-[0.98] cursor-pointer"
        }`}
      >
        {isLoading ? (
          <Loader2 size={24} className="animate-spin" />
        ) : (
          "Ingresar"
        )}
      </button>
    </form>
  );
};
