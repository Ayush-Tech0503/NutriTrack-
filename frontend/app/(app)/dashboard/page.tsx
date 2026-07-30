"use client";

import { useEffect, useState } from "react";
import { Apple, Flame, Droplets, Orbit, Scale, Dumbbell, Cookie } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { PageFrame } from "@/components/page-frame";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    apiFetch("/api/dashboard").then(setData).catch(() => setData(null));
  }, []);

  const todayCal = data?.todayCalories ?? 0;
  const calGoal = data?.dailyCaloriesGoal ?? 2400;
  const calRemaining = data?.caloriesRemaining ?? Math.max(0, calGoal - todayCal);

  const todayPro = data?.todayProtein ?? 0;
  const proGoal = data?.dailyProteinGoal ?? 160;

  const todayCarbs = data?.todayCarbs ?? 0;
  const carbGoal = data?.dailyCarbGoal ?? 300;

  const todayFat = data?.todayFat ?? 0;
  const fatGoal = data?.dailyFatGoal ?? 75;

  const todayWaterL = ((data?.waterIntake ?? 0) / 1000).toFixed(1);
  const waterGoalL = ((data?.dailyWaterGoal ?? 3500) / 1000).toFixed(1);

  const stats = [
    {
      label: "Calories",
      display: `${todayCal} / ${calGoal} kcal`,
      sub: `${calRemaining} kcal remaining`,
      percent: Math.min(100, Math.round((todayCal / calGoal) * 100)),
      icon: Flame,
      color: "text-orange-500",
    },
    {
      label: "Protein",
      display: `${todayPro} / ${proGoal} g`,
      sub: `${Math.max(0, Math.round(proGoal - todayPro))}g remaining`,
      percent: Math.min(100, Math.round((todayPro / proGoal) * 100)),
      icon: Dumbbell,
      color: "text-emerald-500",
    },
    {
      label: "Carbohydrates",
      display: `${todayCarbs} / ${carbGoal} g`,
      sub: `${Math.max(0, Math.round(carbGoal - todayCarbs))}g remaining`,
      percent: Math.min(100, Math.round((todayCarbs / carbGoal) * 100)),
      icon: Apple,
      color: "text-blue-500",
    },
    {
      label: "Fat",
      display: `${todayFat} / ${fatGoal} g`,
      sub: `${Math.max(0, Math.round(fatGoal - todayFat))}g remaining`,
      percent: Math.min(100, Math.round((todayFat / fatGoal) * 100)),
      icon: Cookie,
      color: "text-purple-500",
    },
    {
      label: "Water Intake",
      display: `${todayWaterL} / ${waterGoalL} L`,
      sub: `${Math.max(0, parseFloat((parseFloat(waterGoalL) - parseFloat(todayWaterL)).toFixed(1)))} L remaining`,
      percent: Math.min(100, Math.round(((data?.waterIntake ?? 0) / (data?.dailyWaterGoal ?? 3500)) * 100)),
      icon: Droplets,
      color: "text-cyan-500",
    },
    {
      label: "Current Weight",
      display: `${data?.weight ?? "68"} kg`,
      sub: "Log in Weight Tracker",
      percent: 100,
      icon: Scale,
      color: "text-slate-500",
    },
  ];

  return (
    <PageFrame
      title="Dashboard"
      description="Live tracking of calories, macros, hydration, and bodyweight targets."
      actions={<Badge className="text-emerald-600 bg-emerald-50 border border-emerald-200">Live Progress</Badge>}
    >
      <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{item.label}</p>
                <Icon className={`h-4.5 w-4.5 ${item.color}`} />
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{item.display}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.sub}</p>
              <div className="mt-4">
                <Progress value={item.percent} className="h-2" />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 border-t border-border/70 p-4 lg:grid-cols-2">
        <Card className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Today's Meals</h3>
          <div className="mt-4 space-y-3">
            {(data?.recentMeals || []).map((meal: any) => (
              <div key={meal.id} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-900 px-4 py-3 border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{meal.meal_name}</p>
                  <p className="text-xs text-slate-500 capitalize">{meal.meal_type}</p>
                </div>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{meal.calories} kcal</p>
              </div>
            ))}
            {!data?.recentMeals?.length && <p className="text-sm text-slate-500">No meals logged yet today.</p>}
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Nutrition Insights</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 dark:bg-emerald-950/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Protein Target</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {Math.min(100, Math.round((todayPro / proGoal) * 100))}%
              </p>
            </div>
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 dark:bg-cyan-950/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">Hydration</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {Math.min(100, Math.round(((data?.waterIntake ?? 0) / (data?.dailyWaterGoal ?? 3500)) * 100))}%
              </p>
            </div>
          </div>
        </Card>
      </div>
    </PageFrame>
  );
}
