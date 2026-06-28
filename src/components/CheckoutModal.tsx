import React, { useState } from "react";
import { X, User as UserIcon, MapPin, Smartphone, Lock, Percent, AlertCircle } from "lucide-react";
import { CartItem, Product, User } from "../types";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  products: Product[];
  currentUser: User | null;
  onSubmitOrder: (formData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    paymentMethod: string;
    postalCode: string;
    total: number;
    couponCode?: string;
    discountApplied?: number;
  }) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  products,
  currentUser,
  onSubmitOrder
}: CheckoutModalProps) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
    paymentMethod: "bkash",
    postalCode: ""
  });

  const [couponInput, setCouponInput] = useState("");
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Resolve matching product information
  const cartWithInfo = cart.map((item) => {
    const prod = products.find((p) => p.id === item.id);
    return {
      ...item,
      info: prod
    };
  }).filter(item => item.info !== undefined);

  const subtotal = cartWithInfo.reduce((sum, item) => {
    return sum + (item.info ? item.info.price * item.quantity : 0);
  }, 0);

  const deliveryCharge = subtotal >= 50.0 || subtotal === 0 ? 0 : 4.99;
  
  // Calculate discount
  const discountVal = activeCoupon ? (subtotal * activeCoupon.discount) / 100 : 0;
  const totalVal = Math.max(0, subtotal - discountVal + deliveryCharge);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setValidationError(null);
  };

  const handlePaymentSelect = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: method
    }));
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid promo coupon code");
      }
      setActiveCoupon({ code: data.code, discount: data.discount });
      setCouponInput("");
    } catch (err: any) {
      setCouponError(err.message || "Failed to validate coupon");
    }
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
    setCouponError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Validate Email address format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setValidationError("Invalid email address. Please insert a standardized address (e.g. name@example.com).");
      return;
    }

    // 2. Validate Bangladeshi & International Phone prefix format
    // Validates local mobile length of 11 digits with optional +88/88 prefix
    const phoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;
    if (!phoneRegex.test(formData.phone.replace(/[\s-]/g, ""))) {
      setValidationError("Invalid phone number format. Please specify a valid Bangladeshi or international prefix phone (e.g., +88017XXXXXXXX or 019XXXXXXXX).");
      return;
    }

    // 3. Validate ZIP Postal Code
    const postalRegex = /^\d{4,5}$/;
    if (!postalRegex.test(formData.postalCode.trim())) {
      setValidationError("Postal code must represent a 4 or 5-digit number (e.g. 1207 or 1000).");
      return;
    }

    // 4. Validate Address
    if (formData.address.trim().length < 8) {
      setValidationError("Please specify a more complete street address to avoid logistics transit issues.");
      return;
    }

    // Submit validated order details upward to handlers
    onSubmitOrder({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      paymentMethod: formData.paymentMethod,
      postalCode: formData.postalCode,
      total: totalVal,
      couponCode: activeCoupon?.code,
      discountApplied: discountVal
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-slate-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl my-8 z-10 animate-fade-in-up max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/15 flex items-center justify-between shrink-0">
          <h2 className="text-base font-bold font-display text-white flex items-center space-x-2">
            <Lock className="w-4 h-4 text-cyber-accent" />
            <span>Secure Order Checkout</span>
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form id="checkoutSubmitForm" onSubmit={handleSubmit} className="space-y-6">
            {/* Direct Contact information */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-4">
              <h3 className="text-xs font-bold font-display text-white flex items-center space-x-2 border-b border-white/5 pb-2">
                <UserIcon className="w-4 h-4 text-cyber-primary" />
                <span>Contact Information</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-cyber-primary focus:border-cyber-primary text-white font-sans"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-cyber-primary focus:border-cyber-primary text-white font-sans"
                    placeholder="name@example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                    Phone Number (BD/Int'l prefixes accepted) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-cyber-primary focus:border-cyber-primary text-white font-mono"
                    placeholder="e.g. +8801712345678 or 01712345678"
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-4">
              <h3 className="text-xs font-bold font-display text-white flex items-center space-x-2 border-b border-white/5 pb-2">
                <MapPin className="w-4 h-4 text-cyber-primary" />
                <span>Shipping Address</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                    Full Street Address *
                  </label>
                  <textarea
                    name="address"
                    required
                    rows={2}
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-cyber-primary focus:border-cyber-primary text-white resize-none font-sans"
                    placeholder="Apartment/Flat, Street name, City"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                    ZIP / Postal Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-cyber-primary focus:border-cyber-primary text-white font-mono"
                    placeholder="e.g. 1207 or 1000"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method section */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-4">
              <h3 className="text-xs font-bold font-display text-white flex items-center space-x-2 border-b border-white/5 pb-2">
                <Smartphone className="w-4 h-4 text-cyber-primary" />
                <span>One-Tap Mobile Wallet Integration</span>
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-3">
                {/* bKash */}
                <div 
                  onClick={() => handlePaymentSelect("bkash")}
                  className={`p-3 rounded-xl border cursor-pointer hover:border-cyber-primary transition-all flex items-center space-x-3 ${
                    formData.paymentMethod === "bkash" 
                      ? "bg-pink-950/40 border-pink-500/50 scale-[1.02] shadow-md shadow-pink-500/5" 
                      : "bg-slate-950 border-white/5 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center shrink-0">
                    <Smartphone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">bKash</p>
                    <p className="text-[9px] text-slate-400">Instant Mobile Pay</p>
                  </div>
                </div>

                {/* Nagad */}
                <div 
                  onClick={() => handlePaymentSelect("nagad")}
                  className={`p-3 rounded-xl border cursor-pointer hover:border-cyber-primary transition-all flex items-center space-x-3 ${
                    formData.paymentMethod === "nagad" 
                      ? "bg-orange-950/40 border-orange-500/50 scale-[1.02] shadow-md shadow-orange-500/5" 
                      : "bg-slate-950 border-white/5 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center shrink-0">
                    <Smartphone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Nagad</p>
                    <p className="text-[9px] text-slate-400">Fast Wallet Transfer</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon Promo Field */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                <Percent className="w-4 h-4 text-cyber-accent" />
                <span>Apply Promo Coupon</span>
              </h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    setCouponError("");
                  }}
                  className="flex-1 bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-cyber-primary text-white uppercase placeholder:normal-case font-mono"
                  placeholder="e.g. TUKTAKINSIDER"
                  disabled={activeCoupon !== null}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={!couponInput.trim() || activeCoupon !== null}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all border border-white/10"
                >
                  {activeCoupon ? "Applied" : "Apply"}
                </button>
              </div>
              {couponError && (
                <p className="text-[10px] text-red-400 font-mono flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{couponError}</span>
                </p>
              )}
              {activeCoupon && (
                <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/20 rounded-lg p-2.5 text-[10px] text-emerald-400 font-mono">
                  <span>✔ Code '{activeCoupon.code}' matching {activeCoupon.discount}% discount applied!</span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="underline font-bold hover:text-white ml-2 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Quick Invoice order preview */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-3.5">
              <h3 className="text-xs font-bold text-white border-b border-white/5 pb-2">Order Items Invoice Summary</h3>
              <div className="space-y-2.5 max-h-[150px] overflow-y-auto pr-2">
                {cartWithInfo.map((item) => {
                  const prod = item.info!;
                  return (
                    <div key={item.id} className="flex justify-between items-center text-xs text-slate-300">
                      <span className="truncate max-w-[240px]">{prod.name} (x{item.quantity})</span>
                      <span className="font-mono text-white">${(prod.price * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-white/5 pt-3 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                {activeCoupon && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Promo ({activeCoupon.discount}%)</span>
                    <span className="font-mono">-${discountVal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Express Delivery</span>
                  <span className="font-mono">
                    {deliveryCharge === 0 ? "FREE" : `$${deliveryCharge.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-cyber-accent pt-2.5 border-t border-white/10">
                  <span>Total Amount Due</span>
                  <span className="font-mono">${totalVal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Validation errors */}
            {validationError && (
              <div className="p-3 bg-red-950/50 border border-red-500/20 rounded-xl text-xs text-red-200 font-sans flex items-start space-x-2 animate-pulse">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p>{validationError}</p>
              </div>
            )}
          </form>
        </div>

        {/* Action placement Footer toolbar */}
        <div className="px-6 py-4 bg-slate-950 border-t border-white/10 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 hover:bg-white/5 text-slate-300 hover:text-white rounded-lg text-xs font-bold mr-3 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="checkoutSubmitForm"
            className="px-6 py-2.5 bg-gradient-to-r from-cyber-primary to-cyber-secondary flex items-center space-x-2 text-white text-xs font-bold rounded-xl transition-all shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.01] cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Place Secure Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}
