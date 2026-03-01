import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "@/api/auth/AuthAPI";
import userApi from "@/api/user/UserAPI";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import type { UserRole } from "@/features/auth/data/mockUsers";

export const useLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("El nombre de usuario y la clave no pueden estar vacíos.", {
        style: { background: "#593D31", color: "#fff" },
      });
      return;
    }

    setIsLoading(true);
    try {
      const authResponse = await authApi.authenticate({ username, password });

      if (authResponse.token) {
        localStorage.setItem("authToken", authResponse.token);
      }
      if (authResponse.refreshToken) {
        localStorage.setItem("refreshToken", authResponse.refreshToken);
      }

      const userProfile = await userApi.getByUsername(username);

      if (!userProfile) {
        throw new Error("No se pudo obtener el perfil del usuario.");
      }

      const roleStr = userProfile.role?.toLowerCase() || "";
      let mappedRole: UserRole = "mesero";
      if (roleStr.includes("admin")) {
        mappedRole = "admin";
      } else if (roleStr.includes("vendedor") || roleStr.includes("cajero")) {
        mappedRole = "cajero";
      }

      login({
        id: (userProfile.userId || userProfile.id || "").toString(),
        name: `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() || userProfile.username,
        role: mappedRole,
      });

      toast.success(`¡Bienvenido, ${userProfile.firstName || userProfile.username}!`, {
        style: { background: "#E8BC6E", color: "#fff", fontWeight: "bold" },
        iconTheme: { primary: "#fff", secondary: "#E8BC6E" },
      });

      const defaultRoutes: Record<string, string> = {
        mesero: "/ordenes",
        cajero: "/ordenes",
        admin: "/",
      };

      setTimeout(() => {
        navigate(defaultRoutes[mappedRole] || "/");
      }, 1500);
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Credenciales incorrectas o error de conexión.", {
        duration: 4000,
        style: {
          background: "#593D31",
          color: "#fff",
          borderLeft: "5px solid #E8BC6E",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { username, setUsername, password, setPassword, handleLogin, isLoading };
};