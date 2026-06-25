import React, { useState } from "react";
import { X, Lock, Eye, EyeOff, User as UserIcon, Mail } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  initialMode?: "login" | "signup";
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "login"
}: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setErrorMsg("");
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const targetUrl = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password };

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred during authentication.");
      }

      onSuccess(data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-slate-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 animate-fade-in-up">
        {/* Close */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold font-display text-white">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">
              {isLogin ? "Sign in to manage orders & favorites" : "Join TukTak Tech club for premium perks"}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg text-center leading-snug mb-4">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {/* Name (Signup only) */}
            {!isLogin && (
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full bg-slate-900 border border-white/5 focus:border-cyber-primary rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="w-full bg-slate-900 border border-white/5 focus:border-cyber-primary rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-white/5 focus:border-cyber-primary rounded-xl py-2 pl-9 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-gradient-to-r from-cyber-primary to-cyber-secondary hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-cyber-primary/10"
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-5">
            {isLogin ? "Don't have an account yet?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }}
              className="text-cyber-accent hover:underline font-bold ml-1"
            >
              {isLogin ? "Create account" : "Connect now"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
