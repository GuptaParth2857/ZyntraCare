'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiCheck, FiClock, FiCoffee, FiEdit3, FiMapPin, FiPlus, FiRefreshCw, FiShoppingCart, FiTarget, FiTrash2, FiTrendingUp, FiX, FiDroplet } from 'react-icons/fi';

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  image: string;
}

interface DayPlan {
  day: string;
  meals: {
    Breakfast: Meal;
    Lunch: Meal;
    Snack: Meal;
    Dinner: Meal;
  };
}

interface GroceryItem {
  name: string;
  category: string;
  quantity: string;
  checked: boolean;
}

interface Profile {
  dietType: string;
  healthConditions: string[];
  allergies: string[];
  calorieTarget: number;
}

const DIET_TYPES = ['Vegetarian', 'Vegan', 'Non-Veg', 'Eggetarian'];
const HEALTH_CONDITIONS = ['Diabetes', 'Hypertension', 'PCOD', 'Heart Disease', 'None'];
const ALLERGIES = ['Gluten', 'Dairy', 'Nuts', 'Shellfish', 'None'];
const CALORIE_PRESETS = [1500, 2000, 2500];

const GROCERY_ITEMS: GroceryItem[] = [];

function generateWeeklyPlan(): DayPlan[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days.map(day => ({
    day,
    meals: {
      Breakfast: { id: `b-${day}`, name: 'Loading...', calories: 0, protein: 0, carbs: 0, fat: 0, time: '8:00 AM', image: '🍽️' },
      Lunch: { id: `l-${day}`, name: 'Loading...', calories: 0, protein: 0, carbs: 0, fat: 0, time: '1:00 PM', image: '🍽️' },
      Snack: { id: `s-${day}`, name: 'Loading...', calories: 0, protein: 0, carbs: 0, fat: 0, time: '4:00 PM', image: '🍽️' },
      Dinner: { id: `d-${day}`, name: 'Loading...', calories: 0, protein: 0, carbs: 0, fat: 0, time: '8:00 PM', image: '🍽️' },
    },
  }));
}

function getCalorieColor(cals: number): string {
  if (cals <= 200) return 'from-green-500/20 to-green-600/10 border-green-500/30';
  if (cals <= 350) return 'from-blue-500/20 to-blue-600/10 border-blue-500/30';
  if (cals <= 500) return 'from-amber-500/20 to-amber-600/10 border-amber-500/30';
  return 'from-red-500/20 to-red-600/10 border-red-500/30';
}

function getCalorieBadgeColor(cals: number): string {
  if (cals <= 200) return 'bg-green-500/20 text-green-300';
  if (cals <= 350) return 'bg-blue-500/20 text-blue-300';
  if (cals <= 500) return 'bg-amber-500/20 text-amber-300';
  return 'bg-red-500/20 text-red-300';
}

export default function MealPlannerPage() {
  const [activeTab, setActiveTab] = useState<'plan' | 'summary' | 'grocery' | 'log'>('plan');
  const [profile, setProfile] = useState<Profile>({
    dietType: 'Vegetarian',
    healthConditions: ['None'],
    allergies: ['None'],
    calorieTarget: 2000,
  });
  const [showProfile, setShowProfile] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>(() => generateWeeklyPlan());
  const [selectedDay, setSelectedDay] = useState(0);
  const [loggedMeals, setLoggedMeals] = useState<{ name: string; calories: number; time: string }[]>([
    { name: 'Poha with Peanuts', calories: 250, time: '8:15 AM' },
    { name: 'Sprouts Chaat', calories: 150, time: '4:00 PM' },
  ]);
  const [quickLogInput, setQuickLogInput] = useState('');
  const [quickLogCals, setQuickLogCals] = useState('');
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([...GROCERY_ITEMS]);
  const [waterIntake, setWaterIntake] = useState(5);
  const [swappingMeal, setSwappingMeal] = useState<{ dayIdx: number; mealType: string } | null>(null);
  const [customCalories, setCustomCalories] = useState('');
  const [loading, setLoading] = useState(true);
  const [indianMeals, setIndianMeals] = useState<Record<string, Meal[]>>({});

  const fetchMealPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/meal-plans?userId=demo-user');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.weeklyPlan) setWeeklyPlan(data.weeklyPlan);
      if (data.groceryList) setGroceryList(data.groceryList);
      if (data.loggedMeals) setLoggedMeals(data.loggedMeals);
      if (data.profile) setProfile(data.profile);
    } catch {
      // Use empty defaults on failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMealPlan();
    fetch('/api/meal-planner/meals')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('failed'))))
      .then((data) => setIndianMeals(data.meals || {}))
      .catch(() => setIndianMeals({}));
  }, []);

  const todayCalories = loggedMeals.reduce((sum, m) => sum + m.calories, 0);
  const caloriePct = Math.min((todayCalories / profile.calorieTarget) * 100, 100);

  const todayPlan = weeklyPlan[selectedDay]?.meals;
  const todayMacros = todayPlan
    ? Object.values(todayPlan).reduce(
        (acc, meal) => ({
          protein: acc.protein + meal.protein,
          carbs: acc.carbs + meal.carbs,
          fat: acc.fat + meal.fat,
        }),
        { protein: 0, carbs: 0, fat: 0 }
      )
    : { protein: 0, carbs: 0, fat: 0 };

  const totalWeeklyCalories = weeklyPlan.reduce(
    (sum, day) => sum + Object.values(day.meals).reduce((s, m) => s + m.calories, 0),
    0
  );

  const groceryCategories = useMemo(() => {
    const map: Record<string, GroceryItem[]> = {};
    groceryList.forEach(item => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });
    return map;
  }, [groceryList]);

  const categoryIcons: Record<string, string> = {
    'Vegetables': '🥬',
    'Grains & Pulses': '🌾',
    'Dairy & Eggs': '🥛',
    'Spices': '🌶️',
    'Fruits': '🍎',
    'Snacks': '🥜',
  };

  const swapMeal = (dayIdx: number, mealType: string) => {
    const pool = indianMeals[mealType as keyof typeof indianMeals];
    if (!pool) return;
    const newMeal = { ...pool[Math.floor(Math.random() * pool.length)], id: `swap-${Date.now()}` };
    setWeeklyPlan(prev => {
      const updated = [...prev];
      updated[dayIdx] = {
        ...updated[dayIdx],
        meals: { ...updated[dayIdx].meals, [mealType]: newMeal },
      };
      return updated;
    });
    setSwappingMeal(null);
  };

  const toggleGrocery = (idx: number) => {
    setGroceryList(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], checked: !updated[idx].checked };
      return updated;
    });
  };

  const addQuickLog = () => {
    if (!quickLogInput.trim() || !quickLogCals) return;
    setLoggedMeals(prev => [
      ...prev,
      { name: quickLogInput, calories: parseInt(quickLogCals), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setQuickLogInput('');
    setQuickLogCals('');
  };

  const circumference = 2 * Math.PI * 54;
  const strokeOffset = circumference - (caloriePct / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600/90 via-teal-600/90 to-cyan-700/90 backdrop-blur-xl p-6 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center">
                <FiCoffee className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-black">AI Meal Planner</h1>
                <p className="text-emerald-200 text-sm">Personalized Nutrition for You</p>
              </div>
            </div>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="bg-white/15 hover:bg-white/25 p-2 rounded-xl transition-all"
            >
              <FiEdit3 className="text-lg" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-lg font-black">{todayCalories}</p>
              <p className="text-xs text-emerald-200">Eaten Today</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-yellow-300">{profile.calorieTarget}</p>
              <p className="text-xs text-emerald-200">Daily Goal</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-red-300">{profile.calorieTarget - todayCalories}</p>
              <p className="text-xs text-emerald-200">Remaining</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-4">
        {/* Profile Setup Modal */}
        <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-4 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Health Profile</h3>
                <button onClick={() => setShowProfile(false)} className="text-white/50 hover:text-white">
                  <FiX />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Diet Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DIET_TYPES.map(dt => (
                      <button
                        key={dt}
                        onClick={() => setProfile(p => ({ ...p, dietType: dt }))}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                          profile.dietType === dt
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {dt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-2 block">Health Conditions</label>
                  <div className="flex flex-wrap gap-2">
                    {HEALTH_CONDITIONS.map(hc => (
                      <button
                        key={hc}
                        onClick={() =>
                          setProfile(p => ({
                            ...p,
                            healthConditions: p.healthConditions.includes(hc)
                              ? p.healthConditions.filter(c => c !== hc)
                              : [...p.healthConditions.filter(c => c !== 'None'), hc],
                          }))
                        }
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                          profile.healthConditions.includes(hc)
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {hc}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-2 block">Allergies</label>
                  <div className="flex flex-wrap gap-2">
                    {ALLERGIES.map(a => (
                      <button
                        key={a}
                        onClick={() =>
                          setProfile(p => ({
                            ...p,
                            allergies: p.allergies.includes(a)
                              ? p.allergies.filter(al => al !== a)
                              : [...p.allergies.filter(al => al !== 'None'), a],
                          }))
                        }
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                          profile.allergies.includes(a)
                            ? 'bg-red-500/20 border-red-500/50 text-red-300'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-2 block">Calorie Target</label>
                  <div className="flex gap-2 flex-wrap">
                    {CALORIE_PRESETS.map(cp => (
                      <button
                        key={cp}
                        onClick={() => setProfile(p => ({ ...p, calorieTarget: cp }))}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                          profile.calorieTarget === cp && !customCalories
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {cp} kcal
                      </button>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Custom"
                        value={customCalories}
                        onChange={e => {
                          setCustomCalories(e.target.value);
                          if (e.target.value) setProfile(p => ({ ...p, calorieTarget: parseInt(e.target.value) || 2000 }));
                        }}
                        className="w-24 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                      />
                      <span className="text-xs text-white/40">kcal</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 mb-6">
          {[
            { key: 'plan', label: 'Weekly Plan', icon: FiCalendar },
            { key: 'summary', label: 'Summary', icon: FiTrendingUp },
            { key: 'grocery', label: 'Grocery', icon: FiShoppingCart },
            { key: 'log', label: 'Log Meal', icon: FiEdit3 },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <tab.icon className="text-sm" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-white/50">Loading meal plan...</p>
          </div>
        )}

        {!loading && (
        <>

        {/* Weekly Plan Tab */}
        {activeTab === 'plan' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-8">
            {/* Day Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {weeklyPlan.map((day, idx) => (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(idx)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    selectedDay === idx
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-900/80 border-white/10 text-white/50 hover:bg-white/5'
                  }`}
                >
                  {day.day.slice(0, 3)}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{weeklyPlan[selectedDay].day}&apos;s Meals</h3>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const res = await fetch('/api/meal-plans', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: 'demo-user', action: 'regenerate', profile }),
                    });
                    if (res.ok) {
                      const data = await res.json();
                      if (data.weeklyPlan) setWeeklyPlan(data.weeklyPlan);
                    }
                  } catch { /* ignore */ }
                  setLoading(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white/60 hover:bg-white/10 transition-all"
              >
                <FiRefreshCw className="text-xs" /> Regenerate
              </button>
            </div>

            {/* Meals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['Breakfast', 'Lunch', 'Snack', 'Dinner'] as const).map(mealType => {
                const meal = todayPlan?.[mealType];
                if (!meal) return null;
                return (
                  <motion.div
                    key={`${selectedDay}-${mealType}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-gradient-to-br ${getCalorieColor(meal.calories)} border rounded-2xl p-4 relative group`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">{mealType}</span>
                        <h4 className="font-bold text-white mt-1">{meal.name}</h4>
                      </div>
                      <span className="text-3xl">{meal.image}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center mb-3">
                      <div>
                        <p className="text-xs text-white/40">Cal</p>
                        <p className="font-bold text-sm">{meal.calories}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">P</p>
                        <p className="font-bold text-sm text-green-300">{meal.protein}g</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">C</p>
                        <p className="font-bold text-sm text-amber-300">{meal.carbs}g</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">F</p>
                        <p className="font-bold text-sm text-red-300">{meal.fat}g</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40 flex items-center gap-1">
                        <FiClock className="text-xs" /> {meal.time}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCalorieBadgeColor(meal.calories)}`}>
                        {meal.calories} kcal
                      </span>
                    </div>
                    <button
                      onClick={() => setSwappingMeal({ dayIdx: selectedDay, mealType })}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-all"
                      title="Swap meal"
                    >
                      <FiRefreshCw className="text-xs text-white/70" />
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Day Totals */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                <FiTarget className="text-emerald-400" /> Daily Total
              </h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black">{todayPlan ? Object.values(todayPlan).reduce((s, m) => s + m.calories, 0) : 0}</p>
                  <p className="text-xs text-white/50">Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-green-400">{todayMacros.protein}g</p>
                  <p className="text-xs text-white/50">Protein</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-amber-400">{todayMacros.carbs}g</p>
                  <p className="text-xs text-white/50">Carbs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-red-400">{todayMacros.fat}g</p>
                  <p className="text-xs text-white/50">Fat</p>
                </div>
              </div>
            </div>

            {/* Weekly Overview */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h4 className="font-bold text-sm mb-3">Weekly Calorie Overview</h4>
              <div className="flex items-end gap-2 h-24">
                {weeklyPlan.map((day, idx) => {
                  const dayCals = Object.values(day.meals).reduce((s, m) => s + m.calories, 0);
                  const maxCals = 2500;
                  const height = (dayCals / maxCals) * 100;
                  return (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-white/40">{dayCals}</span>
                      <div
                        className={`w-full rounded-t-lg transition-all ${idx === selectedDay ? 'bg-emerald-500' : 'bg-white/10'}`}
                        style={{ height: `${height}%` }}
                      />
                      <span className={`text-[10px] ${idx === selectedDay ? 'text-emerald-300 font-bold' : 'text-white/40'}`}>
                        {day.day.slice(0, 2)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-white/40 text-center mt-2">Total: {totalWeeklyCalories.toLocaleString()} kcal this week</p>
            </div>
          </motion.div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-8">
            {/* Circular Calorie Progress */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center">
              <h3 className="font-bold text-lg mb-4">Today&apos;s Nutrition</h3>
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="url(#calorieGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="calorieGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-black">{todayCalories}</p>
                  <p className="text-xs text-white/50">/ {profile.calorieTarget} kcal</p>
                </div>
              </div>
              <p className="text-sm text-emerald-400 mt-2">
                {todayCalories <= profile.calorieTarget
                  ? `${profile.calorieTarget - todayCalories} kcal remaining`
                  : `${todayCalories - profile.calorieTarget} kcal over goal`}
              </p>
            </div>

            {/* Macro Bar Charts */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h4 className="font-bold text-sm mb-4">Macronutrient Breakdown</h4>
              <div className="space-y-4">
                {[
                  { label: 'Protein', value: todayMacros.protein, max: 80, color: 'bg-green-500', unit: 'g' },
                  { label: 'Carbs', value: todayMacros.carbs, max: 250, color: 'bg-amber-500', unit: 'g' },
                  { label: 'Fat', value: todayMacros.fat, max: 70, color: 'bg-red-500', unit: 'g' },
                ].map(macro => (
                  <div key={macro.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/60">{macro.label}</span>
                      <span className="font-medium">{macro.value}{macro.unit} / {macro.max}{macro.unit}</span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((macro.value / macro.max) * 100, 100)}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full rounded-full ${macro.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Water Intake */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                <FiDroplet className="text-blue-400" /> Water Intake
              </h4>
              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                {Array.from({ length: 8 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setWaterIntake(i + 1)}
                    className={`w-9 h-11 rounded-xl flex items-center justify-center text-lg transition-all ${
                      i < waterIntake
                        ? 'bg-blue-500/30 border border-blue-500/50'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    💧
                  </button>
                ))}
              </div>
              <p className="text-sm text-white/50 text-center">
                {waterIntake} / 8 glasses ({((waterIntake / 8) * 100).toFixed(0)}%)
              </p>
            </div>

            {/* Meal breakdown */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h4 className="font-bold text-sm mb-3">Today&apos;s Meal Calories</h4>
              <div className="space-y-2">
                {loggedMeals.map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-sm">
                        <FiCheck className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-white/40">{m.time}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold">{m.calories} kcal</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Grocery Tab */}
        {activeTab === 'grocery' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-8">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Grocery List</h3>
              <span className="text-xs text-white/40">
                {groceryList.filter(g => g.checked).length}/{groceryList.length} items
              </span>
            </div>

            {/* Progress */}
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${(groceryList.filter(g => g.checked).length / groceryList.length) * 100}%` }}
              />
            </div>

            {Object.entries(groceryCategories).map(([cat, items]) => (
              <div key={cat} className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <span>{categoryIcons[cat] || '📦'}</span> {cat}
                </h4>
                <div className="space-y-2">
                  {items.map(item => {
                    const globalIdx = groceryList.indexOf(item);
                    return (
                      <button
                        key={item.name}
                        onClick={() => toggleGrocery(globalIdx)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                          item.checked ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5 border border-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'
                          }`}
                        >
                          {item.checked && <FiCheck className="text-xs text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${item.checked ? 'text-white/40 line-through' : ''}`}>{item.name}</p>
                          <p className="text-xs text-white/30">{item.quantity}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Order Button */}
            <button className="w-full py-3 bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 rounded-xl text-emerald-300 font-medium transition-all flex items-center justify-center gap-2">
              <FiMapPin /> Order from Nearby Store
            </button>
          </motion.div>
        )}

        {/* Log Meal Tab */}
        {activeTab === 'log' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-8">
            {/* Calorie Ring */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="url(#logGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                  />
                  <defs>
                    <linearGradient id="logGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xl font-black">{todayCalories}</p>
                  <p className="text-[10px] text-white/50">/ {profile.calorieTarget}</p>
                </div>
              </div>
              <p className="text-sm text-emerald-400 mt-3 font-medium">{caloriePct.toFixed(0)}% of daily goal</p>
            </div>

            {/* Quick Log */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h4 className="font-bold text-sm mb-3">Quick Log</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="What did you eat?"
                  value={quickLogInput}
                  onChange={e => setQuickLogInput(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50"
                />
                <input
                  type="number"
                  placeholder="Cal"
                  value={quickLogCals}
                  onChange={e => setQuickLogCals(e.target.value)}
                  className="w-20 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50"
                />
                <button
                  onClick={addQuickLog}
                  className="px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 hover:bg-emerald-500/30 transition-all"
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            {/* Quick Add from Plan */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h4 className="font-bold text-sm mb-3">Add from Today&apos;s Plan</h4>
              <div className="grid grid-cols-2 gap-2">
                {todayPlan &&
                  Object.entries(todayPlan).map(([type, meal]) => (
                    <button
                      key={type}
                      onClick={() => {
                        if (!loggedMeals.find(m => m.name === meal.name)) {
                          setLoggedMeals(prev => [...prev, { name: meal.name, calories: meal.calories, time: meal.time }]);
                        }
                      }}
                      className="p-3 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 transition-all"
                    >
                      <p className="text-xs text-white/40 uppercase">{type}</p>
                      <p className="text-sm font-medium truncate">{meal.name}</p>
                      <p className="text-xs text-emerald-400">{meal.calories} kcal</p>
                    </button>
                  ))}
              </div>
            </div>

            {/* Today's Logged Meals */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h4 className="font-bold text-sm mb-3">Today&apos;s Log</h4>
              <div className="space-y-2">
                {loggedMeals.length === 0 ? (
                  <p className="text-sm text-white/40 text-center py-4">No meals logged yet today</p>
                ) : (
                  loggedMeals.map((m, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-white/40">{m.time}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">{m.calories} kcal</span>
                        <button
                          onClick={() => setLoggedMeals(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-white/20 hover:text-red-400 transition-all"
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {loggedMeals.length > 0 && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                  <span className="text-sm text-white/60">Total</span>
                  <span className="font-bold text-emerald-400">{todayCalories} kcal</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
        </>
        )}

      </div>

      {/* Swap Meal Modal */}
      <AnimatePresence>
        {swappingMeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSwappingMeal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-2xl p-5 w-full max-w-sm max-h-[70vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Swap {swappingMeal.mealType}</h3>
                <button onClick={() => setSwappingMeal(null)} className="text-white/50 hover:text-white">
                  <FiX />
                </button>
              </div>
              <div className="space-y-2">
                {indianMeals[swappingMeal.mealType as keyof typeof indianMeals]?.map(meal => (
                  <button
                    key={meal.id}
                    onClick={() => swapMeal(swappingMeal.dayIdx, swappingMeal.mealType)}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{meal.image}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{meal.name}</p>
                        <p className="text-xs text-white/40">{meal.calories} kcal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
