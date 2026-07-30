import { clearToken, getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Fallback Local Storage Data Helper for Standalone Client Deployments (Vercel)
function handleLocalFallback(path: string, init: RequestInit = {}) {
  if (typeof window === "undefined") return null;

  const method = (init.method || "GET").toUpperCase();

  // 1. Profile / User Endpoint
  if (path.startsWith("/api/auth/me")) {
    const raw = localStorage.getItem("nutritrack_profile");
    let profile = raw
      ? JSON.parse(raw)
      : {
          name: "Ayush Rathore",
          email: "ayush@gmail.com",
          age: 28,
          gender: "male",
          height_cm: 177,
          current_weight_kg: 68,
          goal_weight_kg: 72,
          activity_level: "moderate",
          goal: "gain_muscle",
          daily_calories_goal: 2800,
          daily_protein_goal: 150,
          daily_carb_goal: 350,
          daily_fat_goal: 80,
          daily_fibre_goal: 30,
          daily_water_goal: 2584,
          bmi: 21.7,
          bmr: 1654,
          tdee: 2560,
        };

    if (method === "PUT" && init.body) {
      const body = JSON.parse(init.body as string);
      profile = { ...profile, ...body };
      localStorage.setItem("nutritrack_profile", JSON.stringify(profile));
    }
    return profile;
  }

  // 2. Dashboard Summary Endpoint
  if (path.startsWith("/api/dashboard")) {
    const profileRaw = localStorage.getItem("nutritrack_profile");
    const profile = profileRaw ? JSON.parse(profileRaw) : null;
    const mealsRaw = localStorage.getItem("nutritrack_meals") || "[]";
    const meals = JSON.parse(mealsRaw);
    const waterRaw = localStorage.getItem("nutritrack_water_logs") || "[]";
    const waterLogs = JSON.parse(waterRaw);

    const todayStr = new Date().toISOString().split("T")[0];
    const todayMeals = meals.filter((m: any) => m.created_at && m.created_at.startsWith(todayStr));
    const todayWater = waterLogs
      .filter((w: any) => w.logged_at && w.logged_at.startsWith(todayStr))
      .reduce((sum: number, w: any) => sum + (w.amount_ml || 0), 0);

    const todayCal = todayMeals.reduce((s: number, m: any) => s + (m.calories || 0), 0);
    const todayPro = todayMeals.reduce((s: number, m: any) => s + (m.protein || 0), 0);
    const todayCarbs = todayMeals.reduce((s: number, m: any) => s + (m.carbohydrates || 0), 0);
    const todayFat = todayMeals.reduce((s: number, m: any) => s + (m.fat || 0), 0);
    const todayFibre = todayMeals.reduce((s: number, m: any) => s + (m.fibre || 0), 0);

    const calGoal = profile?.daily_calories_goal || 2800;

    return {
      todayCalories: todayCal,
      todayProtein: todayPro,
      todayCarbs: todayCarbs,
      todayFat: todayFat,
      todayFibre: todayFibre,
      dailyCaloriesGoal: calGoal,
      dailyProteinGoal: profile?.daily_protein_goal || 150,
      dailyCarbGoal: profile?.daily_carb_goal || 350,
      dailyFatGoal: profile?.daily_fat_goal || 80,
      dailyFibreGoal: profile?.daily_fibre_goal || 30,
      dailyWaterGoal: profile?.daily_water_goal || 2584,
      caloriesRemaining: Math.max(0, calGoal - todayCal),
      waterIntake: todayWater,
      weight: profile?.current_weight_kg || 68,
      recentMeals: meals.slice(0, 5),
    };
  }

  // 3. Meals Endpoint
  if (path.startsWith("/api/meals")) {
    const raw = localStorage.getItem("nutritrack_meals") || "[]";
    let meals = JSON.parse(raw);

    if (method === "POST" && init.body) {
      const body = JSON.parse(init.body as string);
      const newMeal = {
        id: Date.now(),
        meal_type: body.meal_type || "meal",
        meal_name: body.meal_name || "Custom Meal",
        calories: body.items ? body.items.reduce((s: number, i: any) => s + (i.quantity || 1) * 200, 0) : 350,
        protein: 25,
        carbohydrates: 40,
        fat: 12,
        fibre: 5,
        created_at: new Date().toISOString(),
        items: body.items || [],
      };
      meals = [newMeal, ...meals];
      localStorage.setItem("nutritrack_meals", JSON.stringify(meals));
      return newMeal;
    }
    return meals;
  }

  // 4. Water Logs Endpoint
  if (path.startsWith("/api/tracker/water")) {
    const raw = localStorage.getItem("nutritrack_water_logs") || "[]";
    let waterLogs = JSON.parse(raw);

    if (method === "POST" && init.body) {
      const body = JSON.parse(init.body as string);
      const newEntry = {
        id: Date.now(),
        amount_ml: body.amount_ml || 250,
        logged_at: new Date().toISOString(),
      };
      waterLogs = [newEntry, ...waterLogs];
      localStorage.setItem("nutritrack_water_logs", JSON.stringify(waterLogs));
      return newEntry;
    }
    return waterLogs;
  }

  // 5. Weight Logs Endpoint
  if (path.startsWith("/api/tracker/weight")) {
    const raw = localStorage.getItem("nutritrack_weight_logs") || "[]";
    let weightLogs = JSON.parse(raw);

    if (method === "POST" && init.body) {
      const body = JSON.parse(init.body as string);
      const newEntry = {
        id: Date.now(),
        weight_kg: body.weight_kg || 68,
        logged_at: new Date().toISOString(),
      };
      weightLogs = [newEntry, ...weightLogs];
      localStorage.setItem("nutritrack_weight_logs", JSON.stringify(weightLogs));

      // Update weight in profile
      const profRaw = localStorage.getItem("nutritrack_profile");
      if (profRaw) {
        const prof = JSON.parse(profRaw);
        prof.current_weight_kg = body.weight_kg;
        localStorage.setItem("nutritrack_profile", JSON.stringify(prof));
      }
      return newEntry;
    }
    return weightLogs;
  }

  // Default Fallback
  return [];
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = typeof window !== "undefined" ? getToken() : null;
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
    });
    if (response.status === 401) {
      if (typeof window !== "undefined") clearToken();
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.detail || `Request failed with status ${response.status}`);
    }
    if (response.status === 204) return null;
    return await response.json();
  } catch (err: any) {
    console.warn(`[apiFetch] Server connection unavailable for ${path}. Using local storage fallback.`);
    return handleLocalFallback(path, init);
  }
}
