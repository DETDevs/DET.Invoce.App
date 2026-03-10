import { Outlet } from "react-router-dom";
import { Sidebar } from "@/features/dashboard/components/SideBar";
import { SidebarProvider, useSidebar } from "@/shared/context/SidebarContext";
import { NetworkStatusBar } from "@/shared/ui/NetworkStatusBar";

const LayoutContent = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex bg-[#FDFBF7] min-h-screen">
      <Sidebar />
      <main
        className={`flex-1 min-w-0 h-screen flex flex-col overflow-y-auto overflow-x-hidden pt-16 lg:pt-0 ${
          isCollapsed ? "ml-0 lg:ml-[72px]" : "ml-0 lg:ml-64"
        }`}
      >
        <NetworkStatusBar />
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
