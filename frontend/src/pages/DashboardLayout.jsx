import { useContext } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import {
  UserRound,
  PlusCircle,
  Grid2X2,
  Heart,
  ShoppingBag,
  Package,
  Users,
  ListChecks,
  LogOut,
} from "lucide-react";
import { AuthContext } from "../Provider/AuthProvider";
const links = [
  ["MyProfile", "Your profile", UserRound],
  ["AddListing", "Sell an item", PlusCircle],
  ["MyListing", "Your listings", Grid2X2],
  ["MyWishlist", "Saved finds", Heart],
  ["MyCart", "Shopping bag", ShoppingBag],
  ["MyOrders", "Your orders", Package],
];
export default function DashboardLayout() {
  const { profile, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  return (
    <div className="container dashboard">
      <aside className="dashboard-aside">
        <p className="eyebrow">YOUR LITTLE CORNER</p>
        <nav className="dashboard-nav" aria-label="Account navigation">
          {links.map(([path, name, Icon]) => (
            <NavLink key={path} to={`/dashboard/${path}`}>
              <Icon size={17} />
              {name}
            </NavLink>
          ))}
          {profile?.role === "admin" && (
            <>
              <span className="nav-divider" />
              <NavLink to="/dashboard/AllProducts">
                <Grid2X2 size={17} />
                All listings
              </NavLink>
              <NavLink to="/dashboard/AllUsers">
                <Users size={17} />
                Members
              </NavLink>
              <NavLink to="/dashboard/AllOrders">
                <ListChecks size={17} />
                All orders
              </NavLink>
            </>
          )}
          <span className="nav-divider" />
          <button
            onClick={async () => {
              navigate("/", { replace: true });
              await logout();
            }}
          >
            <LogOut size={17} />
            Sign out
          </button>
        </nav>
      </aside>
      <div className="dashboard-content">
        <Outlet />
      </div>
    </div>
  );
}
