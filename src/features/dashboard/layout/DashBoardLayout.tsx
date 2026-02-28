import { Outlet } from "react-router-dom";
import { Sidebar } from "@/features/dashboard/components/SideBar";
import { SidebarProvider, useSidebar } from "@/shared/context/SidebarContext";

const LayoutContent = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex bg-[#FDFBF7] min-h-screen">
      <Sidebar />
      <main
        className={`flex-1 pt-16 md:pt-4 overflow-x-hidden ${
          isCollapsed ? "ml-0 md:ml-[72px]" : "ml-0 md:ml-64"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};
