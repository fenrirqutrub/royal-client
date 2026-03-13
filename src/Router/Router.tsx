// src/router/Router.tsx
import { Route, Routes } from "react-router";
import Root from "../layout/Root";
import Home from "../components/Home/Home";
import AdminLayout from "../layout/AdminLayout";
import NotFound from "../pages/NotFound/NotFound";
import PrivateRoute from "./PrivateRoute";
import Photography from "../pages/Photography/Photography";
import DailyLesson from "../pages/DailyLesson/DailyLesson";
import WeeklyExam from "../pages/WeeklyExam/WeeklyExam";
import ManagePhotos from "../pages/Admin/Management/ManagePhotos";
import ManageHero from "../pages/Admin/Management/ManageHero";
import ManageWeeklyExam from "../pages/Admin/Management/ManageWeeklyExam";
import AddPhotography from "../pages/Admin/AddNewItem/AddPhotography";
import AddWeeklyExam from "../pages/Admin/AddNewItem/AddWeeklyExam";
import AddHero from "../pages/Admin/AddNewItem/AddHero";
import AddTeacher from "../pages/Admin/AddNewItem/AddTeacher";
import Dashboard from "../pages/Admin/Dashboard/Dashboard";
import Login from "../pages/Admin/Auth/Login";
import Profile from "../pages/Admin/Dashboard/Profile";
import AddDailyLesson from "../pages/Admin/AddNewItem/AddDailyLesson";
import NoticeBoard from "../pages/Notice/NoticeBoard";
import AddNotice from "../pages/Admin/AddNewItem/AddNotice";
import ManageNotice from "../pages/Admin/Management/ManageNotice";

const Router = () => {
  return (
    <Routes>
      {/* ══════════════════ PUBLIC ROUTES ══════════════════ */}
      <Route path="/" element={<Root />}>
        <Route index element={<Home />} />
        <Route path="dailylesson" element={<DailyLesson />} />
        <Route path="weekly-exam" element={<WeeklyExam />} />
        <Route path="notice" element={<NoticeBoard />} />
        <Route path="photography" element={<Photography />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ══════════════════ AUTH ══════════════════ */}
      <Route path="/admin-login" element={<Login />} />

      {/* ══════════════════ PRIVATE — any authenticated user ══════════════════ */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        {/* Dashboard — all roles */}
        <Route index element={<Dashboard />} />

        {/* Profile — all roles */}
        <Route path="profile" element={<Profile />} />

        {/* Weekly Exam — all roles */}
        <Route path="add-weekly-exam" element={<AddWeeklyExam />} />
        <Route path="management/weekly-exam" element={<ManageWeeklyExam />} />

        {/* ── admin + principal only ── */}
        <Route
          path="add-teacher"
          element={
            <PrivateRoute allowedRoles={["admin", "principal"]}>
              <AddTeacher />
            </PrivateRoute>
          }
        />
        <Route
          path="add-photography"
          element={
            <PrivateRoute allowedRoles={["admin", "principal"]}>
              <AddPhotography />
            </PrivateRoute>
          }
        />
        <Route
          path="add-hero"
          element={
            <PrivateRoute allowedRoles={["admin", "principal"]}>
              <AddHero />
            </PrivateRoute>
          }
        />
        <Route
          path="add-notice"
          element={
            <PrivateRoute allowedRoles={["admin", "principal"]}>
              <AddNotice />
            </PrivateRoute>
          }
        />
        <Route path="add-daily-lesson" element={<AddDailyLesson />} />
        <Route
          path="management/photos"
          element={
            <PrivateRoute allowedRoles={["admin", "principal"]}>
              <ManagePhotos />
            </PrivateRoute>
          }
        />
        <Route
          path="management/heroes"
          element={
            <PrivateRoute allowedRoles={["admin", "principal"]}>
              <ManageHero />
            </PrivateRoute>
          }
        />

        <Route
          path="management/notice"
          element={
            <PrivateRoute allowedRoles={["admin", "principal"]}>
              <ManageNotice />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default Router;
