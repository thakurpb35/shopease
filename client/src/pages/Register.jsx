import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      navigate(location.state?.from || "/", { replace: true });
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
            <h4 className="mb-3">Create your account</h4>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <div className="mb-3">
              <label className="form-label">Full name</label>
              <input className="form-control" name="name" value={form.name} onChange={change} autoComplete="name" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" name="email" value={form.email} onChange={change} autoComplete="email" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                name="password"
                value={form.password}
                onChange={change}
                minLength={6}
                autoComplete="new-password"
                required
              />
              <div className="form-text">At least 6 characters.</div>
            </div>
            <button className="btn btn-primary w-100" disabled={busy}>
              {busy ? "Creating account…" : "Sign up"}
            </button>
            <p className="small text-center text-muted mt-3 mb-0">
              Already have an account? <Link to="/login" state={location.state}>Log in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
