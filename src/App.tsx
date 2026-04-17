import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import Profile from "./pages/Profile";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Programs from "./pages/Programs";
import Users from "./pages/Users"
import Accountant from "./pages/Accountant";
import Beneficiary from "./pages/Beneficiary";
import Order from "./pages/Order";
import Reports from "./pages/Reports";
import Surrender from "./pages/Surrender";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout - Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />

              {/* Others Page */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/users" element={<Users />} />
              <Route path="/accountant" element={<Accountant />} />
              <Route path="/beneficiary" element={<Beneficiary />} />
              <Route path="/order" element={<Order />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/surrender" element={<Surrender />} />
            </Route>
          </Route>

          {/* Auth Layout - Public Only */}
          <Route element={<PublicRoute />}>
            <Route path="/signin" element={<SignIn />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}
