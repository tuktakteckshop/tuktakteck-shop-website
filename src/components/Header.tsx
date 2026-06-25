import React, { useState } from "react";
import { Bolt, ShoppingCart, Search, Menu, LogOut, User as UserIcon, Heart, Map, Settings, Sun, Moon } from "lucide-react";
import { User, CartItem } from "../types";

interface HeaderProps {
  currentUser: User | null;
  cart: CartItem[];
  favoritesCount: number;
  onNavigate: (page: string) => void;
  currentPage: string;
  onSearch: (query: string) => void;
  onToggleCart: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  theme: "light" | "cyber";
  onToggleTheme: () => void;
}

export default function Header({
  currentUser,
  cart,
  favoritesCount,
  onNavigate,
  currentPage,
  onSearch,
  onToggleCart,
  onOpenAuth,
  onLogout,
  theme,
  onToggleTheme
}: HeaderProps) {
  const [searchVal, setSearchVal] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hints, setHints] = useState<any[]>([]);
  const [showHints, setShowHints] = useState(false);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  React.useEffect(() => {
    if (!searchVal.trim()) {
      setHints([]);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search-hints?q=${encodeURIComponent(searchVal)}`);
        if (res.ok) {
          const data = await res.json();
          setHints(data);
        }
      } catch (err) {
        console.error("Hints query error:", err);
      }
    }, 150);

    return () => clearTimeout(handler);
  }, [searchVal]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(searchVal);
      onNavigate("shop");
      setShowHints(false);
    }
  };

  const handleSearchClick = () => {
    onSearch(searchVal);
    onNavigate("shop");
    setShowHints(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-cyber-darker/95 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer select-none" 
            onClick={() => { onNavigate("home"); onSearch(""); setSearchVal(""); }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-primary to-cyber-secondary flex items-center justify-center pulse-glow">
              <Bolt className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display bg-gradient-to-r from-cyber-primary via-cyber-secondary to-cyber-accent bg-clip-text text-transparent leading-none">
                TukTak Teck
              </h1>
              <p className="text-[10px] text-slate-400 tracking-wider">PREMIUM GADGETS</p>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for premium tech..."
                value={searchVal}
                onFocus={() => setShowHints(true)}
                onChange={(e) => {
                  setSearchVal(e.target.value);
                  setShowHints(true);
                }}
                onKeyDown={handleKeyPress}
                className="w-full bg-cyber-dark/50 border border-white/10 rounded-xl py-2 pl-12 pr-10 text-sm focus:outline-none focus:border-cyber-primary transition-colors text-white placeholder-slate-400"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              {searchVal && (
                <button 
                  onClick={handleSearchClick}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-cyber-primary/20 text-cyber-accent hover:bg-cyber-primary/40 px-2 py-0.5 rounded cursor-pointer"
                >
                  Go
                </button>
              )}

              {/* Dynamic Suggestions Dropdown Overlay */}
              {showHints && hints.length > 0 && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowHints(false)} />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in-up divide-y divide-white/5 max-h-[300px] overflow-y-auto">
                    {hints.map((hint) => (
                      <div
                        key={hint.id}
                        onClick={() => {
                          onSearch(hint.name);
                          setSearchVal(hint.name);
                          setShowHints(false);
                          onNavigate("shop");
                        }}
                        className="p-2.5 hover:bg-white/5 flex items-center space-x-3 cursor-pointer transition-colors"
                      >
                        <img
                          src={hint.image}
                          alt={hint.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 object-cover rounded-lg border border-white/10 shrink-0"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-xs font-bold text-white truncate">{hint.name}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                            <span className="uppercase tracking-wider text-cyber-accent font-mono text-[9px]">{hint.category}</span>
                            {hint.stock <= 2 ? (
                              <span className="text-red-400 font-bold">Only {hint.stock} left in stock!</span>
                            ) : (
                              <span className="font-mono text-white font-medium">${hint.price.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Nav Icons */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-2 hover:bg-white/10 rounded-xl transition-all text-white flex items-center justify-center cursor-pointer"
              title={theme === "light" ? "Switch to Cyber Theme" : "Switch to High-Contrast Light Mode"}
              id="theme-toggle-btn"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-indigo-500 fill-indigo-500/20" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400 fill-amber-400/20" />
              )}
            </button>

            {/* Wishlist Button (quick navigation) */}
            <button 
              onClick={() => onNavigate("favorites")} 
              className={`relative p-2 hover:bg-white/10 rounded-xl transition-colors ${currentPage === 'favorites' ? 'text-cyber-accent bg-white/5' : 'text-white'}`}
              title="View Wishlist"
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-bold flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button 
              onClick={onToggleCart} 
              className="relative p-2 hover:bg-white/10 rounded-xl transition-colors text-white"
              title="Open Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyber-primary rounded-full text-xs font-bold flex items-center justify-center logo-bounce">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* User Section */}
            {currentUser ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1.5 hover:bg-white/10 rounded-xl transition-colors text-white shrink-0"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyber-primary to-cyber-secondary flex items-center justify-center text-xs font-bold select-none">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline text-xs font-medium max-w-[80px] truncate">
                    {currentUser.name.split(" ")[0]}
                  </span>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 z-50 animate-fade-in-up">
                      <div className="px-3 py-2 border-b border-white/5 mb-1.5 overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                      </div>
                      <button 
                        onClick={() => { onNavigate("profile"); setShowUserMenu(false); }}
                        className="w-full text-left flex items-center space-x-2 px-3 py-2 text-xs rounded-lg hover:bg-white/10 text-slate-200"
                      >
                        <UserIcon className="w-4 h-4 text-cyber-accent" />
                        <span>My Profile</span>
                      </button>
                      <button 
                        onClick={() => { onNavigate("delivery"); setShowUserMenu(false); }}
                        className="w-full text-left flex items-center space-x-2 px-3 py-2 text-xs rounded-lg hover:bg-white/10 text-slate-200"
                      >
                        <Map className="w-4 h-4 text-cyber-accent" />
                        <span>Track Deliveries</span>
                      </button>
                      <button 
                        onClick={() => { onLogout(); setShowUserMenu(false); }}
                        className="w-full text-left flex items-center space-x-2 px-3 py-2 text-xs rounded-lg hover:bg-white/10 text-rose-400 mt-1 pt-1.5 border-t border-white/5"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-cyber-primary to-cyber-secondary hover:from-cyber-primary/95 hover:to-cyber-secondary/95 text-white rounded-xl text-xs font-bold transition-all"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger menu */}
            <button 
              onClick={() => onNavigate("mobile-menu")} 
              className="md:hidden p-2 hover:bg-white/10 rounded-xl text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
