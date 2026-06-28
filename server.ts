import express from "express";
import path from "path";
import fs from "fs";
import { Product, User, Order, Coupon, MessagePlatform } from "./src/types";

// Database storage setup
const isVercel = process.env.VERCEL === "1" || !!process.env.VERCEL;
const DB_FILE = isVercel 
  ? path.join("/tmp", "database_tuktak.json") 
  : path.join(process.cwd(), "database_tuktak.json");

interface DatabaseSchema {
  products: Product[];
  users: User[];
  orders: Order[];
  favorites: { [userId: string]: number[] }; // userId to productIds
  coupons: Coupon[];
  platforms: MessagePlatform[];
  adminPassword?: string;
}

// Initial/default products list
const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'Wireless Earbuds Pro', price: 79.99, originalPrice: 129.99, category: 'audio', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', rating: 4.8, reviews: 2341, description: 'Premium wireless earbuds with high-fidelity sound quality, active noise cancellation (ANC), and crystal-clear microphone resolution. Enjoy up to 30 hours of continuous playtime using the included dynamic wireless charging case.', stock: 50 },
  { id: 2, name: 'Smart Watch Ultra', price: 299.99, originalPrice: 399.99, category: 'wearables', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400', rating: 4.9, reviews: 1892, description: 'Advanced wearable smartwatch with continuous ECG health monitoring, built-id dual-frequency GPS, and an ultra-rugged aerospace-grade titanium bezel. Perfect for tracking long hikes, cycling excursions, or deep sleep metrics.', stock: 30 },
  { id: 3, name: 'Gaming Mouse RGB', price: 49.99, originalPrice: 79.99, category: 'peripherals', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc5a1b9?w=400', rating: 4.7, reviews: 3421, description: 'High-precision ergonomically optimized gaming mouse with fully customizable multi-zone RGB flow illumination, a 26K DPI optical sensor, and ultra-durable tactile switches rated for 80 million crisp operations.', stock: 100 },
  { id: 4, name: 'Mechanical Keyboard', price: 129.99, originalPrice: 179.99, category: 'peripherals', image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400', rating: 4.8, reviews: 2156, description: 'Sleek hot-swappable mechanical gaming and typing keyboard with premium Cherry MX switches, durable double-shot PBT keycaps, and a robust bead-blasted aluminum alloy top plate.', stock: 45 },
  { id: 5, name: '4K Webcam HD', price: 89.99, originalPrice: 119.99, category: 'peripherals', image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400', rating: 4.6, reviews: 1567, description: 'Crystal-clear 4K Ultra-HD streaming webcam with high frame rates, intelligent auto-exposure, dual noise-canceling stereo microphones, and integrated sliding physical privacy cover.', stock: 60 },
  { id: 6, name: 'Portable SSD 1TB', price: 109.99, originalPrice: 149.99, category: 'storage', image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400', rating: 4.9, reviews: 4231, description: 'Pocket-sized portable SSD offering lightning-fast transfer speeds up to 2000MB/s. Built with a tough, water-and-dust resistant rubberized shell, ensuring your photos, music, and documents stay secure on any adventure.', stock: 80 },
  { id: 7, name: 'USB-C Hub Pro', price: 59.99, originalPrice: 89.99, category: 'accessories', image: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400', rating: 4.5, reviews: 987, description: 'Comprehensive 8-in-1 multi-port USB-C adapter dock. Features an HDMI 4K video resolution output, dual USB 3.0 ports, Gigabit Ethernet, SD and MicroSD reader ports, and power distribution throughput up to 100W.', stock: 120 },
  { id: 8, name: 'Wireless Charger Pad', price: 29.99, originalPrice: 49.99, category: 'accessories', image: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=400', rating: 4.4, reviews: 1234, description: 'Elegant non-slip wireless charging pad supporting fast charging up to 15W for QI-enabled devices. Intelligently regulates temperature to extend your mobile device battery life span safely.', stock: 200 },
  { id: 9, name: 'Bluetooth Speaker', price: 69.99, originalPrice: 99.99, category: 'audio', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', rating: 4.7, reviews: 2876, description: 'Immersive portable Bluetooth wireless speaker featuring dual passive radiators for rich 360-degree sound distribution and full IPX7 water-immersion resistance, suited for pool parties and camping trips.', stock: 75 },
  { id: 10, name: 'Gaming Headset', price: 99.99, originalPrice: 149.99, category: 'audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', rating: 4.8, reviews: 3421, description: 'Full surround-sound over-ear gaming and video chat headset. Outstanding memory foam ear cushions, lightweight head frame, and high-sensitivity removable noise-canceling physical microphone boom.', stock: 55 },
  { id: 11, name: 'Laptop Stand', price: 39.99, originalPrice: 59.99, category: 'accessories', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc5a1b9?w=400', rating: 4.3, reviews: 876, description: 'Sleek ergonomic aluminum alloy riser stand for notebooks. Fully adjustable angle profile to improve posture and open heat-airflow design to keep laptops running cooler.', stock: 150 },
  { id: 12, name: 'Smart Ring', price: 199.99, originalPrice: 249.99, category: 'wearables', image: 'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=400', rating: 4.6, reviews: 654, description: 'Next-generation smart ring tracker measuring real-time heart rate variation, skin temperature fluctuations, and personal sleep-quality levels from the convenience of your finger.', stock: 25 },
  { id: 13, name: 'Action Camera 4K', price: 179.99, originalPrice: 249.99, category: 'cameras', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400', rating: 4.8, reviews: 1876, description: 'Waterproof high-framerate action sports camera capturing ultra dynamic 4K videos. Equipped with physical EIS stabilization, a responsive dual touchscreen view, and accessories kit combo.', stock: 40 },
  { id: 14, name: 'Drone Mini', price: 349.99, originalPrice: 449.99, category: 'cameras', image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400', rating: 4.7, reviews: 1234, description: 'Super lightweight foldable beginner-friendly drone with a built-in 4K camera. GPS tracking safety features ensure automatic returns when signal connection is depleted or power level drops low.', stock: 20 },
  { id: 15, name: 'VR Headset', price: 299.99, originalPrice: 399.99, category: 'vr', image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=400', rating: 4.9, reviews: 2543, description: 'Immersive virtual reality gaming headset featuring a sharp high-pixel spatial display, zero external computing requirements (stand-alone mode), and responsive ergonomic motion sensing hand controllers.', stock: 35 },
  { id: 16, name: 'Smart Home Hub', price: 89.99, originalPrice: 119.99, category: 'smart-home', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400', rating: 4.5, reviews: 987, description: 'Central base command console to coordinate and orchestrate all your household smart lights, smart thermostats, motorized shades, and safety locks securely from one location.', stock: 65 }
];

const DEFAULT_COUPONS: Coupon[] = [
  { code: 'TUKTAKINSIDER', discount: 15, isActive: true },
  { code: 'WELCOME10', discount: 10, isActive: true },
  { code: 'CHIPDEAL20', discount: 20, isActive: true }
];

const DEFAULT_PLATFORMS: MessagePlatform[] = [
  { id: 'messenger', name: 'Messenger', icon: 'MessageSquare', value: 'https://m.me/tuktaktech', bgColor: 'bg-blue-600', isActive: true },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'MessageCircle', value: 'https://wa.me/8801711223344', bgColor: 'bg-emerald-600', isActive: true },
  { id: 'telegram', name: 'Telegram', icon: 'Send', value: 'https://t.me/tuktaktech', bgColor: 'bg-cyan-600', isActive: true },
  { id: 'hotline', name: 'Hotline', icon: 'Phone', value: 'tel:+8801234567890', bgColor: 'bg-indigo-600', isActive: true }
];

let memoryDB: DatabaseSchema | null = null;

// Helper to interact with the database
function readDB(): DatabaseSchema {
  if (memoryDB) return memoryDB;
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialDB: DatabaseSchema = {
        products: INITIAL_PRODUCTS,
        users: [],
        orders: [],
        favorites: {},
        coupons: DEFAULT_COUPONS,
        platforms: DEFAULT_PLATFORMS,
        adminPassword: "admin123"
      };
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
      } catch (writeErr) {
        console.warn("Could not write database_tuktak.json, fallback to memory storage:", writeErr);
      }
      memoryDB = initialDB;
      return initialDB;
    }
    const rawData = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(rawData);
    
    // Auto-migrate if values are missing
    let migrated = false;
    if (!parsed.coupons) {
      parsed.coupons = DEFAULT_COUPONS;
      migrated = true;
    }
    if (!parsed.platforms) {
      parsed.platforms = DEFAULT_PLATFORMS;
      migrated = true;
    }
    if (!parsed.adminPassword) {
      parsed.adminPassword = "admin123";
      migrated = true;
    }
    if (migrated) {
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2));
      } catch (writeErr) {
        console.warn("Could not write updated database_tuktak.json, fallback to memory storage:", writeErr);
      }
    }
    memoryDB = parsed;
    return parsed;
  } catch (err) {
    console.error("Database reading warning:", err);
    const fallbackDB = { 
      products: INITIAL_PRODUCTS, 
      users: [], 
      orders: [], 
      favorites: {}, 
      coupons: DEFAULT_COUPONS, 
      platforms: DEFAULT_PLATFORMS,
      adminPassword: "admin123"
    };
    memoryDB = fallbackDB;
    return fallbackDB;
  }
}

function writeDB(data: DatabaseSchema) {
  memoryDB = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Database writing error:", err);
  }
}

// Simulated Token-Based JWT Helpers
function generateJWT(userId: string): string {
  const header = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
  const payloadStr = JSON.stringify({ sub: userId, iat: Math.floor(Date.now() / 1000) });
  const payload = Buffer.from(payloadStr).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const signature = "SIM_SIG_" + userId.replace(/[^a-zA-Z0-9]/g, "");
  return `${header}.${payload}.${signature}`;
}

function verifyJWT(token: string): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payloadStr = Buffer.from(parts[1], "base64").toString("utf-8");
    const payload = JSON.parse(payloadStr);
    return payload.sub || null;
  } catch (err) {
    return null;
  }
}

function getUserIdFromReq(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyJWT(token);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "TukTak Teck Backend API" });
  });

  // Get active product catalog (with optional search, category and sorting options)
  app.get("/api/products", (req, res) => {
    const db = readDB();
    let result = [...db.products];

    const category = req.query.category as string;
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string;

    if (category) {
      result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (sortBy) {
      switch (sortBy) {
        case "price-low":
          result.sort((a, b) => a.price - b.price);
          break;
        case "price-high":
          result.sort((a, b) => b.price - a.price);
          break;
        case "rating":
          result.sort((a, b) => b.rating - a.rating);
          break;
        case "newest":
          result.sort((a, b) => b.id - a.id);
          break;
        default:
          break;
      }
    }

    res.json(result);
  });

  // Get singular product details
  app.get("/api/products/:id", (req, res) => {
    const db = readDB();
    const id = parseInt(req.params.id);
    const product = db.products.find(p => p.id === id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.json(product);
    }
  });

  // Authentication: Register User
  app.post("/api/auth/register", (req, res) => {
    const db = readDB();
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required fields" });
    }

    const emailLower = email.toLowerCase().trim();
    const existing = db.users.find(u => u.email.toLowerCase() === emailLower);
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const newUser: User = {
      id: "usr_" + Date.now(),
      name,
      email: emailLower,
      joinDate: new Date().toLocaleDateString()
    };

    // Store private credentials (simple mockup hashing as plaintext/field is fine for simulated env)
    // We attach password to a simple shadow record or model inside our user schema securely
    (newUser as any).password = password;

    db.users.push(newUser);
    writeDB(db);

    // Keep password out of output response
    const { password: _, ...userSafe } = newUser as any;
    const token = generateJWT(newUser.id);
    (userSafe as any).token = token;
    res.json(userSafe);
  });

  // Authentication: Login User
  app.post("/api/auth/login", (req, res) => {
    const db = readDB();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required fields" });
    }

    const emailLower = email.toLowerCase().trim();
    // find user with matching email and password
    const user = db.users.find(u => u.email.toLowerCase() === emailLower && (u as any).password === password);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password combination" });
    }

    const { password: _, ...userSafe } = user as any;
    const token = generateJWT(user.id);
    (userSafe as any).token = token;
    res.json(userSafe);
  });

  // Profile: Update User details
  app.post("/api/users/update", (req, res) => {
    const db = readDB();
    const { userId, name, phone, address } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const authenticatedUserId = getUserIdFromReq(req);
    if (!authenticatedUserId || authenticatedUserId !== userId) {
      return res.status(411).json({ error: "Access Denied: Invalid or expired authorization token" });
    }

    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User session not found" });
    }

    const updatedUser = {
      ...db.users[userIndex],
      name: name || db.users[userIndex].name,
      phone: phone || db.users[userIndex].phone,
      address: address || db.users[userIndex].address
    };

    db.users[userIndex] = updatedUser;
    writeDB(db);

    const { password: _, ...userSafe } = updatedUser as any;
    const token = generateJWT(updatedUser.id);
    (userSafe as any).token = token;
    res.json(userSafe);
  });

  // Deliveries / Orders: Get order history for a user
  app.get("/api/orders", (req, res) => {
    const db = readDB();
    const email = req.query.email as string;

    if (!email) {
      return res.status(400).json({ error: "Customer email is required to list orders" });
    }

    const authenticatedUserId = getUserIdFromReq(req);
    if (!authenticatedUserId) {
      return res.status(411).json({ error: "Access Denied: Invalid or expired authorization token" });
    }

    const user = db.users.find(u => u.id === authenticatedUserId);
    const emailLower = email.toLowerCase().trim();
    if (!user || user.email.toLowerCase() !== emailLower) {
      return res.status(403).json({ error: "Access Denied: You cannot view order logs for another user account" });
    }

    const userOrders = db.orders.filter(o => o.email.toLowerCase() === emailLower);
    res.json(userOrders);
  });

  // Deliveries / Orders: Place a new order
  app.post("/api/orders", (req, res) => {
    const db = readDB();
    const { name, email, phone, address, paymentMethod, items, total, couponCode, discountApplied, postalCode } = req.body;

    if (!name || !email || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order details (name, email, shipping items) are incomplete" });
    }

    const authenticatedUserId = getUserIdFromReq(req);
    if (!authenticatedUserId) {
      return res.status(411).json({ error: "Access Denied: Invalid or expired authorization token" });
    }

    const user = db.users.find(u => u.id === authenticatedUserId);
    if (!user || user.email.toLowerCase() !== email.toLowerCase().trim()) {
      return res.status(403).json({ error: "Access Denied: Unauthorized email order registration" });
    }

    // Process and update stocks
    const resolvedItems = [];
    for (const item of items) {
      const matchProd = db.products.find(p => p.id === item.id);
      if (matchProd) {
        // adjust stock safely
        matchProd.stock = Math.max(0, matchProd.stock - item.quantity);
        resolvedItems.push({
          id: matchProd.id,
          name: matchProd.name,
          price: matchProd.price,
          quantity: item.quantity,
          image: matchProd.image
        });
      }
    }

    const newOrder: Order = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      status: "processing",
      items: resolvedItems,
      total: total || resolvedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0),
      customerName: name,
      email: email.toLowerCase().trim(),
      phone: phone || "",
      address: address || "",
      paymentMethod: paymentMethod || "bkash",
      couponCodeUsed: couponCode,
      discountApplied: discountApplied ? parseFloat(discountApplied) : undefined,
      postalCode: postalCode
    };

    db.orders.push(newOrder);
    writeDB(db);

    res.json({ success: true, order: newOrder });
  });

  // Favorites: Get active wishlist item IDs for user
  app.get("/api/favorites", (req, res) => {
    const db = readDB();
    const userId = req.query.userId as string;
    if (!userId) {
      return res.json([]);
    }

    const authenticatedUserId = getUserIdFromReq(req);
    if (!authenticatedUserId || authenticatedUserId !== userId) {
      return res.status(411).json({ error: "Access Denied: Invalid or expired authorization token" });
    }

    const userFavs = db.favorites[userId] || [];
    res.json(userFavs);
  });

  // Favorites: Toggle active state of a product for user
  app.post("/api/favorites/toggle", (req, res) => {
    const db = readDB();
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ error: "User ID and Product ID are required to toggle wishlist" });
    }

    const authenticatedUserId = getUserIdFromReq(req);
    if (!authenticatedUserId || authenticatedUserId !== userId) {
      return res.status(411).json({ error: "Access Denied: Invalid or expired authorization token" });
    }

    const prodIdNum = parseInt(productId);
    if (!db.favorites[userId]) {
      db.favorites[userId] = [];
    }

    const index = db.favorites[userId].indexOf(prodIdNum);
    let added = false;
    if (index > -1) {
      db.favorites[userId].splice(index, 1);
    } else {
      db.favorites[userId].push(prodIdNum);
      added = true;
    }

    writeDB(db);
    res.json({ success: true, favorites: db.favorites[userId], isFavorite: added });
  });

  // --- Search Bar Autocomplete Dropdown hints endpoint ---
  app.get("/api/products/search-hints", (req, res) => {
    const db = readDB();
    const q = (req.query.q as string || "").toLowerCase().trim();
    if (!q) {
      return res.json([]);
    }
    const hints = db.products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q)
    ).slice(0, 5).map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      image: p.image,
      stock: p.stock
    }));
    res.json(hints);
  });

  // --- Coupons Engine validation endpoint ---
  app.post("/api/coupons/validate", (req, res) => {
    const db = readDB();
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Coupon code is required" });
    }
    const coupon = db.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
    if (!coupon) {
      return res.status(404).json({ error: "Invalid, expired, or inactive coupon code" });
    }
    res.json({ code: coupon.code, discount: coupon.discount });
  });

  // --- Message/Support platforms list sync endpoint ---
  app.get("/api/platforms", (req, res) => {
    const db = readDB();
    const active = db.platforms.filter(p => p.isActive);
    res.json(active);
  });

  // --- ADMIN: Product CRUD controls ---
  app.get("/api/admin/products", (req, res) => {
    const db = readDB();
    const authenticatedUserId = getUserIdFromReq(req);
    if (!authenticatedUserId || authenticatedUserId !== "admin") {
      return res.status(411).json({ error: "Access Denied: Administrative authority required" });
    }
    res.json(db.products);
  });

  app.post("/api/admin/products", (req, res) => {
    const db = readDB();
    const { id, name, price, originalPrice, category, image, description, stock } = req.body;

    const authenticatedUserId = getUserIdFromReq(req);
    if (!authenticatedUserId || authenticatedUserId !== "admin") {
      return res.status(411).json({ error: "Access Denied: Administrative authority required" });
    }

    if (id) {
      // Edit product
      const index = db.products.findIndex(p => p.id === id);
      if (index === -1) return res.status(404).json({ error: "Product not found" });
      db.products[index] = {
        ...db.products[index],
        name: name || db.products[index].name,
        price: price !== undefined ? parseFloat(price) : db.products[index].price,
        originalPrice: originalPrice !== undefined ? parseFloat(originalPrice) : db.products[index].originalPrice,
        category: category || db.products[index].category,
        image: image || db.products[index].image,
        description: description || db.products[index].description,
        stock: stock !== undefined ? parseInt(stock) : db.products[index].stock
      };
    } else {
      // Add product
      const nextId = db.products.reduce((max, curr) => Math.max(max, curr.id), 0) + 1;
      const newProd = {
        id: nextId,
        name: name || "New Tech Core Drop",
        price: parseFloat(price) || 29.99,
        originalPrice: parseFloat(originalPrice) || 49.99,
        category: category || "accessories",
        image: image || "https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=400",
        rating: 4.5,
        reviews: 1,
        description: description || "Professional, high-integrity innovation drop.",
        stock: stock !== undefined ? parseInt(stock) : 10
      };
      db.products.push(newProd);
    }

    writeDB(db);
    res.json({ success: true, products: db.products });
  });

  app.delete("/api/admin/products/:id", (req, res) => {
    const db = readDB();
    const id = parseInt(req.params.id);

    const authenticatedUserId = getUserIdFromReq(req);
    if (!authenticatedUserId || authenticatedUserId !== "admin") {
      return res.status(411).json({ error: "Access Denied: Administrative authority required" });
    }

    db.products = db.products.filter(p => p.id !== id);
    writeDB(db);
    res.json({ success: true, products: db.products });
  });

  // --- ADMIN: Coupons CRUD controls ---
  app.get("/api/admin/coupons", (req, res) => {
    const db = readDB();
    const authenticatedUserId = getUserIdFromReq(req);
    if (!authenticatedUserId || authenticatedUserId !== "admin") {
      return res.status(411).json({ error: "Access Denied: Administrative authority required" });
    }
    res.json(db.coupons);
  });

  app.post("/api/admin/coupons", (req, res) => {
    const db = readDB();
    const { code, discount, isActive } = req.body;

    const authenticatedUserId = getUserIdFromReq(req);
    if (!authenticatedUserId || authenticatedUserId !== "admin") {
      return res.status(411).json({ error: "Access Denied: Administrative authority required" });
    }

    if (!code) {
      return res.status(400).json({ error: "Coupon code is required" });
    }

    const index = db.coupons.findIndex(c => c.code.toUpperCase() === code.toUpperCase());
    if (index > -1) {
      db.coupons[index].discount = discount !== undefined ? parseInt(discount) : db.coupons[index].discount;
      db.coupons[index].isActive = isActive !== undefined ? !!isActive : db.coupons[index].isActive;
    } else {
      db.coupons.push({
        code: code.toUpperCase().trim(),
        discount: parseInt(discount) || 15,
        isActive: isActive !== undefined ? !!isActive : true
      });
    }

    writeDB(db);
    res.json({ success: true, coupons: db.coupons });
  });

  app.delete("/api/admin/coupons/:code", (req, res) => {
    const db = readDB();
    const code = req.params.code.toUpperCase();

    const authenticatedUserId = getUserIdFromReq(req);
    if (!authenticatedUserId || authenticatedUserId !== "admin") {
      return res.status(411).json({ error: "Access Denied: Administrative authority required" });
    }

    db.coupons = db.coupons.filter(c => c.code !== code);
    writeDB(db);
    res.json({ success: true, coupons: db.coupons });
  });

  // --- ADMIN: Platforms configurations controls ---
  app.get("/api/admin/platforms", (req, res) => {
    const db = readDB();
    const authenticatedUserId = getUserIdFromReq(req);
    if (!authenticatedUserId || authenticatedUserId !== "admin") {
      return res.status(411).json({ error: "Access Denied: Administrative authority required" });
    }
    res.json(db.platforms);
  });

  app.post("/api/admin/platforms", (req, res) => {
    const db = readDB();
    const { id, name, icon, value, bgColor, isActive } = req.body;

    const authenticatedUserId = getUserIdFromReq(req);
    if (!authenticatedUserId || authenticatedUserId !== "admin") {
      return res.status(411).json({ error: "Access Denied: Administrative authority required" });
    }

    if (!id) {
      return res.status(400).json({ error: "Platform ID is required" });
    }

    const index = db.platforms.findIndex(p => p.id === id);
    if (index > -1) {
      db.platforms[index] = {
        ...db.platforms[index],
        name: name || db.platforms[index].name,
        icon: icon || db.platforms[index].icon,
        value: value !== undefined ? value : db.platforms[index].value,
        bgColor: bgColor || db.platforms[index].bgColor,
        isActive: isActive !== undefined ? !!isActive : db.platforms[index].isActive
      };
    } else {
      db.platforms.push({
        id: id,
        name: name || id,
        icon: icon || "MessageSquare",
        value: value || "",
        bgColor: bgColor || "bg-indigo-600",
        isActive: isActive !== undefined ? !!isActive : true
      });
    }

    writeDB(db);
    res.json({ success: true, platforms: db.platforms });
  });

  // --- ADMIN: Master password authentication and profile change ---
  app.post("/api/admin/verify-password", (req, res) => {
    const db = readDB();
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    const currentPassword = db.adminPassword || "admin123";
    if (password === currentPassword) {
      return res.json({ success: true, token: generateJWT("admin") });
    } else {
      return res.status(401).json({ error: "Incorrect administrative password" });
    }
  });

  app.post("/api/admin/change-password", (req, res) => {
    const db = readDB();
    const { oldPassword, newPassword } = req.body;

    const authenticatedUserId = getUserIdFromReq(req);
    if (!authenticatedUserId || authenticatedUserId !== "admin") {
      return res.status(411).json({ error: "Access Denied: Administrative authority required" });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Old password and new password are required" });
    }

    const currentPassword = db.adminPassword || "admin123";
    if (oldPassword !== currentPassword) {
      return res.status(400).json({ error: "Previous administrative password does not match" });
    }

    db.adminPassword = newPassword;
    writeDB(db);
    res.json({ success: true, message: "Administrative passcode changed successfully" });
  });

  // --- ADMIN: System Order controls ---
  app.get("/api/admin/orders", (req, res) => {
    const db = readDB();
    const authenticatedUserId = getUserIdFromReq(req);
    if (!authenticatedUserId || authenticatedUserId !== "admin") {
      return res.status(411).json({ error: "Access Denied: Administrative authority required" });
    }
    res.json(db.orders);
  });

  app.post("/api/admin/orders/:id/status", (req, res) => {
    const db = readDB();
    const authenticatedUserId = getUserIdFromReq(req);
    if (!authenticatedUserId || authenticatedUserId !== "admin") {
      return res.status(411).json({ error: "Access Denied: Administrative authority required" });
    }

    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Delivery status is required" });
    }

    const order = db.orders.find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    writeDB(db);
    res.json({ success: true, orders: db.orders });
  });

  // --- Vite Dev and Prod Middleware Setup ---

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[TukTak Teck Server] Listening on http://0.0.0.0:${PORT}`);
    });
  }

  return app;
}

export { startServer };

if (!process.env.VERCEL) {
  startServer();
}
