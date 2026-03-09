"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  X,
  Trash2,
  Users,
  Loader2,
  CreditCard,
} from "lucide-react";
import CheckoutModal from "./CheckoutModal";

interface CartItem {
  eventId: {
    _id: string;
    eventId: string;
    title: string;
    fees: number;
    category: string;
  } | null;
  selectedMembers: {
    _id: string;
    username: string;
    email: string;
  }[];
  addedAt: string;
  ticketType?: string;
  price?: number;
}

interface CartData {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  expiresAt?: string;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCartUpdate?: (count: number) => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  onCartUpdate,
}: CartSidebarProps) {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  async function fetchCart() {
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data);
        onCartUpdate?.(data.itemCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  }

  async function removeFromCart(eventId: string) {
    setRemoving(eventId);
    try {
      const res = await fetch(`/api/cart?eventId=${eventId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    } finally {
      setRemoving(null);
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
              onClick={onClose}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-[101] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#00F0FF]/10 rounded-xl flex items-center justify-center">
                    <ShoppingCart size={20} className="text-[#00F0FF]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white font-mono uppercase">
                      Your Cart
                    </h2>
                    <p className="text-xs text-zinc-500 font-mono">
                      {cart?.itemCount || 0} event
                      {(cart?.itemCount || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={20} className="text-zinc-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-48">
                    <Loader2
                      className="animate-spin text-[#00F0FF]"
                      size={32}
                    />
                    <p className="text-zinc-500 font-mono text-sm mt-3">
                      Loading cart...
                    </p>
                  </div>
                ) : !cart?.items?.length ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4">
                      <ShoppingCart size={28} className="text-zinc-700" />
                    </div>
                    <p className="text-zinc-400 font-mono text-sm">
                      Your cart is empty
                    </p>
                    <p className="text-zinc-600 font-mono text-xs mt-1">
                      Add events from the Events page
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.items.map((item, index) => (
                      <div
                        key={item.eventId?._id || `item-${index}`}
                        className="bg-[#111] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all"
                      >
                        <div className="flex justify-between items-start gap-3">
                          {!item.eventId ? (
                            <div className="flex-1">
                              <p className="text-red-400 font-mono text-xs">
                                Event no longer available
                              </p>
                            </div>
                          ) : (
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] px-2 py-0.5 bg-[#00F0FF]/10 text-[#00F0FF] rounded font-mono uppercase">
                                  {item.eventId.category}
                                </span>
                              </div>
                              <h3 className="text-white font-bold font-mono text-sm uppercase">
                                {item.eventId.title}
                              </h3>
                                                            {item.ticketType && (
                                                                <span className="text-[10px] text-[#E661FF] font-black uppercase mt-1 block">
                                                                    {item.ticketType} Ticket
                                                                </span>
                                                            )}

                              {/* Selected Members */}
                              <div className="flex items-center gap-2 mt-3">
                                <Users size={12} className="text-zinc-500" />
                                <span className="text-xs text-zinc-400 font-mono">
                                  {item.selectedMembers.length} member
                                  {item.selectedMembers.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.selectedMembers
                                  .slice(0, 3)
                                  .map((member) => (
                                    <span
                                      key={member._id}
                                      className="text-[10px] px-2 py-1 bg-zinc-800 text-zinc-400 rounded font-mono"
                                    >
                                      {member.username ||
                                        member.email?.split("@")[0]}
                                    </span>
                                  ))}
                                {item.selectedMembers.length > 3 && (
                                  <span className="text-[10px] px-2 py-1 bg-zinc-800 text-zinc-500 rounded font-mono">
                                    +{item.selectedMembers.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col items-end gap-2">
                                                        <span className="text-lg font-black text-white font-mono">
                                                            {!item.eventId ? "---" : (item.price === 0 ? "FREE" : `₹${item.price}`)}
                                                        </span>
                                                        <button
                                                            onClick={() => removeFromCart(item.eventId?.eventId || "")}
                                                            disabled={removing === item.eventId?.eventId}
                                                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group disabled:opacity-50"
                                                        >
                                                            {removing === item.eventId?.eventId ? (
                                                                <Loader2 size={16} className="animate-spin text-red-400" />
                                                            ) : (
                                                                <Trash2 size={16} className="text-zinc-500 group-hover:text-red-400" />
                                                            )}
                                                        </button>
                                                    </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cart?.items?.length ? (
                <div className="p-6 border-t border-white/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 font-mono text-sm">
                      Total
                    </span>
                    <span className="text-2xl font-black text-white font-mono">
                      {cart.totalAmount === 0 ? "FREE" : `₹${cart.totalAmount}`}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setCheckoutOpen(true);
                      onClose();
                    }}
                    className="w-full py-4 bg-[#00F0FF] text-black font-black font-mono text-sm rounded-xl uppercase hover:bg-[#00F0FF]/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <CreditCard size={18} />
                    Proceed to Checkout
                  </button>

                  <p className="text-center text-zinc-600 font-mono text-[10px]">
                    Pay via UPI • Manual verification
                  </p>
                </div>
              ) : null}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal - Rendered outside AnimatePresence so it stays open when cart closes */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={() => {
          setCheckoutOpen(false);
          fetchCart();
          onClose();
        }}
      />
    </>
  );
}

// Cart Icon Button Component (to use in header/layout)
export function CartIconButton({
  onClick,
  itemCount,
}: {
  onClick: () => void;
  itemCount: number;
}) {
  return (
    <button
      onClick={onClick}
      className="relative p-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-xl border border-zinc-700/50 transition-all group"
    >
      <ShoppingCart
        size={20}
        className="text-zinc-400 group-hover:text-[#00F0FF] transition-colors"
      />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00F0FF] text-black text-[10px] font-black rounded-full flex items-center justify-center">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </button>
  );
}
