import { useState } from "react";
import { 
  Home, Store, Heart, MessageSquare, Truck, Info, ChevronDown, Headphones, Watch, MousePointer, 
  Database, Plug, Camera, Eye, Cpu, MessageCircle 
} from "lucide-react";
import { Category } from "../types";

interface SidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onNavigate: (page: string) => void;
  currentPage: string;
  favoritesCount: number;
}

export default function Sidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  onNavigate,
  currentPage,
  favoritesCount
}: SidebarProps) {
  const [showMsgDropdown, setShowMsgDropdown] = useState(false);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "fa-headphones": return <Headphones className="w-4 h-4" />;
      case "fa-clock": return <Watch className="w-4 h-4" />;
      case "fa-mouse": return <MousePointer className="w-4 h-4" />;
      case "fa-database": return <Database className="w-4 h-4" />;
      case "fa-plug": return <Plug className="w-4 h-4" />;
      case "fa-camera": return <Camera className="w-4 h-4" />;
      case "fa-vr-cardboard": return <Eye className="w-4 h-4" />;
      case "fa-home": return <Cpu className="w-4 h-4" />;
      default: return <Plug className="w-4 h-4" />;
    }
  };

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-slate-950/80 backdrop-blur-md border-r border-white/10 hidden lg:block z-35 overflow-y-auto p-5 scrollbar-thin">
      <nav className="space-y-1.5">
        <a 
          href="#/home"
          onClick={() => { onSelectCategory(null); }}
          className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all font-medium text-xs text-left ${
            currentPage === "home" && !selectedCategory
              ? "bg-cyber-primary/20 text-white border-l-2 border-cyber-primary" 
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </a>

        <a 
          href="#/shop"
          onClick={() => { onSelectCategory(null); }}
          className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all font-medium text-xs text-left ${
            currentPage === "shop" && !selectedCategory
              ? "bg-cyber-primary/20 text-white border-l-2 border-cyber-primary" 
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>All Gadgets</span>
        </a>

        <a 
          href="#/favorites"
          className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all font-medium text-xs text-left ${
            currentPage === "favorites" 
              ? "bg-cyber-primary/20 text-white border-l-2 border-cyber-primary" 
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Favorites</span>
          {favoritesCount > 0 && (
            <span className="ml-auto bg-cyber-primary/20 text-cyber-accent text-[10px] font-bold px-2 py-0.5 rounded-full">
              {favoritesCount}
            </span>
          )}
        </a>

        <a 
          href="#/admin"
          className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all font-medium text-xs text-left ${
            currentPage === "admin" 
              ? "bg-cyber-primary/20 text-white border-l-2 border-cyber-primary" 
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Cpu className="w-4 h-4 text-cyber-accent" />
          <span>Admin Controls Console</span>
        </a>

        <a 
          href="#/delivery"
          className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all font-medium text-xs text-left ${
            currentPage === "delivery" 
              ? "bg-cyber-primary/20 text-white border-l-2 border-cyber-primary" 
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>My Delivery</span>
        </a>

        <a 
          href="#/about"
          className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all font-medium text-xs text-left ${
            currentPage === "about" 
              ? "bg-cyber-primary/20 text-white border-l-2 border-cyber-primary" 
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Info className="w-4 h-4" />
          <span>About TukTak</span>
        </a>
      </nav>

      {/* Catalog Categories listing */}
      <div className="mt-7">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 px-3">
          Product Categories
        </h3>
        <div className="space-y-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <a
                key={cat.id}
                href="#/shop"
                onClick={() => { onSelectCategory(cat.id); }}
                className={`w-full flex items-center space-x-3 p-2.5 rounded-lg transition-all text-xs text-left ${
                  isSelected 
                    ? "bg-gradient-to-r from-cyber-primary/35 to-cyber-secondary/15 text-white font-medium" 
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                }`}
              >
                <div className={`p-1.5 rounded-lg bg-slate-900 border border-white/5 ${isSelected ? "text-cyber-accent" : "text-slate-400"}`}>
                  {getCategoryIcon(cat.icon)}
                </div>
                <span className="truncate">{cat.name}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Campaign Banner card */}
      <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-cyber-primary/20 via-cyber-secondary/5 to-cyber-accent/5 border border-cyber-primary/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-cyber-primary/10 rounded-full blur-xl"></div>
        <div className="flex items-start space-x-3 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-cyber-primary/30 flex items-center justify-center pulse-glow shrink-0 mt-0.5">
            <Truck className="text-cyber-accent w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">Free Express Delivery</p>
            <p className="text-[10px] text-slate-400 mt-1">Automatically applied for orders totaling over $50.00 USD.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
