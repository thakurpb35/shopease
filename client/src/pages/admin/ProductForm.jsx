import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../api.js";

const EMPTY = { name: "", category: "", price: "", stock: "", image: "", description: "" };

export default function ProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!editing) return;
    api
      .getProduct(id)
      .then((p) =>
        setForm({
          name: p.name,
          category: p.category,
          price: String(p.price),
          stock: String(p.stock),
          image: p.image || "",
          description: p.description || "",
        })
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, editing]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const body = { ...form, category: form.category.trim() || "General" };
      if (editing) await api.updateProduct(id, body);
      else await api.createProduct(body);
      navigate("/admin/products");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (loading) return <div className="text-center text-muted py-5">Loading…</div>;

  return (
    <div className="row">
      <div className="col-lg-8">
        <form className="card border-0 shadow-sm" onSubmit={submit}>
          <div className="card-body p-4">
            <h5 className="mb-3">{editing ? "Edit product" : "Add a new product"}</h5>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-3">
              <label className="form-label">Name</label>
              <input className="form-control" name="name" value={form.name} onChange={change} required />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-sm-6">
                <label className="form-label">Category</label>
                <input
                  className="form-control"
                  name="category"
                  value={form.category}
                  onChange={change}
                  list="category-list"
                  placeholder="e.g. Electronics"
                />
                <datalist id="category-list">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className="col-sm-3">
                <label className="form-label">Price (₹)</label>
                <input className="form-control" type="number" min="0" step="0.01" name="price" value={form.price} onChange={change} required />
              </div>
              <div className="col-sm-3">
                <label className="form-label">Stock</label>
                <input className="form-control" type="number" min="0" step="1" name="stock" value={form.stock} onChange={change} required />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Image link (optional)</label>
              <input
                className="form-control"
                name="image"
                value={form.image}
                onChange={change}
                placeholder="https://…  (leave empty to show a coloured tile)"
              />
            </div>
            <div className="mb-4">
              <label className="form-label">Description</label>
              <textarea className="form-control" name="description" rows={4} value={form.description} onChange={change} />
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-primary" disabled={busy}>
                {busy ? "Saving…" : editing ? "Save changes" : "Add product"}
              </button>
              <Link to="/admin/products" className="btn btn-outline-secondary">
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
