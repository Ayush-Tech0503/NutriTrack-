"use client";

import { useEffect, useState, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { PageFrame } from "@/components/page-frame";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  Save,
  Sparkles,
  Flame,
  Dumbbell,
  Wheat,
  Cookie,
  Apple,
  Droplets,
  Lightbulb,
  Info,
  BarChart3,
  Check,
  Plus,
  Minus,
  Edit3,
  Target,
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
  bmi?: number;
  bmr?: number;
  tdee?: number;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [goalMode, setGoalMode] = useState<"recommended" | "custom">("recommended");

  // Step 1: Form State
  const [name, setName] = useState("Ayush Rathore");
  const [email, setEmail] = useState("ayush@gmail.com");
  const [age, setAge] = useState<number | "">(28);
  const [gender, setGender] = useState("male");
  const [heightCm, setHeightCm] = useState<number | "">(177);
  const [currentWeightKg, setCurrentWeightKg] = useState<number | "">(68);
  const [targetWeightKg, setTargetWeightKg] = useState<number | "">(72);
  const [activityLevel, setActivityLevel] = useState("moderate"); // sedentary, light, moderate, active, athlete
  const [goal, setGoal] = useState("muscle"); // loss, maintain, gain, muscle

  // Custom Nutrition Goals State
  const [caloriesGoal, setCaloriesGoal] = useState<number>(2800);
  const [proteinGoal, setProteinGoal] = useState<number>(150);
  const [carbGoal, setCarbGoal] = useState<number>(350);
  const [fatGoal, setFatGoal] = useState<number>(80);
  const [fibreGoal, setFibreGoal] = useState<number>(30);
  const [waterGoal, setWaterGoal] = useState<number>(2584);

  // Load User Data
  useEffect(() => {
    async function loadUser() {
      try {
        const data: UserProfile = await apiFetch("/api/auth/me");
        if (data) {
          setName(data.name || "Ayush Rathore");
          setEmail(data.email || "ayush@gmail.com");
          setAge(data.age ?? 28);
          setGender(data.gender || "male");
          setHeightCm(data.height_cm ?? 177);
          setCurrentWeightKg(data.current_weight_kg ?? 68);
          setTargetWeightKg(data.goal_weight_kg ?? 72);

          const act = data.activity_level?.toLowerCase() || "moderate";
          if (act.includes("sed")) setActivityLevel("sedentary");
          else if (act.includes("light")) setActivityLevel("light");
          else if (act.includes("ath") || act.includes("extra")) setActivityLevel("athlete");
          else if (act.includes("act") || act.includes("very")) setActivityLevel("active");
          else setActivityLevel("moderate");

          const g = data.goal?.toLowerCase() || "muscle";
          if (g.includes("loss") || g.includes("lose")) setGoal("loss");
          else if (g.includes("muscle")) setGoal("muscle");
          else if (g.includes("gain")) setGoal("gain");
          else setGoal("maintain");

          if (data.daily_calories_goal) setCaloriesGoal(Math.round(data.daily_calories_goal));
          if (data.daily_protein_goal) setProteinGoal(Math.round(data.daily_protein_goal));
          if (data.daily_carb_goal) setCarbGoal(Math.round(data.daily_carb_goal));
          if (data.daily_fat_goal) setFatGoal(Math.round(data.daily_fat_goal));
          if (data.daily_fibre_goal) setFibreGoal(Math.round(data.daily_fibre_goal));
          if (data.daily_water_goal) setWaterGoal(Math.round(data.daily_water_goal));
        }
      } catch (err) {
        console.error("Failed to load user profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  // STEP 2: Automatic Calculations using Scientific Formulas
  const metrics = useMemo(() => {
    const h = typeof heightCm === "number" ? heightCm : 175;
    const w = typeof currentWeightKg === "number" ? currentWeightKg : 70;
    const a = typeof age === "number" ? age : 25;

    // 1. BMI Calculation
    const bmiVal = w / Math.pow(h / 100, 2);
    const bmi = Math.round(bmiVal * 10) / 10;
    let bmiCategory = "Normal Weight";
    let bmiColor = "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400";
    if (bmiVal < 18.5) {
      bmiCategory = "Underweight";
      bmiColor = "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400";
    } else if (bmiVal >= 25 && bmiVal < 30) {
      bmiCategory = "Overweight";
      bmiColor = "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400";
    } else if (bmiVal >= 30) {
      bmiCategory = "Obese";
      bmiColor = "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400";
    }

    // 2. BMR - Mifflin-St Jeor Equation
    // Male: 10*w + 6.25*h - 5*a + 5
    // Female: 10*w + 6.25*h - 5*a - 161
    const genderOffset = gender === "female" ? -161 : 5;
    const bmrVal = 10 * w + 6.25 * h - 5 * a + genderOffset;
    const bmr = Math.round(bmrVal);

    // 3. TDEE based on Activity Level Multipliers
    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      athlete: 1.9,
    };
    const tdeeVal = bmrVal * (multipliers[activityLevel] || 1.55);
    const tdee = Math.round(tdeeVal);

    // 4. Calorie Adjustments based on Goal Logic
    // Weight Loss: 400 kcal deficit, Protein: 2.0 g/kg
    // Maintain Weight: TDEE, Protein: 1.6 g/kg
    // Weight Gain: 400 kcal surplus, Protein: 1.8 g/kg
    // Muscle Gain: 300 kcal surplus, Protein: 2.0 g/kg
    let recCalories = tdee;
    let proteinRate = 1.6;

    if (goal === "loss") {
      recCalories = tdee - 400;
      proteinRate = 2.0;
    } else if (goal === "gain") {
      recCalories = tdee + 400;
      proteinRate = 1.8;
    } else if (goal === "muscle") {
      recCalories = tdee + 300;
      proteinRate = 2.0;
    } else {
      recCalories = tdee;
      proteinRate = 1.6;
    }
    recCalories = Math.max(1200, Math.round(recCalories));

    // 5. Scientific Macro & Water Ratios
    const recProtein = Math.round(w * proteinRate);
    const recFat = Math.round((recCalories * 0.25) / 9); // 25% of calories
    const recCarbs = Math.max(50, Math.round((recCalories - recProtein * 4 - recFat * 9) / 4));
    const recFibre = Math.round((recCalories / 1000) * 14); // 14g per 1000 kcal
    const recWater = Math.round(w * 38); // 38 ml per kg body weight

    return {
      bmi,
      bmiCategory,
      bmiColor,
      bmr,
      tdee,
      recCalories,
      recProtein,
      recCarbs,
      recFat,
      recFibre,
      recWater,
    };
  }, [heightCm, currentWeightKg, age, gender, activityLevel, goal]);

  // Apply recommended goals
  const applyRecommendedGoals = () => {
    setCaloriesGoal(metrics.recCalories);
    setProteinGoal(metrics.recProtein);
    setCarbGoal(metrics.recCarbs);
    setFatGoal(metrics.recFat);
    setFibreGoal(metrics.recFibre);
    setWaterGoal(metrics.recWater);
    setGoalMode("recommended");
    showToast("Scientific recommended targets applied!");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle Profile Save
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name,
        email,
        age: typeof age === "number" ? age : 28,
        gender,
        height_cm: typeof heightCm === "number" ? heightCm : 177,
        current_weight_kg: typeof currentWeightKg === "number" ? currentWeightKg : 68,
        goal_weight_kg: typeof targetWeightKg === "number" ? targetWeightKg : 72,
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

      showToast("Profile & Nutrition goals saved! Redirecting to Dashboard...");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (err: any) {
      console.error("Save failed", err);
      showToast(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Goal description text
  const goalAdvice = useMemo(() => {
    if (goal === "loss") {
      return {
        title: "Weight Loss",
        text: "Designed with a 400 kcal deficit & high protein (2.0g/kg) to maximize fat loss while preserving lean body mass.",
      };
    } else if (goal === "gain") {
      return {
        title: "Weight Gain",
        text: "Calculated with a 400 kcal surplus to support overall weight & muscle growth.",
      };
    } else if (goal === "muscle") {
      return {
        title: "Muscle Gain",
        text: "Optimized with a 300 kcal surplus & 2.0g/kg protein for clean muscle hypertrophy without excess fat gain.",
      };
    }
    return {
      title: "Maintain Weight",
      text: "Balanced at exact maintenance calories (TDEE) and 1.6g/kg protein to preserve your weight.",
    };
  }, [goal]);

  if (loading) {
    return (
      <PageFrame title="Profile & Goal Settings" description="Loading profile parameters...">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      </PageFrame>
    );
  }

  return (
    <PageFrame
      title="Profile & Goal Settings"
      description="Update your body details, target weight, and intelligent nutrition goals."
      actions={
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md transition-all px-5 py-2.5 rounded-xl flex items-center gap-2"
        >
          {saving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Save className="h-4.5 w-4.5" />
          )}
          <span>Save Profile</span>
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

      <div className="space-y-6 pb-12">
        {/* TOP SECTION: Step 1 Profile & Step 2 Goal Preview Gauges */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* STEP 1: USER PROFILE CARD (7 cols) */}
          <Card className="lg:col-span-7 p-6 space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Step 1 — User Profile</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Personal metrics & target weight</p>
                </div>
              </div>
            </div>

            {/* User Details Grid */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Full Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="rounded-lg border-slate-200 dark:border-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Email</label>
                <Input
                  value={email}
                  readOnly
                  placeholder="Email"
                  className="rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Age</label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : "")}
                  placeholder="28"
                  className="rounded-lg border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Height</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value ? parseFloat(e.target.value) : "")}
                    placeholder="177"
                    className="pr-10 rounded-lg border-slate-200 dark:border-slate-800"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">cm</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Current Weight</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={currentWeightKg}
                    onChange={(e) => setCurrentWeightKg(e.target.value ? parseFloat(e.target.value) : "")}
                    placeholder="68"
                    className="pr-10 rounded-lg border-slate-200 dark:border-slate-800"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">kg</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Target Weight</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={targetWeightKg}
                    onChange={(e) => setTargetWeightKg(e.target.value ? parseFloat(e.target.value) : "")}
                    placeholder="72"
                    className="pr-10 rounded-lg border-slate-200 dark:border-slate-800"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">kg</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Activity Level</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="sedentary">Sedentary (Little/no exercise)</option>
                  <option value="light">Lightly Active (1-3 days/wk)</option>
                  <option value="moderate">Moderately Active (3-5 days/wk)</option>
                  <option value="active">Very Active (6-7 days/wk)</option>
                  <option value="athlete">Athlete / Heavy Work</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Fitness Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="loss">Weight Loss</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain">Weight Gain</option>
                  <option value="muscle">Muscle Gain</option>
                </select>
              </div>
            </div>

            {/* Scientific Recommendation Banner */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 dark:bg-emerald-950/30 dark:border-emerald-900/50 p-4 flex items-start gap-3 mt-2">
              <Lightbulb className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-emerald-800 dark:text-emerald-300 mr-1">{goalAdvice.title}:</span>
                {goalAdvice.text}
              </div>
            </div>
          </Card>

          {/* STEP 2: GOAL PREVIEW CIRCULAR GAUGES (5 cols) */}
          <Card className="lg:col-span-5 p-6 space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Goal Preview Cards</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Calculated targets based on scientific formulas</p>
              </div>

              {/* 6 Preview Gauges Grid */}
              <div className="grid grid-cols-3 gap-y-6 gap-x-4 pt-4">
                <CircularGauge label="Calories" value={`${caloriesGoal}`} unit="kcal" color="#f97316" icon={Flame} percentage={85} />
                <CircularGauge label="Protein" value={`${proteinGoal}g`} unit="" color="#22c55e" icon={Dumbbell} percentage={75} />
                <CircularGauge label="Carbs" value={`${carbGoal}g`} unit="" color="#2563eb" icon={Wheat} percentage={80} />
                <CircularGauge label="Fat" value={`${fatGoal}g`} unit="" color="#9333ea" icon={Cookie} percentage={65} />
                <CircularGauge label="Fibre" value={`${fibreGoal}g`} unit="" color="#eab308" icon={Apple} percentage={70} />
                <CircularGauge label="Water" value={`${waterGoal}`} unit="ml" color="#06b6d4" icon={Droplets} percentage={90} />
              </div>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 dark:bg-emerald-950/40 dark:border-emerald-900/50 p-3 text-center text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center justify-center gap-1.5 mt-4">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Scientific formulas automatically calculate optimal targets for your body.</span>
            </div>
          </Card>
        </div>

        {/* MIDDLE SECTION: Customization Steppers & Body Composition Cards */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* CUSTOMIZATION STEPPER CONTROLS (7 cols) */}
          <Card className="lg:col-span-7 p-6 space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Nutrition Goal Steppers</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Use scientific recommendations or adjust manually.</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={applyRecommendedGoals}
                className="text-xs border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5 rounded-lg"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                <span>Use Recommended Goals</span>
              </Button>
            </div>

            {/* 6 Stepper Inputs */}
            <div className="grid gap-4 sm:grid-cols-3">
              <MacroStepper label="🔥 Calories Goal" value={caloriesGoal} unit="kcal" step={50} onChange={(v) => { setCaloriesGoal(v); setGoalMode("custom"); }} icon={Flame} color="text-orange-500" />
              <MacroStepper label="💪 Protein Goal" value={proteinGoal} unit="g" step={5} onChange={(v) => { setProteinGoal(v); setGoalMode("custom"); }} icon={Dumbbell} color="text-emerald-500" />
              <MacroStepper label="🌾 Carbohydrates" value={carbGoal} unit="g" step={5} onChange={(v) => { setCarbGoal(v); setGoalMode("custom"); }} icon={Wheat} color="text-blue-500" />
              <MacroStepper label="🥑 Fat Goal" value={fatGoal} unit="g" step={5} onChange={(v) => { setFatGoal(v); setGoalMode("custom"); }} icon={Cookie} color="text-purple-500" />
              <MacroStepper label="🥗 Fibre Goal" value={fibreGoal} unit="g" step={1} onChange={(v) => { setFibreGoal(v); setGoalMode("custom"); }} icon={Apple} color="text-amber-500" />
              <MacroStepper label="💧 Water Intake" value={waterGoal} unit="ml" step={250} onChange={(v) => { setWaterGoal(v); setGoalMode("custom"); }} icon={Droplets} color="text-cyan-500" />
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/60 dark:bg-blue-950/30 dark:border-blue-900/50 p-3.5 flex items-center gap-2.5 text-xs text-blue-800 dark:text-blue-300">
              <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>These values propagate automatically to Dashboard, Meal Tracker, Water Tracker, and Analytics.</span>
            </div>
          </Card>

          {/* BODY COMPOSITION & ESTIMATION CARDS (5 cols) */}
          <Card className="lg:col-span-5 p-6 space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Body Composition & Estimation</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Mifflin-St Jeor & TDEE multipliers</p>
              </div>

              {/* 4 Metric Tiles */}
              <div className="grid grid-cols-2 gap-3.5 pt-4">
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-center space-y-1">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">BMI</span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metrics.bmi}</div>
                  <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${metrics.bmiColor}`}>
                    {metrics.bmiCategory}
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-center space-y-1">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">BMR (Mifflin-St Jeor)</span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metrics.bmr}</div>
                  <span className="text-[11px] text-slate-400 block">kcal/day</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-center space-y-1">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">TDEE</span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metrics.tdee}</div>
                  <span className="text-[11px] text-slate-400 block">kcal/day</span>
                </div>

                <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/30 text-center space-y-1">
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 block">Suggested Calories</span>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.recCalories}</div>
                  <span className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 block">kcal/day</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5 mt-4">
              <BarChart3 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <span>Calculated using Mifflin-St Jeor formula and activity level. </span>
                <button type="button" className="text-emerald-600 dark:text-emerald-400 font-medium underline">
                  Scientific Details
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* BOTTOM SECTION: Customization Option Selectors */}
        <Card className="p-6 space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Customization Mode</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Choose between scientific defaults and manual goal overrides.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div
              onClick={applyRecommendedGoals}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                goalMode === "recommended"
                  ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30"
                  : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
              }`}
            >
              <div className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                goalMode === "recommended" ? "border-emerald-600 bg-emerald-600" : "border-slate-300"
              }`}>
                {goalMode === "recommended" && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Use Recommended Goals</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Automatically calculate the best targets based on age, height, weight, activity level, and goal.
                </p>
              </div>
            </div>

            <div
              onClick={() => setGoalMode("custom")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                goalMode === "custom"
                  ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30"
                  : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
              }`}
            >
              <div className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                goalMode === "custom" ? "border-emerald-600 bg-emerald-600" : "border-slate-300"
              }`}>
                {goalMode === "custom" && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Edit3 className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Custom Goals</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customize Calories, Protein, Carbs, Fat, Fibre, and Water intake targets manually.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageFrame>
  );
}

{/* Sub-Component: Circular Progress Gauge */}
function CircularGauge({
  label,
  value,
  unit,
  color,
  icon: Icon,
  percentage = 75,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
  icon: any;
  percentage?: number;
}) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-1.5">
      <div className="relative w-22 h-22 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth="7"
            fill="transparent"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={color}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <Icon className="h-3.5 w-3.5 mb-0.5 opacity-80" style={{ color }} />
          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{value}</span>
          {unit && <span className="text-[10px] text-slate-400 font-medium">{unit}</span>}
        </div>
      </div>

      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
    </div>
  );
}

{/* Sub-Component: Macro Stepper Control */}
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
