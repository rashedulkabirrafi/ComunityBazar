import { useContext } from "react";
import { Navigate, useLocation } from "react-router";
import { AuthContext } from "../Provider/AuthProvider";
import { Loading, ErrorState } from "../ui/shared";
export default function PrivateRoutes({ children }) {
  const { user, loading, error } = useContext(AuthContext);
  const location = useLocation();
  if (loading) return <Loading />;
  if (!user)
    return (
      <Navigate
        to="/Login"
        replace
        state={location.pathname + location.search}
      />
    );
  if (error)
    return (
      <div className="container section-space">
        <ErrorState message={error} retry={() => window.location.reload()} />
      </div>
    );
  return children;
}
