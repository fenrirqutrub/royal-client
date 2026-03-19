import { Outlet } from "react-router";
import AdminSidebar from "../pages/Admin/Dashboard/AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto mt-12 lg:mt-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
