import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { findUserByPassword } from "@/features/auth/data/mockUsers";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export const useLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const { login } = useAuthStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error("La clave de seguridad no puede estar vacía.", {
        style: { background: "#593D31", color: "#fff" },
      });
      return;
    }

    const user = findUserByPassword(password);

    if (!user) {
      toast.error("Clave de seguridad incorrecta.", {
        duration: 4000,
        style: {
          background: "#593D31",
          color: "#fff",
          borderLeft: "5px solid #E8BC6E",
        },
      });
      return;
    }

    login({ id: user.id, name: user.name, role: user.role });

    toast.success(`¡Bienvenido, ${user.name}!`, {
      style: { background: "#E8BC6E", color: "#fff", fontWeight: "bold" },
      iconTheme: { primary: "#fff", secondary: "#E8BC6E" },
    });

    const defaultRoutes: Record<string, string> = {
      mesero: "/ordenes",
      cajero: "/ordenes",
      admin: "/",
    };

    setTimeout(() => {
      navigate(defaultRoutes[user.role] || "/");
    }, 1500);
  };

  return { password, setPassword, handleLogin };
};