import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close the mobile menu after moving to another page
  useEffect(() => setOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          🛍️ ShopEase
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${open ? "show" : ""}`}>
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink to="/" end className="nav-link">
                Shop
              </NavLink>
            </li>
            {user && (
              <li className="nav-item">
                <NavLink to="/orders" className="nav-link">
                  My orders
                </NavLink>
              </li>
            )}
            {user?.role === "admin" && (
              <li className="nav-item">
                <NavLink to="/admin" className="nav-link">
                  Admin
                </NavLink>
              </li>
            )}
          </ul>

          <ul className="navbar-nav align-items-md-center gap-md-2">
            <li className="nav-item">
              <NavLink to="/cart" className="nav-link">
                🛒 Cart{" "}
                {count > 0 && <span className="badge rounded-pill bg-warning text-dark">{count}</span>}
              </NavLink>
            </li>
            {user ? (
              <>
                <li className="nav-item">
                  <span className="navbar-text text-white-50">Hi, {user.name.split(" ")[0]}</span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    Log out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink to="/login" className="nav-link">
                    Log in
                  </NavLink>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="btn btn-warning btn-sm">
                    Sign up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
