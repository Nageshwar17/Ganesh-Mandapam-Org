import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import DailySchedule from "./pages/admin/DailySchedule";
import CreateMandapam from "./pages/CreateMandapam"; // ✅ Missing import added
import JoinMandapam from "./pages/JoinMandapam"; 
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminRoute from "./components/AdminRoute"; // custom route protection for admins
import NotAuthorized from "./pages/NotAuthorized";
import AdminRoles from "./pages/admin/AdminRoles";
import ExpenseTracker from "./pages/ExpenseTracker";
import MandapamDetails from "./pages/MandapamDetails";
import { Toaster } from "react-hot-toast";
import AboutPage from "./pages/AboutPage";
import BhajanUploadPage from "./pages/BhajanUploadPage";
import MyBhajans from "./pages/MyBhajans";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route path="/userdashboard" element={<UserDashboard />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/mandapam/:mandapamId" element={<MandapamDetails />} />
          <Route path="/bhajansupload" element={<BhajanUploadPage />} />
          <Route path="/mybhajans" element={<MyBhajans />} />


          <Route
            path="/admin/schedule"
            element={
              <ProtectedRoute>
                <DailySchedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-mandapam"
            element={
              <ProtectedRoute>
                <CreateMandapam />
              </ProtectedRoute>
            }
          />
          <Route path="/join-mandapam" element={<JoinMandapam />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <AdminRoute>
                  <AdminRequests />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/team"
              element={
                <AdminRoute>
                  <AdminRoles />
                </AdminRoute>
              }
            />

            <Route
            path="/admin/expenses"
            element={
              <ProtectedRoute>
                <ExpenseTracker />
              </ProtectedRoute>
            }
          />
            
            <Route path="/unauthorized" element={<NotAuthorized />} />
          {/* Add more routes as needed */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
