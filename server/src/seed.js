// Run with:  npm run seed
// Creates the admin account and a few sample products. Safe to run again:
// it never duplicates the admin, and only adds products when the shop is empty.
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Product = require("./models/Product");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopease";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@shopease.com").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const products = [
  { name: "Wireless Earbuds", category: "Electronics", price: 1999, stock: 25, description: "Bluetooth 5.3 earbuds with a charging case and up to 20 hours of playtime." },
  { name: "Bluetooth Speaker", category: "Electronics", price: 2499, stock: 18, description: "Portable speaker with deep bass and a splash-proof body." },
  { name: "Smart Watch", category: "Electronics", price: 3999, stock: 12, description: "Tracks steps, heart rate and sleep. Shows phone notifications on your wrist." },
  { name: "Power Bank 10000 mAh", category: "Electronics", price: 1299, stock: 40, description: "Slim power bank with fast charging and two USB ports." },
  { name: "Cotton T-Shirt", category: "Fashion", price: 499, stock: 60, description: "Soft, breathable 100% cotton t-shirt for everyday wear." },
  { name: "Denim Jacket", category: "Fashion", price: 1799, stock: 15, description: "Classic blue denim jacket with a comfortable regular fit." },
  { name: "Running Shoes", category: "Fashion", price: 2299, stock: 4, description: "Lightweight running shoes with a cushioned sole and breathable mesh." },
  { name: "Ceramic Mug Set (4 pcs)", category: "Home", price: 699, stock: 30, description: "Set of four glazed ceramic mugs, dishwasher safe." },
  { name: "LED Desk Lamp", category: "Home", price: 899, stock: 22, description: "Adjustable desk lamp with three brightness levels and a USB charging port." },
  { name: "Cotton Bedsheet", category: "Home", price: 1199, stock: 17, description: "Double bedsheet with two pillow covers, 144 thread count." },
  { name: "Web Development Handbook", category: "Books", price: 599, stock: 28, description: "A beginner-friendly guide to HTML, CSS, JavaScript and building real websites." },
  { name: "Limited Edition Notebook", category: "Books", price: 249, stock: 0, description: "Hard-cover ruled notebook, 200 pages. Currently sold out." },
  { name: "Yoga Mat", category: "Sports", price: 799, stock: 35, description: "6 mm non-slip yoga mat with a carry strap." },
  { name: "Cricket Bat (Kashmir Willow)", category: "Sports", price: 1499, stock: 10, description: "Full-size Kashmir willow bat with a comfortable rubber grip." },
  { name: "Steel Water Bottle 1 L", category: "Sports", price: 349, stock: 80, description: "Insulated stainless steel bottle that keeps drinks cold for 12 hours." },
];

async function run() {
  await mongoose.connect(MONGO_URI);

  let admin = await User.findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    admin = await User.create({
      name: "Admin",
      email: ADMIN_EMAIL,
      password: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: "admin",
    });
    console.log(`Admin created: ${ADMIN_EMAIL}  /  password: ${ADMIN_PASSWORD}`);
  } else {
    if (admin.role !== "admin") {
      admin.role = "admin";
      await admin.save();
    }
    console.log(`Admin already exists: ${ADMIN_EMAIL} (password unchanged)`);
  }

  if ((await Product.countDocuments()) === 0) {
    // Insert one by one so "newest first" ordering is stable
    for (const p of products) await Product.create(p);
    console.log(`Added ${products.length} sample products`);
  } else {
    console.log("Products already exist, skipped sample products");
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
