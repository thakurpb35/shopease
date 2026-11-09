import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { money, when } from "../utils.js";

export default function Orders() {
  const location = useLocation();
  const placedId = location.state?.placed;
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .myOrders()
      .then(setOrders)
      .catch((e) => setError(e.message));
  }, []);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    setError("");
    try {
      const updated = await api.cancelOrder(id);
      setOrders((list) => list.map((o) => (o._id === id ? updated : o)));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <h3 className="mb-3">My orders</h3>

      {placedId && (
        <div className="alert alert-success">
          🎉 Thank you! Your order <strong>#{placedId.slice(-6).toUpperCase()}</strong> has been placed. Pay cash when it arrives.
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}

      {!orders && !error && <div className="text-center text-muted py-5">Loading…</div>}
      {orders && orders.length === 0 && (
        <div className="text-center py-5">
          <div className="display-4">📦</div>
          <p className="text-muted mt-2">You have not placed any orders yet.</p>
          <Link to="/" className="btn btn-primary">
            Start shopping
          </Link>
        </div>
      )}

      {orders &&
        orders.map((o) => (
          <div className="card border-0 shadow-sm mb-3" key={o._id}>
            <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div>
                <strong>Order #{o._id.slice(-6).toUpperCase()}</strong>
                <span className="text-muted small ms-2">{when(o.createdAt)}</span>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-3">
                {o.items.map((it) => (
                  <li key={it.product} className="d-flex justify-content-between py-1">
                    <span>
                      {it.name} <span className="text-muted">× {it.qty}</span>
                    </span>
                    <span>{money(it.price * it.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 border-top pt-3">
                <div className="small text-muted">
                  Deliver to {o.shipping.fullName}, {o.shipping.address}, {o.shipping.city} - {o.shipping.pincode}
                  <br />
                  Phone {o.shipping.phone} · {o.paymentMethod}
                </div>
                <div className="text-end">
                  <div className="fs-5 fw-semibold">{money(o.total)}</div>
                  {o.status === "placed" && (
                    <button className="btn btn-sm btn-outline-danger mt-1" onClick={() => cancel(o._id)}>
                      Cancel order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
    </>
  );
}
