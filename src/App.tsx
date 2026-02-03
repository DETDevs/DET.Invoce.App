import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { DashboardLayout } from "@/features/dashboard/layout/DashBoardLayout";
import { DashboardPage } from "@/features/dashboard/page/DashBoardPage";
import { ProductsPage } from "./features/products/pages/ProductsPage";
import { AddProductPage } from "./features/products/pages/AddProductPage";
import { AddUserPage } from "./features/users/pages/AddUserPage";
import { UsersPage } from "./features/users/pages/UsersPage";
import { ReportsPage } from "./features/reports/pages/ReportsPage";
import { NewOrderPage } from "./features/orders/pages/NewOrderPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="productos" element={<ProductsPage />} />
          <Route path="nuevo-producto" element={<AddProductPage />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="nuevo-usuario" element={<AddUserPage />} />
          <Route path="reportes" element={<ReportsPage />} />
          <Route path="ordenes" element={<NewOrderPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
