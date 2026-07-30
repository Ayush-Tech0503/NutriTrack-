"use client";

import { useEffect, useState, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { PageFrame } from "@/components/page-frame";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  Target,
  Palette,
  Ruler,
  Bot,
  Bell,
  Database,
  Info,
  Save,
  Check,
  Sparkles,
  RotateCcw,
  Flame,
  Dumbbell,
  Wheat,
  Cookie,
  Apple,
  Droplets,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  HelpCircle,
  ShieldCheck,
  FileText,
  Bug,
  Plus,
  Minus,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

interface UserProfile {
  id?: number;
  name: string;
  email: string;
  age: number;
  gender: string;
  height_cm: number;
  current_weight_kg: number;
  goal_weight_kg?: number;
  activity_level: string;
  goal: string;
  daily_calories_goal: number;
  daily_protein_goal: number;
  daily_carb_goal: number;
  daily_fat_goal: number;
  daily_fibre_goal: number;
  daily_water_goal: number;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "profile" | "goals" | "appearance" | "units" | "ai" | "notifications" | "data" | "about"
  >("profile");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // SECTION 1: PROFILE
  const [name, setName] = useState("Ayush Rathore");
  const [email, setEmail] = useState("ayush@gmail.com");
  const [age, setAge] = useState<number | "">(28);
  const [gender, setGender] = useState("male");
  const [heightCm, setHeightCm] = useState<number | "">(177);
  const [weightKg, setWeightKg] = useState<number | "">(68);
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [goal, setGoal] = useState("muscle");

  // SECTION 2: NUTRITION GOALS
  const [caloriesGoal, setCaloriesGoal] = useState<number>(2800);
  const [proteinGoal, setProteinGoal] = useState<number>(150);
  const [carbGoal, setCarbGoal] = useState<number>(350);
  const [fatGoal, setFatGoal] = useState<number>(80);
  const [fibreGoal, setFibreGoal] = useState<number>(30);
  const [waterGoal, setWaterGoal] = useState<number>(2584);

  // SECTION 3: APPEARANCE
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("system");
  const [accentColor, setAccentColor] = useState<"emerald" | "sky" | "purple" | "amber" | "rose">("emerald");

  // SECTION 4: UNITS
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [waterUnit, setWaterUnit] = useState<"ml" | "L" | "oz">("ml");
  const [caloriesUnit, setCaloriesUnit] = useState<"kcal" | "kJ">("kcal");

  // SECTION 5: AI SETTINGS
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [aiModel, setAiModel] = useState("gemini-1.5-flash");
  const [aiLanguage, setAiLanguage] = useState("en");
  const [autoAnalyzeMeals, setAutoAnalyzeMeals] = useState(true);

  // SECTION 6: NOTIFICATIONS
  const [mealReminder, setMealReminder] = useState(true);
  const [waterReminder, setWaterReminder] = useState(true);
  const [dailyGoalReminder, setDailyGoalReminder] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);

  // MODAL STATES
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [aboutModalContent, setAboutModalContent] = useState<string | null>(null);

  // Load User Data & Local Preferences
  useEffect(() => {
    async function loadData() {
      try {
        const user: UserProfile = await apiFetch("/api/auth/me");
        if (user) {
          setName(user.name || "Ayush Rathore");
          setEmail(user.email || "ayush@gmail.com");
          setAge(user.age ?? 28);
          setGender(user.gender || "male");
          setHeightCm(user.height_cm ?? 177);
          setWeightKg(user.current_weight_kg ?? 68);

          const act = user.activity_level?.toLowerCase() || "moderate";
          if (act.includes("sed")) setActivityLevel("sedentary");
          else if (act.includes("light")) setActivityLevel("light");
          else if (act.includes("ath")) setActivityLevel("athlete");
          else if (act.includes("act")) setActivityLevel("active");
          else setActivityLevel("moderate");

          const g = user.goal?.toLowerCase() || "muscle";
          if (g.includes("loss") || g.includes("lose")) setGoal("loss");
          else if (g.includes("muscle")) setGoal("muscle");
          else if (g.includes("gain")) setGoal("gain");
          else setGoal("maintain");

          if (user.daily_calories_goal) setCaloriesGoal(Math.round(user.daily_calories_goal));
          if (user.daily_protein_goal) setProteinGoal(Math.round(user.daily_protein_goal));
          if (user.daily_carb_goal) setCarbGoal(Math.round(user.daily_carb_goal));
          if (user.daily_fat_goal) setFatGoal(Math.round(user.daily_fat_goal));
          if (user.daily_fibre_goal) setFibreGoal(Math.round(user.daily_fibre_goal));
          if (user.daily_water_goal) setWaterGoal(Math.round(user.daily_water_goal));
        }
      } catch (err) {
        console.error("Failed to load user settings", err);
      } finally {
        setLoading(false);
      }

      // Load Local Preferences
      const savedTheme = (localStorage.getItem("nutritrack_theme") as any) || "system";
      const savedAccent = (localStorage.getItem("nutritrack_accent") as any) || "emerald";
      const savedWeightU = (localStorage.getItem("nutritrack_unit_weight") as any) || "kg";
      const savedHeightU = (localStorage.getItem("nutritrack_unit_height") as any) || "cm";
      const savedWaterU = (localStorage.getItem("nutritrack_unit_water") as any) || "ml";
      const savedCalU = (localStorage.getItem("nutritrack_unit_cal") as any) || "kcal";

      setThemeMode(savedTheme);
      setAccentColor(savedAccent);
      setWeightUnit(savedWeightU);
      setHeightUnit(savedHeightU);
      setWaterUnit(savedWaterU);
      setCaloriesUnit(savedCalU);

      const savedKey = localStorage.getItem("gemini_api_key");
      if (savedKey) setApiKey(savedKey);
    }
    loadData();
  }, []);

  // Scientific Formula Calculation
  const scientificCalculations = useMemo(() => {
    const h = typeof heightCm === "number" ? heightCm : 175;
    const w = typeof weightKg === "number" ? weightKg : 70;
    const a = typeof age === "number" ? age : 25;

    const offset = gender === "female" ? -161 : 5;
    const bmr = 10 * w + 6.25 * h - 5 * a + offset;

    const mults: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      athlete: 1.9,
    };
    const tdee = bmr * (mults[activityLevel] || 1.55);

    let recCalories = tdee;
    let pRate = 1.6;
    if (goal === "loss") { recCalories = tdee - 400; pRate = 2.0; }
    else if (goal === "gain") { recCalories = tdee + 400; pRate = 1.8; }
    else if (goal === "muscle") { recCalories = tdee + 300; pRate = 2.0; }
    else { recCalories = tdee; pRate = 1.6; }

    recCalories = Math.max(1200, Math.round(recCalories));
    const recProtein = Math.round(w * pRate);
    const recFat = Math.round((recCalories * 0.25) / 9);
    const recCarbs = Math.max(50, Math.round((recCalories - recProtein * 4 - recFat * 9) / 4));
    const recFibre = Math.round((recCalories / 1000) * 14);
    const recWater = Math.round(w * 38);

    return { recCalories, recProtein, recCarbs, recFat, recFibre, recWater };
  }, [heightCm, weightKg, age, gender, activityLevel, goal]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Save All Settings
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // 1. Sync Profile & Goals with Backend
      const payload = {
        name,
        email,
        age: typeof age === "number" ? age : 28,
        gender,
        height_cm: typeof heightCm === "number" ? heightCm : 177,
        current_weight_kg: typeof weightKg === "number" ? weightKg : 68,
        activity_level: activityLevel,
        goal: goal === "loss" ? "lose_weight" : goal === "gain" ? "gain_weight" : goal === "muscle" ? "gain_muscle" : "maintain",
        daily_calories_goal: caloriesGoal,
        daily_protein_goal: proteinGoal,
        daily_carb_goal: carbGoal,
        daily_fat_goal: fatGoal,
        daily_fibre_goal: fibreGoal,
        daily_water_goal: waterGoal,
      };

      await apiFetch("/api/auth/me", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      // 2. Save Appearance & Preferences to LocalStorage
      localStorage.setItem("nutritrack_theme", themeMode);
      localStorage.setItem("nutritrack_accent", accentColor);
      localStorage.setItem("nutritrack_unit_weight", weightUnit);
      localStorage.setItem("nutritrack_unit_height", heightUnit);
      localStorage.setItem("nutritrack_unit_water", waterUnit);
      localStorage.setItem("nutritrack_unit_cal", caloriesUnit);
      localStorage.setItem("gemini_api_key", apiKey);

      // Apply theme mode class
      if (themeMode === "dark") {
        document.documentElement.classList.add("dark");
      } else if (themeMode === "light") {
        document.documentElement.classList.remove("dark");
      }

      showToast("All settings saved successfully!");
    } catch (err: any) {
      console.error("Failed to save settings", err);
      showToast(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Export Data JSON
  const handleExportData = () => {
    const data = {
      profile: { name, email, age, gender, heightCm, weightKg, activityLevel, goal },
      goals: { caloriesGoal, proteinGoal, carbGoal, fatGoal, fibreGoal, waterGoal },
      units: { weightUnit, heightUnit, waterUnit, caloriesUnit },
      ai: { aiModel, aiLanguage, autoAnalyzeMeals },
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nutritrack_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast("Backup exported successfully!");
  };

  const navTabs = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "goals", label: "Nutrition Goals", icon: Target },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "units", label: "Units", icon: Ruler },
    { id: "ai", label: "AI Settings", icon: Bot },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "data", label: "Data Management", icon: Database },
    { id: "about", label: "About & Legal", icon: Info },
  ];

  if (loading) {
    return (
      <PageFrame title="Settings Dashboard" description="Loading preferences...">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      title="Settings Dashboard"
      description="Manage your profile, scientific goals, appearance, units, AI settings, and data."
      actions={
        <Button
          onClick={handleSaveAll}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md transition-all px-5 py-2.5 rounded-xl flex items-center gap-2"
        >
          {saving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Save className="h-4.5 w-4.5" />
          )}
          <span>Save Changes</span>
        </Button>
      }
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-white shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <Check className="h-5 w-5" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12 pb-12">
        {/* SIDEBAR TABS (4 cols) */}
        <Card className="lg:col-span-4 p-3 space-y-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-fit">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Settings Navigation</h3>
            <p className="text-xs text-slate-500">Tune your preferences</p>
          </div>

          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </Card>

        {/* CONTENT AREA (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION 1: PROFILE */}
          {activeTab === "profile" && (
            <Card className="p-6 space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <UserIcon className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">1. Profile Information</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Full Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Email</label>
                  <Input value={email} readOnly className="rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Age</label>
                  <Input type="number" value={age} onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : "")} className="rounded-lg" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm bg-white dark:bg-slate-900">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Height (cm)</label>
                  <Input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value ? parseFloat(e.target.value) : "")} className="rounded-lg" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Current Weight (kg)</label>
                  <Input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value ? parseFloat(e.target.value) : "")} className="rounded-lg" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Activity Level</label>
                  <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="w-full rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm bg-white dark:bg-slate-900">
                    <option value="sedentary">Sedentary (Little/no exercise)</option>
                    <option value="light">Lightly Active (1-3 days/wk)</option>
                    <option value="moderate">Moderately Active (3-5 days/wk)</option>
                    <option value="active">Very Active (6-7 days/wk)</option>
                    <option value="athlete">Athlete / Heavy Work</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Primary Goal</label>
                  <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm bg-white dark:bg-slate-900">
                    <option value="loss">Weight Loss</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="gain">Weight Gain</option>
                    <option value="muscle">Muscle Gain</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 2: DAILY NUTRITION GOALS */}
          {activeTab === "goals" && (
            <Card className="p-6 space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <Target className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">2. Daily Nutrition Goals</h2>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCaloriesGoal(scientificCalculations.recCalories);
                      setProteinGoal(scientificCalculations.recProtein);
                      setCarbGoal(scientificCalculations.recCarbs);
                      setFatGoal(scientificCalculations.recFat);
                      setFibreGoal(scientificCalculations.recFibre);
                      setWaterGoal(scientificCalculations.recWater);
                      showToast("Auto calculated goals applied!");
                    }}
                    className="text-xs border-emerald-200 text-emerald-700 font-medium rounded-lg flex items-center gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Auto Calculate</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCaloriesGoal(2400);
                      setProteinGoal(150);
                      setCarbGoal(300);
                      setFatGoal(75);
                      setFibreGoal(30);
                      setWaterGoal(3500);
                      showToast("Reset to standard recommendations!");
                    }}
                    className="text-xs rounded-lg flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                    <span>Reset</span>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <MacroStepper label="🔥 Calories Goal" value={caloriesGoal} unit="kcal" step={50} onChange={setCaloriesGoal} icon={Flame} color="text-orange-500" />
                <MacroStepper label="💪 Protein Goal" value={proteinGoal} unit="g" step={5} onChange={setProteinGoal} icon={Dumbbell} color="text-emerald-500" />
                <MacroStepper label="🌾 Carbohydrates" value={carbGoal} unit="g" step={5} onChange={setCarbGoal} icon={Wheat} color="text-blue-500" />
                <MacroStepper label="🥑 Fat Goal" value={fatGoal} unit="g" step={5} onChange={setFatGoal} icon={Cookie} color="text-purple-500" />
                <MacroStepper label="🥗 Fibre Goal" value={fibreGoal} unit="g" step={1} onChange={setFibreGoal} icon={Apple} color="text-amber-500" />
                <MacroStepper label="💧 Water Goal" value={waterGoal} unit="ml" step={250} onChange={setWaterGoal} icon={Droplets} color="text-cyan-500" />
              </div>
            </Card>
          )}

          {/* SECTION 3: APPEARANCE */}
          {activeTab === "appearance" && (
            <Card className="p-6 space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <Palette className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">3. Appearance</h2>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Theme Mode</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setThemeMode("light")}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                      themeMode === "light" ? "border-emerald-600 bg-emerald-50/50" : "border-slate-200"
                    }`}
                  >
                    <Sun className="h-5 w-5 text-amber-500" />
                    <span className="text-xs font-semibold">Light Theme</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setThemeMode("dark")}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                      themeMode === "dark" ? "border-emerald-600 bg-slate-950 text-white" : "border-slate-200"
                    }`}
                  >
                    <Moon className="h-5 w-5 text-purple-400" />
                    <span className="text-xs font-semibold">Dark Theme</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setThemeMode("system")}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                      themeMode === "system" ? "border-emerald-600 bg-emerald-50/50" : "border-slate-200"
                    }`}
                  >
                    <Monitor className="h-5 w-5 text-blue-500" />
                    <span className="text-xs font-semibold">System Theme</span>
                  </button>
                </div>

                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block pt-4">Accent Color</label>
                <div className="flex gap-3">
                  {[
                    { id: "emerald", bg: "bg-emerald-500" },
                    { id: "sky", bg: "bg-sky-500" },
                    { id: "purple", bg: "bg-purple-500" },
                    { id: "amber", bg: "bg-amber-500" },
                    { id: "rose", bg: "bg-rose-500" },
                  ].map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setAccentColor(color.id as any)}
                      className={`h-8 w-8 rounded-full ${color.bg} flex items-center justify-center transition-transform ${
                        accentColor === color.id ? "ring-4 ring-emerald-200 scale-110" : ""
                      }`}
                    >
                      {accentColor === color.id && <Check className="h-4 w-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 4: UNITS */}
          {activeTab === "units" && (
            <Card className="p-6 space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <Ruler className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">4. Units & Measurements</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <label className="text-xs font-medium text-slate-500 block">Weight Unit</label>
                  <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value as any)} className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900">
                    <option value="kg">Kilograms (kg)</option>
                    <option value="lbs">Pounds (lbs)</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <label className="text-xs font-medium text-slate-500 block">Height Unit</label>
                  <select value={heightUnit} onChange={(e) => setHeightUnit(e.target.value as any)} className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900">
                    <option value="cm">Centimeters (cm)</option>
                    <option value="ft">Feet & Inches (ft)</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <label className="text-xs font-medium text-slate-500 block">Water Unit</label>
                  <select value={waterUnit} onChange={(e) => setWaterUnit(e.target.value as any)} className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900">
                    <option value="ml">Milliliters (ml)</option>
                    <option value="L">Liters (L)</option>
                    <option value="oz">Fluid Ounces (oz)</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <label className="text-xs font-medium text-slate-500 block">Energy Unit</label>
                  <select value={caloriesUnit} onChange={(e) => setCaloriesUnit(e.target.value as any)} className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900">
                    <option value="kcal">Kilocalories (kcal)</option>
                    <option value="kJ">Kilojoules (kJ)</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 5: AI SETTINGS */}
          {activeTab === "ai" && (
            <Card className="p-6 space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <Bot className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">5. AI & Gemini Integration</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Gemini API Key</label>
                  <div className="relative">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="pr-10 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">AI Model Selection</label>
                    <select value={aiModel} onChange={(e) => setAiModel(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900">
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (High Accuracy)</option>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash (Experimental)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">Response Language</label>
                    <select value={aiLanguage} onChange={(e) => setAiLanguage(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50">
                  <div>
                    <span className="font-semibold text-sm block">Auto Analyze Meals</span>
                    <span className="text-xs text-slate-500">Automatically parse natural text meal descriptions with Gemini</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoAnalyzeMeals}
                    onChange={(e) => setAutoAnalyzeMeals(e.target.checked)}
                    className="h-5 w-5 accent-emerald-600 rounded"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 6: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <Card className="p-6 space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <Bell className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">6. Notification Preferences</h2>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Meal Reminder", sub: "Receive prompts for breakfast, lunch, and dinner logging", val: mealReminder, set: setMealReminder },
                  { label: "Water Reminder", sub: "Hourly hydration check reminders", val: waterReminder, set: setWaterReminder },
                  { label: "Daily Goal Reminder", sub: "Alert when nearing daily calorie or protein target", val: dailyGoalReminder, set: setDailyGoalReminder },
                  { label: "Weekly Summary Report", sub: "Receive weekly nutrition progress emails", val: weeklySummary, set: setWeeklySummary },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50">
                    <div>
                      <span className="font-semibold text-sm block">{item.label}</span>
                      <span className="text-xs text-slate-500">{item.sub}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={item.val}
                      onChange={(e) => item.set(e.target.checked)}
                      className="h-5 w-5 accent-emerald-600 rounded"
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* SECTION 7: DATA MANAGEMENT */}
          {activeTab === "data" && (
            <Card className="p-6 space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <Database className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">7. Data Management & Backup</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="font-semibold text-sm block">Export Data</span>
                  <p className="text-xs text-slate-500">Download a full JSON backup of your profile and goals.</p>
                  <Button onClick={handleExportData} size="sm" variant="outline" className="w-full flex items-center gap-2 mt-2">
                    <Download className="h-4 w-4" /> Export Backup
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="font-semibold text-sm block">Import & Restore</span>
                  <p className="text-xs text-slate-500">Restore your profile and nutrition parameters from JSON.</p>
                  <Button size="sm" variant="outline" className="w-full flex items-center gap-2 mt-2" onClick={() => showToast("Select JSON file to import")}>
                    <Upload className="h-4 w-4" /> Import Backup
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/50 dark:bg-rose-950/20 space-y-2 mt-4">
                <span className="font-semibold text-sm text-rose-700 dark:text-rose-400 block">Danger Zone</span>
                <p className="text-xs text-slate-500">Permanently clear local data and reset all parameters.</p>
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="outline"
                  size="sm"
                  className="border-rose-200 text-rose-600 hover:bg-rose-100 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" /> Delete All Data
                </Button>
              </div>
            </Card>
          )}

          {/* SECTION 8: ABOUT & LEGAL */}
          {activeTab === "about" && (
            <Card className="p-6 space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <Info className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">8. About NutriTrack</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-sm block text-slate-900 dark:text-slate-100">NutriTrack OS</span>
                  <span className="text-xs text-slate-500 block">Version 1.2.0 — Scientific Nutrition Intelligence</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button variant="outline" className="justify-start gap-2" onClick={() => setAboutModalContent("Contact Support: support@nutritrack.app")}>
                    <HelpCircle className="h-4 w-4 text-emerald-600" /> Contact Support
                  </Button>

                  <Button variant="outline" className="justify-start gap-2" onClick={() => setAboutModalContent("Privacy Policy: Your data is saved locally on your device.")}>
                    <ShieldCheck className="h-4 w-4 text-blue-600" /> Privacy Policy
                  </Button>

                  <Button variant="outline" className="justify-start gap-2" onClick={() => setAboutModalContent("Terms of Service: Provided under MIT License.")}>
                    <FileText className="h-4 w-4 text-purple-600" /> Terms of Service
                  </Button>

                  <Button variant="outline" className="justify-start gap-2" onClick={() => setAboutModalContent("Report Bug: Please email bugs@nutritrack.app")}>
                    <Bug className="h-4 w-4 text-rose-600" /> Report Bug
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Data Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-rose-600">Delete All Data?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This action will reset your local profile, scientific goals, and preferences. Are you sure?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={() => {
                  localStorage.clear();
                  setShowDeleteModal(false);
                  showToast("Local data deleted");
                }}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {aboutModalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Information</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{aboutModalContent}</p>
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setAboutModalContent(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </PageFrame>
  );
}

{/* Stepper Input Helper Component */}
function MacroStepper({
  label,
  value,
  unit,
  step = 5,
  onChange,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  step?: number;
  onChange: (val: number) => void;
  icon: any;
  color: string;
}) {
  return (
    <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
      <div className="flex items-center gap-1.5">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
      </div>

      <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - step))}
          className="px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        <div className="flex-1 flex items-center justify-center px-1 text-center font-bold text-sm text-slate-900 dark:text-slate-100">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            className="w-14 text-center bg-transparent focus:outline-none"
          />
          <span className="text-xs font-normal text-slate-400 ml-0.5">{unit}</span>
        </div>

        <button
          type="button"
          onClick={() => onChange(value + step)}
          className="px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
