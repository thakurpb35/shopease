import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      navigate(location.state?.from || (user.role === "admin" ? "/admin" : "/"), { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <form className="card border-0 shadow-sm" onSubmit={submit}>
          <div className="card-body p-4">
            <h4 className="mb-3">Log in</h4>
            {location.state?.from && <div className="alert alert-info py-2">Please log in to continue.</div>}
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                name="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                name="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                required
              />
            </div>
            <button className="btn btn-primary w-100" disabled={busy}>
              {busy ? "Logging in…" : "Log in"}
            </button>
            <p className="small text-center text-muted mt-3 mb-0">
              New here? <Link to="/register" state={location.state}>Create an account</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
