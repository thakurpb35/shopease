export const money = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const when = (d) =>
  new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

const EMOJI = { Electronics: "🎧", Fashion: "👕", Home: "🏠", Books: "📚", Sports: "⚽" };
export const emojiFor = (category) => EMOJI[category] || "🛍️";

// Soft background colour for products that have no picture, based on the name
const COLORS = ["#dbeafe", "#fce7f3", "#dcfce7", "#fef3c7", "#ede9fe", "#cffafe", "#ffe4e6", "#e0f2fe"];
export function tileColor(name = "") {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return COLORS[h % COLORS.length];
}

export const STATUS_STYLE = {
  placed: "primary",
  shipped: "info",
  delivered: "success",
  cancelled: "secondary",
};

// Which status changes the server allows (same rules as the API)
export const NEXT_STATUS = {
  placed: ["shipped", "delivered", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};
