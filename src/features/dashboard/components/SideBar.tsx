import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  ClipboardList,
  Users,
  Bell,
  LogOut,
  Menu,
  X,
  FileEdit,
  Kanban,
  Settings,
  ArrowLeftRight,
  ChevronDown,
  Receipt,
  UtensilsCrossed,
} from "lucide-react";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import logo from "@/assets/Logotipo.png";
import { useNavigationBlocker } from "@/shared/context/NavigationBlockerContext";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { blocker } = useNavigationBlocker();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>(
    { 0: true, 1: true, 2: true },
  );

  const menuGroups = [
    {
      title: "Operaciones",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/" },
        { icon: Kanban, label: "Tablero Producción", path: "/tablero" },
        { icon: ClipboardList, label: "Nueva Orden", path: "/ordenes" },
        { icon: UtensilsCrossed, label: "Takeout", path: "/takeout" },
        { icon: FileEdit, label: "Realizar Pedido", path: "/realizar-pedido" },
        {
          icon: ArrowLeftRight,
          label: "Movimientos de Caja",
          path: "/movimientos-caja",
        },
      ],
    },
    {
      title: "Gestión",
      items: [
        { icon: Receipt, label: "Facturas", path: "/facturas" },
        { icon: ShoppingBag, label: "Productos", path: "/productos" },
        { icon: PlusCircle, label: "Nuevo Producto", path: "/nuevo-producto" },
        { icon: Bell, label: "Reportes", path: "/reportes" },
        { icon: Users, label: "Usuarios", path: "/usuarios" },
      ],
    },
    {
      title: "Sistema",
      items: [
        { icon: Settings, label: "Configuración", path: "/configuracion" },
      ],
    },
  ];

  const handleNavigation = (path: string) => {
    if (blocker) {
      blocker(path);
    } else {
      navigate(path);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutDialogOpen(false);
    navigate("/login");
  };

  const toggleGroup = (groupIndex: number) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupIndex]: !prev[groupIndex],
    }));
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
          flex flex-col z-50 shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:shadow-none
        `}
      >
        <div className="shrink-0 p-4 flex flex-col items-center relative">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden absolute top-0 right-0 text-[#E8BC6E] hover:text-white transition-colors"
          >
            <X size={28} />
          </button>

          <div className="w-full flex justify-center mt-4 lg:mt-0">
            <img
              src={logo}
              alt="Dulces Momentos"
              className="h-28 w-auto object-contain"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#E8BC6E]/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#E8BC6E]/50 transition-colors">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-4">
              <button
                onClick={() => toggleGroup(groupIndex)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-[#E8BC6E] uppercase tracking-wider hover:bg-white/5 rounded-lg transition-colors mb-2"
              >
                <span>{group.title}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    expandedGroups[groupIndex] ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`space-y-1 overflow-hidden transition-all duration-300 ${
                  expandedGroups[groupIndex]
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                {group.items.map((item, itemIndex) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== "/" &&
                      location.pathname.startsWith(item.path));

                  return (
                    <button
                      key={itemIndex}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                        isActive
                          ? "bg-[#E8BC6E] text-white shadow-lg translate-x-1"
                          : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <item.icon
                        size={20}
                        className={
                          isActive
                            ? "text-white"
                            : "text-[#E8BC6E] group-hover:text-white"
                        }
                      />
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {groupIndex < menuGroups.length - 1 && (
                <div className="h-px bg-white/10 mt-4" />
              )}
            </div>
          ))}
        </nav>

        <div className="shrink-0 p-4 mt-auto border-t border-white/10">
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
