import { useContext } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "../Provider/AuthProvider";
export default function AdminRoutes({ children }) {
  const { profile } = useContext(AuthContext);
  return profile?.role === "admin" ? (
    children
  ) : (
    <Navigate to="/dashboard/MyProfile" replace />
  );
}
