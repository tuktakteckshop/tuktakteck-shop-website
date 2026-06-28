import React, { useState, useEffect } from "react";
import { 
  Bolt, ShoppingCart, Search, Menu, Heart, ChevronDown, Trash2, User as UserIcon, 
  MapPin, CreditCard, Lock, ArrowRight, Star, X, Truck, Info, LogOut, ShieldCheck, CheckCircle2, MessageSquare, ExternalLink, Calendar, Phone, Store,
  Plus, Key, Settings, Edit
} from "lucide-react";

import { Product, Category, User, CartItem, Order, Coupon, MessagePlatform } from "./types";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ProductCard from "./components/ProductCard";
import CartSidebar from "./components/CartSidebar";
import CheckoutModal from "./components/CheckoutModal";
import BottomNav from "./components/BottomNav";
import AuthModal from "./components/AuthModal";
import Toast, { ToastMessage } from "./components/Toast";

// Static categories metadata with gradient color highlights
const CATEGORIES: Category[] = [
  { id: 'audio', name: 'Premium Audio', icon: 'fa-headphones', color: 'from-indigo-600 to-pink-500' },
  { id: 'wearables', name: 'Smart Wearables', icon: 'fa-clock', color: 'from-blue-600 to-cyan-400' },
  { id: 'peripherals', name: 'Gaming Peripherals', icon: 'fa-mouse', color: 'from-emerald-500 to-teal-400' },
  { id: 'storage', name: 'High-speed Storage', icon: 'fa-database', color: 'from-amber-500 to-red-500' },
  { id: 'accessories', name: 'Accessories', icon: 'fa-plug', color: 'from-red-500 to-purple-500' },
  { id: 'cameras', name: 'Action Cameras & Drones', icon: 'fa-camera', color: 'from-violet-600 to-indigo-500' },
  { id: 'vr', name: 'Virtual Reality', icon: 'fa-vr-cardboard', color: 'from-fuchsia-600 to-pink-500' },
  { id: 'smart-home', name: 'Smart Home Hubs', icon: 'fa-home', color: 'from-emerald-600 to-cyan-500' }
];

export default function App() {
  // Global States
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [theme, setTheme] = useState<"light" | "cyber">(() => {
    const saved = localStorage.getItem("tuktak_theme");
    return (saved === "cyber" || saved === "light") ? saved : "light";
  });

  // Synchronize theme configuration with DOM class attributes
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
      document.body.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.body.classList.remove("light");
    }
    localStorage.setItem("tuktak_theme", theme);
  }, [theme]);

  // Detailed Product View target
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [detailQuantity, setDetailQuantity] = useState<number>(1);

  // Synchronize state currentPage with URL hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#/", "");
      if (hash.startsWith("product/")) {
        const idStr = hash.split("/")[1];
        const id = parseInt(idStr, 10);
        if (!isNaN(id)) {
          setSelectedProductId(id);
          setCurrentPage("product");
        }
      } else if (hash && ["home", "shop", "favorites", "delivery", "admin", "about", "profile"].includes(hash)) {
        setCurrentPage(hash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    // Initial check on mount
    handleHashChange();

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Update URL hash when state changes
  useEffect(() => {
    if (currentPage === "product" && selectedProductId !== null) {
      window.location.hash = `#/product/${selectedProductId}`;
    } else {
      const currentHash = window.location.hash.replace("#/", "");
      if (currentPage && currentPage !== currentHash) {
        window.location.hash = `#/${currentPage}`;
      }
    }
  }, [currentPage, selectedProductId]);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");

  // Authentication & session records
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("tuktak_session_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Cart & Wishlist records
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("tuktak_shop_cart");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [favorites, setFavorites] = useState<number[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Admin and mobile support datasets
  const [platforms, setPlatforms] = useState<MessagePlatform[]>([]);
  const [adminCoupons, setAdminCoupons] = useState<Coupon[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);

  // Admin access & security console states
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem("tuktak_admin_token"));
  const [enteredAdminPassword, setEnteredAdminPassword] = useState("");
  const [adminOldPassword, setAdminOldPassword] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");

  // Admin Product CRUD Modal Forms
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [prodFormName, setProdFormName] = useState("");
  const [prodFormPrice, setProdFormPrice] = useState("");
  const [prodFormOrigPrice, setProdFormOrigPrice] = useState("");
  const [prodFormCategory, setProdFormCategory] = useState("accessories");
  const [prodFormImage, setProdFormImage] = useState("");
  const [prodFormStock, setProdFormStock] = useState("10");
  const [prodFormDesc, setProdFormDesc] = useState("");

  // UI state overlays
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<"login" | "signup">("login");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // For Newsletter subscription
  const [newsEmail, setNewsEmail] = useState("");

  // Admin coupon creation state
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("10");

  // Track profile changes locally before upload
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");

  // Trigger floating alert
  const showToast = (text: string, type: "success" | "error" | "info" | "warning" = "info") => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, text, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- REST Data Fetching Syncs with Express ---

  // Fetch product catalog with active search/category parameters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `/api/products?sortBy=${sortBy}`;
        if (selectedCategory) {
          url += `&category=${selectedCategory}`;
        }
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Could not retrieve tech products catalog");
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        showToast(err.message || "Endpoint connection failed", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy]);

  // Fetch active user database records (favorites, histories) on session load
  useEffect(() => {
    if (!currentUser) {
      setFavorites([]);
      setOrders([]);
      return;
    }

    const fetchUserData = async () => {
      try {
        const headers: HeadersInit = {};
        if (currentUser && (currentUser as any).token) {
          headers["Authorization"] = `Bearer ${(currentUser as any).token}`;
        }

        // fetch wishlist favorites
        const resFav = await fetch(`/api/favorites?userId=${currentUser.id}`, { headers });
        if (resFav.ok) {
          const favs = await resFav.json();
          setFavorites(favs);
        }

        // fetch order deliveries list
        const resOrd = await fetch(`/api/orders?email=${encodeURIComponent(currentUser.email)}`, { headers });
        if (resOrd.ok) {
          const ords = await resOrd.json();
          setOrders(ords);
        }
      } catch (err) {
        console.error("User storage syncing warning:", err);
      }
    };

    fetchUserData();
    
    // sync fields for settings forms
    setProfileName(currentUser.name);
    setProfilePhone(currentUser.phone || "");
    setProfileAddress(currentUser.address || "");
  }, [currentUser]);

  // Save cart changes locally
  useEffect(() => {
    localStorage.setItem("tuktak_shop_cart", JSON.stringify(cart));
  }, [cart]);

  // Fetch support platforms and general admin datasets on mount or tab navigation
  useEffect(() => {
    if (currentPage !== "admin" || !adminToken) return;

    const fetchAdminData = async () => {
      try {
        const headers: HeadersInit = {
          "Authorization": `Bearer ${adminToken}`
        };

        // Fetch coupons
        const resCoup = await fetch("/api/admin/coupons", { headers });
        if (resCoup.ok) {
          const data = await resCoup.json();
          setAdminCoupons(data);
        }

        // Fetch platforms link configuration
        const resPlat = await fetch("/api/admin/platforms", { headers });
        if (resPlat.ok) {
          const data = await resPlat.json();
          setPlatforms(data);
        }

        // Fetch system wide orders
        const resOrd = await fetch("/api/admin/orders", { headers });
        if (resOrd.ok) {
          const data = await resOrd.json();
          setAdminOrders(data);
        }
      } catch (err) {
        console.error("Error synchronizing admin databases:", err);
      }
    };

    fetchAdminData();
  }, [currentPage, adminToken]);

  // --- REST Action Callback handlers ---

  const handleAuthSuccess = (authenticatedUser: User) => {
    setCurrentUser(authenticatedUser);
    localStorage.setItem("tuktak_session_user", JSON.stringify(authenticatedUser));
    showToast(`Successfully connected as ${authenticatedUser.name}!`, "success");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setFavorites([]);
    setOrders([]);
    localStorage.removeItem("tuktak_session_user");
    showToast("Logged out of session. See you next time!", "info");
    setCurrentPage("home");
  };

  const handleToggleFavorite = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    if (!currentUser) {
      setAuthInitialMode("login");
      setIsAuthOpen(true);
      showToast("Identification required. Please sign in first", "warning");
      return;
    }

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if ((currentUser as any).token) {
        headers["Authorization"] = `Bearer ${(currentUser as any).token}`;
      }
      const res = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers,
        body: JSON.stringify({ userId: currentUser.id, productId })
      });
      const data = await res.json();
      if (res.ok) {
        setFavorites(data.favorites);
        showToast(data.isFavorite ? "Added to your favorites list!" : "Removed from favorites", "success");
      }
    } catch (err) {
      showToast("Could not register favorite toggle", "error");
    }
  };

  const handleAddToCart = (e: React.MouseEvent, productId: number, quantity = 1) => {
    e.stopPropagation();
    if (!currentUser) {
      setAuthInitialMode("login");
      setIsAuthOpen(true);
      showToast("Please sign in to modify your cart items", "warning");
      return;
    }

    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    if (prod.stock <= 0) {
      showToast("We apologize, this high tech item is currently out of stock", "error");
      return;
    }

    setCart((prev) => {
      const existing = prev.find(item => item.id === productId);
      if (existing) {
        const targetQty = existing.quantity + quantity;
        if (targetQty > prod.stock) {
          showToast(`Cannot add more. Static stock limit is ${prod.stock}`, "warning");
          return prev;
        }
        showToast(`Updated bag quantity for ${prod.name}!`, "success");
        return prev.map(item => item.id === productId ? { ...item, quantity: targetQty } : item);
      } else {
        showToast(`Added ${prod.name} to checkout bag!`, "success");
        return [...prev, { id: productId, quantity }];
      }
    });
  };

  const handleUpdateCartQuantity = (productId: number, change: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === productId) {
          const nextQty = item.quantity + change;
          if (nextQty <= 0) {
            return null; // triggers filter
          }
          if (nextQty > prod.stock) {
            showToast(`Current available catalog stock cap is ${prod.stock}`, "warning");
            return item;
          }
          return { ...item, quantity: nextQty };
        }
        return item;
      }).filter((item): item is CartItem => item !== null);
    });
  };

  const handleRemoveCartItem = (productId: number) => {
    setCart((prev) => prev.filter(item => item.id !== productId));
    showToast("Removed product from cart", "info");
  };

  const handlePlaceOrder = async (billingDetails: any) => {
    if (cart.length === 0) {
      showToast("Your shopping cart is empty", "error");
      return;
    }

    const orderPayload = {
      name: billingDetails.name,
      email: billingDetails.email,
      phone: billingDetails.phone,
      address: billingDetails.address,
      paymentMethod: billingDetails.paymentMethod,
      items: cart.map(item => ({
        id: item.id,
        quantity: item.quantity
      })),
      total: billingDetails.total,
      couponCode: billingDetails.couponCode || null,
      discountApplied: billingDetails.discountApplied || 0,
      postalCode: billingDetails.postalCode || null
    };

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (currentUser && (currentUser as any).token) {
        headers["Authorization"] = `Bearer ${(currentUser as any).token}`;
      }
      const res = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order placement failed");

      showToast("Order Placed Successfully! Processing and shipping now.", "success");
      setCart([]); // Reset Cart
      setIsCheckoutOpen(false);

      // Re-trigger order fetching
      const ordHeaders: HeadersInit = {};
      if (currentUser && (currentUser as any).token) {
        ordHeaders["Authorization"] = `Bearer ${(currentUser as any).token}`;
      }
      const resOrd = await fetch(`/api/orders?email=${encodeURIComponent(currentUser!.email)}`, {
        headers: ordHeaders
      });
      if (resOrd.ok) {
        const ords = await resOrd.json();
        setOrders(ords);
      }

      setCurrentPage("delivery");
    } catch (err: any) {
      showToast(err.message || "Failed to finalize transaction", "error");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if ((currentUser as any).token) {
        headers["Authorization"] = `Bearer ${(currentUser as any).token}`;
      }
      const res = await fetch("/api/users/update", {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: currentUser.id,
          name: profileName,
          phone: profilePhone,
          address: profileAddress
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save profile");

      setCurrentUser(data);
      localStorage.setItem("tuktak_session_user", JSON.stringify(data));
      showToast("Successfully updated personal gadget profile info!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update profile", "error");
    }
  };

  const handleSubscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsEmail) return;
    showToast("Awesome! You've joined the TukTak Teck inner circle for hot deals.", "success");
    setNewsEmail("");
  };

  // --- Subpage Rendering Logic ---

  const renderActiveSubpage = () => {
    switch (currentPage) {
      case "home":
        return renderHomeSub();
      case "shop":
        return renderShopSub();
      case "favorites":
        return renderFavoritesSub();
      case "product":
        return renderProductDetailSub();
      case "delivery":
        return renderDeliverySub();
      case "admin":
        return renderAdminSub();
      case "about":
        return renderAboutSub();
      case "profile":
        return renderProfileSub();
      case "mobile-menu":
        return renderMobileMenuSub();
      default:
        return renderHomeSub();
    }
  };

  // Home Screen Layout
  const renderHomeSub = () => {
    // filter products with biggest discounts
    const discountSales = products.filter(p => p.originalPrice > p.price)
      .sort((a,b) => {
        const deltaA = ((a.originalPrice - a.price) / a.originalPrice);
        const deltaB = ((b.originalPrice - b.price) / b.originalPrice);
        return deltaB - deltaA;
      }).slice(0, 4);

    const newestDrops = [...products].sort((a, b) => b.id - a.id).slice(0, 4);

    return (
      <div className="space-y-12 pb-12 animate-fade-in-up">
        {/* Futuristic Tech Hero section */}
        <section className="relative rounded-3xl overflow-hidden glass-panel border border-white/5 p-6 md:p-10 lg:p-14">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyber-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyber-accent/10 rounded-full blur-3xl"></div>
          
          <div className="grid lg:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-6">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-cyber-primary/20 text-cyber-accent border border-cyber-primary/30 rounded-full text-[10px] font-extrabold tracking-widest uppercase">
                <Bolt className="w-3 h-3 text-cyber-accent animate-pulse" />
                <span>Futuristic Innovations</span>
              </span>
              
              <h2 className="text-3xl sm:text-5xl font-extrabold font-display leading-[1.1] text-white">
                Next-Gen <span className="gradient-text">Tech Artifacts</span> for Your Workstation.
              </h2>
              
              <p className="text-sm text-slate-300 leading-relaxed max-w-md">
                Equip your flow with pure, ultra-responsive gadgets. From high-integrity mechanical keyboards to health-monitoring smart rings—curated and tested by tech purists.
              </p>

              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => { setSelectedCategory(null); setCurrentPage("shop"); }}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyber-primary to-cyber-secondary hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-lg shadow-cyber-primary/20"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => { setSelectedCategory("audio"); setCurrentPage("shop"); }}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10"
                >
                  Listen Premium Audio
                </button>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
                <div>
                  <p className="text-lg md:text-xl font-bold font-display text-white">15K+</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1 font-semibold">Artifacts Sold</p>
                </div>
                <div>
                  <p className="text-lg md:text-xl font-bold font-display text-white">4.92 ★</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1 font-semibold">User Rating</p>
                </div>
                <div>
                  <p className="text-lg md:text-xl font-bold font-display text-white">24hr</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1 font-semibold">Quick Delivery</p>
                </div>
              </div>
            </div>

            {/* Visual showcase widget matching top-grade styling limits */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyber-primary/20 to-cyber-accent/20 blur-2xl rounded-full"></div>
              <div className="relative glass-panel rounded-2xl p-4 max-w-[400px] border border-white/10 float-animation shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500" 
                  alt="TukTak Premium Headset" 
                  className="rounded-xl w-full object-cover aspect-[4/3] bg-slate-900"
                  referrerPolicy="no-referrer"
                />
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-cyber-accent uppercase">Weekly Hot Pick</p>
                    <p className="text-xs font-bold text-white mt-0.5">TukTak Spatial Gaming Headset</p>
                  </div>
                  <button 
                    onClick={() => { setSelectedProductId(10); setCurrentPage("product"); }}
                    className="px-3 py-1.5 bg-cyber-primary text-white text-[10px] font-extrabold rounded-lg transition-transform hover:scale-105"
                  >
                    View Drops
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories bento grids block */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-lg font-bold font-display text-white">Bento Categories</h3>
              <p className="text-xs text-slate-400 mt-1">Direct access to specialized technical hardware departments</p>
            </div>
            <button 
              onClick={() => { setSelectedCategory(null); setCurrentPage("shop"); }}
              className="text-xs text-cyber-accent hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <div 
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setCurrentPage("shop"); }}
                className="group cursor-pointer p-4 bg-slate-900/50 hover:bg-slate-900 border border-white/5 hover:border-cyber-primary/30 rounded-2xl transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-3 group-hover:scale-115 transition-transform`}>
                  <Bolt className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs font-bold text-white leading-tight">{cat.name}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Explore department drops
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Hot Discounts dynamic grid */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <h3 className="text-lg font-bold font-display text-white">Hot Discounts</h3>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center"><span className="loading loading-spinner text-cyber-primary"></span></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
              {discountSales.map((product) => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  isFavorite={favorites.includes(product.id)}
                  onSelect={(id) => { setSelectedProductId(id); setCurrentPage("product"); }}
                  onToggleFavorite={(e) => handleToggleFavorite(e, product.id)}
                  onAddToCart={(e) => handleAddToCart(e, product.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* New Arrivals drop section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-accent animate-pulse"></span>
              <h3 className="text-lg font-bold font-display text-white">New Drop Arrivals</h3>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center"><span className="loading loading-spinner text-cyber-primary"></span></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
              {newestDrops.map((product) => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  isFavorite={favorites.includes(product.id)}
                  onSelect={(id) => { setSelectedProductId(id); setCurrentPage("product"); }}
                  onToggleFavorite={(e) => handleToggleFavorite(e, product.id)}
                  onAddToCart={(e) => handleAddToCart(e, product.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Newsletter promo panel */}
        <section className="bg-gradient-to-r from-cyber-primary/10 via-cyber-secondary/5 to-cyber-accent/5 border border-white/5 p-6 sm:p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-cyber-accent/15 rounded-full blur-2xl"></div>
          <div className="relative max-w-md mx-auto text-center space-y-4">
            <h3 className="text-lg font-bold font-display text-white">TukTak Tech Insider</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Unlock exclusive club drops, technical hardware testing guides, and secret discounts delivered securely directly to your inbox.
            </p>
            <form onSubmit={handleSubscribeNewsletter} className="flex gap-2 max-w-sm mx-auto pt-1">
              <input 
                type="email" 
                required
                value={newsEmail}
                onChange={(e) => setNewsEmail(e.target.value)}
                placeholder="Enter workspace email..."
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-cyber-primary text-white"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white rounded-xl text-xs font-bold"
              >
                Join
              </button>
            </form>
          </div>
        </section>
      </div>
    );
  };

  // Shop Screen Layout
  const renderShopSub = () => {
    return (
      <div className="space-y-6 pb-12 animate-fade-in-up">
        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/30 p-4 border border-white/5 rounded-2xl">
          <div>
            <h3 className="text-base font-bold text-white uppercase font-display tracking-wide">
              {selectedCategory ? `${CATEGORIES.find(c => c.id === selectedCategory)?.name}` : "Shop Tech Drops"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Found {products.length} technical artifacts ready to dispatch</p>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto self-end sm:self-center">
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-[10px] font-bold rounded-lg transition-all"
              >
                Clear Department
              </button>
            )}

            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-cyber-primary text-white"
            >
              <option value="default">Default Catalogue Sort</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">User Rating: Descending</option>
              <option value="newest">Chronological: Newest Drop</option>
            </select>
          </div>
        </div>

        {/* Dynamic List grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <span className="loading loading-spinner text-cyber-primary loading-lg"></span>
            <p className="text-xs text-slate-400 font-mono">Syncing with TukTak database...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/10 border border-white/5 rounded-3xl">
            <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-slate-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-300">No tech match found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-normal">
              No products found under this search parameters. Try adjusting filters or searching general categories.
            </p>
            <button 
              onClick={() => { setSelectedCategory(null); setSearchQuery(""); }}
              className="mt-4 px-4 py-1.5 bg-cyber-primary text-white rounded-lg text-xs font-bold"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard 
                key={product.id}
                product={product}
                isFavorite={favorites.includes(product.id)}
                onSelect={(id) => { setSelectedProductId(id); setCurrentPage("product"); }}
                onToggleFavorite={(e) => handleToggleFavorite(e, product.id)}
                onAddToCart={(e) => handleAddToCart(e, product.id)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Favorites / Wishlist Layout
  const renderFavoritesSub = () => {
    const favoriteProducts = products.filter(p => favorites.includes(p.id));

    return (
      <div className="space-y-6 pb-12 animate-fade-in-up">
        <div>
          <h3 className="text-lg font-bold font-display text-white">My Favorites Wishlist</h3>
          <p className="text-xs text-slate-400 mt-1">Track drop schedules and availability for saved equipment</p>
        </div>

        {favoriteProducts.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/10 border border-white/5 rounded-3xl">
            <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-300">Wishlist empty</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-normal">
              Click the heart badge overlays on product cards inside our store catalogs to bookmark objects.
            </p>
            <button 
              onClick={() => { setCurrentPage("shop"); setSelectedCategory(null); }}
              className="mt-4 px-5 py-2 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white rounded-xl text-xs font-bold"
            >
              Browse Hardware
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {favoriteProducts.map((product) => (
              <ProductCard 
                key={product.id}
                product={product}
                isFavorite={true}
                onSelect={(id) => { setSelectedProductId(id); setCurrentPage("product"); }}
                onToggleFavorite={(e) => handleToggleFavorite(e, product.id)}
                onAddToCart={(e) => handleAddToCart(e, product.id)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Product detailed profile subscreen
  const renderProductDetailSub = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return <div className="text-slate-400 py-12">Search Target Missing...</div>;

    const discount = product.originalPrice > product.price 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
      : 0;

    const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

    return (
      <div className="space-y-12 pb-12 animate-fade-in-up">
        {/* Breadcrumb path */}
        <nav className="flex items-center space-x-2 text-xs text-slate-400 leading-none">
          <button onClick={() => setCurrentPage("home")} className="hover:text-white transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => { setSelectedCategory(product.category); setCurrentPage("shop"); }} className="hover:text-white transition-colors capitalize">{product.category}</button>
          <span>/</span>
          <span className="text-white font-bold truncate max-w-[120px]">{product.name}</span>
        </nav>

        {/* Column Splitter */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left asset illustration */}
          <div className="relative glass-panel rounded-3xl p-5 border border-white/5 bg-slate-900/30">
            {discount > 0 && (
              <span className="absolute top-6 left-6 bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-md z-10 uppercase tracking-widest">
                Save ${Math.floor(product.originalPrice - product.price).toFixed(0)} ({discount}%)
              </span>
            )}
            <img 
              src={product.image} 
              alt={product.name} 
              className="rounded-2xl w-full object-cover aspect-square bg-slate-950"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Right transaction controls body */}
          <div className="space-y-6">
            <div>
              <span className="inline-block bg-cyber-primary/20 text-cyber-accent text-[9px] font-extrabold px-2.5 py-1 uppercase rounded-md tracking-wider">
                {product.category}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white mt-3">{product.name}</h2>
              
              <div className="flex items-center space-x-3 mt-2.5">
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`} />
                  ))}
                </div>
                <span className="text-xs text-slate-400 font-medium">({product.rating} / 5.0 rating score based on {product.reviews.toLocaleString()} reviews)</span>
              </div>
            </div>

            {/* Price Tags */}
            <div className="flex items-baseline space-x-3 bg-slate-900/30 p-3 rounded-2xl border border-white/5 w-fit">
              <span className="text-3xl font-black text-white font-mono">${product.price.toFixed(2)}</span>
              {discount > 0 && (
                <span className="text-xs text-slate-500 line-through font-mono">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>

            {/* Spec breakdown text block */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Artifact Narrative Specs</p>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/20 p-3 rounded-xl border border-white/5">{product.description}</p>
            </div>

            {/* Stock meter */}
            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                <span>Catalogue Stock availability</span>
                <span className={product.stock > 10 ? "text-emerald-400" : "text-rose-400"}>
                  {product.stock > 0 ? `${product.stock} Units Left` : "Out of Stock"}
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={`h-full bg-gradient-to-r ${product.stock > 10 ? "from-cyber-primary to-cyber-accent" : "from-rose-500 to-amber-500"}`}
                  style={{ width: `${Math.min(100, (product.stock / 100) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Add to checkout forms */}
            <div className="space-y-2 pt-3 border-t border-white/5">
              {detailQuantity >= product.stock && product.stock > 0 && (
                <p className="text-[10px] text-amber-400 font-bold font-mono">
                  ⚠️ Maximum Available Stock Reached ({product.stock} units)
                </p>
              )}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center justify-between bg-slate-900 rounded-xl border border-white/10 p-1 font-mono text-white">
                  <button 
                    onClick={() => setDetailQuantity(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold">{detailQuantity}</span>
                  <button 
                    onClick={() => setDetailQuantity(p => Math.min(product.stock, p + 1))}
                    className={`px-3 py-1.5 text-xs transition-colors ${
                      detailQuantity >= product.stock 
                        ? "text-slate-600 cursor-not-allowed" 
                        : "text-slate-400 hover:text-white cursor-pointer"
                    }`}
                    disabled={detailQuantity >= product.stock}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={(e) => { handleAddToCart(e, product.id, detailQuantity); setDetailQuantity(1); }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white text-xs font-extrabold rounded-xl hover:opacity-95 transition-opacity flex items-center justify-center space-x-2 shadow-lg shadow-cyber-primary/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{product.stock === 0 ? "Out of Stock" : `Add ${detailQuantity} to Secure Bag`}</span>
                </button>

                <button
                  onClick={(e) => handleToggleFavorite(e, product.id)}
                  className={`py-2.5 px-3.5 border rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    favorites.includes(product.id)
                      ? "border-rose-500 bg-rose-500/10 text-rose-400" 
                      : "border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                  }`}
                  title="Bookmark Gadget"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Feature lists badge */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5 text-[10px] text-slate-400">
              <div className="flex items-center space-x-2 bg-slate-900/30 p-2.5 border border-white/5 rounded-lg">
                <Truck className="w-3.5 h-3.5 text-cyber-accent" />
                <span>Secure packing dispatch</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-900/30 p-2.5 border border-white/5 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-cyber-accent" />
                <span>2 Year hardware warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Section drops */}
        {related.length > 0 && (
          <section className="space-y-4 pt-10 border-t border-white/5">
            <h4 className="text-sm font-bold font-display text-slate-200">Related Artifact Specs</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {related.map((prod) => (
                <ProductCard 
                  key={prod.id}
                  product={prod}
                  isFavorite={favorites.includes(prod.id)}
                  onSelect={(id) => { setSelectedProductId(id); setCurrentPage("product"); }}
                  onToggleFavorite={(e) => handleToggleFavorite(e, prod.id)}
                  onAddToCart={(e) => handleAddToCart(e, prod.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  // Tracking Delivery Page
  const renderDeliverySub = () => {
    return (
      <div className="space-y-6 pb-12 animate-fade-in-up">
        <div>
          <h3 className="text-lg font-bold font-display text-white">Deliveries Dispatch Log</h3>
          <p className="text-xs text-slate-400 mt-1">Real-time status tracking for TukTak Teck active deliveries</p>
        </div>

        {!currentUser ? (
          <div className="text-center py-16 bg-slate-900/10 border border-white/5 rounded-3xl">
            <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-cyber-primary">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-sm font-bold text-slate-300">Identity Login Required</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-normal">
              Please sign in with your email address to locate active physical shipment trackers registered to your account portfolio.
            </p>
            <button 
              onClick={() => { setAuthInitialMode("login"); setIsAuthOpen(true); }}
              className="mt-4 px-5 py-2.5 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white rounded-xl text-xs font-bold"
            >
              Sign In to Session
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/10 border border-white/5 rounded-3xl animate-fade-in-up">
            <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-300">No Orders Logged Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-normal">
              When you submit orders through our secure card or bKash/Nagad options, they will pop up instantly here.
            </p>
            <button 
              onClick={() => { setCurrentPage("shop"); setSelectedCategory(null); }}
              className="mt-4 px-5 py-2 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white rounded-xl text-xs font-bold"
            >
              Start Curating Hardware
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusColors = {
                processing: "bg-amber-500/10 border-amber-500/20 text-amber-400",
                shipped: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
                delivered: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              };

              return (
                <div 
                  key={order.id}
                  className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden p-5 space-y-4"
                >
                  {/* Title Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500">TRANSACTION ORDER #{order.id}</span>
                      <p className="text-xs text-slate-300 mt-0.5 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-cyber-accent" />
                        <span>Registered on {order.date}</span>
                      </p>
                    </div>

                    <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border tracking-wider shrink-0 ${statusColors[order.status] || "text-white"}`}>
                      ● Order Status: {order.status}
                    </span>
                  </div>

                  {/* Shipment items list */}
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 text-xs">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-10 h-10 object-cover rounded-lg bg-slate-950 border border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Quantity: {item.quantity} units</p>
                        </div>
                        <p className="font-mono text-white font-bold shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Status Tracking Timeline */}
                  <div className="py-4 border-t border-b border-white/5 my-4">
                    <p className="text-[9px] uppercase font-bold text-slate-500 mb-3 tracking-wider font-mono">Live Logistics Tracking Status</p>
                    <div className="grid grid-cols-4 gap-2 relative">
                      {/* Connecting Line backgrounds */}
                      <div className="absolute top-[14px] left-[12.5%] right-[12.5%] h-0.5 bg-slate-800 z-0"></div>
                      
                      {/* Step 1: Order Received */}
                      <div className="flex flex-col items-center text-center z-10">
                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-lg shadow-emerald-500/20">
                          1
                        </div>
                        <p className="text-[9px] font-bold text-white mt-1.5 uppercase tracking-wide">Order Received</p>
                        <p className="text-[8px] text-emerald-400 mt-0.5 font-mono uppercase font-semibold">Confirmed</p>
                      </div>

                      {/* Step 2: Package Packed */}
                      <div className="flex flex-col items-center text-center z-10">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                          order.status !== "processing"
                            ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                            : "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 animate-pulse"
                        }`}>
                          2
                        </div>
                        <p className="text-[9px] font-bold text-white mt-1.5 uppercase tracking-wide">Package Packed</p>
                        <p className={`text-[8px] mt-0.5 font-mono uppercase font-semibold ${
                          order.status !== "processing" ? "text-emerald-400" : "text-cyan-400"
                        }`}>{order.status !== "processing" ? "Completed" : "Active"}</p>
                      </div>

                      {/* Step 3: Dispatch Transit */}
                      <div className="flex flex-col items-center text-center z-10">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                          order.status === "delivered"
                            ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                            : order.status === "shipped"
                            ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 animate-pulse"
                            : "bg-slate-800 text-slate-500 border border-white/10"
                        }`}>
                          3
                        </div>
                        <p className="text-[9px] font-bold text-white mt-1.5 uppercase tracking-wide">Dispatch Transit</p>
                        <p className={`text-[8px] mt-0.5 font-mono uppercase font-semibold ${
                          order.status === "delivered"
                            ? "text-emerald-400"
                            : order.status === "shipped"
                            ? "text-cyan-400 animate-pulse"
                            : "text-slate-500"
                        }`}>{order.status === "delivered" ? "Completed" : order.status === "shipped" ? "In Transit" : "Pending"}</p>
                      </div>

                      {/* Step 4: Delivered */}
                      <div className="flex flex-col items-center text-center z-10">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                          order.status === "delivered"
                            ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                            : "bg-slate-800 text-slate-500 border border-white/10"
                        }`}>
                          4
                        </div>
                        <p className="text-[9px] font-bold text-white mt-1.5 uppercase tracking-wide">Delivered</p>
                        <p className={`text-[8px] mt-0.5 font-mono uppercase font-semibold ${
                          order.status === "delivered" ? "text-emerald-400" : "text-slate-500"
                        }`}>{order.status === "delivered" ? "Handover Done" : "Pending"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer calculations & visual tracker */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-3.5 border-t border-white/5">
                    <div className="space-y-1.5 text-xs">
                      <p className="text-slate-400 font-semibold flex items-center space-x-1 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-cyber-accent" />
                        <span>Destined to {order.customerName} : {order.address}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 flex items-center space-x-1 font-mono">
                        <Phone className="w-3 h-3 text-cyber-primary" />
                        <span>Phone Hotline Contact: {order.phone} ({order.paymentMethod.toUpperCase()})</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase text-slate-500 tracking-wider">Total Charge Handover</span>
                      <p className="text-lg font-black text-cyber-accent font-mono mt-0.5">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Admin Control Panel subpage
  const renderAdminSub = () => {
    const handleVerifyPasscode = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!enteredAdminPassword.trim()) return;

      try {
        const res = await fetch("/api/admin/verify-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: enteredAdminPassword.trim() })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Incorrect combination sequence");

        setAdminToken(data.token);
        localStorage.setItem("tuktak_admin_token", data.token);
        showToast("Console access authorized successfully! Welcome, Chief.", "success");
        setEnteredAdminPassword("");
      } catch (err: any) {
        showToast(err.message, "error");
      }
    };

    const handleLockConsole = () => {
      setAdminToken(null);
      localStorage.removeItem("tuktak_admin_token");
      showToast("Console session locked and cleared from cache.", "info");
    };

    const handleChangeMasterPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!adminOldPassword || !adminNewPassword) {
        showToast("Both current and new passwords are required.", "warning");
        return;
      }
      if (adminNewPassword !== adminConfirmPassword) {
        showToast("Passcode validation failed: new combinations don't match.", "error");
        return;
      }

      try {
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        };

        const res = await fetch("/api/admin/change-password", {
          method: "POST",
          headers,
          body: JSON.stringify({
            oldPassword: adminOldPassword,
            newPassword: adminNewPassword
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Password transition rejected");

        showToast("Master console passcode modified successfully!", "success");
        setAdminOldPassword("");
        setAdminNewPassword("");
        setAdminConfirmPassword("");
      } catch (err: any) {
        showToast(err.message, "error");
      }
    };

    const handleCreateCoupon = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCouponCode.trim()) return;

      try {
        const headers: HeadersInit = { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        };

        const res = await fetch("/api/admin/coupons", {
          method: "POST",
          headers,
          body: JSON.stringify({
            code: newCouponCode.trim().toUpperCase(),
            discount: parseInt(newCouponDiscount) || 15,
            isActive: true
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed registration");
        setAdminCoupons(data.coupons || []);
        setNewCouponCode("");
        showToast(`Coupon code ${newCouponCode.trim().toUpperCase()} registered successfully!`, "success");
      } catch (err: any) {
        showToast(err.message, "error");
      }
    };

    const handleDeleteCoupon = async (code: string) => {
      try {
        const headers: HeadersInit = {
          "Authorization": `Bearer ${adminToken}`
        };

        const res = await fetch(`/api/admin/coupons/${code}`, {
          method: "DELETE",
          headers
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed delete");
        setAdminCoupons(data.coupons || []);
        showToast(`Coupon code ${code} deleted from system databases!`, "warning");
      } catch (err: any) {
        showToast(err.message, "error");
      }
    };

    const handleUpdatePlatformOnServer = async (plat: MessagePlatform, updatedFields: Partial<MessagePlatform>) => {
      try {
        const headers: HeadersInit = { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        };

        const res = await fetch("/api/admin/platforms", {
          method: "POST",
          headers,
          body: JSON.stringify({
            ...plat,
            ...updatedFields
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Change failed");
        setPlatforms(data.platforms || []);
        showToast(`Support channel updated!`, "success");
      } catch (err: any) {
        showToast(err.message, "error");
      }
    };

    const handleUpdateProductStockLevel = async (product: Product, newStock: number) => {
      try {
        const headers: HeadersInit = { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        };

        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers,
          body: JSON.stringify({
            id: product.id,
            stock: newStock
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed product modification");
        setProducts(data.products || []);
        showToast(`Product ${product.name} stock optimized to ${newStock}!`, "success");
      } catch (err: any) {
        showToast(err.message, "error");
      }
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!prodFormName.trim()) {
        showToast("Product item name cannot be empty", "error");
        return;
      }

      try {
        const headers: HeadersInit = { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        };

        const bodyData = {
          id: editingProduct ? editingProduct.id : undefined,
          name: prodFormName.trim(),
          price: parseFloat(prodFormPrice) || 29.99,
          originalPrice: parseFloat(prodFormOrigPrice) || 49.99,
          category: prodFormCategory,
          image: prodFormImage.trim() || "https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=400",
          stock: parseInt(prodFormStock) || 0,
          description: prodFormDesc.trim() || "Verified by system administration labs."
        };

        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers,
          body: JSON.stringify(bodyData)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to commit product specification");

        setProducts(data.products || []);
        showToast(editingProduct ? `Catalog product updated: ${bodyData.name}` : `New catalogue release announced: ${bodyData.name}`, "success");
        setIsProductModalOpen(false);
        setEditingProduct(null);
      } catch (err: any) {
        showToast(err.message, "error");
      }
    };

    const handleDeleteProduct = async (prodId: number) => {
      if (!window.confirm("Do you want to permanently erase this product item from active catalogs? This action is irreversible.")) {
        return;
      }

      try {
        const headers: HeadersInit = {
          "Authorization": `Bearer ${adminToken}`
        };

        const res = await fetch(`/api/admin/products/${prodId}`, {
          method: "DELETE",
          headers
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed deletion");

        setProducts(data.products || []);
        showToast("Product catalog node destroyed successfully!", "warning");
      } catch (err: any) {
        showToast(err.message, "error");
      }
    };

    const handleUpdateOrderStatus = async (orderId: number, status: string) => {
      try {
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        };

        const res = await fetch(`/api/admin/orders/${orderId}/status`, {
          method: "POST",
          headers,
          body: JSON.stringify({ status })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Status progression refused");

        setAdminOrders(data.orders || []);
        showToast(`Order status forwarded to [${status.toUpperCase()}] successfully!`, "success");
      } catch (err: any) {
        showToast(err.message, "error");
      }
    };

    const handleOpenEditProduct = (p: Product) => {
      setEditingProduct(p);
      setProdFormName(p.name);
      setProdFormPrice(p.price.toString());
      setProdFormOrigPrice(p.originalPrice.toString());
      setProdFormCategory(p.category);
      setProdFormImage(p.image);
      setProdFormStock(p.stock.toString());
      setProdFormDesc(p.description || "");
      setIsProductModalOpen(true);
    };

    const handleOpenCreateProduct = () => {
      setEditingProduct(null);
      setProdFormName("");
      setProdFormPrice("49.99");
      setProdFormOrigPrice("79.99");
      setProdFormCategory("accessories");
      setProdFormImage("https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400");
      setProdFormStock("45");
      setProdFormDesc("Verified high-integrity core innovation specs.");
      setIsProductModalOpen(true);
    };

    // LOCKSCREEN GATE
    if (!adminToken) {
      return (
        <div className="max-w-md mx-auto my-12 p-8 bg-slate-900/80 border-2 border-cyber-primary/30 rounded-3xl backdrop-blur-xl space-y-6 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-cyber-primary/10 border-2 border-cyber-primary rounded-full flex items-center justify-center mx-auto text-cyber-primary shadow-lg shadow-cyber-primary/20">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold font-display text-white tracking-tight">Administrative Lock Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Enter the console administrative passcode to unleash full control override mechanisms.
            </p>
          </div>

          <form onSubmit={handleVerifyPasscode} className="space-y-4 pt-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Key className="w-4 h-4 text-cyber-accent" />
              </span>
              <input 
                type="password"
                placeholder="Access Key / Password"
                required
                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyber-primary font-mono select-all"
                value={enteredAdminPassword}
                onChange={(e) => setEnteredAdminPassword(e.target.value)}
              />
            </div>
            
            <button 
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white font-bold text-xs rounded-xl shadow-lg shadow-cyber-primary/30 hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authenticate Console Shell</span>
            </button>
          </form>

          <div className="border-t border-white/5 pt-4 text-[10px] font-mono text-slate-500 bg-slate-950/40 p-3 rounded-lg">
            <span>Fixed Console Default Key: </span>
            <code className="text-cyber-accent font-bold px-1 rounded">admin123</code>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8 pb-12 animate-fade-in-up">
        {/* Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-slate-900/50 border border-white/5 rounded-2xl gap-4 font-sans">
          <div>
            <h2 className="text-lg font-bold font-display text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-cyber-accent animate-pulse" />
              <span>TukTak Teck System Administrative Controller</span>
            </h2>
            <div className="flex items-center space-x-2 mt-1 font-sans">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Status: Master Shell Active</span>
            </div>
          </div>
          <button
            onClick={handleLockConsole}
            className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/20 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Console</span>
          </button>
        </div>

        {/* Change Master Console Passcode Section */}
        <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl space-y-4 font-sans text-xs">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center space-x-1.5">
              <Settings className="w-4 h-4 text-cyber-primary" />
              <span>Access Control Configuration</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Change the fixed master password combination used to verify shell entrance.</p>
          </div>
          <form onSubmit={handleChangeMasterPassword} className="grid grid-cols-1 sm:grid-cols-3 max-w-3xl gap-4 items-end bg-slate-950/60 p-4 rounded-xl border border-white/5">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Current Passcode</span>
              <input 
                type="password"
                required
                placeholder="Old access key"
                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyber-primary h-9 font-mono"
                value={adminOldPassword}
                onChange={(e) => setAdminOldPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">New Secret Key</span>
              <input 
                type="password"
                required
                placeholder="New access key"
                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyber-primary h-9 font-mono"
                value={adminNewPassword}
                onChange={(e) => setAdminNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Confirm Secret Key</span>
              <div className="flex space-x-2">
                <input 
                  type="password"
                  required
                  placeholder="Verify key"
                  className="flex-1 bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyber-primary h-9 font-mono"
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-3 bg-cyber-primary/25 hover:bg-cyber-primary border border-cyber-primary/20 text-white font-bold text-[11px] rounded-lg cursor-pointer h-9 transition-colors text-center font-sans tracking-wide"
                >
                  Save Key
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Global Catalog CRUD Section */}
        <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-2.5 gap-2">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center space-x-1.5">
                <Store className="w-4 h-4 text-cyber-accent" />
                <span>1. Hardware Catalogue Overrides & Stock CRUD</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-1 font-sans">Introduce new physical releases, override specifications, edit descriptions, change pricing and manage quantities.</p>
            </div>
            <button
              onClick={handleOpenCreateProduct}
              className="px-4 py-2 bg-gradient-to-r from-cyber-primary via-blue-600 to-cyber-secondary text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-cyber-primary/10 scale-100 hover:scale-[1.02] active:scale-95 transition-all text-center uppercase cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Product Core</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {products.map((p) => (
              <div key={p.id} className="flex justify-between items-center p-3.5 bg-slate-950/80 border border-white/5 rounded-xl gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <img src={p.image} className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0 bg-slate-900" />
                  <div className="min-w-0">
                    <span className="text-white text-xs font-bold block truncate max-w-[150px] sm:max-w-[190px]">{p.name}</span>
                    <span className="text-[10px] font-mono text-cyber-accent font-extrabold mt-0.5 block">${p.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2.5 shrink-0">
                  <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-md uppercase ${
                    p.stock === 0 
                      ? "bg-red-950/50 text-red-400 border border-red-500/10" 
                      : p.stock <= 2 
                      ? "bg-amber-950/50 text-amber-400 border border-amber-500/10 animate-pulse" 
                      : "bg-emerald-950/50 text-emerald-400 border border-emerald-500/10"
                  }`}>
                    {p.stock === 0 ? "Purged Stock" : `${p.stock} Left`}
                  </span>
                  
                  {/* Stock micro controls */}
                  <div className="flex space-x-1 font-mono">
                    <button 
                      onClick={() => handleUpdateProductStockLevel(p, Math.max(0, p.stock - 1))}
                      className="w-5 h-5 rounded bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-white flex items-center justify-center cursor-pointer transition-colors"
                    >
                      -
                    </button>
                    <button 
                      onClick={() => handleUpdateProductStockLevel(p, p.stock + 1)}
                      className="w-5 h-5 rounded bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-white flex items-center justify-center cursor-pointer transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Edit / Delete items */}
                  <div className="flex space-x-1 pl-1 border-l border-white/10">
                    <button
                      onClick={() => handleOpenEditProduct(p)}
                      title="Edit Product Details"
                      className="p-1 text-slate-400 hover:text-cyber-accent rounded bg-white/5 border border-white/10 hover:border-cyber-accent/30 transition-all cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      title="Delete Product Permanently"
                      className="p-1 text-slate-400 hover:text-red-400 rounded bg-white/5 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Order Logistics Management System */}
        <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl space-y-4">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center space-x-1.5">
              <Truck className="w-4 h-4 text-cyber-accent" />
              <span>2. Global Order Logistics & Delivery Dispatch Center</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">View system wide hardware purchases and advance statuses to automatically populate user shipment trackers.</p>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {adminOrders.length === 0 ? (
              <div className="p-10 border border-white/5 bg-slate-950/40 rounded-xl text-center space-y-2 font-sans">
                <Store className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-500">No customer physical orders currently submitted on system databases</p>
              </div>
            ) : (
              [...adminOrders].reverse().map((o) => (
                <div key={o.id} className="p-4 bg-slate-950/80 border border-white/5 rounded-2xl space-y-4 font-sans text-xs">
                  {/* Order header information */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2.5 border-b border-white/5 font-mono text-[10px]">
                    <div className="space-y-1">
                      <p className="font-extrabold text-white text-xs">ORDER #{o.id}</p>
                      <p className="text-slate-500">Placed on log database date: {o.date}</p>
                    </div>
                    {/* Status updater pill selectors */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] uppercase font-bold text-slate-400 mr-1.5 font-sans">Set Delivery Status:</span>
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, "processing")}
                        className={`px-2 py-1 rounded-md text-[9px] font-black uppercase transition-all cursor-pointer ${
                          o.status === "processing" 
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" 
                            : "bg-slate-900 text-slate-500 border border-white/5"
                        }`}
                      >
                        Processing
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, "shipped")}
                        className={`px-2 py-1 rounded-md text-[9px] font-black uppercase transition-all cursor-pointer ${
                          o.status === "shipped" 
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/40" 
                            : "bg-slate-900 text-slate-500 border border-white/5"
                        }`}
                      >
                        Shipped
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, "delivered")}
                        className={`px-2 py-1 rounded-md text-[9px] font-black uppercase transition-all cursor-pointer ${
                          o.status === "delivered" 
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" 
                            : "bg-slate-900 text-slate-500 border border-white/5"
                        }`}
                      >
                        Delivered
                      </button>
                    </div>
                  </div>

                  {/* Customer shipping instructions layout */}
                  <div className="grid sm:grid-cols-2 gap-4 text-slate-300 text-[11px] font-sans">
                    <div className="space-y-1.5">
                      <p className="font-semibold text-white">Recipient Contact Log Details:</p>
                      <p className="text-slate-400 uppercase font-mono text-[10px]">Name: {o.customerName}</p>
                      <p className="text-slate-400">Email: {o.email}</p>
                      <p className="text-slate-400 font-mono">Phone: {o.phone}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="font-semibold text-white font-sans">Destination Address:</p>
                      <p className="text-slate-400">{o.address}</p>
                      <p className="text-slate-450 font-mono">Postal Zip: {o.postalCode || "N/A"}</p>
                      <p className="text-slate-400">Payment Solution: <span className="text-cyber-accent font-bold uppercase font-mono">{o.paymentMethod}</span></p>
                    </div>
                  </div>

                  {/* Items purchased logs */}
                  <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5 space-y-1 bg-slate-950/20 font-sans text-[11px]">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 font-sans">Ordered Tech cores:</p>
                    {o.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-300 text-xs py-1">
                        <span>{item.name} <strong className="text-cyber-accent font-mono">x{item.quantity}</strong></span>
                        <span className="font-mono text-slate-400">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {o.couponCodeUsed && (
                      <div className="flex justify-between items-center text-emerald-400 text-[10px] uppercase font-bold pt-1.5 border-t border-white/5">
                        <span>Applied promo voucher: {o.couponCodeUsed}</span>
                        <span>-{o.discountApplied}% savings</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-white text-xs font-black pt-2 border-t border-cyber-accent/10">
                      <span className="font-sans uppercase">Hand-over Price Total:</span>
                      <span className="text-cyber-accent font-mono text-sm">${o.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Promo Vouchers */}
        <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl space-y-4 font-sans">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">3. System Promo Coupons</h3>
            <p className="text-[10px] text-slate-400 mt-1">Configure active system-wide codes that reduce order totals on checkouts.</p>
          </div>

          <form onSubmit={handleCreateCoupon} className="flex flex-wrap gap-3 p-3.5 bg-slate-950/80 border border-white/5 rounded-xl">
            <div className="flex-1 min-w-[150px] space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Promo Code</span>
              <input 
                type="text"
                placeholder="e.g. MEGAFAST"
                required
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 uppercase font-mono h-9"
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value)}
              />
            </div>
            <div className="w-24 space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Discount %</span>
              <input 
                type="number"
                min="1"
                max="95"
                required
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono h-9"
                value={newCouponDiscount}
                onChange={(e) => setNewCouponDiscount(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button 
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white text-xs font-bold rounded-xl hover:opacity-90 h-9 flex items-center transition-opacity cursor-pointer"
              >
                + Register Code
              </button>
            </div>
          </form>

          <div className="divide-y divide-white/5 bg-slate-950/50 border border-white/5 rounded-xl overflow-hidden font-mono text-xs">
            {adminCoupons.length === 0 ? (
              <p className="text-[10px] text-slate-500 text-center py-5 font-mono">No promo coupons currently registered</p>
            ) : (
              adminCoupons.map((c) => (
                <div key={c.code} className="flex items-center justify-between p-3 select-all">
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-black bg-white/5 px-2.5 py-1 rounded border border-white/10 text-[11px] font-mono">{c.code}</span>
                    <span className="text-cyber-accent font-extrabold">{c.discount}% Discount active</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCoupon(c.code)}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-bold font-sans cursor-pointer underline"
                  >
                    Delete Coupon
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Support Configurations Section */}
        <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl space-y-4">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">4. Webhook & Support Link Configuration</h3>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">Toggle online networks. Active channels dynamically propagate instantly into system support workflows.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {platforms.map((plat) => (
              <div key={plat.id} className="p-3.5 bg-slate-950/85 border border-white/5 rounded-xl space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">{plat.name} Support Channel</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={plat.isActive}
                      onChange={(e) => handleUpdatePlatformOnServer(plat, { isActive: e.target.checked })}
                    />
                    <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyber-primary"></div>
                    <span className="ml-2 text-[9px] font-bold font-mono text-slate-400 uppercase">{plat.isActive ? "Online" : "Offline"}</span>
                  </label>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Target Support URL Endpoint / Link</span>
                  <div className="flex space-x-2">
                    <input 
                      type="text"
                      className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-cyber-primary font-mono"
                      value={plat.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPlatforms(prev => prev.map(p => p.id === plat.id ? { ...p, value: val } : p));
                      }}
                    />
                    <button
                      onClick={() => handleUpdatePlatformOnServer(plat, { value: plat.value })}
                      className="px-3.5 py-1 text-white hover:bg-cyber-primary bg-white/5 text-[10px] font-bold rounded-lg border border-white/10 hover:border-cyber-primary transition-colors cursor-pointer"
                    >
                      Save link
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL overlay: Product Create / Edit custom forms */}
        {isProductModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
            <div className="bg-slate-900 border-2 border-cyber-primary/40 rounded-3xl w-full max-w-lg overflow-hidden animate-scale-up shadow-2xl shadow-cyber-primary/20 text-xs">
              
              {/* Modal header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-slate-950/30">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                  {editingProduct ? `Edit detail override: ${editingProduct.name}` : "Anounce New Hardware Release"}
                </h3>
                <button 
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body form */}
              <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto font-sans">
                
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Product Descriptor Name</span>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. TukTak Carbon Smart Watch"
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-cyber-primary"
                    value={prodFormName}
                    onChange={(e) => setProdFormName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Pricing Charge (USD)</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      required 
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyber-primary font-mono"
                      value={prodFormPrice}
                      onChange={(e) => setProdFormPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Original/MSRP Charge (USD)</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      required 
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyber-primary font-mono"
                      value={prodFormOrigPrice}
                      onChange={(e) => setProdFormOrigPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Segment Choice Category</span>
                    <select 
                      className="w-full bg-slate-955 bg-slate-950 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-cyber-primary text-xs"
                      value={prodFormCategory}
                      onChange={(e) => setProdFormCategory(e.target.value)}
                    >
                      <option value="audio">Audio Equipment & Gear (audio)</option>
                      <option value="wearables">Wearables & Smart tracking (wearables)</option>
                      <option value="peripherals">Computer Peripherals (peripherals)</option>
                      <option value="storage">Storage media drives (storage)</option>
                      <option value="accessories">General accessories & connectors (accessories)</option>
                      <option value="cameras">Cameras & Recording lens (cameras)</option>
                      <option value="vr">Virtual reality gadgets (vr)</option>
                      <option value="smart-home">Smart Home Command centers (smart-home)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Available Stock Counts</span>
                    <input 
                      type="number" 
                      required 
                      min="0"
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyber-primary font-mono"
                      value={prodFormStock}
                      onChange={(e) => setProdFormStock(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Mock Cover Unsplash Image URL</span>
                  <input 
                    type="text" 
                    placeholder="https://images.unsplash.com/promo-path-example..."
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyber-primary font-mono"
                    value={prodFormImage}
                    onChange={(e) => setProdFormImage(e.target.value)}
                  />
                  <p className="text-[9px] text-slate-500 mt-0.5">Note: Set a clean Unsplash image URL or leave empty for basic placeholder images.</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Product Backstory Description</span>
                  <textarea 
                    rows={4} 
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyber-primary leading-normal"
                    value={prodFormDesc}
                    onChange={(e) => setProdFormDesc(e.target.value)}
                  />
                </div>

                {/* Submit row */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button 
                    type="button" 
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 hover:bg-white/5 border border-white/10 rounded-xl font-bold cursor-pointer transition-colors"
                  >
                    Cancel Drop
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center space-x-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Drop Catalog Records</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };
  const renderAboutSub = () => {
    return (
      <div className="space-y-10 pb-12 animate-fade-in-up">
        {/* Story Intro */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-black font-display text-white">
            Our Mission at <span className="gradient-text">TukTak Teck</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            We are simple tech developers who realized premium computer accessories, tracking devices, and audiophile gears shouldn't are locked behind high reseller loops. We deliver directly to developers, gamers, and writers securely.
          </p>
        </div>

        {/* Global footprints layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 p-6 border border-white/5 rounded-2xl text-center">
            <span className="text-2xl font-black gradient-text font-display">15,000+</span>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Shipped Hardware</p>
          </div>
          <div className="bg-slate-900/50 p-6 border border-white/5 rounded-2xl text-center">
            <span className="text-2xl font-black gradient-text font-display">8,300+</span>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Happy Engineers</p>
          </div>
          <div className="bg-slate-900/50 p-6 border border-white/5 rounded-2xl text-center">
            <span className="text-2xl font-black gradient-text font-display">500+</span>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Approved Brands</p>
          </div>
          <div className="bg-slate-900/50 p-6 border border-white/5 rounded-2xl text-center">
            <span className="text-2xl font-black gradient-text font-display">24 Hour</span>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Response SLAs</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center pt-6">
          <img 
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600" 
            alt="TukTak Garage Lab"
            className="rounded-3xl border border-white/5 object-cover aspect-video bg-slate-900"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-display text-white">The TukTak Lab Story</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We bootstrapped around 2020 inside a simple hardware testing garage. Disappointed with the high failures of average audio drivers and sticky membrane mechanical keys, our team worked directly with specialized chip factories to source heavy-duty tactile items.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              TukTak means "small fixes" in local Bengali syntax. Today, our catalogue has grown to premium carbon smartwatch fibers, professional 4K streaming webcams, and extreme speed solid-state storage. We verify every single batch before dispatch logs go live.
            </p>
            <div className="pt-2">
              <a 
                href="https://m.me/tuktaktech" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white text-xs font-bold rounded-xl"
              >
                <span>Have questions? Quick Chat</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Editable Profile Settings
  const renderProfileSub = () => {
    if (!currentUser) {
      return (
        <div className="py-16 text-center animate-fade-in-up">
          <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-slate-300">Identity Profile Locked</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Please identify your session first to configure shipping details.</p>
          <button 
            onClick={() => { setAuthInitialMode("login"); setIsAuthOpen(true); }}
            className="mt-4 px-5 py-2.5 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white rounded-xl text-xs font-bold"
          >
            Connect Profile
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6 pb-12 max-w-xl mx-auto animate-fade-in-up">
        <div>
          <h3 className="text-lg font-bold font-display text-white">My TukTak Account Profile</h3>
          <p className="text-xs text-slate-400 mt-1">Configure default address details for one-click checkout shipping</p>
        </div>

        <div className="glass-panel rounded-2xl border border-white/5 p-6 space-y-6 bg-slate-900/30">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-primary to-cyber-secondary flex items-center justify-center text-xl font-bold font-display text-white select-none shadow-xl">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-base font-bold text-white">{currentUser.name}</h4>
              <p className="text-xs text-slate-400">{currentUser.email}</p>
              <p className="text-[10px] text-slate-500 mt-1">Joined TukTak tech club on {currentUser.joinDate}</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Display Profile Name</label>
              <input 
                type="text" 
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyber-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Mobile Phone Hotline *</label>
              <input 
                type="tel" 
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="e.g. +880 1711 XXXXXX"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyber-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Default Shipment Deliver Address *</label>
              <textarea 
                rows={3}
                value={profileAddress}
                onChange={(e) => setProfileAddress(e.target.value)}
                placeholder="Flat/House Number, Road Name, Region, Zipcode"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyber-primary resize-none"
              />
            </div>

            <button 
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-cyber-primary to-cyber-secondary hover:opacity-95 text-white rounded-xl text-xs font-bold transition-opacity text-center flex items-center justify-center space-x-2 shadow-lg shadow-cyber-primary/20"
            >
              <span>Save Gadget Profile Settings</span>
            </button>
          </form>
        </div>
      </div>
    );
  };

  // Mobile full Hamburger menu fallback layout
  const renderMobileMenuSub = () => {
    return (
      <div className="space-y-6 pb-12 animate-fade-in-up md:hidden">
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <h3 className="text-base font-bold font-display text-white">Viewport Links</h3>
          <button onClick={() => setCurrentPage("home")} className="p-1 hover:bg-white/10 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col space-y-2.5">
          <button 
            onClick={() => { setCurrentPage("home"); setSelectedCategory(null); }}
            className={`w-full text-left p-4 rounded-xl text-xs font-bold flex items-center space-x-3 ${!selectedCategory && currentPage === 'home' ? 'bg-cyber-primary/20 text-white' : 'bg-slate-900/50 text-slate-300'}`}
          >
            <Bolt className="w-4 h-4 text-cyber-accent" />
            <span>Store Home</span>
          </button>

          <button 
            onClick={() => { setCurrentPage("shop"); setSelectedCategory(null); }}
            className={`w-full text-left p-4 rounded-xl text-xs font-bold flex items-center space-x-3 ${!selectedCategory && currentPage === 'shop' ? 'bg-cyber-primary/20 text-white' : 'bg-slate-900/50 text-slate-300'}`}
          >
            <Store className="w-4 h-4 text-cyber-accent" />
            <span>All Catalog Hardware</span>
          </button>

          <button 
            onClick={() => { setCurrentPage("favorites"); }}
            className={`w-full text-left p-4 rounded-xl text-xs font-bold flex items-center space-x-3 relative ${currentPage === 'favorites' ? 'bg-cyber-primary/20 text-white' : 'bg-slate-900/50 text-slate-300'}`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Wishlist Favorites</span>
            {favorites.length > 0 && (
              <span className="ml-auto bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{favorites.length}</span>
            )}
          </button>

          <button 
            onClick={() => { setCurrentPage("delivery"); }}
            className={`w-full text-left p-4 rounded-xl text-xs font-bold flex items-center space-x-3 ${currentPage === 'delivery' ? 'bg-cyber-primary/20 text-white' : 'bg-slate-900/50 text-slate-300'}`}
          >
            <Truck className="w-4 h-4 text-cyber-accent" />
            <span>Deliveries tracking</span>
          </button>

          <button 
            onClick={() => { setCurrentPage("about"); }}
            className={`w-full text-left p-4 rounded-xl text-xs font-bold flex items-center space-x-3 ${currentPage === 'about' ? 'bg-cyber-primary/20 text-white' : 'bg-slate-900/50 text-slate-300'}`}
          >
            <Info className="w-4 h-4 text-cyber-accent" />
            <span>Backstory about TukTak</span>
          </button>

          {currentUser ? (
            <button 
              onClick={handleLogout}
              className="w-full text-left p-4 rounded-xl text-xs font-bold flex items-center space-x-3 bg-rose-500/10 text-rose-400 border border-rose-500/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Session</span>
            </button>
          ) : (
            <button 
              onClick={() => { setAuthInitialMode("login"); setIsAuthOpen(true); }}
              className="w-full text-center p-4 rounded-xl text-xs font-bold bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white"
            >
              Connect Session (Sign In)
            </button>
          )}
        </nav>
      </div>
    );
  };

  return (
    <div className="bg-cyber-darker text-slate-100 min-h-screen pb-20 lg:pb-0 font-sans selection:bg-cyber-primary selection:text-white">
      {/* Header element */}
      <Header 
        currentUser={currentUser}
        cart={cart}
        favoritesCount={favorites.length}
        onNavigate={(page) => setCurrentPage(page)}
        currentPage={currentPage}
        onSearch={(q) => setSearchQuery(q)}
        onToggleCart={() => setIsCartOpen(!isCartOpen)}
        onOpenAuth={() => { setAuthInitialMode("login"); setIsAuthOpen(true); }}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === "light" ? "cyber" : "light")}
      />

      <div className="pt-16 max-w-7xl mx-auto px-4 flex">
        {/* Left Desktop Sidebar element */}
        <Sidebar 
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={(id) => setSelectedCategory(id)}
          onNavigate={(page) => setCurrentPage(page)}
          currentPage={currentPage}
          favoritesCount={favorites.length}
        />

        {/* Main Content Area */}
        <main className="w-full lg:pl-64 py-8 overflow-hidden min-h-[calc(100vh-4rem)]">
          {renderActiveSubpage()}
        </main>
      </div>

      {/* Slide-out Shopping Cart component */}
      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        products={products}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
      />

      {/* Floating Checkout Modal component */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        products={products}
        currentUser={currentUser}
        onSubmitOrder={handlePlaceOrder}
      />

      {/* Floating User Authentication login controller modal */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authInitialMode}
      />

      {/* Mobile Bottom Navigation menu bar */}
      <BottomNav 
        onNavigate={(page) => setCurrentPage(page)}
        currentPage={currentPage}
        favoritesCount={favorites.length}
        platforms={platforms}
      />

      {/* Toaster element overlays */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
export { CATEGORIES };
