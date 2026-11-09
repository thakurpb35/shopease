import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";
import Pagination from "../components/Pagination.jsx";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const category = params.get("category") || "all";
  const sort = params.get("sort") || "newest";
  const page = Math.max(parseInt(params.get("page"), 10) || 1, 1);

  const [text, setText] = useState(search);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Put the choices in the address bar, so links and the Back button work
  const update = (changes) => {
    const next = new URLSearchParams(params);
    if (!("page" in changes)) next.delete("page");
    Object.entries(changes).forEach(([key, value]) => {
      const empty = !value || value === "all" || (key === "sort" && value === "newest") || (key === "page" && value === 1);
      if (empty) next.delete(key);
      else next.set(key, value);
    });
    setParams(next);
  };

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => setText(search), [search]);

  // Search while typing, after a short pause
  useEffect(() => {
    if (text.trim() === search) return;
    const timer = setTimeout(() => update({ search: text.trim() }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .getProducts({ search, category, sort, page, limit: 12 })
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [search, category, sort, page]);

  const filtering = search || category !== "all";

  return (
    <>
      {!filtering && page === 1 && (
        <div className="hero p-4 p-md-5 mb-4">
          <h1 className="display-6 fw-bold mb-2">Everything you need, delivered.</h1>
          <p className="mb-0 opacity-75">Browse gadgets, fashion, home essentials, books and sports gear. Pay cash on delivery.</p>
        </div>
      )}

      <div className="row g-2 align-items-center mb-3">
        <div className="col-12 col-md">
          <input
            type="search"
            className="form-control"
            placeholder="Search products…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Search products"
          />
        </div>
        <div className="col-12 col-md-auto">
          <select
            className="form-select"
            value={sort}
            onChange={(e) => update({ sort: e.target.value })}
            aria-label="Sort products"
          >
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        {["all", ...categories].map((c) => (
          <button
            key={c}
            className={`btn btn-sm rounded-pill ${category === c ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => update({ category: c })}
          >
            {c === "all" ? "All" : c}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center text-muted py-5">Loading products…</div>
      ) : data.items.length === 0 ? (
        <div className="text-center text-muted py-5">
          <div className="fs-1">🔍</div>
          No products found{search ? ` for “${search}”` : ""}.
        </div>
      ) : (
        <>
          <p className="text-muted small">
            {data.total} product{data.total === 1 ? "" : "s"}
          </p>
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
            {data.items.map((p) => (
              <div className="col" key={p._id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          <Pagination page={data.page || page} pages={data.pages} onChange={(p) => update({ page: p })} />
        </>
      )}
    </>
  );
}
