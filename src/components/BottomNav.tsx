import React, { useState } from "react";
import { Home, Store, Heart, Truck, User, MessageSquare } from "lucide-react";
import { MessagePlatform } from "../types";

interface BottomNavProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  favoritesCount: number;
  platforms: MessagePlatform[];
}

export default function BottomNav({
  onNavigate,
  currentPage,
  favoritesCount,
  platforms
}: BottomNavProps) {
  const [showSupportMenu, setShowSupportMenu] = useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-lg border-t border-white/10 z-40 lg:hidden py-2.5 shrink-0">
      <div className="relative flex justify-around items-center max-w-md mx-auto px-1">
        {/* Dynamic dropup submenu */}
        {showSupportMenu && (
          <>
            <div className="fixed inset-0 bg-black/45 backdrop-blur-[1px] z-40" onClick={() => setShowSupportMenu(false)} />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-950 border border-white/15 rounded-2xl p-3.5 shadow-2.5xl z-50 flex flex-col space-y-2 w-48 animate-fade-in-up">
              <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider text-center border-b border-white/10 pb-2">Support Channels</p>
              {platforms.filter(p => p.isActive).length === 0 ? (
                <p className="text-[10px] text-slate-500 text-center py-2">No channels configured</p>
              ) : (
                platforms.filter(p => p.isActive).map((p) => (
                  <a
                    key={p.id}
                    href={p.value}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setShowSupportMenu(false)}
                    className="flex items-center justify-between px-3 py-2.5 bg-white/5 hover:bg-cyber-primary/20 rounded-xl text-xs text-white transition-all border border-white/5 active:scale-95"
                  >
                    <span className="font-bold">{p.name}</span>
                    <span className="text-[8px] uppercase tracking-wide px-1.5 py-0.5 bg-cyber-primary/20 text-cyber-accent rounded font-mono">Live</span>
                  </a>
                ))
              )}
            </div>
          </>
        )}

        <a 
          href="#/home"
          onClick={() => { setShowSupportMenu(false); }} 
          className={`flex flex-col items-center p-2.5 min-w-[44px] min-h-[44px] justify-center cursor-pointer transition-colors rounded-xl ${
            currentPage === "home" && !showSupportMenu ? "text-cyber-accent" : "text-slate-400 hover:text-white"
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-medium font-sans">Home</span>
        </a>

        <a 
          href="#/shop"
          onClick={() => { setShowSupportMenu(false); }} 
          className={`flex flex-col items-center p-2.5 min-w-[44px] min-h-[44px] justify-center cursor-pointer transition-colors rounded-xl ${
            currentPage === "shop" && !showSupportMenu ? "text-cyber-accent" : "text-slate-400 hover:text-white"
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-medium font-sans">Shop</span>
        </a>

        <a 
          href="#/favorites"
          onClick={() => { setShowSupportMenu(false); }} 
          className={`flex flex-col items-center p-2.5 min-w-[44px] min-h-[44px] justify-center relative cursor-pointer transition-colors rounded-xl ${
            currentPage === "favorites" && !showSupportMenu ? "text-cyber-accent" : "text-slate-400 hover:text-white"
          }`}
        >
          <Heart className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-medium font-sans">Wishlist</span>
          {favoritesCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-rose-500 rounded-full text-[8px] font-bold flex items-center justify-center text-white">
              {favoritesCount}
            </span>
          )}
        </a>

        {/* Support message tab button */}
        <button 
          onClick={() => setShowSupportMenu(!showSupportMenu)} 
          className={`flex flex-col items-center p-2.5 min-w-[44px] min-h-[44px] justify-center cursor-pointer transition-colors rounded-xl ${
            showSupportMenu ? "text-cyber-accent" : "text-slate-400 hover:text-white"
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-medium font-sans">Support</span>
        </button>

        <a 
          href="#/delivery"
          onClick={() => { setShowSupportMenu(false); }} 
          className={`flex flex-col items-center p-2.5 min-w-[44px] min-h-[44px] justify-center cursor-pointer transition-colors rounded-xl ${
            currentPage === "delivery" && !showSupportMenu ? "text-cyber-accent" : "text-slate-400 hover:text-white"
          }`}
        >
          <Truck className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-medium font-sans">Delivery</span>
        </a>

        <a 
          href="#/profile"
          onClick={() => { setShowSupportMenu(false); }} 
          className={`flex flex-col items-center p-2.5 min-w-[44px] min-h-[44px] justify-center cursor-pointer transition-colors rounded-xl ${
            currentPage === "profile" && !showSupportMenu ? "text-cyber-accent" : "text-slate-400 hover:text-white"
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-medium font-sans">Profile</span>
        </a>
      </div>
    </nav>
  );
}
