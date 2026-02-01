import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  ClipboardList,
  Users,
  Bell,
  LogOut,
  Menu,
} from "lucide-react";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import logo from "@/assets/Logotipo.png";

export const Sidebar = () => {
  const navigate = useNavigate();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: ShoppingBag, label: "Productos", active: false },
    { icon: PlusCircle, label: "Nuevo Producto", active: false },
    { icon: ClipboardList, label: "Nueva Orden", active: false },
    { icon: Users, label: "Usuarios", active: false },
    { icon: Bell, label: "Reportes", active: false },
  ];

  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutDialogOpen(false);
    navigate("/login");
  };

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#593D31] text-[#F9F7F0] flex items-center justify-between px-4 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu size={28} />
          </button>
          <span className="font-bold text-lg tracking-wide">
            Dulces Momentos
          </span>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-[#593D31] text-[#F9F7F0] 
          flex flex-col py-8 px-5 z-50 shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:shadow-none
        `}
      >
        <div className="lg:justify-center">
          <div className="flex justify-center items-center">
            <img
              src={logo}
              alt="Dulces Momentos"
              className="h-40 object-fill"
            />
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                item.active
                  ? "bg-[#E8BC6E] text-white shadow-lg translate-x-1"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon
                size={20}
                className={
                  item.active
                    ? "text-white"
                    : "text-[#E8BC6E] group-hover:text-white"
                }
              />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center space-x-2 bg-[#E8BC6E] hover:bg-[#dca34b] text-white py-3 rounded-lg transition-colors shadow-md font-medium"
          >
            <span>Cerrar Sesión</span>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas salir del sistema?"
      />
    </>
  );
};
