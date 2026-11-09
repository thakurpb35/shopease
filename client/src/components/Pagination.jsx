import React from "react";

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <nav className="d-flex justify-content-center align-items-center gap-3 mt-4" aria-label="Pages">
      <button className="btn btn-outline-secondary btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Previous
      </button>
      <span className="small text-muted">
        Page {page} of {pages}
      </span>
      <button className="btn btn-outline-secondary btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next →
      </button>
    </nav>
  );
}
