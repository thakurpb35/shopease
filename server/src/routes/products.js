const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { auth, adminOnly } = require("../middleware/auth");

const router = express.Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.param("id", (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid product id" });
  next();
});

// Checks the fields an admin sends and returns a clean object (or an error message)
function cleanProduct(body, requireAll) {
  const data = {};
  const has = (k) => body[k] !== undefined;

  if (requireAll || has("name")) {
    const name = String(body.name ?? "").trim();
    if (!name) return { error: "Product name is required" };
    data.name = name;
  }
  if (requireAll || has("price")) {
    const price = Number(body.price);
    if (body.price === "" || body.price == null || !Number.isFinite(price) || price < 0) {
      return { error: "Price must be a number, 0 or more" };
    }
    data.price = Math.round(price * 100) / 100;
  }
  if (requireAll || has("stock")) {
    const stock = Number(body.stock ?? 0);
    if (!Number.isInteger(stock) || stock < 0) {
      return { error: "Stock must be a whole number, 0 or more" };
    }
    data.stock = stock;
  }
  if (has("category")) data.category = String(body.category).trim() || "General";
  if (has("description")) data.description = String(body.description).trim();
  if (has("image")) {
    const image = String(body.image).trim();
    if (image && !/^https?:\/\//i.test(image)) {
      return { error: "Image must be a web link starting with http:// or https://" };
    }
    data.image = image;
  }
  return { data };
}

// GET /api/products?search=&category=&sort=&page=&limit=   (public)
router.get("/", async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);

    const filter = {};
    if (typeof search === "string" && search.trim()) {
      const rx = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [{ name: rx }, { description: rx }, { category: rx }];
    }
    if (typeof category === "string" && category && category !== "all") {
      filter.category = category;
    }

    const sorts = {
      newest: { createdAt: -1, _id: -1 },
      price_asc: { price: 1, _id: 1 },
      price_desc: { price: -1, _id: 1 },
      name: { name: 1, _id: 1 },
    };

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sorts[sort] || sorts.newest)
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/categories   (public)
router.get("/categories", async (req, res, next) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories.filter(Boolean).sort((a, b) => a.localeCompare(b)));
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id   (public)
router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products   (admin)
router.post("/", auth, adminOnly, async (req, res, next) => {
  try {
    const { data, error } = cleanProduct(req.body, true);
    if (error) return res.status(400).json({ message: error });
    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id   (admin)
router.put("/:id", auth, adminOnly, async (req, res, next) => {
  try {
    const { data, error } = cleanProduct(req.body, false);
    if (error) return res.status(400).json({ message: error });
    const product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id   (admin)
router.delete("/:id", auth, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
