import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/SideBar';

export const DashboardLayout = () => {
  return (
    <div className="flex bg-[#FDFBF7] min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-0 lg:ml-64 transition-all duration-300 pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
};