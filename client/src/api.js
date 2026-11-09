const BASE = import.meta.env.VITE_API_URL || "/api";

const TOKEN_KEY = "se_token";
const USER_KEY = "se_user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const storeUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user));
export const setSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  storeUser(user);
};
export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

const qs = (params = {}) => {
  const s = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();
  return s ? `?${s}` : "";
};

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Something went wrong");
    err.status = res.status;
    throw err;
  }
  return data;
}

const send = (method, body) => ({ method, body: JSON.stringify(body) });

export const api = {
  // account
  register: (body) => request("/auth/register", send("POST", body)),
  login: (body) => request("/auth/login", send("POST", body)),
  me: () => request("/auth/me"),

  // products
  getProducts: (params) => request(`/products${qs(params)}`),
  getCategories: () => request("/products/categories"),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (body) => request("/products", send("POST", body)),
  updateProduct: (id, body) => request(`/products/${id}`, send("PUT", body)),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),

  // orders
  createOrder: (body) => request("/orders", send("POST", body)),
  myOrders: () => request("/orders/mine"),
  cancelOrder: (id) => request(`/orders/${id}/cancel`, { method: "PATCH" }),
  allOrders: (status) => request(`/orders${qs({ status })}`),
  setOrderStatus: (id, status) => request(`/orders/${id}/status`, send("PATCH", { status })),

  // admin
  adminStats: () => request("/admin/stats"),
};
