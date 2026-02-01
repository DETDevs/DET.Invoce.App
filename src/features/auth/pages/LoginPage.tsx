import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  isValidEmail,
  isValidPassword,
  getPasswordError,
} from "@/core/utils/validations";
import cakeImage from "@/assets/cake-login.svg";
import logoIcon from "@/assets/bakery.svg";
import mailIcon from "@/assets/mail.svg";
import lockIcon from "@/assets/password.svg";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("¡Epa! El correo es obligatorio.", {
        style: { background: "#593D31", color: "#fff" },
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Ese correo no se ve bien. Revísalo porfa.", {
        style: { background: "#593D31", color: "#fff" },
      });
      return;
    }

    if (!password) {
      toast.error("La contraseña no puede estar vacía.", {
        style: { background: "#593D31", color: "#fff" },
      });
      return;
    }

    if (!isValidPassword(password)) {
      const errorMsg = getPasswordError(password) || "Contraseña insegura.";
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

  return (
    <div className="min-h-screen w-full bg-[#FDFBF7] flex items-center justify-center p-4">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white w-full max-w-5xl h-[85vh] md:h-150 flex rounded-3xl shadow-2xl overflow-hidden">
        <div className="hidden md:flex w-1/2 bg-[#F3EFE0] items-center justify-center relative">
          <img
            src={cakeImage}
            alt="Pastel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/5 mix-blend-multiply"></div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-[#FDFBF7]">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-3">
                <img src={logoIcon} alt="Logo" className="w-14 h-14" />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-800 mb-1 tracking-tight">
                Dulces Momentos
              </h1>
              <p className="text-lg font-medium text-gray-600">¡Bienvenidos!</p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img
                    src={mailIcon}
                    alt="email"
                    className="w-5 h-5 opacity-50 group-focus-within:opacity-100 transition-opacity"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] focus:border-transparent transition-all shadow-sm text-sm"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img
                    src={lockIcon}
                    alt="password"
                    className="w-5 h-5 opacity-50 group-focus-within:opacity-100 transition-opacity"
                  />
                </div>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] focus:border-transparent transition-all shadow-sm text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#E8BC6E] hover:bg-[#dca34b] text-white font-bold rounded-xl shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all duration-200 mt-6 cursor-pointer"
              >
                Ingresar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
