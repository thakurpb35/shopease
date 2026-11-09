import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import { money, when } from "../../utils.js";

function Stat({ label, value, icon }) {
  return (
    <div className="col-6 col-lg-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body">
          <div className="text-muted small">
            {icon} {label}
          </div>
          <div className="fs-3 fw-semibold">{value}</div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .adminStats()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!stats) return <div className="text-center text-muted py-5">Loading…</div>;

  return (
    <>
      <div className="row g-3 mb-4">
        <Stat icon="💰" label="Revenue" value={money(stats.revenue)} />
        <Stat icon="📦" label="Orders" value={stats.orders} />
        <Stat icon="🏷️" label="Products" value={stats.products} />
        <Stat icon="👥" label="Customers" value={stats.customers} />
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h6 className="mb-3">Orders by status</h6>
          <div className="d-flex flex-wrap gap-4">
            {Object.entries(stats.ordersByStatus).map(([status, n]) => (
              <div key={status} className="d-flex align-items-center gap-2">
                <StatusBadge status={status} />
                <span className="fw-semibold">{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="mb-3">Low stock (≤ {stats.lowStockLimit})</h6>
              {stats.lowStockItems.length === 0 ? (
                <p className="text-muted mb-0">All products are well stocked.</p>
              ) : (
                <table className="table table-sm align-middle mb-0">
                  <tbody>
                    {stats.lowStockItems.map((p) => (
                      <tr key={p._id}>
                        <td>{p.name}</td>
                        <td className="text-end">
                          {p.stock === 0 ? <span className="badge text-bg-danger">Sold out</span> : <span className="badge text-bg-warning">{p.stock} left</span>}
                        </td>
                        <td className="text-end">
                          <Link to={`/admin/products/${p._id}/edit`} className="btn btn-sm btn-outline-secondary">
                            Restock
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Recent orders</h6>
                <Link to="/admin/orders" className="small">
                  View all
                </Link>
              </div>
              {stats.recentOrders.length === 0 ? (
                <p className="text-muted mb-0">No orders yet.</p>
              ) : (
                <table className="table table-sm align-middle mb-0">
                  <tbody>
                    {stats.recentOrders.map((o) => (
                      <tr key={o._id}>
                        <td>
                          <div className="fw-semibold">#{o._id.slice(-6).toUpperCase()}</div>
                          <div className="small text-muted">
                            {o.user?.name || "Deleted user"} · {when(o.createdAt)}
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={o.status} />
                        </td>
                        <td className="text-end">{money(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
