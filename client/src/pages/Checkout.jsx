import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { money } from "../utils.js";

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: user?.name || "", phone: "", address: "", city: "", pincode: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (items.length === 0) {
    return (
      <div className="text-center py-5">
        <h4>Your cart is empty</h4>
        <Link to="/" className="btn btn-primary mt-2">
          Continue shopping
        </Link>
      </div>
    );
  }

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      // Only ids and quantities are sent. The server works out the prices.
      const order = await api.createOrder({
        items: items.map((it) => ({ productId: it.productId, qty: it.qty })),
        shipping: form,
      });
      clear();
      navigate("/orders", { state: { placed: order._id } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h3 className="mb-3">Checkout</h3>
      <div className="row g-4">
        <div className="col-lg-7">
          <form className="card border-0 shadow-sm" onSubmit={submit}>
            <div className="card-body">
              <h5 className="card-title mb-3">Delivery address</h5>
              {error && (
                <div className="alert alert-danger">
                  {error}
                  {error.startsWith("Not enough stock") && (
                    <div className="mt-1">
                      <Link to="/cart">Change the quantity in your cart</Link>
                    </div>
                  )}
                </div>
              )}
              <div className="mb-3">
                <label className="form-label">Full name</label>
                <input className="form-control" name="fullName" value={form.fullName} onChange={change} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone number</label>
                <input
                  className="form-control"
                  name="phone"
                  value={form.phone}
                  onChange={change}
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10 digits"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Address</label>
                <textarea className="form-control" name="address" rows={2} value={form.address} onChange={change} required />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label">City</label>
                  <input className="form-control" name="city" value={form.city} onChange={change} required />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">PIN code</label>
                  <input
                    className="form-control"
                    name="pincode"
                    value={form.pincode}
                    onChange={change}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6 digits"
                    required
                  />
                </div>
              </div>
              <div className="alert alert-light border mb-3">
                💵 Payment: <strong>Cash on Delivery</strong>. Pay when your order arrives.
              </div>
              <button className="btn btn-primary btn-lg w-100" disabled={busy}>
                {busy ? "Placing order…" : `Place order · ${money(total)}`}
              </button>
            </div>
          </form>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Your order</h5>
              <ul className="list-unstyled mb-3">
                {items.map((it) => (
                  <li key={it.productId} className="d-flex justify-content-between small py-1">
                    <span>
                      {it.name} × {it.qty}
                    </span>
                    <span>{money(it.price * it.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="d-flex justify-content-between fs-5 fw-semibold border-top pt-3">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
