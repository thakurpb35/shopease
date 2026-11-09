const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { auth, adminOnly } = require("../middleware/auth");

const router = express.Router();
router.use(auth, adminOnly);

const LOW_STOCK = 5;

// GET /api/admin/stats   (numbers for the admin dashboard)
router.get("/stats", async (req, res, next) => {
  try {
    const [products, customers, orders, byStatus, revenueRows, lowStockItems, recentOrders] =
      await Promise.all([
        Product.countDocuments(),
        User.countDocuments({ role: "customer" }),
        Order.countDocuments(),
        Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        Order.aggregate([
          { $match: { status: { $ne: "cancelled" } } },
          { $group: { _id: null, revenue: { $sum: "$total" } } },
        ]),
        Product.find({ stock: { $lte: LOW_STOCK } }).sort({ stock: 1, name: 1 }).limit(6),
        Order.find().sort({ createdAt: -1, _id: -1 }).limit(5).populate("user", "name email"),
      ]);

    const ordersByStatus = { placed: 0, shipped: 0, delivered: 0, cancelled: 0 };
    byStatus.forEach((row) => {
      if (row._id in ordersByStatus) ordersByStatus[row._id] = row.count;
    });

    res.json({
      products,
      customers,
      orders,
      revenue: revenueRows[0] ? Math.round(revenueRows[0].revenue * 100) / 100 : 0,
      ordersByStatus,
      lowStockLimit: LOW_STOCK,
      lowStockItems,
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
