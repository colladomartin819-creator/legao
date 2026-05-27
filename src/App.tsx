import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Search, 
  Star, 
  Trash2, 
  ChevronRight, 
  X, 
  RotateCcw, 
  Calculator, 
  Sparkles, 
  Award, 
  Gift, 
  Wrench, 
  Compass, 
  Sliders, 
  Percent, 
  ShieldCheck, 
  TrendingUp, 
  Flame, 
  Zap, 
  Lightbulb, 
  ExternalLink,
  Plus,
  Minus,
  Check,
  User,
  Info
} from "lucide-react";
import { legoSets } from "./data";
import { LegoSet, CartItem } from "./types";
import LegoCursor from "./components/LegoCursor";
import ToonHubHero from "./components/ToonHubHero";
import ParallaxHero from "./components/ParallaxHero";
import FlipProductImage from "./components/FlipProductImage";
import SuntyLuxOverlay from "./components/SuntyLuxOverlay";
import ShoppingCartPage from "./components/ShoppingCartPage";
import { motion, AnimatePresence } from "motion/react";

// Staggered entry animation variants for multi-tab list loading
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 14
    }
  }
};

export default function App() {
  // Global States
  const [activeTab, setActiveTab] = useState<'Hot Sellers' | 'Marvel' | 'Ninjago' | 'Technic' | 'Cart'>('Hot Sellers');
  const [heroMode, setHeroMode] = useState<'parallax' | 'carousel'>('parallax');
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("brickworld_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSet, setSelectedSet] = useState<LegoSet | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [insiderPoints, setInsiderPoints] = useState<number>(() => {
    const saved = localStorage.getItem("brickworld_points");
    return saved ? parseInt(saved) : 1250;
  });
  
  // Promo codes
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState("");

  // Filter States (Hot Sellers page)
  const [priceMax, setPriceMax] = useState<number>(900);
  const [selectedAge, setSelectedAge] = useState<string>("All");
  
  // Insiders Trivia states
  const [triviaAnswer, setTriviaAnswer] = useState<string | null>(null);
  const [triviaRewardClaimed, setTriviaRewardClaimed] = useState(false);
  
  // Custom Reviews State (temporary local storage / memory)
  const [customReviews, setCustomReviews] = useState<Record<string, LegoSet['reviews']>>({});
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Marvel squad builder state
  const [marvelSquad, setMarvelSquad] = useState<string[]>(["Iron Man", "Captain America"]);
  
  // Ninjago mini game states
  const [ninjaCharacter, setNinjaCharacter] = useState<string>("Lloyd");
  const [ninjaTrainingPower, setNinjaTrainingPower] = useState<number>(50);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinScore, setSpinScore] = useState<number | null>(null);
  const [unlockedMinifigs, setUnlockedMinifigs] = useState<string[]>(["Kai", "Lloyd", "Zane"]);

  // Technic mechanical calculator state
  const [driveTeeth, setDriveTeeth] = useState<number>(24);
  const [drivenTeeth, setDrivenTeeth] = useState<number>(40);
  const [pneumaticPumpCount, setPneumaticPumpCount] = useState<number>(3); // PSI simulation

  // Persist cart
  useEffect(() => {
    localStorage.setItem("brickworld_cart", JSON.stringify(cart));
  }, [cart]);

  // Persist points
  useEffect(() => {
    localStorage.setItem("brickworld_points", insiderPoints.toString());
  }, [insiderPoints]);

  // Handle Cart Management
  const addToCart = (set: LegoSet) => {
    setCart(prev => {
      const existing = prev.find(item => item.set.id === set.id);
      if (existing) {
        return prev.map(item => item.set.id === set.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { set, quantity: 1 }];
    });
    // Add 10% of price as Insiders points
    const earnedPoints = Math.round(set.price * 0.15);
    setInsiderPoints(prev => prev + earnedPoints);
    
    // Quick success bounce
    const element = document.getElementById(`btn-${set.id}`);
    if (element) {
      element.innerHTML = "Added! ✓";
      element.classList.add("bg-emerald-600");
      setTimeout(() => {
        element.innerHTML = "Add to Bag";
        element.classList.remove("bg-emerald-600");
      }, 1000);
    }
  };

  const updateCartQty = (setId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.set.id === setId) {
          const nextQty = item.quantity + delta;
          return nextQty > 0 ? { ...item, quantity: nextQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (setId: string) => {
    setCart(prev => prev.filter(item => item.set.id !== setId));
  };

  // Computations
  const subtotal = cart.reduce((sum, item) => sum + (item.set.price * item.quantity), 0);
  const discountMultiplier = appliedPromo === "BRICK10" ? 0.10 : 0;
  const discountAmount = subtotal * discountMultiplier;
  const taxAmount = (subtotal - discountAmount) * 0.08;
  const shippingCost = subtotal > 150 || subtotal === 0 ? 0 : 15.00;
  const totalAmount = subtotal - discountAmount + taxAmount + shippingCost;
  const totalCartPieces = cart.reduce((sum, item) => sum + (item.set.pieces * item.quantity), 0);

  const applyPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput.trim().toUpperCase() === "BRICK10") {
      setAppliedPromo("BRICK10");
      setPromoError("");
    } else if (promoInput.trim() !== "") {
      setPromoError("Invalid code. Try 'BRICK10'");
    }
  };

  // Add Custom Review
  const handleAddReview = (e: React.FormEvent, setId: string) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    const newReview = {
      author: reviewName,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toISOString().split('T')[0]
    };

    setCustomReviews(prev => ({
      ...prev,
      [setId]: [newReview, ...(prev[setId] || [])]
    }));

    // Reset inputs
    setReviewName("");
    setReviewComment("");
    setReviewRating(5);
  };

  // Spinjitzu spin mini-game trigger
  const triggerSpinjitzu = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSpinScore(null);
    setTimeout(() => {
      const powerMultiplier = ninjaCharacter === "Kai" ? 1.4 : ninjaCharacter === "Lloyd" ? 1.6 : 1.2;
      const calculatedScore = Math.floor((ninjaTrainingPower * 12 + Math.random() * 200) * powerMultiplier);
      setSpinScore(calculatedScore);
      setIsSpinning(false);
      // Give simulated rewards points if high score!
      if (calculatedScore > 850) {
        setInsiderPoints(prev => prev + 25);
      }
    }, 1500);
  };

  // Toggle minifigure collector selection
  const toggleMinifigCollected = (name: string) => {
    setUnlockedMinifigs(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  // Toggle Marvel team builder
  const toggleMarvelSquad = (hero: string) => {
    setMarvelSquad(prev => 
      prev.includes(hero) 
        ? prev.filter(h => h !== hero) 
        : prev.length < 5 ? [...prev, hero] : prev
    );
  };

  // Trivia validation
  const checkTrivia = (choice: string) => {
    setTriviaAnswer(choice);
    if (choice === "wood" && !triviaRewardClaimed) {
      setInsiderPoints(prev => prev + 100);
      setTriviaRewardClaimed(true);
    }
  };

  // Filter products matching search and sliders
  const filteredSets = legoSets.filter(set => {
    const matchesSearch = set.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          set.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          set.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by screen themes
    let matchesTheme = true;
    if (activeTab === "Marvel") {
      matchesTheme = set.theme === "Marvel";
    } else if (activeTab === "Ninjago") {
      matchesTheme = set.theme === "Ninjago";
    } else if (activeTab === "Technic") {
      matchesTheme = set.theme === "Technic";
    } else {
      // Hot Sellers handles general, Icons, Star Wars & Hot sellers tag
      matchesTheme = set.price <= priceMax && (selectedAge === "All" || set.age === selectedAge);
    }

    return matchesSearch && matchesTheme;
  });

  const getSuntyTheme = (tab: typeof activeTab) => {
    switch (tab) {
      case 'Hot Sellers': return 'amber';
      case 'Marvel': return 'red';
      case 'Ninjago': return 'emerald';
      case 'Technic': return 'cyan';
      default: return 'amber';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-neutral-950 antialiased relative overflow-x-hidden">
      <SuntyLuxOverlay themeMode={getSuntyTheme(activeTab)} />
      <LegoCursor />
      {/* Dynamic LEGO Ribbon Header (Official Stylings) */}
      <div className="bg-amber-400 text-neutral-900 py-1.5 px-4 text-center text-xs font-semibold tracking-wide flex justify-between items-center relative overflow-hidden">
        <div className="hidden md:flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-red-600 animate-pulse" />
          <span>LEGENDARY REWARDS: Double Insiders Points on all Marvel & Icons builds!</span>
        </div>
        <div className="mx-auto md:mx-0 flex items-center gap-4">
          <span className="font-bold underline cursor-pointer hover:text-red-700" onClick={() => {
            alert("Promo Code: Use 'BRICK10' in cart to save 10% on your entire brick order today!");
          }}>
            🔑 Apply code "BRICK10" to get 10% OFF
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="font-medium">Free Shipping on orders over $150</span>
        </div>
      </div>

      {/* Main LEGO Navigation */}
      <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          
          {/* Main Logo & Red Stud Backing */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => { setActiveTab('Hot Sellers'); setSearchQuery(""); }}
              className="group flex items-center gap-2 font-black tracking-tighter text-2xl"
              id="brickworld-logo"
            >
              <div className="bg-red-600 text-amber-300 px-3.5 py-1.5 rounded-sm shadow-md flex flex-col items-center justify-center transform group-hover:scale-105 transition duration-200 uppercase" style={{ border: '3px solid #fcd34d' }}>
                <span className="leading-none text-white tracking-widest font-extrabold" style={{ textShadow: '2px 2px 0px #000' }}>BRICK</span>
                <span className="text-xs leading-none tracking-tight font-black" style={{ textShadow: '1px 1px 0px #000' }}>WORLD</span>
              </div>
            </button>

            {/* Sub-Theme Menu Selectors */}
            <nav className="hidden lg:flex items-center gap-1.5 text-sm font-semibold">
              {(['Hot Sellers', 'Marvel', 'Ninjago', 'Technic', 'Cart'] as const).map((tab) => {
                const isActive = activeTab === tab;
                const activeColors = 
                  tab === 'Marvel' ? 'bg-red-900/60 border-red-500 text-red-200' :
                  tab === 'Ninjago' ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' :
                  tab === 'Technic' ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300' :
                  tab === 'Cart' ? 'bg-amber-505/20 border-amber-400 text-amber-300' :
                  'bg-amber-400 text-neutral-950 border-amber-300';
                  
                return (
                  <button
                    key={tab}
                    id={`tab-${tab.toLowerCase().replace(' ', '-')}`}
                    onClick={() => { setActiveTab(tab); setSearchQuery(""); }}
                    className={`px-4 py-2 rounded-md border transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? `${activeColors} shadow-lg shadow-black/40 scale-105` 
                        : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    {tab === 'Marvel' && '🔴 Marvel Superheroes'}
                    {tab === 'Ninjago' && '🐉 Ninjago Legacy'}
                    {tab === 'Technic' && '⚙️ Technic Lab'}
                    {tab === 'Hot Sellers' && '🔥 Hot Sellers'}
                    {tab === 'Cart' && `🛒 Luxury Cart (${cart.reduce((s, i) => s + i.quantity, 0)})`}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search Input, Cart and VIP Insiders status */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xs md:max-w-md justify-end">
            
            {/* Quick Search */}
            <div className="relative w-full hidden sm:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search rare bricks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-full py-2 pl-9 pr-4 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-300">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Insiders Reward Widget Link */}
            <div className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700/80 px-2.5 py-1.5 rounded-lg border border-neutral-700 text-xs font-medium text-amber-300 transition cursor-pointer" id="insiders-points-header">
              <Award className="w-4 h-4 text-amber-400" />
              <div className="text-right">
                <span className="block text-[9px] text-neutral-400 uppercase leading-none font-semibold">VIP Insiders</span>
                <span className="leading-tight block font-bold">{insiderPoints.toLocaleString()} pts</span>
              </div>
            </div>

            {/* Shopping Bag Button with active tab switch */}
            <button
              id="shopping-cart-toggle"
              onClick={() => { setActiveTab('Cart'); setSearchQuery(""); }}
              className="relative p-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition"
              aria-label="Toggle Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border border-neutral-900 animate-bounce">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex bg-neutral-950 px-2 py-2 overflow-x-auto gap-1 border-t border-neutral-800">
          {(['Hot Sellers', 'Marvel', 'Ninjago', 'Technic', 'Cart'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSearchQuery(""); }}
              className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-bold rounded-full transition cursor-pointer ${
                activeTab === tab 
                  ? 'bg-amber-400 text-neutral-950' 
                  : 'bg-neutral-900 text-neutral-400'
              }`}
            >
              {tab === 'Marvel' && '🔴 Marvel'}
              {tab === 'Ninjago' && '🐉 Ninjago'}
              {tab === 'Technic' && '⚙️ Technic'}
              {tab === 'Hot Sellers' && '🔥 Hot Sellers'}
              {tab === 'Cart' && `🛒 Cart (${cart.reduce((s, i) => s + i.quantity, 0)})`}
            </button>
          ))}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow">
        
        {/* =============== HOT SELLERS / STAR WARS THEME ================== */}
        {activeTab === 'Hot Sellers' && (
          <div>
            {/* Floating Switcher for Hero Experience */}
            <div className="bg-neutral-950/95 border-b border-white/5 py-2.5 px-4 sm:px-8 flex flex-col sm:flex-row gap-2 items-center justify-between text-xs font-semibold select-none z-30 relative">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-neutral-400 uppercase tracking-widest text-[10px] font-bold">EXPERIENCE MODE:</span>
                <span className="text-neutral-200 font-extrabold uppercase tracking-wide">
                  {heroMode === 'parallax' ? '⚡ Smooth 3D Parallax' : '✨ Chibi Carousel Slider'}
                </span>
              </div>
              <div className="flex bg-neutral-900/95 border border-white/5 p-0.5 rounded-xl">
                <button
                  onClick={() => setHeroMode('parallax')}
                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                    heroMode === 'parallax' 
                      ? 'bg-amber-400 text-neutral-950 font-black shadow-md' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  3D Parallax View
                </button>
                <button
                  onClick={() => setHeroMode('carousel')}
                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                    heroMode === 'carousel' 
                      ? 'bg-amber-400 text-neutral-950 font-black shadow-md' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Chibi Carousel
                </button>
              </div>
            </div>

            {heroMode === 'parallax' ? <ParallaxHero /> : <ToonHubHero />}

            {/* Core Interactive Layout & Showcase Grid */}
            <section id="grid-showcase" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Lateral Sidebar Filters */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 space-y-6">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <h3 className="font-extrabold text-neutral-200 tracking-wide uppercase text-sm flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-amber-400" />
                        Explore Options
                      </h3>
                      <button 
                        onClick={() => {
                          setPriceMax(900);
                          setSelectedAge("All");
                        }}
                        className="text-xs text-neutral-500 hover:text-amber-400 transition"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Age Classification */}
                    <div className="space-y-2.5">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest block">Age Classification</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {["All", "4+", "9+", "10+", "12+", "16+", "18+"].map((age) => (
                          <button
                            key={age}
                            onClick={() => setSelectedAge(age)}
                            className={`px-2 py-1.5 text-xs font-bold rounded-lg border transition ${
                              selectedAge === age 
                                ? 'bg-amber-400 text-neutral-950 border-amber-300' 
                                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            {age}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Bracket */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-neutral-400 uppercase tracking-widest">Price Bracket</span>
                        <span className="text-amber-400 font-bold">Up to ${priceMax}</span>
                      </div>
                      <input 
                        type="range"
                        min="40"
                        max="900"
                        step="20"
                        value={priceMax}
                        onChange={(e) => setPriceMax(Number(e.target.value))}
                        className="w-full accent-amber-400 bg-neutral-950"
                      />
                      <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                        <span>$40</span>
                        <span>$500</span>
                        <span>$900</span>
                      </div>
                    </div>

                    {/* Dynamic VIP Point Estimator Widget */}
                    <div className="bg-amber-400/5 border border-amber-400/20 rounded-lg p-3.5 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" />
                        <span>Insiders Calculator</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-normal">
                        Did you know? Spend points on rare vintage catalog accessories, free block sets, and vouchers!
                      </p>
                      <div className="pt-1.5 flex justify-between items-center border-t border-neutral-800">
                        <span className="text-[10px] text-neutral-500 uppercase font-semibold">100 points reward</span>
                        <span className="text-xs text-amber-300 font-bold">=$5 voucher</span>
                      </div>
                    </div>
                  </div>

                  {/* LEGO Club Insiders Quiz Block */}
                  <div className="bg-gradient-to-br from-amber-400 to-red-600 rounded-xl p-5 text-neutral-900 font-semibold space-y-4">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-neutral-900" />
                      <h4 className="font-extrabold text-sm uppercase tracking-wider">Insiders Daily Trivia</h4>
                    </div>
                    <p className="text-xs leading-normal font-medium text-neutral-900/90">
                      Answer the question and claim <strong className="font-extrabold">+100 VIP Insiders Points</strong> instantly in your account!
                    </p>
                    
                    <div className="bg-neutral-950/95 p-3 rounded-lg text-neutral-200 text-xs space-y-3">
                      <p className="font-bold">What material were the first early manufactured LEGO bricks made out of?</p>
                      <div className="space-y-1.5">
                        <button 
                          onClick={() => checkTrivia("wood")}
                          className={`w-full text-left p-2 rounded border text-xs transition font-semibold flex items-center justify-between ${
                            triviaAnswer === "wood" ? "border-emerald-500 bg-emerald-950/20 text-emerald-400" : "border-neutral-800 hover:border-neutral-700"
                          }`}
                        >
                          <span>🪵 Natural Birch Wood</span>
                          {triviaAnswer === "wood" && <Check className="w-4.5 h-4.5 text-emerald-500" />}
                        </button>
                        <button 
                          onClick={() => checkTrivia("plastic")}
                          className={`w-full text-left p-2 rounded border text-xs transition font-semibold flex items-center justify-between ${
                            triviaAnswer === "plastic" ? "border-red-500 bg-red-950/20 text-red-400" : "border-neutral-800 hover:border-neutral-700"
                          }`}
                        >
                          <span>🧪 Synthetic ABS Plastic</span>
                          {triviaAnswer === "plastic" && <X className="w-4.5 h-4.5 text-red-500" />}
                        </button>
                      </div>
                      
                      {triviaAnswer && (
                        <div className="pt-2 border-t border-neutral-800 text-[11px]">
                          {triviaAnswer === "wood" ? (
                            <span className="text-emerald-400 font-bold">Correct! LEGO started in Ole Kirk Kristiansen's Denmark workshop crafting wooden toys in 1932! Points added!</span>
                          ) : (
                            <span className="text-red-400">Incorrect! The very first brick toys in the early 1930s were beautifully carved wood.</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Grid Lists */}
                <div className="lg:col-span-3 space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                        {searchQuery ? `Search Results for "${searchQuery}"` : "Masterpiece Catalog"}
                      </h2>
                      <p className="text-neutral-400 text-xs">
                        Displaying {filteredSets.length} authentic collectible set models
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 text-xs text-neutral-400">
                      <span className="font-bold text-amber-400">PROMO CODE:</span>
                      <span className="font-mono bg-neutral-950 px-1.5 py-0.5 rounded text-white font-bold select-all">BRICK10</span>
                    </div>
                  </div>

                  {filteredSets.length === 0 ? (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-16 text-center space-y-4">
                      <RotateCcw className="w-10 h-10 text-neutral-600 mx-auto animate-spin" />
                      <h3 className="text-lg font-bold text-neutral-300">No matching LEGO sets found</h3>
                      <p className="text-neutral-500 text-xs max-w-sm mx-auto">
                        We couldn't find matches. Try adjusting your price bracket slider or select a different age classification range.
                      </p>
                      <button 
                        onClick={() => { setSearchQuery(""); setPriceMax(900); setSelectedAge("All"); }}
                        className="bg-amber-400 text-neutral-950 font-bold px-4 py-2 rounded-lg text-xs"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <motion.div 
                      key={activeTab}
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                      {filteredSets.map((set) => (
                        <motion.div 
                          variants={itemVariants}
                          key={set.id}
                          className="bg-neutral-900 border border-neutral-800 hover:border-amber-400/40 rounded-xl overflow-hidden transition duration-300 hover:-translate-y-1 group flex flex-col justify-between"
                        >
                          <FlipProductImage 
                            image={set.image}
                            name={set.name}
                            pieces={set.pieces}
                            theme={set.theme}
                            itemNumber={set.specifications.itemNumber}
                            price={set.price}
                            dimensions={set.specifications.dimensions}
                            rating={set.rating}
                            themeColor="amber"
                            onClick={() => setSelectedSet(set)}
                          />

                          <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                            <div>
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <h3 
                                  onClick={() => setSelectedSet(set)}
                                  className="font-extrabold text-base tracking-tight text-white hover:text-amber-400 cursor-pointer pr-1 transition line-clamp-1"
                                >
                                  {set.name}
                                </h3>
                                <div className="flex items-center text-amber-400 text-xs shrink-0 pt-0.5">
                                  <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                                  <span className="font-bold">{set.rating}</span>
                                </div>
                              </div>
                              <p className="text-neutral-400 text-xs line-clamp-2 leading-relaxed">
                                {set.description}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-neutral-800/80 space-y-3.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xl font-black text-white">${set.price}</span>
                                <span className="text-[10px] bg-neutral-950 text-neutral-400 px-2 py-0.5 rounded font-semibold border border-neutral-800">
                                  Age {set.age}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <button 
                                  onClick={() => setSelectedSet(set)}
                                  className="w-full text-center bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:border-neutral-700 py-2 rounded-lg text-xs font-bold transition cursor-pointer"
                                >
                                  Details
                                </button>
                                <button
                                  id={`btn-${set.id}`}
                                  onClick={() => addToCart(set)}
                                  className="w-full bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black py-2 rounded-lg text-xs transition cursor-pointer shadow-md"
                                >
                                  Add to Bag
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =============== MARVEL UNIVERSE THEME (NEON CRIMSON COSBOUND) ================== */}
        {activeTab === 'Marvel' && (
          <div className="bg-[#0b0406] relative overflow-hidden pb-16 font-sans">
            {/* Ambient Cosmic Orbs */}
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-600/15 rounded-full blur-[110px] pointer-events-none"></div>
            <div className="absolute top-80 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-[110px] pointer-events-none"></div>
            
            {/* Comic Halftone Background Texture effect */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

            {/* Marvel Header Banner with Lego Avengers aesthetic */}
            <section className="relative py-16 border-b border-red-500/20 bg-gradient-to-b from-red-950/30 to-transparent">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-red-600 text-white font-black text-xs px-4 py-1.5 rounded-sm uppercase tracking-widest shadow-lg shadow-red-900/30 border-r-4 border-b-4 border-yellow-400 transform -rotate-1">
                  <span className="animate-pulse">🔴 ACCESS CODE CODE-RED</span>
                </div>
                <h1 className="text-5xl sm:text-8xl font-black text-white tracking-tighter leading-none uppercase" style={{ textShadow: '3px 3px 0px #dc2626, 7px 7px 0px #000' }}>
                  ASSEMBLE THE SQUAD
                </h1>
                <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-semibold italic">
                  Command absolute Lego structural mechanics. Secure the multiversal timeline with armored Gauntlets, towering Stark Sentry hubs, and customized Nanotech build armor.
                </p>
              </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Marvel Products Grid Section - Comic skew layout style */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-8 bg-gradient-to-b from-red-600 to-amber-500 block transform -skew-x-12"></span>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                      S.H.I.E.L.D Tactical Blueprint Files
                    </h2>
                  </div>

                  <motion.div 
                    key={activeTab}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-8"
                  >
                    {filteredSets.map(set => (
                      <motion.div 
                        variants={itemVariants}
                        key={set.id}
                        className="bg-neutral-900 border-2 border-neutral-800 hover:border-red-600/80 rounded-none overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-red-650/15 group flex flex-col justify-between relative transform hover:rotate-[-0.5deg]"
                        style={{ boxShadow: '4px 4px 0px rgba(220, 38, 38, 0.1)' }}
                      >
                        {/* Skewed Price Plate inside item card */}
                        <div className="absolute top-3 left-3 z-10 bg-yellow-400 text-neutral-950 font-black text-xs px-3 py-1 uppercase tracking-wider transform -skew-x-12 border border-neutral-950 shadow-md">
                          ${set.price}
                        </div>

                        <FlipProductImage 
                          image={set.image}
                          name={set.name}
                          pieces={set.pieces}
                          theme={set.theme}
                          itemNumber={set.specifications.itemNumber}
                          price={set.price}
                          dimensions={set.specifications.dimensions}
                          rating={set.rating}
                          themeColor="red"
                          onClick={() => setSelectedSet(set)}
                        />
                        
                        <div className="p-5 flex-grow flex flex-col justify-between space-y-4 bg-neutral-950/40">
                          <div>
                            <h3 className="text-xl font-black text-white hover:text-red-500 transition line-clamp-1 uppercase tracking-tight">{set.name}</h3>
                            <p className="text-xs text-neutral-400 leading-relaxed mb-2 line-clamp-2">{set.description}</p>
                            
                            {/* Score bars for tactical indices */}
                            <div className="space-y-1.5 pt-1">
                              <div className="flex justify-between text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                                <span>Cosmic Threat Class</span>
                                <span className="text-red-400">Class {Math.round(set.rating * 2)}</span>
                              </div>
                              <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-neutral-800">
                                <div className="bg-red-600 h-full" style={{ width: `${(set.rating / 5) * 100}%` }}></div>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                            <div className="flex items-center text-amber-500 text-xs font-black gap-1">
                              <Star className="w-4 h-4 fill-current text-yellow-400" />
                              <span>{set.rating}/5</span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setSelectedSet(set)}
                                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-[10px] font-extrabold rounded-none border border-neutral-800 text-neutral-300 uppercase tracking-wide cursor-pointer transition"
                              >
                                INTEL
                              </button>
                              <button 
                                id={`btn-${set.id}`}
                                onClick={() => addToCart(set)}
                                className="p-2 px-4 bg-red-600 hover:bg-red-500 text-white text-[11px] font-black uppercase tracking-wider shadow-lg hover:shadow-red-500/20 rounded-none border border-red-700 transition cursor-pointer"
                              >
                                DEPLOY BAG
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Marvel Superheroes Squad Assembler Mini-Game stylized as Tony Stark's Hologram HUD */}
                <div className="lg:col-span-1">
                  <div className="sticky top-28 bg-[#100609] border-2 border-red-600/50 rounded-none p-6 space-y-5 text-center relative overflow-hidden" style={{ boxShadow: '0 0 35px rgba(220, 38, 38, 0.15)' }}>
                    
                    {/* Corner Cyber Accents */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500"></div>
                    
                    {/* Scanning glow bar effect */}
                    <div className="absolute inset-x-0 h-[1.5px] bg-red-500/40 top-0 animate-[ping_3s_infinite]" />

                    <div className="inline-flex p-3 rounded-none bg-red-600/10 text-red-500 border border-red-500/20">
                      <Zap className="w-8 h-8 animate-pulse text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-white uppercase tracking-wider" style={{ textShadow: '1px 1px 0px #000' }}>STARK DEFENSE MATRIX</h3>
                      <p className="text-xs text-neutral-400 mt-1">
                        Synthesize your supreme tactical roster of 5 heroes to safeguard the Infinity bricks.
                      </p>
                    </div>

                    {/* Active Squad Grid styled in neon outlines */}
                    <div className="bg-black/80 p-4 rounded-none space-y-3.5 border border-red-500/30">
                      <div className="flex items-center justify-between text-[10px] text-red-400 font-bold uppercase tracking-widest border-b border-red-950 pb-2">
                        <span>ROSTER TELEMETRY</span>
                        <span className="font-mono bg-red-950 px-1.5 py-0.5 text-[9px] text-white font-black">{marvelSquad.length} / 5</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {marvelSquad.map(hero => (
                          <span 
                            key={hero} 
                            onClick={() => toggleMarvelSquad(hero)}
                            className="bg-black border-2 border-red-600 text-red-350 text-[11px] font-black px-3 py-1 cursor-pointer hover:bg-yellow-400 hover:text-neutral-950 hover:border-yellow-300 transition-all duration-200 flex items-center gap-1.5 shadow-md transform hover:scale-105"
                          >
                            <span>{hero}</span>
                            <X className="w-3.5 h-3.5 text-red-400 hover:text-red-600 shrink-0" />
                          </span>
                        ))}
                        {marvelSquad.length === 0 && (
                          <div className="text-xs text-neutral-600 py-4 text-center w-full font-bold">STARK MATRIX COLD: ASSEMBLE SQUAD</div>
                        )}
                      </div>

                      {/* Power Estimation telemetry */}
                      <div className="pt-3 border-t border-neutral-900 text-left space-y-2 text-[11px] font-mono">
                        <div className="flex justify-between">
                          <span className="text-neutral-500 uppercase">SYS STRENGTH RATIO:</span>
                          <span className="text-red-400 font-extrabold">{(marvelSquad.length * 1.8).toFixed(1)}x SPEED</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500 uppercase">ENERGY DESTRUCT LVL:</span>
                          <span className="text-blue-400 font-extrabold">{(marvelSquad.length * 200)} INDEX</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500 uppercase">GRID SHIELD COV:</span>
                          <span className={`${marvelSquad.length === 5 ? "text-emerald-400" : "text-amber-500"} font-extrabold`}>
                            {marvelSquad.length === 5 ? "MAXIMUM SHIELDED" : "UNPROTECTED VULNERABILITY"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Choose Heroes Pool grid */}
                    <div className="space-y-3 text-left">
                      <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-3.5 bg-red-500 inline-block"></span>
                        <span>CHOOSE ACTIVE HEROES</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2.5 text-xs font-black">
                        {["Iron Man", "Captain America", "Thor", "Spider-Man", "Hulk", "Black Widow", "Doctor Strange", "Loki"].map(hero => {
                          const isSelected = marvelSquad.includes(hero);
                          return (
                            <button
                              key={hero}
                              onClick={() => toggleMarvelSquad(hero)}
                              disabled={!isSelected && marvelSquad.length >= 5}
                              className={`py-2 text-center rounded-none border-2 font-black tracking-wide uppercase transition duration-200 cursor-pointer ${
                                isSelected 
                                  ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-900/30' 
                                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-red-500/50 disabled:opacity-20'
                              }`}
                            >
                              {hero}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {marvelSquad.length === 5 && (
                      <div className="bg-red-950/40 border-l-4 border-yellow-400 text-yellow-300 rounded-none p-3 text-xs text-left font-semibold">
                        ⚡ <strong>STARK COMMAND SHIFT:</strong> Avengers assembled successfully. Multiversal portals fully defended!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =============== NINJAGO THEME (EMERALD JADE MYSTICISM) ================== */}
        {activeTab === 'Ninjago' && (
          <div className="bg-[#050b07] py-12 relative overflow-hidden font-serif">
            {/* Ambient Dojo Jade Vapor glow */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-700/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-600/5 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Ninjago Title with Ancient Ink aesthetics */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-16 relative">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-amber-500 text-neutral-950 font-black text-xs px-4 py-1.5 uppercase tracking-widest rounded-full shadow-lg font-sans">
                <span>🐉 MYSTICAL DOJO ARCHITECTURE</span>
              </div>
              <h1 className="text-5xl sm:text-7xl font-extrabold text-[#f3f4f6] leading-none uppercase tracking-tight" style={{ textShadow: "3px 3.5px 0px #10b981", fontFamily: 'Georgia, serif' }}>
                Ninjago Legacy
              </h1>
              <div className="flex items-center justify-center gap-4 text-emerald-500 select-none py-1">
                <span className="text-lg">✸</span>
                <span className="h-[1px] w-24 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></span>
                <span className="font-sans text-xs uppercase tracking-[0.3em] font-bold text-neutral-400">THE FIVE REALMS OF SPINJITZU</span>
                <span className="h-[1px] w-24 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></span>
                <span className="text-lg">✸</span>
              </div>
              <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                Reconstruct the historic dojo towers and command golden elemental artifacts. Mobilize mechanical storm dragons, titanium battle mechs, and mountainside training temples block by block.
              </p>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                
                {/* Ninjago Products Grid with Organic rounded Card look */}
                <div className="lg:col-span-2 space-y-8 font-sans">
                  <div className="flex items-center justify-between border-b border-emerald-950 pb-4">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2 font-serif">
                      <span>Elemental Artifacts Catalog</span>
                    </h2>
                    <span className="text-xs text-emerald-500 bg-emerald-950/40 border border-emerald-900 px-3 py-1 rounded-full font-mono">
                      {filteredSets.length} ACTIVE ARTIFACTS
                    </span>
                  </div>

                  <motion.div 
                    key={activeTab}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-8"
                  >
                    {filteredSets.map(set => {
                      // Guess elemental focus of sets for themed tags
                      const nameLower = set.name.toLowerCase();
                      const descLower = set.description.toLowerCase();
                      let elementBadge = "🌀 ENERGY";
                      let elementColor = "text-emerald-400 bg-emerald-950/50 border-emerald-700/30";
                      
                      if (nameLower.includes("dragon") || nameLower.includes("fire") || descLower.includes("fire")) {
                        elementBadge = "🔥 FIRE ARTIFACT";
                        elementColor = "text-red-400 bg-red-950/40 border-red-900/30";
                      } else if (nameLower.includes("mech") || descLower.includes("titan") || nameLower.includes("titan")) {
                        elementBadge = "⚡ LIGHTNING MECH";
                        elementColor = "text-blue-400 bg-blue-950/40 border-blue-900/30";
                      } else if (nameLower.includes("shrine") || nameLower.includes("temple") || descLower.includes("temple")) {
                        elementBadge = "🌸 SPIRIT SANCTUARY";
                        elementColor = "text-amber-400 bg-amber-950/40 border-amber-900/30";
                      }

                      return (
                        <motion.div 
                          variants={itemVariants}
                          key={set.id}
                          className="bg-neutral-900/40 border border-emerald-900/30 hover:border-emerald-500/70 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between"
                          style={{ boxShadow: '0 10px 30px rgba(5, 11, 7, 0.4)' }}
                        >
                          <FlipProductImage 
                            image={set.image}
                            name={set.name}
                            pieces={set.pieces}
                            theme={set.theme}
                            itemNumber={set.specifications.itemNumber}
                            price={set.price}
                            dimensions={set.specifications.dimensions}
                            rating={set.rating}
                            themeColor="emerald"
                            onClick={() => setSelectedSet(set)}
                          />

                          <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                            <div>
                              <div className="flex justify-between items-start">
                                <h3 className="font-serif font-bold text-white group-hover:text-emerald-400 transition text-lg leading-snug">{set.name}</h3>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shadow-sm backdrop-blur shrink-0 ${elementColor}`}>
                                  {elementBadge}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-2 font-sans font-medium">{set.description}</p>
                            </div>

                            <div className="pt-4 border-t border-emerald-950 flex items-center justify-between font-sans">
                              <div>
                                <span className="block text-[9px] text-neutral-500 uppercase tracking-wider font-bold">Offer Value</span>
                                <span className="text-lg font-black text-white">${set.price}</span>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setSelectedSet(set)}
                                  className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-xs font-bold rounded-xl border border-neutral-800 text-neutral-300 cursor-pointer transition"
                                >
                                  INSIGHT
                                </button>
                                <button 
                                  id={`btn-${set.id}`}
                                  onClick={() => addToCart(set)}
                                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 hover:scale-105 active:scale-95 text-neutral-950 text-xs font-black rounded-xl transition shadow-md shadow-emerald-900/20 cursor-pointer"
                                >
                                  ACQUIRE
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>

                {/* Spinjitzu Arena mini simulator & figures list */}
                <div className="lg:col-span-1 space-y-8 font-sans">
                  
                  {/* Minifigure checklist styled as bamboo list */}
                  <div className="bg-[#09100a] border border-emerald-950 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
                      <h3 className="font-serif font-bold text-sm text-neutral-200 uppercase tracking-wider">
                        Warrior Scroll Tracker
                      </h3>
                      <span className="text-xs text-emerald-400 font-mono font-bold">
                        {unlockedMinifigs.length}/8
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed font-sans font-medium">
                      Check off which elemental heroes reside in your physical archives.
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {["Kai", "Jay", "Cole", "Zane", "Lloyd", "Sora", "Master Wu", "Garmadon"].map(ninja => {
                        const collected = unlockedMinifigs.includes(ninja);
                        return (
                          <button
                            key={ninja}
                            onClick={() => toggleMinifigCollected(ninja)}
                            className={`flex items-center justify-between p-2.5 rounded-xl border text-left font-semibold transition ${
                              collected ? "border-emerald-500 bg-emerald-950/20 text-emerald-300 font-bold" : "border-neutral-900 text-neutral-500 hover:border-neutral-800"
                            }`}
                          >
                            <span>{ninja}</span>
                            {collected ? <Check className="w-3.5 h-3.5 text-emerald-400 opacity-90" /> : <Plus className="w-3 h-3 text-neutral-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Spinjitzu Spinning Challenge */}
                  <div className="bg-neutral-900/60 border border-emerald-500/20 rounded-3xl p-6 text-center space-y-4 relative">
                    {/* Tiny oriental ornament accent */}
                    <div className="text-emerald-800 text-xs">❖ ❖ ❖</div>

                    <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400">
                      <Flame className={`w-8 h-8 ${isSpinning ? "animate-spin text-amber-400" : ""}`} />
                    </div>

                    <div>
                      <h3 className="font-serif font-black text-lg text-white uppercase tracking-wider">Spinjitzu Elemental Portal</h3>
                      <p className="text-xs text-neutral-400 font-sans font-medium mt-1">
                        Select an element, tension the spring, and spin to claim free VIP Insiders Points (+25 pts for &gt;850 score).
                      </p>
                    </div>

                    <div className="bg-neutral-950/80 p-4 rounded-2xl space-y-4 border border-emerald-950 text-xs font-sans">
                      {/* Character selected */}
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 font-medium">Active Ninja:</span>
                        <select 
                          value={ninjaCharacter}
                          onChange={(e) => setNinjaCharacter(e.target.value)}
                          className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-white text-xs font-bold"
                        >
                          <option value="Lloyd">Lloyd (Storm Energy)</option>
                          <option value="Kai">Kai (Elemental Fire)</option>
                          <option value="Zane">Zane (Glacial Core)</option>
                        </select>
                      </div>

                      {/* Slider power */}
                      <div className="space-y-2 text-left">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-neutral-500">Launch Velocity:</span>
                          <span className="text-emerald-400 font-mono">{ninjaTrainingPower * 10} RPM</span>
                        </div>
                        <input 
                          type="range"
                          min="10"
                          max="100"
                          value={ninjaTrainingPower}
                          onChange={(e) => setNinjaTrainingPower(Number(e.target.value))}
                          className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>

                      {spinScore !== null && (
                        <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/10 text-center animate-pulse">
                          <span className="block text-[10px] text-neutral-500 uppercase font-black tracking-wide">Output Velocity Output</span>
                          <span className="text-2xl font-mono text-emerald-300 font-extrabold">{spinScore} RPM Index</span>
                          {spinScore > 850 && (
                            <span className="block text-[10px] text-amber-300 font-bold mt-1">⭐⭐ REWARDS EARNED AND ADDED! ⭐⭐</span>
                          )}
                        </div>
                      )}

                      <button
                        onClick={triggerSpinjitzu}
                        disabled={isSpinning}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-neutral-950 font-black py-3 text-xs uppercase tracking-widest rounded-xl cursor-pointer transition shadow-md shadow-emerald-900/30"
                      >
                        {isSpinning ? "SPINNING TEMPEST..." : "🌪️ TRIGGER SPINJITZU SPINNER!"}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          </div>
        )}

        {/* =============== TECHNIC LAB THEME (BLUEPRINT TELEMETRY) ================== */}
        {activeTab === 'Technic' && (
          <div className="bg-[#03080e] pb-16 relative overflow-hidden font-mono text-neutral-300">
            {/* Blueprint Grid Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#081729_1px,transparent_1px),linear-gradient(to_bottom,#081729_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none"></div>

            {/* Technic Banner detailing Real-life mechanical systems */}
            <section className="relative py-16 border-b border-cyan-500/20 bg-[#040c17]/60">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-cyan-500 text-neutral-950 font-black text-xs px-4 py-1.5 uppercase tracking-widest border border-cyan-400">
                  <Wrench className="w-3.5 h-3.5 animate-spin" />
                  <span>[SYS_TELEMETRY: OPTIMAL_RUNNING]</span>
                </div>
                <h1 className="text-4xl sm:text-6xl font-black text-white leading-none uppercase tracking-tight">
                  TECHNIC MANUAL SYSTEM
                </h1>
                <p className="text-neutral-400 text-xs sm:text-sm max-w-2xl mx-auto font-sans leading-relaxed">
                  Discover the mathematical principles of mechanical advantage. Synthesize planetary gear systems, sequential 8-speed clutch plates, active wishbone double-suspensions, and fully pressurized heavy loader pneumatic logic.
                </p>
              </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Technic Products Grid as engineering schematics */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between border-b border-cyan-950 pb-3">
                    <h2 className="text-sm font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                      <span>_SCHEMATIC FILES [CATALOG_W-04]</span>
                    </h2>
                    <span className="text-[10px] text-neutral-500">[COORDINATES: CL-5.8 // RX]</span>
                  </div>

                  <motion.div 
                    key={activeTab}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-8"
                  >
                    {filteredSets.map(set => (
                      <motion.div 
                        variants={itemVariants}
                        key={set.id}
                        className="bg-[#050f1b] border-2 border-dashed border-cyan-900/60 hover:border-cyan-400 hover:bg-[#071424] overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between group relative"
                      >
                        {/* Technical corner coordinate text */}
                        <div className="absolute top-1.5 right-2 text-[8px] text-cyan-950 group-hover:text-cyan-600/60 select-none z-10">
                          POS_X: {Math.round(set.price * 0.12)}mm
                        </div>

                        <FlipProductImage 
                          image={set.image}
                          name={set.name}
                          pieces={set.pieces}
                          theme={set.theme}
                          itemNumber={set.specifications.itemNumber}
                          price={set.price}
                          dimensions={set.specifications.dimensions}
                          rating={set.rating}
                          themeColor="cyan"
                          onClick={() => setSelectedSet(set)}
                        />

                        <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-extrabold text-[#f3f4f6] text-sm group-hover:text-cyan-400 transition leading-snug">{set.name}</h3>
                            </div>
                            
                            <p className="text-[11px] text-neutral-400 mt-2 font-sans leading-relaxed">{set.description}</p>
                            
                            {/* Detailed schematic specification table */}
                            <div className="mt-4 bg-[#030a13] border border-cyan-950 p-3 space-y-1 text-[10px] text-neutral-400">
                              <div className="flex justify-between">
                                <span className="text-cyan-800">PIECES QUANTITY:</span>
                                <span className="font-bold text-cyan-400">{set.pieces} Units</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-cyan-800">DIFFICULTY RANK:</span>
                                <span className="font-bold text-amber-500">{set.age === "18+" ? "MASTER (18+)" : "EXPERT LEVEL"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-cyan-800">EFFICIENCY INDEX:</span>
                                <span className="font-bold text-emerald-400">{set.rating} / 5.0</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-cyan-950 flex items-center justify-between">
                            <div>
                              <span className="block text-[8px] text-neutral-600 uppercase">SYS PRICE Index</span>
                              <span className="text-lg font-black text-white">${set.price}</span>
                            </div>
                            <div className="flex gap-2 font-sans">
                              <button 
                                onClick={() => setSelectedSet(set)}
                                className="px-2.5 py-1.5 bg-[#030a12] hover:bg-[#061425] text-[10px] font-mono font-bold rounded-sm border border-cyan-900/60 text-cyan-400 uppercase tracking-wider cursor-pointer transition"
                              >
                                [SPECS]
                              </button>
                              <button 
                                id={`btn-${set.id}`}
                                onClick={() => addToCart(set)}
                                className="p-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-mono font-black text-[10px] rounded-sm transition uppercase tracking-wider cursor-pointer"
                              >
                                [MOUNT BAG]
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* STEM Interactive Gear Calculator / Telemetry Lab */}
                <div className="lg:col-span-1 space-y-6">
                  
                  {/* Gearbox Telemetry lab widget */}
                  <div className="bg-[#05101b] border-2 border-cyan-950/80 p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-cyan-950 pb-3">
                      <Calculator className="w-5 h-5 text-cyan-400 animate-pulse" />
                      <h3 className="font-bold text-xs text-neutral-200 uppercase tracking-widest">TRANSMISSION RATIO MESH</h3>
                    </div>

                    <p className="text-[10px] text-neutral-450 leading-relaxed font-sans">
                      Deduce optimal planetary drive layouts. Real-world mechanical metrics calculations updated on gear selection.
                    </p>

                    <div className="space-y-4 p-4 bg-[#03080e] border border-cyan-950 text-xs text-neutral-300">
                      
                      {/* Driver input */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-neutral-500 uppercase font-black block tracking-wider">Drive Gear (Output Key)</label>
                        <select 
                          value={driveTeeth} 
                          onChange={(e) => setDriveTeeth(Number(e.target.value))}
                          className="bg-neutral-900 text-white w-full border border-cyan-950 rounded px-2.5 py-1.5 font-mono text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                        >
                          <option value="8">8-Teeth driving pinion</option>
                          <option value="12">12-Teeth standard gear</option>
                          <option value="16">16-Teeth spur gear</option>
                          <option value="20">20-Teeth drive spline</option>
                          <option value="24">24-Teeth heavy gear</option>
                          <option value="36">36-Teeth planetary gear</option>
                          <option value="40">40-Teeth crown layout</option>
                        </select>
                      </div>

                      {/* Driven input */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-neutral-500 uppercase font-black block tracking-wider">Driven Gear (Differential Axle)</label>
                        <select 
                          value={drivenTeeth} 
                          onChange={(e) => setDrivenTeeth(Number(e.target.value))}
                          className="bg-neutral-900 text-white w-full border border-cyan-950 rounded px-2.5 py-1.5 font-mono text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                        >
                          <option value="8">8-Teeth planetary pinion</option>
                          <option value="12">12-Teeth standard hub</option>
                          <option value="16">16-Teeth spur gear</option>
                          <option value="20">20-Teeth torque crown</option>
                          <option value="24">24-Teeth differential gear</option>
                          <option value="36">36-Teeth ring housing</option>
                          <option value="40">40-Teeth main assembly</option>
                        </select>
                      </div>

                      {/* Computed values telemetry */}
                      <div className="pt-3.5 border-t border-cyan-950 space-y-2 text-[11px] font-mono bg-[#020509] p-3">
                        <div className="flex justify-between">
                          <span className="text-neutral-500 uppercase">SPEED RATIO:</span>
                          <span className="text-cyan-400 font-extrabold">{(drivenTeeth / driveTeeth).toFixed(2)} : 1</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500 uppercase">TORQUE FACTOR:</span>
                          <span className="text-amber-400 font-extrabold">{(drivenTeeth / driveTeeth).toFixed(2)}x N·m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500 uppercase">MESH STATUS:</span>
                          <span className={`${driveTeeth > drivenTeeth ? "text-emerald-400" : "text-cyan-400"} font-black`}>
                            {driveTeeth > drivenTeeth ? "[★ OVERDRIVE SPEED]" : "[⚙️ UNDERDRIVE TORQUE]"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pneumatic Cylinder Simulator Widget */}
                  <div className="bg-[#05101b] border-2 border-cyan-950/80 p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-cyan-950 pb-3">
                      <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
                      <h3 className="font-bold text-xs text-neutral-200 uppercase tracking-widest">CYLINDER PISTON PRESSURE</h3>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-500 uppercase">SIMULATED SYSTEM PRESSURE:</span>
                        <span className="text-cyan-400 font-extrabold">{pneumaticPumpCount * 12} PSI</span>
                      </div>

                      {/* Progress bar visualizer */}
                      <div className="w-full bg-black rounded-none overflow-hidden h-3 border border-cyan-950">
                        <div 
                          className="bg-gradient-to-r from-cyan-600 to-blue-500 h-full transition-all duration-300" 
                          style={{ width: `${Math.min((pneumaticPumpCount * 12 / 80) * 105, 100)}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 font-sans">
                        <button 
                          onClick={() => setPneumaticPumpCount(p => Math.max(1, p - 1))}
                          className="bg-black border border-cyan-950 py-2 hover:bg-[#071324] hover:text-cyan-400 text-xs font-mono font-bold text-neutral-300 transition cursor-pointer"
                        >
                          [OPEN VALVE]
                        </button>
                        <button 
                          onClick={() => setPneumaticPumpCount(p => Math.min(6, p + 1))}
                          className="bg-cyan-500 text-neutral-950 py-2 hover:bg-cyan-400 text-xs font-mono font-black uppercase transition cursor-pointer"
                        >
                          [PUMP SYSTEM]
                        </button>
                      </div>

                      <div className="pt-2 text-[10px] text-neutral-500 leading-normal">
                        {pneumaticPumpCount >= 5 ? (
                          <span className="text-amber-400 font-bold">⚠️ SYSTEM AT MAX PRESSURE LIMIT: Pneumatic force coefficients at extreme load values.</span>
                        ) : (
                          <span>Cylinder compression levels normalized. Valve seal integrity verified.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          </div>
        )}

        {/* =============== SUNTY INTEGRATED LUXURY CART PAGE ================== */}
        {activeTab === 'Cart' && (
          <ShoppingCartPage 
            cart={cart}
            updateCartQty={updateCartQty}
            removeFromCart={removeFromCart}
            subtotal={subtotal}
            discountAmount={discountAmount}
            taxAmount={taxAmount}
            shippingCost={shippingCost}
            totalAmount={totalAmount}
            appliedPromo={appliedPromo}
            promoInput={promoInput}
            setPromoInput={setPromoInput}
            applyPromoCode={applyPromoCode}
            promoError={promoError}
            insiderPoints={insiderPoints}
            setInsiderPoints={setInsiderPoints}
            setActiveTab={setActiveTab}
          />
        )}

      </main>

      {/* ================= GLOBAL SHOPPING CART DRAWER (SLIDE-IN RIGHT) ================== */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Overlay background filter */}
            <div 
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-neutral-950/80 transition-opacity backdrop-blur-xs" 
            ></div>

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col bg-neutral-900 shadow-2xl border-l border-neutral-800">
                  
                  {/* Cart Header */}
                  <div className="px-5 py-6 bg-neutral-900 border-b border-neutral-850 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-amber-400" />
                      <h2 className="text-lg font-black text-white uppercase tracking-tight">Your Brick Bag</h2>
                    </div>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="text-neutral-400 hover:text-white transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Cart Items List */}
                  <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                        <div className="bg-neutral-950 p-4 rounded-full border border-neutral-800 text-neutral-600">
                          <ShoppingBag className="w-10 h-10" />
                        </div>
                        <h3 className="text-base font-bold text-neutral-300">Your bag is completely empty</h3>
                        <p className="text-xs text-neutral-500 max-w-xs leading-normal">
                          Explore our Star Wars models, Marvel figures, and complex Technic gears to start constructing.
                        </p>
                        <button 
                          onClick={() => { setIsCartOpen(false); setActiveTab("Hot Sellers"); }}
                          className="bg-amber-400 text-neutral-950 font-bold px-5 py-2 rounded-lg text-xs"
                        >
                          Browse Sets
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div 
                            key={item.set.id}
                            className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-850 flex gap-3 relative items-stretch"
                          >
                            <img 
                              src={item.set.image} 
                              alt={item.set.name} 
                              className="w-16 h-16 rounded object-cover"
                              referrerPolicy="no-referrer"
                            />
                            
                            <div className="flex-grow flex flex-col justify-between text-xs space-y-1">
                              <div>
                                <h4 className="font-extrabold text-white leading-tight line-clamp-1">{item.set.name}</h4>
                                <span className="text-[10px] text-neutral-500 uppercase font-semibold">{item.set.theme} • {item.set.pieces} pcs</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded">
                                  <button 
                                    onClick={() => updateCartQty(item.set.id, -1)}
                                    className="p-1 text-neutral-400 hover:text-white font-bold"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-xs font-bold text-neutral-200 font-mono px-1">{item.quantity}</span>
                                  <button 
                                    onClick={() => updateCartQty(item.set.id, 1)}
                                    className="p-1 text-neutral-400 hover:text-white font-bold"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <button 
                                  onClick={() => removeFromCart(item.set.id)}
                                  className="text-red-500 hover:text-red-400 font-semibold"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>

                            <div className="text-right shrink-0 flex flex-col justify-between items-end">
                              <span className="font-bold text-white text-sm">${(item.set.price * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Promo Input / Cart Subtotal details */}
                  {cart.length > 0 && (
                    <div className="px-5 py-6 bg-neutral-950 border-t border-neutral-800 space-y-4 text-xs">
                      
                      {/* Promotional section */}
                      <form onSubmit={applyPromoCode} className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Promo Code (e.g. BRICK10)" 
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          className="flex-grow bg-neutral-900 text-white rounded px-3 py-2 border border-neutral-800 uppercase"
                        />
                        <button 
                          type="submit"
                          className="bg-neutral-800 text-white hover:bg-neutral-700 px-4 py-2 font-bold rounded"
                        >
                          Apply
                        </button>
                      </form>
                      {promoError && <p className="text-red-500 text-[11px] leading-tight font-semibold">{promoError}</p>}
                      {appliedPromo && (
                        <p className="text-emerald-400 text-[11px] leading-tight font-bold flex items-center gap-1.5">
                          <Percent className="w-3.5 h-3.5" />
                          <span>Code "BRICK10" Applied — 10% Discount Saved!</span>
                        </p>
                      )}

                      {/* Cumulative part metric */}
                      <div className="bg-neutral-905 p-3 rounded-lg border border-neutral-850 flex justify-between items-center text-[11px]">
                        <span className="text-neutral-500 uppercase font-semibold">Total parts to organize:</span>
                        <span className="text-amber-300 font-mono font-bold font-lg">{totalCartPieces.toLocaleString()} pieces</span>
                      </div>

                      {/* Financial summary Breakdown */}
                      <div className="space-y-2 border-t border-b border-neutral-850 py-3.5">
                        <div className="flex justify-between">
                          <span className="text-neutral-400 font-medium">Subtotal</span>
                          <span className="text-white font-semibold">${subtotal.toFixed(2)}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-emerald-400">
                            <span>10% Promo Discount</span>
                            <span>-${discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-neutral-400 font-medium">Estimated Carrier Shipping</span>
                          <span>{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400 font-medium">Estimated Sales Taxes (8%)</span>
                          <span>${taxAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm py-2">
                        <span className="font-bold text-neutral-300">TOTAL ORDER PRICE</span>
                        <span className="font-black text-amber-400 text-base">${totalAmount.toFixed(2)}</span>
                      </div>

                      <button 
                        onClick={() => {
                          alert(`Checkout successful! Thank you for purchasing ${totalCartPieces} pieces of bricks. ${Math.round(subtotal * 0.15)} VIP Points generated!`);
                          setCart([]);
                          setIsCartOpen(false);
                        }}
                        className="w-full bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black py-3 text-sm text-center tracking-wide uppercase rounded-lg transition shadow-md"
                      >
                        Secure Checkout with VIP points
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= DETAILED SPECIFICATION MODAL ================== */}
      {selectedSet && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            
            {/* Overlay background */}
            <div 
              onClick={() => setSelectedSet(null)}
              className="fixed inset-0 bg-neutral-950/85 transition-opacity backdrop-blur-sm" 
            ></div>

            {/* Trick centering viewport */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-middle bg-neutral-900 border border-neutral-800 rounded-2xl text-left overflow-auto shadow-2xl transform transition-all my-8 sm:max-w-3xl sm:w-full overflow-hidden">
              
              {/* Image banner with absolute overlays */}
              <div className="relative overflow-hidden h-72 bg-neutral-950" style={{ perspective: "1000px" }}>
                <motion.div
                  className="w-full h-full relative"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <img 
                    src={selectedSet.image} 
                    alt={selectedSet.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button 
                    onClick={() => setSelectedSet(null)}
                    className="absolute top-4 right-4 bg-neutral-950/85 text-neutral-400 hover:text-white p-2 rounded-full backdrop-blur transition z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-4 bg-neutral-950/90 py-1.5 px-3 rounded text-amber-300 text-[10px] uppercase font-bold tracking-widest border border-neutral-850 z-10">
                    {selectedSet.theme} Collection
                  </div>
                </motion.div>
              </div>

              {/* Specifications Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase">{selectedSet.name}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 mt-2 font-medium">
                      <span>Item Number: <strong className="text-neutral-250 font-semibold">{selectedSet.specifications.itemNumber}</strong></span>
                      <span>•</span>
                      <span>Pieces: <strong className="text-neutral-250 font-semibold">{selectedSet.pieces}</strong></span>
                      <span>•</span>
                      <span>Recommended Minimum Age: <strong className="text-neutral-250 font-semibold">{selectedSet.age}</strong></span>
                    </div>
                  </div>

                  <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-center shrink-0 w-full sm:w-auto">
                    <span className="block text-[10px] text-neutral-500 uppercase font-black tracking-widest leading-none">VIP Points Earnt</span>
                    <span className="text-lg font-bold text-amber-300 font-mono">+{selectedSet.specifications.insiderPoints}</span>
                  </div>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-neutral-200 uppercase text-xs tracking-wider border-b border-neutral-800 pb-2">Description</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed text-slate-350 font-medium">
                      {selectedSet.description}
                    </p>

                    <div>
                      <h5 className="font-black text-[11px] text-neutral-300 uppercase tracking-widest mt-4 mb-2">Build Features:</h5>
                      <ul className="space-y-2 text-xs text-neutral-450 font-medium">
                        {selectedSet.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-400 block shrink-0 pt-0.5">▪</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Technical specifics & product dimensions */}
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-neutral-200 uppercase text-xs tracking-wider border-b border-neutral-800 pb-2">Technical specs</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-neutral-850">
                        <span className="text-neutral-500">Form Layout Sizing</span>
                        <span className="text-neutral-300 font-semibold">{selectedSet.specifications.dimensions}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-neutral-850">
                        <span className="text-neutral-500">Release Year Catalog</span>
                        <span className="text-neutral-300 font-semibold">{selectedSet.releaseYear}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-neutral-850">
                        <span className="text-neutral-500">Retail Unit Price</span>
                        <span className="text-white font-bold">${selectedSet.price}</span>
                      </div>
                    </div>

                    <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 space-y-3.5">
                      <h5 className="text-[11px] font-extrabold text-neutral-300 uppercase tracking-widest">Add to your brick orders</h5>
                      <p className="text-[10px] text-neutral-500">Combine this model with other elements in your shopping bag to earn double rewards point vouchers.</p>
                      
                      <button 
                        onClick={() => {
                          addToCart(selectedSet);
                          setSelectedSet(null);
                        }}
                        className="w-full bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black py-2.5 rounded text-xs transition uppercase cursor-pointer"
                      >
                        Add to Bag — ${selectedSet.price}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interactive Dynamic Build Reviews section */}
                <div className="pt-6 border-t border-neutral-800 space-y-4">
                  <h4 className="font-extrabold text-neutral-300 uppercase text-xs tracking-widest flex items-center gap-2">
                    <span>Authentic Builder Reviews</span>
                    <span className="text-[10px] bg-neutral-950 text-amber-300 px-2.5 py-0.5 rounded border border-neutral-850 font-semibold">
                      {selectedSet.rating} Stars Avg
                    </span>
                  </h4>

                  {/* Review List */}
                  <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                    {/* Combine static reviews with custom reviews */}
                    {[...(customReviews[selectedSet.id] || []), ...selectedSet.reviews].map((rev, index) => (
                      <div key={index} className="bg-neutral-950/80 p-3.5 rounded-lg border border-neutral-850 text-xs text-neutral-350 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-neutral-200">{rev.author}</span>
                          <span className="text-[10px] text-neutral-500 font-medium">{rev.date}</span>
                        </div>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <p className="text-neutral-450 leading-relaxed italic">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Write a build review client-side form */}
                  <form onSubmit={(e) => handleAddReview(e, selectedSet.id)} className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 space-y-3">
                    <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Share Your Build Thoughts</h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-500 uppercase font-bold block">Builder Name</label>
                        <input 
                          type="text" 
                          placeholder="Builder nickname"
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          className="w-full bg-neutral-900 text-white rounded p-2 text-xs border border-neutral-800"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-500 uppercase font-bold block">Rating Stars</label>
                        <select 
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          className="w-full bg-neutral-900 text-white rounded p-2 text-xs border border-neutral-800 font-bold"
                        >
                          <option value="5">⭐⭐⭐⭐⭐ Elite 5/5</option>
                          <option value="4">⭐⭐⭐⭐ Great 4/5</option>
                          <option value="3">⭐⭐⭐ Good 3/5</option>
                          <option value="2">⭐⭐ Fair 2/5</option>
                          <option value="1">⭐ Poor 1/5</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-500 uppercase font-bold block">Comments & building details</label>
                      <textarea 
                        placeholder="Was the gearbox assembly challenging? Are the mini-figures outstanding?"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full bg-neutral-900 text-white rounded p-2 text-xs border border-neutral-800 h-16 resize-none"
                        required
                      ></textarea>
                    </div>

                    <button 
                      type="submit"
                      className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2 px-4 rounded text-xs transition"
                    >
                      Post Builder Review
                    </button>
                  </form>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-neutral-950 border-t border-neutral-850 py-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <span className="text-white font-black tracking-tight uppercase border-l-4 border-amber-400 pl-2">LEGO BRICKWORLD CATALOGUE</span>
            <p className="leading-relaxed text-neutral-450">
              The premium fan-centered portal for legendary sets, dynamic Marvel force assemblers, and authentic simulated mechanical gear systems. Rebuilt with ultimate precision.
            </p>
          </div>

          <div className="space-y-4">
            <span className="text-white font-bold uppercase tracking-wider block">Insiders VIP Club</span>
            <ul className="space-y-2">
              <li>• VIP Points balance: <strong className="text-amber-300 font-bold">{insiderPoints} pts</strong></li>
              <li>• Claim points scanning booklets</li>
              <li>• Access rare physical rewards</li>
            </ul>
          </div>

          <div className="space-y-4">
            <span className="text-white font-bold uppercase tracking-wider block">LEGO Collector Resources</span>
            <ul className="space-y-2">
              <li><span className="hover:underline hover:text-neutral-300 cursor-pointer" onClick={() => setActiveTab('Hot Sellers')}>Hot Sellers Collection</span></li>
              <li><span className="hover:underline hover:text-neutral-300 cursor-pointer" onClick={() => setActiveTab('Marvel')}>Marvel Superheroes</span></li>
              <li><span className="hover:underline hover:text-neutral-300 cursor-pointer" onClick={() => setActiveTab('Ninjago')}>Ninjago Spinjitzu Arena</span></li>
              <li><span className="hover:underline hover:text-neutral-300 cursor-pointer" onClick={() => setActiveTab('Technic')}>Technic Engineering Lab</span></li>
            </ul>
          </div>

          <div className="space-y-4 bg-neutral-900 p-4 rounded-xl border border-neutral-850">
            <span className="text-white font-bold uppercase tracking-wider block">Insiders Newsletter</span>
            <p className="text-[11px] leading-relaxed">Sign up to receive early alerts about limited run display sets.</p>
            <div className="flex gap-1.5 pt-1">
              <input 
                type="email" 
                placeholder="vip-builder@gmail.com" 
                className="bg-neutral-950 text-white rounded px-2.5 py-1.5 w-full text-[11px] border border-neutral-800" 
              />
              <button 
                onClick={() => alert("Check your email! You received your VIP welcome pack containing free stickers.")}
                className="bg-amber-400 text-neutral-950 px-3.5 py-1 text-[11px] font-black uppercase rounded"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-neutral-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-center">
          <p>© 2026 BRICKWORLD Fan e-commerce showcase. Not affiliated with any official toy manufacturer trademarks.</p>
          <div className="font-mono text-[10px]">
            <span>ENGINE STATUS: </span>
            <span className="text-emerald-400 font-bold">ONLINE (3,000 RPM)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
