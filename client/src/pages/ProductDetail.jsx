import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import ProductImage from "../components/ProductImage.jsx";
import { useCart } from "../context/CartContext.jsx";
import { money } from "../utils.js";

export default function ProductDetail() {
  const { id } = useParams();
  const { add, items } = useCart();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setProduct(null);
    setError("");
    setQty(1);
    setAdded(false);
    api
      .getProduct(id)
      .then(setProduct)
      .catch((e) => setError(e.status === 404 ? "This product does not exist any more." : e.message));
  }, [id]);

  if (error) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">{error}</p>
        <Link to="/" className="btn btn-primary">
          Back to the shop
        </Link>
      </div>
    );
  }
  if (!product) return <div className="text-center text-muted py-5">Loading…</div>;

  const inCart = items.find((x) => x.productId === product._id)?.qty || 0;
  const room = Math.max(product.stock - inCart, 0); // how many more can be added
  const soldOut = product.stock < 1;

  const handleAdd = () => {
    add(product, qty);
    setAdded(true);
    setQty(1);
  };

  return (
    <>
      <Link to="/" className="small text-decoration-none">
        ← Back to the shop
      </Link>
      <div className="row g-4 mt-1">
        <div className="col-md-6">
          <ProductImage product={product} size="detail" />
        </div>
        <div className="col-md-6">
          <span className="badge text-bg-light border mb-2">{product.category}</span>
          <h2 className="mb-1">{product.name}</h2>
          <div className="fs-3 fw-semibold mb-2">{money(product.price)}</div>
          <p className="mb-2">
            {soldOut ? (
              <span className="text-danger">Out of stock</span>
            ) : product.stock <= 5 ? (
              <span className="text-warning-emphasis">Only {product.stock} left in stock</span>
            ) : (
              <span className="text-success">In stock</span>
            )}
          </p>
          <p className="text-muted">{product.description || "No description yet."}</p>

          {!soldOut && room > 0 && (
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="btn-group" role="group" aria-label="Quantity">
                <button className="btn btn-outline-secondary" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                  −
                </button>
                <span className="btn btn-light disabled px-3" style={{ minWidth: 48 }}>
                  {qty}
                </span>
                <button className="btn btn-outline-secondary" onClick={() => setQty((q) => Math.min(room, q + 1))}>
                  +
                </button>
              </div>
              <button className="btn btn-primary px-4" onClick={handleAdd}>
                Add to cart
              </button>
            </div>
          )}
          {!soldOut && room === 0 && (
            <div className="alert alert-info py-2">You already have all available units in your cart.</div>
          )}
          {added && (
            <div className="alert alert-success py-2 d-flex justify-content-between align-items-center">
              Added to your cart.
              <Link to="/cart" className="btn btn-sm btn-success">
                View cart
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
