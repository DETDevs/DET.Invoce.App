import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
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
  User,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import logo from "@/assets/Logotipo.png";
import { useNavigationBlocker } from "@/shared/context/NavigationBlockerContext";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useSidebar } from "@/shared/context/SidebarContext";
import type { UserRole } from "@/features/auth/data/mockUsers";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { blocker } = useNavigationBlocker();
  const { user, logout } = useAuthStore();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>(
    { 0: true, 1: true, 2: true, 3: true, 4: true },
  );

  // On mobile menu, always show labels regardless of desktop collapsed state
  const showExpanded = !isCollapsed || isMobileMenuOpen;

  const allMenuGroups: {
    title: string;
    allowedRoles: UserRole[];
    items: { icon: typeof LayoutDashboard; label: string; path: string }[];
  }[] = [
    {
      title: "Ventas",
      allowedRoles: ["mesero", "cajero", "admin"],
      items: [
        { icon: ClipboardList, label: "Nueva Orden", path: "/ordenes" },
        { icon: UtensilsCrossed, label: "Takeout", path: "/takeout" },
        { icon: FileEdit, label: "Realizar Pedido", path: "/realizar-pedido" },
      ],
    },
    {
      title: "Caja",
      allowedRoles: ["cajero", "admin"],
      items: [
        { icon: Receipt, label: "Facturas", path: "/facturas" },
        {
          icon: ArrowLeftRight,
          label: "Movimientos de Caja",
          path: "/movimientos-caja",
        },
      ],
    },
    {
      title: "Producción",
      allowedRoles: ["admin", "cajero", "mesero"],
      items: [{ icon: Kanban, label: "Tablero Producción", path: "/tablero" }],
    },
    {
      title: "Administración",
      allowedRoles: ["admin"],
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/" },
        { icon: ShoppingBag, label: "Productos", path: "/productos" },
        { icon: Bell, label: "Reportes", path: "/reportes" },
        { icon: Users, label: "Usuarios", path: "/usuarios" },
      ],
    },
    {
      title: "Sistema",
      allowedRoles: ["admin"],
      items: [
        { icon: Settings, label: "Configuración", path: "/configuracion" },
      ],
    },
  ];

  const menuGroups = useMemo(() => {
    const role = user?.role;
    if (!role) return allMenuGroups;
    return allMenuGroups.filter((group) => group.allowedRoles.includes(role));
  }, [user?.role]);

  const roleLabels: Record<UserRole, string> = {
    admin: "Administrador",
    cajero: "Cajero",
    mesero: "Mesero",
  };

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
    logout();
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
          className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen bg-[#593D31] text-[#F9F7F0] 
          flex flex-col z-50 shadow-2xl overflow-x-clip
          ${isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"} 
          lg:translate-x-0 lg:shadow-none lg:overflow-x-visible
          ${isCollapsed ? "lg:w-[72px]" : "lg:w-64"}
          transition-transform duration-300 ease-in-out lg:transition-[width] lg:duration-200
        `}
      >
        <div className="shrink-0 p-3 flex flex-col items-center relative">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden absolute top-0 right-0 text-[#E8BC6E] hover:text-white transition-colors"
          >
            <X size={28} />
          </button>

          <div
            className={`w-full flex justify-center mt-3 lg:mt-0 ${isCollapsed ? "lg:px-0" : ""}`}
          >
            <img
              src={logo}
              alt="Dulces Momentos"
              className={`object-contain ${isCollapsed && !isMobileMenuOpen ? "lg:h-10 lg:w-10" : "h-16 w-auto"}`}
            />
          </div>
        </div>

        <nav
          className={`flex-1 min-h-0 px-4 lg:px-2 py-3 scrollbar-hide ${isCollapsed && !isMobileMenuOpen ? "lg:overflow-visible overflow-y-auto" : "overflow-y-auto"}`}
        >
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-2">
              {!showExpanded ? (
                <div className="hidden lg:block h-px bg-white/10 my-3 mx-2" />
              ) : (
                <button
                  onClick={() => toggleGroup(groupIndex)}
                  className="w-full flex items-center justify-between px-4 py-1.5 text-xs font-semibold text-[#E8BC6E] uppercase tracking-wider hover:bg-white/5 rounded-lg transition-colors mb-1"
                >
                  <span>{group.title}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      expandedGroups[groupIndex] ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}

              <div
                className={`space-y-1 ${
                  !showExpanded
                    ? ""
                    : `overflow-hidden transition-[max-height,opacity] duration-300 ${
                        expandedGroups[groupIndex]
                          ? "max-h-[500px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`
                }`}
              >
                {group.items.map((item, itemIndex) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== "/" &&
                      location.pathname.startsWith(item.path));

                  return (
                    <div key={itemIndex} className="relative group/tooltip">
                      <button
                        onClick={() => handleNavigation(item.path)}
                        className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-colors duration-150 group ${
                          !showExpanded
                            ? "lg:justify-center lg:px-0"
                            : "space-x-3"
                        } ${
                          isActive
                            ? "bg-[#E8BC6E] text-white shadow-lg"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <item.icon
                          size={20}
                          className={`shrink-0 ${
                            isActive
                              ? "text-white"
                              : "text-[#E8BC6E] group-hover:text-white"
                          }`}
                        />
                        {showExpanded && (
                          <span className="font-medium text-sm whitespace-nowrap">
                            {item.label}
                          </span>
                        )}
                      </button>

                      {!showExpanded && (
                        <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-[#2D2D2D] text-white text-xs font-medium rounded-lg shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-opacity duration-150 whitespace-nowrap z-100 pointer-events-none">
                          {item.label}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#2D2D2D]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {showExpanded && groupIndex < menuGroups.length - 1 && (
                <div className="h-px bg-white/10 mt-4" />
              )}
            </div>
          ))}
        </nav>

        <div className="shrink-0 px-4 py-3 lg:px-2 lg:py-2 mt-auto border-t border-white/10">
          {user && showExpanded && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-9 h-9 rounded-full bg-[#E8BC6E]/20 flex items-center justify-center shrink-0">
                <User size={18} className="text-[#E8BC6E]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                </p>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#E8BC6E]/80">
                  {roleLabels[user.role]}
                </span>
              </div>
            </div>
          )}

          {user && !showExpanded && (
            <div className="hidden lg:flex justify-center mb-3 relative group/user">
              <div className="w-9 h-9 rounded-full bg-[#E8BC6E]/20 flex items-center justify-center">
                <User size={18} className="text-[#E8BC6E]" />
              </div>
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-[#2D2D2D] text-white text-xs font-medium rounded-lg shadow-lg opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-opacity duration-150 whitespace-nowrap z-100 pointer-events-none">
                {user.name} · {roleLabels[user.role]}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#2D2D2D]" />
              </div>
            </div>
          )}

          <div className="relative group/logout">
            <button
              onClick={handleLogoutClick}
              className={`w-full flex items-center justify-center bg-[#E8BC6E] hover:bg-[#dca34b] text-white py-2.5 rounded-lg transition-colors duration-150 shadow-md font-medium ${
                !showExpanded ? "lg:py-2.5 lg:px-0" : "space-x-2"
              }`}
            >
              {showExpanded && <span>Cerrar Sesión</span>}
              <LogOut size={18} />
            </button>

            {!showExpanded && (
              <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-[#2D2D2D] text-white text-xs font-medium rounded-lg shadow-lg opacity-0 invisible group-hover/logout:opacity-100 group-hover/logout:visible transition-opacity duration-150 whitespace-nowrap z-100 pointer-events-none">
                Cerrar Sesión
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#2D2D2D]" />
              </div>
            )}
          </div>

          <button
            onClick={toggleSidebar}
            className="hidden lg:flex w-full items-center justify-center gap-2 mt-2 py-1.5 text-[#E8BC6E]/70 hover:text-[#E8BC6E] hover:bg-white/5 rounded-lg transition-colors duration-150 text-xs font-medium"
          >
            {isCollapsed ? (
              <ChevronsRight size={18} />
            ) : (
              <>
                <ChevronsLeft size={18} />
                <span>Colapsar</span>
              </>
            )}
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
