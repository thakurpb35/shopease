import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api.js";
import Pagination from "../../components/Pagination.jsx";
import ProductImage from "../../components/ProductImage.jsx";
import { money } from "../../utils.js";

export default function AdminProducts() {
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  // Search after a short pause in typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(text.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    let cancelled = false;
    api
      .getProducts({ search, page, limit: 10 })
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [search, page, reload]);

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    setError("");
    try {
      await api.deleteProduct(p._id);
      // If that was the last item on the page, go back one page
      if (data.items.length === 1 && page > 1) setPage(page - 1);
      else setReload((n) => n + 1);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <div className="d-flex flex-wrap gap-2 justify-content-between mb-3">
        <input
          type="search"
          className="form-control"
          style={{ maxWidth: 320 }}
          placeholder="Search products…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Search products"
        />
        <Link to="/admin/products/new" className="btn btn-primary">
          + Add product
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {!data && !error && <div className="text-center text-muted py-5">Loading…</div>}

      {data && (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Stock</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      No products found.
                    </td>
                  </tr>
                )}
                {data.items.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <ProductImage product={p} size="thumb" />
                        <span className="fw-semibold">{p.name}</span>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td className="text-end">{money(p.price)}</td>
                    <td className="text-end">
                      {p.stock === 0 ? (
                        <span className="badge text-bg-danger">Sold out</span>
                      ) : p.stock <= 5 ? (
                        <span className="badge text-bg-warning">{p.stock}</span>
                      ) : (
                        p.stock
                      )}
                    </td>
                    <td className="text-end text-nowrap">
                      <Link to={`/admin/products/${p._id}/edit`} className="btn btn-sm btn-outline-secondary me-2">
                        Edit
                      </Link>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => remove(p)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
    </>
  );
}
