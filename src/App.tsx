import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { DashboardLayout } from "@/features/dashboard/layout/DashBoardLayout";
import { DashboardPage } from "@/features/dashboard/page/DashBoardPage";
import { ProductsPage } from "@/features/products/pages/ProductsPage";
import { AddProductPage } from "@/features/products/pages/AddProductPage";
import { AddUserPage } from "@/features/users/pages/AddUserPage";
import { UsersPage } from "@/features/users/pages/UsersPage";
import { ReportsPage } from "@/features/reports/pages/ReportsPage";
import { NewOrderPage } from "@/features/orders/pages/NewOrderPage";
import { CreateCustomOrderPage } from "@/features/custom-orders/page/CreateCustomOrderPage";
import { NavigationBlockerProvider } from "@/shared/context/NavigationBlockerContext";
import { OrdersBoardPage } from "@/features/custom-orders/page/OrdersBoardPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
import { CashBoxProvider } from "@/features/settings/pages/CashBoxContext";
import { CashMovementsPage } from "@/features/cash-movements";
import { InvoicesPage } from "@/features/invoices/pages/InvoicesPage";
import { TakeoutDashboardPage } from "@/features/takeout/pages/TakeoutDashboardPage";

function App() {
  return (
    <BrowserRouter>
      <NavigationBlockerProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <CashBoxProvider>
                <DashboardLayout />
              </CashBoxProvider>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="tablero" element={<OrdersBoardPage />} />
            <Route path="productos" element={<ProductsPage />} />
            <Route path="nuevo-producto" element={<AddProductPage />} />
            <Route path="usuarios" element={<UsersPage />} />
            <Route path="realizar-pedido" element={<CreateCustomOrderPage />} />
            <Route path="nuevo-usuario" element={<AddUserPage />} />
            <Route path="reportes" element={<ReportsPage />} />
            <Route path="ordenes" element={<NewOrderPage />} />
            <Route path="takeout" element={<TakeoutDashboardPage />} />
            <Route path="facturas" element={<InvoicesPage />} />
            <Route path="movimientos-caja" element={<CashMovementsPage />} />
            <Route path="configuracion" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </NavigationBlockerProvider>
    </BrowserRouter>
  );
}

export default App;
