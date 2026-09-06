import { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { Menu, X, Plus, ShoppingBag, ArrowUpRight } from "lucide-react";
import { AuthContext } from "../Provider/AuthProvider";
import { Brand } from "../ui/shared";
export default function Navbar() {
  const { user, profile, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      <div className="announcement">
        {import.meta.env.VITE_AUTH_EMULATOR_URL && (
          <span className="demo-label">Local demo</span>
        )}
        A little less new. A lot more possibility.{" "}
        <Link to="/Marketplace">
          Find your next favorite <ArrowUpRight size={13} />
        </Link>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Main navigation">
            <NavLink to="/Marketplace">Discover</NavLink>
            <Link to="/about">How it works</Link>
            {user && <NavLink to="/dashboard/MyListing">Your space</NavLink>}
          </nav>
          <div className="header-actions">
            {user ? (
              <>
                <Link
                  className="icon-button"
                  aria-label="Shopping bag"
                  to="/dashboard/MyCart"
                >
                  <ShoppingBag size={21} />
                </Link>
                <Link
                  className="avatar"
                  to="/dashboard/MyProfile"
                  aria-label="Your profile"
                >
                  {(profile?.name || user.email || "C")[0].toUpperCase()}
                </Link>
              </>
            ) : (
              <Link className="login-link" to="/Login">
                Log in
              </Link>
            )}
            <Link className="button small" to="/dashboard/AddListing">
              <Plus size={17} />
              Sell an item
            </Link>
            <button
              className="icon-button mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav
            className="mobile-nav"
            aria-label="Mobile navigation"
            onClick={() => setOpen(false)}
          >
            <Link to="/Marketplace">Discover</Link>
            <Link to="/about">How it works</Link>
            <Link to={user ? "/dashboard/MyProfile" : "/Login"}>
              {user ? "Your account" : "Log in"}
            </Link>
            {user && (
              <button
                onClick={async () => {
                  navigate("/", { replace: true });
                  await logout();
                }}
              >
                Sign out
              </button>
            )}
          </nav>
        )}
      </header>
    </>
  );
}
