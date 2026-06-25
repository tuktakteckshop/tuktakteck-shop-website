import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { CartItem, Product } from "../types";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  products: Product[];
  onUpdateQuantity: (productId: number, change: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckout: () => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cart,
  products,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartSidebarProps) {
  if (!isOpen) return null;

  // Resolve matching product information
  const cartWithInfo = cart.map((item) => {
    const prod = products.find((p) => p.id === item.id);
    return {
      ...item,
      info: prod
    };
  }).filter(item => item.info !== undefined);

  // Compute pricing
  const subtotal = cartWithInfo.reduce((sum, item) => {
    return sum + (item.info ? item.info.price * item.quantity : 0);
  }, 0);

  const deliveryCharge = subtotal >= 50.0 || subtotal === 0 ? 0 : 4.99;
  const totalVal = subtotal + deliveryCharge;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-950 border-l border-white/10 flex flex-col shadow-2xl">
          {/* Header Panel */}
          <div className="px-6 py-5 border-b border-white/15 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="text-cyber-primary w-5 h-5" />
              <h2 className="text-lg font-bold font-display text-white">Shopping Cart</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Contents list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {cartWithInfo.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-300">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 mt-1">Add items from the store to get started.</p>
                </div>
              </div>
            ) : (
              cartWithInfo.map((item) => {
                const prod = item.info!;
                return (
                  <div 
                    key={item.id}
                    className="flex items-center space-x-4 p-3 bg-slate-900/50 border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                  >
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      className="w-16 h-16 rounded-lg object-cover bg-slate-950 shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{prod.name}</h4>
                      <p className="text-[11px] text-cyber-accent font-medium mt-0.5">${prod.price.toFixed(2)} each</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/15 text-slate-300 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold font-mono text-white">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/15 text-slate-300 flex items-center justify-center transition-colors"
                          disabled={item.quantity >= prod.stock}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end justify-between shrink-0 h-16 py-1">
                      <p className="text-xs font-bold text-white font-mono">
                        ${(prod.price * item.quantity).toFixed(2)}
                      </p>
                      <button 
                        onClick={() => onRemoveItem(item.id)}
                        className="text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 p-1 rounded-md transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pricing computations Footer panel */}
          {cartWithInfo.length > 0 && (
            <div className="border-t border-white/15 px-6 py-6 bg-slate-950 space-y-4 shrink-0">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Delivery Charge</span>
                  <span className="font-mono">
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-400 font-bold">FREE</span>
                    ) : (
                      <span className="text-white">${deliveryCharge.toFixed(2)}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2.5 border-t border-white/5">
                  <span>Total Amount</span>
                  <span className="font-mono text-cyber-accent">${totalVal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={onCheckout}
                className="w-full mt-2 py-3 bg-gradient-to-r from-cyber-primary to-cyber-secondary hover:opacity-95 text-white rounded-xl text-xs font-bold transition-opacity shadow-lg shadow-cyber-primary/20"
              >
                Proceed to Secure Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
