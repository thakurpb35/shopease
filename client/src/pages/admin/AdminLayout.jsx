import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h3 className="mb-0">Admin panel</h3>
        <ul className="nav nav-pills admin-tabs">
          <li className="nav-item">
            <NavLink to="/admin" end className="nav-link">
              Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/admin/products" className="nav-link">
              Products
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/admin/orders" className="nav-link">
              Orders
            </NavLink>
          </li>
        </ul>
      </div>
      <Outlet />
    </>
  );
}
