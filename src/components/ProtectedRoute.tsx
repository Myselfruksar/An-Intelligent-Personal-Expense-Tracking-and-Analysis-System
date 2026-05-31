// ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded: any = jwtDecode(token);

    if (decoded.exp * 1000 < Date.now()) {
      localStorage.clear();
      sessionStorage.clear();

      return <Navigate to="/login" replace />;
    }

    return <Outlet />;
  } catch {
    localStorage.clear();
    sessionStorage.clear();

    return <Navigate to="/login" replace />;
  }
}