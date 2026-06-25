import React from "react";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onSelect: (productId: number) => void;
  onToggleFavorite: (e: React.MouseEvent<Element, MouseEvent>, productId: number) => void;
  onAddToCart: (e: React.MouseEvent<Element, MouseEvent>, productId: number) => void;
  key?: any;
}

export default function ProductCard({
  product,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onAddToCart
}: ProductCardProps) {
  const discount = product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  // Star calculation
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <span key={i} className="relative inline-block w-3 h-3 text-yellow-400">
            <Star className="absolute top-0 left-0 w-3 h-3 text-slate-600" />
            <span className="absolute top-0 left-0 w-3 h-3 overflow-hidden w-[50%]">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            </span>
          </span>
        );
      } else {
        stars.push(<Star key={i} className="w-3 h-3 text-slate-600" />);
      }
    }
    return stars;
  };

  return (
    <div 
      onClick={() => onSelect(product.id)}
      className="group cursor-pointer bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-cyber-primary/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(99,102,241,0.12)] flex flex-col h-full"
    >
      {/* Product Image Panel */}
      <div className="aspect-square w-full relative bg-slate-950 overflow-hidden shrink-0">
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-rose-500 text-white font-black text-[10px] px-2 py-1 rounded-md z-10 uppercase tracking-wider">
            -{discount}% OFF
          </span>
        )}

        <button
          onClick={(e) => onToggleFavorite(e, product.id)}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-slate-950/70 border border-white/10 flex items-center justify-center hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${
              isFavorite ? "fill-rose-500 text-rose-500" : "text-slate-300 group-hover:text-white"
            }`} 
          />
        </button>

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {product.stock === 0 ? (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px] flex items-center justify-center z-10 select-none">
            <span className="text-red-500 font-black text-xs uppercase tracking-widest border-2 border-red-500/40 px-3 py-1 rounded bg-black/40">Out of Stock</span>
          </div>
        ) : product.stock <= 2 ? (
          <span className="absolute bottom-3 left-3 bg-rose-950/95 border border-rose-500/30 text-rose-400 font-black text-[9px] px-2 py-0.5 rounded-md z-10 uppercase tracking-wide font-mono">
            Only {product.stock} units left!
          </span>
        ) : null}
      </div>

      {/* Main Info Body */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] font-bold text-cyber-accent uppercase tracking-wider mb-1">
          {product.category}
        </span>
        
        <h3 className="font-semibold text-xs md:text-sm text-white group-hover:text-cyber-accent transition-colors truncate mb-1">
          {product.name}
        </h3>

        {/* Rating Block */}
        <div className="flex items-center space-x-1.5 mb-3.5">
          <div className="flex space-x-0.5">
            {renderStars(product.rating)}
          </div>
          <span className="text-[10px] text-slate-400">
            ({product.reviews.toLocaleString()})
          </span>
        </div>

        {/* Pricing tag & CTA */}
        <div className="mt-auto pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex items-baseline space-x-1.5 shrink-0">
            <span className="text-sm font-bold text-white">
              ${product.price.toFixed(2)}
            </span>
            {discount > 0 && (
              <span className="text-[10px] text-slate-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={(e) => onAddToCart(e, product.id)}
            className="w-full sm:w-auto px-3 py-1.5 bg-white/5 hover:bg-cyber-primary text-white rounded-xl text-[10px] font-bold transition-all flex items-center justify-center space-x-1 group/btn border border-white/5 hover:border-cyber-primary"
          >
            <ShoppingCart className="w-3 h-3 group-hover/btn:scale-110 transition-transform" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
