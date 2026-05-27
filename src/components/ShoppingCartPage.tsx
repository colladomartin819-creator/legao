import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, Trash2, Plus, Minus, ArrowLeft, Ticket, ShieldCheck, 
  Truck, Award, Sparkles, CheckCircle, CreditCard, RefreshCw, Layers, ExternalLink
} from "lucide-react";
import { CartItem, LegoSet } from "../types";

interface ShoppingCartPageProps {
  cart: CartItem[];
  updateCartQty: (setId: string, delta: number) => void;
  removeFromCart: (setId: string) => void;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  appliedPromo: string | null;
  promoInput: string;
  setPromoInput: (val: string) => void;
  applyPromoCode: (e: React.FormEvent) => void;
  promoError: string;
  insiderPoints: number;
  setInsiderPoints: React.Dispatch<React.SetStateAction<number>>;
  setActiveTab: (tab: 'Hot Sellers' | 'Marvel' | 'Ninjago' | 'Technic') => void;
}

export default function ShoppingCartPage({
  cart,
  updateCartQty,
  removeFromCart,
  subtotal,
  discountAmount,
  taxAmount,
  shippingCost,
  totalAmount,
  appliedPromo,
  promoInput,
  setPromoInput,
  applyPromoCode,
  promoError,
  insiderPoints,
  setInsiderPoints,
  setActiveTab
}: ShoppingCartPageProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"review" | "payment" | "success">("review");
  const [paymentName, setPaymentName] = useState("");
  const [paymentCard, setPaymentCard] = useState("");
  const [paymentExpiry, setPaymentExpiry] = useState("");
  const [paymentCvv, setPaymentCvv] = useState("");
  const [checkoutError, setCheckoutError] = useState("");

  const freeShippingThreshold = 150;
  const progressToFreeShipping = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  // Calculate dynamic VIP points earned from current transaction
  const vipPointsEarned = cart.reduce((sum, item) => sum + (item.set.specifications.insiderPoints * item.quantity), 0);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentName.trim() || paymentCard.length < 16) {
      setCheckoutError("Please enter valid luxury credit card credentials to process transaction.");
      return;
    }
    setCheckoutError("");
    setIsCheckingOut(true);

    // Simulate luxury blockchain payment validation
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutStep("success");
      // Add VIP points to active account
      setInsiderPoints(prev => prev + vipPointsEarned);
    }, 2000);
  };

  const handleApplyQuickCode = (code: string) => {
    setPromoInput(code);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 font-sans text-neutral-100">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-neutral-800 pb-6">
        <div>
          <span className="text-amber-400 text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> SUNTY LUXURY BOUTIQUE
          </span>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2 mt-1">
            <ShoppingBag className="w-8 h-8 text-amber-400" />
            Your Crate Collection
          </h1>
        </div>

        <button
          onClick={() => setActiveTab("Hot Sellers")}
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Keep Exploring Bricks
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: ITEMS LIST & CHECKOUT CARD */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* FREE SHIPPING PROGRESS BANNER */}
          {cart.length > 0 && (
            <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-400" />
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <div className="flex items-center gap-2 text-neutral-200">
                  <Truck className="w-4.5 h-4.5 text-amber-400 hover:rotate-12 transition duration-250" />
                  {progressToFreeShipping >= 100 ? (
                    <span className="text-emerald-400">🎉 Congratulations! You qualify for FREE Luxury Shipping!</span>
                  ) : (
                    <span>Add <strong className="text-amber-400">${amountNeededForFreeShipping.toFixed(2)}</strong> more to unlock FREE shipping!</span>
                  )}
                </div>
                <span className="text-neutral-400 font-mono text-[10px]">{Math.round(progressToFreeShipping)}%</span>
              </div>
              <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-850">
                <motion.div 
                  className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToFreeShipping}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          {/* MAIN CART CONTENT */}
          <AnimatePresence mode="wait">
            {cart.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-neutral-950 border border-neutral-800/80 rounded-full flex items-center justify-center mx-auto shadow-inner text-neutral-600">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-neutral-200">Your shopping cart is currently empty</h3>
                  <p className="text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed font-sans">
                    You haven't added any premium LEGO sets yet. Explore our sub-theme sectors below to locate your dream display builds!
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button 
                    onClick={() => setActiveTab("Hot Sellers")}
                    className="bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl transition shadow-lg cursor-pointer"
                  >
                    🔥 Star Wars / Hot Sellers
                  </button>
                  <button 
                    onClick={() => setActiveTab("Marvel")}
                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl transition shadow-lg cursor-pointer"
                  >
                    🔴 Marvel Superheroes
                  </button>
                  <button 
                    onClick={() => setActiveTab("Technic")}
                    className="bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl transition shadow-lg cursor-pointer"
                  >
                    ⚙️ Technic Lab
                  </button>
                </div>
              </motion.div>
            ) : checkoutStep === "review" ? (
              <motion.div 
                key="review"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl"
              >
                <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-850 flex items-center justify-between text-xs font-bold text-neutral-400">
                  <span>Selected Bricks Crate ({cart.reduce((s, i) => s + i.quantity, 0)} Units)</span>
                  <span className="font-mono">SYS_VERIFIED</span>
                </div>

                <div className="divide-y divide-neutral-850">
                  {cart.map((item) => (
                    <motion.div 
                      key={item.set.id}
                      layout
                      className="p-6 flex flex-col sm:flex-row gap-5 hover:bg-neutral-950/20 transition-all duration-200"
                    >
                      {/* Image Preview */}
                      <div className="w-full sm:w-28 h-28 shrink-0 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950">
                        <img 
                          src={item.set.image} 
                          alt={item.set.name} 
                          className="w-full h-full object-cover filter brightness-95"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Info Panel */}
                      <div className="flex-grow flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-start justify-between">
                            <h3 className="text-base font-black text-white hover:text-amber-400 transition leading-snug cursor-pointer"
                                onClick={() => setActiveTab(item.set.theme === 'Technic' ? 'Technic' : item.set.theme === 'Marvel' ? 'Marvel' : item.set.theme === 'Ninjago' ? 'Ninjago' : 'Hot Sellers')}
                            >
                              {item.set.name}
                            </h3>
                            <button 
                              onClick={() => removeFromCart(item.set.id)}
                              className="text-neutral-500 hover:text-red-500 transition p-1"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="bg-neutral-950 text-amber-400 border border-neutral-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                              {item.set.theme}
                            </span>
                            <span className="text-neutral-500 text-[10px] font-semibold leading-normal font-mono">
                              ID: {item.set.specifications.itemNumber} • {item.set.pieces} Bricks
                            </span>
                          </div>
                        </div>

                        {/* Interactive adjustments */}
                        <div className="flex items-center justify-between pt-2 border-t border-neutral-850/65">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider font-mono">QTY:</span>
                            <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl p-1">
                              <button 
                                onClick={() => updateCartQty(item.set.id, -1)}
                                className="p-1.5 text-neutral-400 hover:text-white transition cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-black text-neutral-200 w-6 text-center font-mono">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => updateCartQty(item.set.id, 1)}
                                className="p-1.5 text-neutral-400 hover:text-white transition cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] text-neutral-500 block uppercase font-mono">Set Price</span>
                            <span className="font-extrabold text-white font-mono">${(item.set.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* VIP points indicator bottom bar */}
                <div className="bg-gradient-to-r from-neutral-950 to-neutral-900 px-6 py-4 border-t border-neutral-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Award className="w-5 h-5 text-amber-400 animate-pulse" />
                    <span>Double Insiders VIP rewards: Collect <strong className="font-extrabold font-mono text-white">+{vipPointsEarned} pts</strong> from this order!</span>
                  </div>
                  <span className="text-neutral-500 text-[10px] uppercase font-mono">Secured Sunty Terminal</span>
                </div>
              </motion.div>
            ) : checkoutStep === "payment" ? (
              <motion.div 
                key="payment"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
                  <CreditCard className="w-6 h-6 text-amber-400" />
                  <div>
                    <h2 className="text-lg font-extrabold text-white uppercase tracking-tight">Luxury Card Payment Validation</h2>
                    <p className="text-xs text-neutral-400 font-sans mt-0.5">Please provide credit card credentials to secure transaction block allocation.</p>
                  </div>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-neutral-400 uppercase font-bold block tracking-wider font-mono">Card Holder Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Alexis Harrington"
                      value={paymentName}
                      onChange={(e) => setPaymentName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-250 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-neutral-400 uppercase font-bold block tracking-wider font-mono">Card Number</label>
                      <input 
                        type="text" 
                        required
                        maxLength={16}
                        placeholder="4532 8940 3381 0495"
                        value={paymentCard}
                        onChange={(e) => setPaymentCard(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-250 font-mono tracking-widest focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-neutral-400 uppercase font-bold block tracking-wider font-mono">Expiry Date</label>
                        <input 
                          type="text" 
                          required
                          maxLength={5}
                          placeholder="MM/YY"
                          value={paymentExpiry}
                          onChange={(e) => setPaymentExpiry(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-3 text-sm text-neutral-250 font-mono focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-neutral-400 uppercase font-bold block tracking-wider font-mono">CVV Secure Key</label>
                        <input 
                          type="password" 
                          required
                          maxLength={3}
                          placeholder="***"
                          value={paymentCvv}
                          onChange={(e) => setPaymentCvv(e.replace(/\D/g, ""))}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-3 text-sm text-neutral-250 font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {checkoutError && (
                    <div className="text-red-400 text-xs bg-red-950/20 border border-red-900/35 p-3 rounded-lg font-mono">
                      ⚠️ {checkoutError}
                    </div>
                  )}

                  {/* Submit options */}
                  <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-4 font-sans">
                    <button 
                      type="button"
                      onClick={() => setCheckoutStep("review")}
                      className="text-xs text-neutral-400 hover:text-white font-bold tracking-wide uppercase"
                    >
                      Back to Review
                    </button>
                    <button 
                      type="submit"
                      disabled={isCheckingOut}
                      className="bg-amber-400 hover:bg-amber-300 disabled:opacity-55 text-neutral-950 text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-xl transition flex items-center gap-2 shadow-lg"
                    >
                      {isCheckingOut ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Securing Order...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Validate Payment & Build Crate
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              // STEP 3: SUCCESS BLOCK DESIGN INTENT
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-neutral-900 border-2 border-amber-500/30 rounded-3xl p-8 text-center space-y-6 relative overflow-hidden"
              >
                {/* Visual celebratory lights */}
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="w-20 h-20 bg-emerald-950/60 border-2 border-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/30 text-emerald-400 animate-bounce">
                  <CheckCircle className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-black tracking-widest bg-emerald-950/80 px-3.5 py-1 rounded border border-emerald-500/15">
                    SYS_ALLOCATION: SUCCESSFUL
                  </span>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-3">Luxury Blocks Dispatched</h2>
                  <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed font-sans">
                    Gratitude Alexis Harrington! Your bespoke brick crates are booked and being allocated by our mechanical warehouse handlers right now.
                  </p>
                </div>

                {/* Simulated luxury dispatch tracking card */}
                <div className="bg-neutral-950 rounded-2xl border border-neutral-850 p-5 max-w-sm mx-auto space-y-3.5 text-xs text-neutral-300 font-mono text-left">
                  <div className="flex justify-between border-b border-neutral-850 pb-2">
                    <span className="text-neutral-500">SECURE DISPATCH TRACKING:</span>
                    <span className="text-amber-400 font-extrabold font-mono">#SN-{Math.floor(100000 + Math.random() * 900000)}Y</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">POINTS ALLOCATED:</span>
                      <span className="text-emerald-400">+{vipPointsEarned} VIP Points Added</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">SHIPPING HUB:</span>
                      <span className="text-neutral-300">Central Sunty UAE Depot</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">EST DISPATCH TIME:</span>
                      <span className="text-neutral-300">Within 24 Hours</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => {
                      // Reset Cart & Go to Hot Sellers page
                      localStorage.removeItem("brickworld_cart");
                      window.location.reload(); 
                    }}
                    className="bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-black uppercase tracking-wider px-8 py-3.5 rounded-xl transition shadow-lg cursor-pointer inline-flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4" /> Start Next Lego Blueprint Project
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUNTY LUXURY TRUST BADGES */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
            <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-2xl flex items-start gap-3.5 text-left">
              <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wide">Fully Insured Delivery</h4>
                <p className="text-[10px] text-neutral-500 leading-normal mt-0.5">Every brick is secured in customized foam cases with high-fidelity tracking protection keys.</p>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-2xl flex items-start gap-3.5 text-left">
              <Award className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wide">Dynamic VIP Accrual</h4>
                <p className="text-[10px] text-neutral-500 leading-normal mt-0.5">Double rewards points applied automatically allowing next-crate massive discounts.</p>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-2xl flex items-start gap-3.5 text-left">
              <Truck className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wide">Fast UAE Delivery</h4>
                <p className="text-[10px] text-neutral-500 leading-normal mt-0.5">Dispatched directly from central Dubai warehouses with door-step custom delivery options.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REWARD STATUS & DRAFT SUMMARY */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* USER POINTS OVERVIEW */}
          <div className="bg-[#110e08]/90 border border-amber-600/25 p-5 rounded-3xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/5 rounded-full blur-[40px] pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-amber-600/15">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="font-mono text-xs text-amber-400 uppercase tracking-widest font-black">VIP INSIDERS NETWORK</h3>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-neutral-400 font-sans">Active Accumulation</span>
              <span className="text-2xl font-black text-amber-400 font-mono tracking-tight">{insiderPoints.toLocaleString()} PTS</span>
            </div>

            <p className="text-[10px] text-neutral-500 leading-relaxed font-sans mt-2.5">
              Accumulate points representing your passion for craftsmanship. Trade points for discounts, rare collectible blueprint files and exclusive box sets.
            </p>
          </div>

          {/* DYNAMIC SUM BOARD CARD */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-neutral-200 uppercase tracking-wider pb-3 border-b border-neutral-850">
              Bricks Crate Summary
            </h3>

            <div className="space-y-3.5 text-xs text-neutral-300 font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase font-semibold">Crate Items:</span>
                <span className="text-neutral-100">{cart.reduce((s, i) => s + i.quantity, 0)} sets</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase font-semibold">Raw Subtotal:</span>
                <span className="text-neutral-100">${subtotal.toFixed(2)}</span>
              </div>

              {appliedPromo && (
                <div className="flex justify-between text-emerald-400">
                  <span className="uppercase font-semibold text-emerald-500/90">PROMO BRICK10 (10%):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase font-semibold">Insured Shipping:</span>
                {shippingCost === 0 ? (
                  <span className="text-emerald-400 font-bold uppercase text-[10px]">FREE SHIPPING</span>
                ) : (
                  <span className="text-neutral-100">${shippingCost.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase font-semibold">VAT (8%):</span>
                <span className="text-neutral-100">${taxAmount.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white uppercase font-sans">Total Price</span>
                <span className="text-2xl font-black text-white font-mono tracking-tight">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo application submission */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-neutral-850 space-y-2.5">
                <form onSubmit={applyPromoCode} className="flex gap-2">
                  <div className="relative flex-grow">
                    <Ticket className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                    <input 
                      type="text" 
                      placeholder="Coupon Code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 pl-9 pr-3 text-xs text-neutral-200 uppercase tracking-widest placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white px-3 py-2 rounded-xl border border-neutral-750 font-sans transition"
                  >
                    Apply
                  </button>
                </form>

                {/* Micro Quick Codes recommendations */}
                {!appliedPromo && (
                  <div className="bg-neutral-950/45 p-3.5 rounded-2xl border border-neutral-850/80 text-left">
                    <span className="text-[9px] text-neutral-500 uppercase font-black tracking-wider block mb-1">RECOMMENDED QUICK PROMO:</span>
                    <button 
                      onClick={() => handleApplyQuickCode("BRICK10")}
                      className="text-[11px] text-amber-300 font-mono font-black border border-dashed border-amber-500/25 bg-amber-950/20 px-2 py-1 rounded inline-flex items-center gap-1 hover:bg-amber-950/40 transition uppercase"
                    >
                      <span>Apply "BRICK10"</span> <span className="text-[9px] text-neutral-400">(10% OFF coupon)</span>
                    </button>
                  </div>
                )}

                {promoError && (
                  <p className="text-red-400 text-[11px] font-mono">{promoError}</p>
                )}
                {appliedPromo && (
                  <p className="text-emerald-400 text-[11px] font-mono flex items-center gap-1.5 justify-center">
                    <CheckCircle className="w-3.5 h-3.5" /> Promo "{appliedPromo}" processed on subtotal!
                  </p>
                )}
              </div>
            )}

            {/* CHECKOUT BUTTON */}
            {cart.length > 0 && checkoutStep === "review" && (
              <button 
                onClick={() => setCheckoutStep("payment")}
                className="w-full bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-black uppercase tracking-wider py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/5 cursor-pointer"
              >
                Assemble Delivery Details <CreditCard className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* SUNTY LUXURY SPECIAL NOTE OVERVIEW */}
          <div className="bg-neutral-900/60 border border-neutral-850 p-5 rounded-3xl text-xs space-y-3 font-sans">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-amber-500" />
              <h4 className="font-bold text-neutral-200 uppercase tracking-wide">Sunty UAE Heritage</h4>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed text-left">
              Sunty luxury is dedicated to bringing authentic, highly detailed showcase collections to premium craft collectors across the Emirates. Secure storage guarantees item integrity remains flawless upon receipt.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
