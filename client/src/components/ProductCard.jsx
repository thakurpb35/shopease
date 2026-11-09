import React from "react";
import { Link } from "react-router-dom";
import ProductImage from "./ProductImage.jsx";
import { useCart } from "../context/CartContext.jsx";
import { money } from "../utils.js";

export default function ProductCard({ product }) {
  const { add, items } = useCart();
  const inCart = items.find((x) => x.productId === product._id)?.qty || 0;
  const soldOut = product.stock < 1;
  const maxedOut = inCart >= product.stock;

  return (
    <div className="card h-100 border-0 shadow-sm card-hover">
      <Link to={`/product/${product._id}`} className="p-2 pb-0 text-decoration-none">
        <ProductImage product={product} />
      </Link>
      <div className="card-body d-flex flex-column">
        <span className="small text-muted">{product.category}</span>
        <h6 className="card-title stretched-title mb-1">
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </h6>
        <div className="fs-5 fw-semibold mb-1">{money(product.price)}</div>
        <div className="small mb-3">
          {soldOut ? (
            <span className="text-danger">Out of stock</span>
          ) : product.stock <= 5 ? (
            <span className="text-warning-emphasis">Only {product.stock} left</span>
          ) : (
            <span className="text-success">In stock</span>
          )}
        </div>
        <button
          className="btn btn-primary mt-auto"
          disabled={soldOut || maxedOut}
          onClick={() => add(product, 1)}
        >
          {soldOut ? "Sold out" : maxedOut ? "Max in cart" : inCart ? `Add another (${inCart} in cart)` : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
