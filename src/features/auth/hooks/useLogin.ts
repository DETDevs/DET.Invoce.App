import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  isValidPassword,
  getPasswordError,
} from "@/core/utils/validations";

export const useLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error("La clave de seguridad no puede estar vacía.", {
        style: { background: "#593D31", color: "#fff" },
      });
      return;
    }

    if (!isValidPassword(password)) {
      const errorMsg =
        getPasswordError(password) || "La clave de seguridad no es válida.";
      toast.error(errorMsg, {
        duration: 4000,
        style: {
          background: "#593D31",
          color: "#fff",
          borderLeft: "5px solid #E8BC6E",
        },
      });
      return;
    }

    toast.success("¡Bienvenido! Entrando al sistema...", {
      style: { background: "#E8BC6E", color: "#fff", fontWeight: "bold" },
      iconTheme: { primary: "#fff", secondary: "#E8BC6E" },
    });

    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  return { password, setPassword, handleLogin };
};