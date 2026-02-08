import React from "react";
import { useLogin } from "../hooks/useLogin";
import { LoginInput } from "./LoginInput";
import lockIcon from "@/assets/password.svg";

export const LoginForm = () => {
  const { password, setPassword, handleLogin } = useLogin();

  return (
    <form className="space-y-5 flex flex-col justify-center items-center" onSubmit={handleLogin}>
      <LoginInput
        type="password"
        placeholder="Clave de seguridad"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={lockIcon}
        alt="password"
      />

      <button
        type="submit"
        className="w-1/2 py-3 bg-[#E8BC6E] hover:bg-[#dca34b] text-white font-bold rounded-xl shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all duration-200 mt-6 cursor-pointer"
      >
        Ingresar
      </button>
    </form>
  );
};