const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { auth, adminOnly } = require("../middleware/auth");

const router = express.Router();
router.use(auth);

router.param("id", (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid order id" });
  next();
});

// Which status changes an admin may make
const TRANSITIONS = {
  placed: ["shipped", "delivered", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const FIELD_LABELS = {
  fullName: "your full name",
  phone: "your phone number",
  address: "your address",
  city: "your city",
  pincode: "your PIN code",
};

// Puts stock back (used when an order is cancelled or fails halfway)
async function restock(items) {
  for (const it of items) {
    await Product.updateOne({ _id: it.product }, { $inc: { stock: it.qty } });
  }
}

// POST /api/orders   (customer places an order)
// Prices and totals are always taken from the database, never from the browser.
router.post("/", async (req, res, next) => {
  try {
    const { items, shipping } = req.body;

    const s = shipping || {};
    const ship = {};
    for (const field of Object.keys(FIELD_LABELS)) {
      ship[field] = String(s[field] ?? "").trim();
      if (!ship[field]) return res.status(400).json({ message: `Please enter ${FIELD_LABELS[field]}` });
    }
    if (!/^\d{10}$/.test(ship.phone)) {
      return res.status(400).json({ message: "Phone number must be 10 digits" });
    }
    if (!/^\d{6}$/.test(ship.pincode)) {
      return res.status(400).json({ message: "PIN code must be 6 digits" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }
    if (items.length > 50) return res.status(400).json({ message: "Too many items in one order" });

    const wanted = new Map(); // productId -> quantity
    for (const it of items) {
      const id = String(it && it.productId);
      const qty = Number(it && it.qty);
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid product in your cart" });
      }
      if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
        return res.status(400).json({ message: "Quantity must be between 1 and 99" });
      }
      wanted.set(id, (wanted.get(id) || 0) + qty);
    }

    const products = await Product.find({ _id: { $in: [...wanted.keys()] } });
    if (products.length !== wanted.size) {
      return res.status(400).json({ message: "Some products in your cart are no longer available" });
    }

    // Reserve stock one product at a time. The "stock >= qty" check and the
    // decrement happen in one database step, so two buyers can't both take the last item.
    const taken = [];
    const orderItems = [];
    for (const p of products) {
      const qty = wanted.get(String(p._id));
      const updated = await Product.findOneAndUpdate(
        { _id: p._id, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: true }
      );
      if (!updated) {
        await restock(taken);
        return res.status(409).json({ message: `Not enough stock for "${p.name}"` });
      }
      taken.push({ product: p._id, qty });
      orderItems.push({ product: p._id, name: updated.name, price: updated.price, qty });
    }

    const total = Math.round(orderItems.reduce((sum, i) => sum + i.price * i.qty, 0) * 100) / 100;

    try {
      const order = await Order.create({ user: req.userId, items: orderItems, total, shipping: ship });
      res.status(201).json(order);
    } catch (err) {
      await restock(taken);
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/mine   (customer: own orders)
router.get("/mine", async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1, _id: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/cancel   (customer: only while still "placed")
router.patch("/:id/cancel", async (req, res, next) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, user: req.userId, status: "placed" },
      { status: "cancelled" },
      { new: true }
    );
    if (!order) {
      const exists = await Order.exists({ _id: req.params.id, user: req.userId });
      if (!exists) return res.status(404).json({ message: "Order not found" });
      return res.status(400).json({ message: "Only orders that have not shipped can be cancelled" });
    }
    await restock(order.items);
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders?status=   (admin: all orders)
router.get("/", adminOnly, async (req, res, next) => {
  try {
    const filter = {};
    if (typeof req.query.status === "string" && TRANSITIONS[req.query.status]) {
      filter.status = req.query.status;
    }
    const orders = await Order.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(200)
      .populate("user", "name email");
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/status   (admin)
router.patch("/:id/status", adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!Object.prototype.hasOwnProperty.call(TRANSITIONS, status)) {
      return res.status(400).json({ message: "Status must be placed, shipped, delivered or cancelled" });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!TRANSITIONS[order.status].includes(status)) {
      return res.status(400).json({ message: `An order that is ${order.status} cannot be changed to ${status}` });
    }
    const updated = await Order.findOneAndUpdate(
      { _id: order._id, status: order.status },
      { status },
      { new: true }
    ).populate("user", "name email");
    if (!updated) return res.status(409).json({ message: "This order was just changed, please refresh" });
    if (status === "cancelled") await restock(updated.items);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
