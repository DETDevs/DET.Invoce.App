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
import { RoleGuard } from "@/shared/ui/RoleGuard";

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
            <Route
              index
              element={
                <RoleGuard allowedRoles={["admin"]}>
                  <DashboardPage />
                </RoleGuard>
              }
            />
            <Route
              path="tablero"
              element={
                <RoleGuard allowedRoles={["admin"]}>
                  <OrdersBoardPage />
                </RoleGuard>
              }
            />
            <Route
              path="productos"
              element={
                <RoleGuard allowedRoles={["admin"]}>
                  <ProductsPage />
                </RoleGuard>
              }
            />
            <Route
              path="nuevo-producto"
              element={
                <RoleGuard allowedRoles={["admin"]}>
                  <AddProductPage />
                </RoleGuard>
              }
            />
            <Route
              path="usuarios"
              element={
                <RoleGuard allowedRoles={["admin"]}>
                  <UsersPage />
                </RoleGuard>
              }
            />
            <Route
              path="nuevo-usuario"
              element={
                <RoleGuard allowedRoles={["admin"]}>
                  <AddUserPage />
                </RoleGuard>
              }
            />
            <Route
              path="reportes"
              element={
                <RoleGuard allowedRoles={["admin"]}>
                  <ReportsPage />
                </RoleGuard>
              }
            />
            <Route
              path="configuracion"
              element={
                <RoleGuard allowedRoles={["admin"]}>
                  <SettingsPage />
                </RoleGuard>
              }
            />

            <Route
              path="facturas"
              element={
                <RoleGuard allowedRoles={["cajero", "admin"]}>
                  <InvoicesPage />
                </RoleGuard>
              }
            />
            <Route
              path="movimientos-caja"
              element={
                <RoleGuard allowedRoles={["cajero", "admin"]}>
                  <CashMovementsPage />
                </RoleGuard>
              }
            />

            <Route
              path="ordenes"
              element={
                <RoleGuard allowedRoles={["mesero", "cajero", "admin"]}>
                  <NewOrderPage />
                </RoleGuard>
              }
            />
            <Route
              path="takeout"
              element={
                <RoleGuard allowedRoles={["mesero", "cajero", "admin"]}>
                  <TakeoutDashboardPage />
                </RoleGuard>
              }
            />
            <Route
              path="realizar-pedido"
              element={
                <RoleGuard allowedRoles={["mesero", "cajero", "admin"]}>
                  <CreateCustomOrderPage />
                </RoleGuard>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </NavigationBlockerProvider>
    </BrowserRouter>
  );
}

export default App;
