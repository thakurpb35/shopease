import React from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductImage from "../components/ProductImage.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { money } from "../utils.js";

export default function Cart() {
  const { items, setQty, remove, clear, total, count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="display-3">🛒</div>
        <h4 className="mt-2">Your cart is empty</h4>
        <p className="text-muted">Add something you like and it will show up here.</p>
        <Link to="/" className="btn btn-primary">
          Start shopping
        </Link>
      </div>
    );
  }

  const checkout = () => {
    if (!user) navigate("/login", { state: { from: "/checkout" } });
    else navigate("/checkout");
  };

  return (
    <>
      <h3 className="mb-3">Your cart ({count} item{count === 1 ? "" : "s"})</h3>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <ul className="list-group list-group-flush">
              {items.map((it) => (
                <li className="list-group-item" key={it.productId}>
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <ProductImage product={it} size="thumb" />
                    <div className="flex-grow-1" style={{ minWidth: 140 }}>
                      <Link to={`/product/${it.productId}`} className="fw-semibold text-decoration-none text-dark">
                        {it.name}
                      </Link>
                      <div className="small text-muted">{money(it.price)} each</div>
                    </div>
                    <div className="btn-group btn-group-sm" role="group" aria-label={`Quantity of ${it.name}`}>
                      <button className="btn btn-outline-secondary" onClick={() => setQty(it.productId, it.qty - 1)} disabled={it.qty <= 1}>
                        −
                      </button>
                      <span className="btn btn-light disabled px-3">{it.qty}</span>
                      <button className="btn btn-outline-secondary" onClick={() => setQty(it.productId, it.qty + 1)} disabled={it.qty >= it.stock}>
                        +
                      </button>
                    </div>
                    <div className="fw-semibold text-end" style={{ minWidth: 90 }}>
                      {money(it.price * it.qty)}
                    </div>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(it.productId)} aria-label={`Remove ${it.name}`}>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <button className="btn btn-link text-danger mt-2 p-0" onClick={clear}>
            Empty cart
          </button>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Order summary</h5>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Items ({count})</span>
                <span>{money(total)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Delivery</span>
                <span className="text-success">Free</span>
              </div>
              <div className="d-flex justify-content-between fs-5 fw-semibold border-top pt-3 mb-3">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
              <button className="btn btn-primary w-100" onClick={checkout}>
                {user ? "Proceed to checkout" : "Log in to checkout"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
