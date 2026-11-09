import React, { useEffect, useState } from "react";
import { api } from "../../api.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import { NEXT_STATUS, money, when } from "../../utils.js";

const FILTERS = ["all", "placed", "shipped", "delivered", "cancelled"];
const ACTION_LABEL = { shipped: "Mark as shipped", delivered: "Mark as delivered", cancelled: "Cancel order" };

export default function AdminOrders() {
  const [filter, setFilter] = useState("all");
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setOrders(null);
    setError("");
    api
      .allOrders(filter === "all" ? "" : filter)
      .then((list) => !cancelled && setOrders(list))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [filter]);

  const change = async (order, status) => {
    if (status === "cancelled" && !window.confirm("Cancel this order? The stock will be put back.")) return;
    setError("");
    try {
      const updated = await api.setOrderStatus(order._id, status);
      setOrders((list) =>
        filter === "all" ? list.map((o) => (o._id === updated._id ? updated : o)) : list.filter((o) => o._id !== updated._id)
      );
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <div className="d-flex flex-wrap gap-2 mb-3">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`btn btn-sm rounded-pill text-capitalize ${filter === f ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {!orders && !error && <div className="text-center text-muted py-5">Loading…</div>}
      {orders && orders.length === 0 && <div className="text-center text-muted py-5">No orders here yet.</div>}

      {orders &&
        orders.map((o) => (
          <div className="card border-0 shadow-sm mb-3" key={o._id}>
            <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div>
                <strong>#{o._id.slice(-6).toUpperCase()}</strong>
                <span className="text-muted small ms-2">{when(o.createdAt)}</span>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-5">
                  <div className="fw-semibold">{o.user?.name || "Deleted user"}</div>
                  <div className="small text-muted">{o.user?.email}</div>
                  <div className="small mt-2">
                    {o.shipping.fullName}, {o.shipping.address}, {o.shipping.city} - {o.shipping.pincode}
                    <br />
                    Phone {o.shipping.phone}
                  </div>
                </div>
                <div className="col-md-4">
                  <ul className="list-unstyled small mb-0">
                    {o.items.map((it) => (
                      <li key={it.product}>
                        {it.name} <span className="text-muted">× {it.qty}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-md-3 text-md-end">
                  <div className="fs-5 fw-semibold mb-2">{money(o.total)}</div>
                  <div className="d-flex flex-md-column gap-2 flex-wrap align-items-md-end">
                    {NEXT_STATUS[o.status].map((s) => (
                      <button
                        key={s}
                        className={`btn btn-sm ${s === "cancelled" ? "btn-outline-danger" : "btn-outline-primary"}`}
                        onClick={() => change(o, s)}
                      >
                        {ACTION_LABEL[s]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
    </>
  );
}
