"use client";

import { useState } from "react";
import { PageFrame } from "@/components/page-frame";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TBody, Td, THead, Th, Tr } from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import {
  Sparkles,
  Flame,
  Dumbbell,
  Wheat,
  AlertCircle,
  CheckCircle2,
  UtensilsCrossed,
  ArrowRight,
  Loader2,
  Salad,
} from "lucide-react";

interface GeminiFoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fibre: number;
}

interface GeminiNutritionTotal {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fibre: number;
}

interface GeminiAnalysisResponse {
  success: boolean;
  foods?: GeminiFoodItem[];
  total?: GeminiNutritionTotal;
  error?: string;
  meal_id?: number;
}

const PLACEHOLDER_TEXT = `Examples

2 Eggs

Chicken Breast 200g

1 Bowl Oats

I ate 2 eggs, 200ml milk and one banana.

Chicken Biryani and Raita

Paneer Butter Masala with 2 Rotis`;

export default function MealTrackerPage() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<GeminiAnalysisResponse | null>(null);

  const handleCalculate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setAnalysis(null);

    try {
      const res: GeminiAnalysisResponse = await apiFetch("/api/meals/parse-diet", {
        method: "POST",
        body: JSON.stringify({ text: inputText }),
      });
      setAnalysis(res);
    } catch (err: any) {
      setAnalysis({
        success: false,
        error: err.message || "We couldn't analyze this meal. Please provide a little more detail.",
      });
    } finally {
      setLoading(false);
    }
  };

  const foods = analysis?.foods || [];
  const total = analysis?.total || {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fibre: 0,
  };

  return (
    <PageFrame
      title="Meal Tracker"
      description="Type what you ate naturally. Powered by Google Gemini API for instant, precise nutrition calculations."
    >
      <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-6">
        {/* Input Card */}
        <Card className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-background via-background to-emerald-950/5 p-6 shadow-xl md:p-8 backdrop-blur-md">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

          <div className="relative space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  Gemini AI Nutrition Engine
                </div>
                <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl text-foreground">
                  What did you eat today?
                </h2>
                <p className="mt-1 text-sm md:text-base text-muted-foreground">
                  Type your meals naturally in plain English or regional terms.
                </p>
              </div>
              <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-inner">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
            </div>

            {/* Input Box */}
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={PLACEHOLDER_TEXT}
                rows={7}
                className="w-full resize-none rounded-2xl border border-border/80 bg-card/60 p-4 text-sm md:text-base text-foreground placeholder:text-muted-foreground/60 shadow-sm transition-all focus:border-emerald-500 focus:bg-background focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
              />
            </div>

            {/* Calculate Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Instant Gemini AI nutrition estimation & auto-save
              </span>

              <Button
                onClick={handleCalculate}
                disabled={loading || !inputText.trim()}
                className="group relative inline-flex items-center gap-2.5 rounded-full bg-emerald-600 px-6 py-6 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/35 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing with Gemini...
                  </>
                ) : (
                  <>
                    <span>Calculate Nutrition</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Error Handling State */}
        {analysis && !analysis.success && (
          <Card className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-800 dark:text-amber-200 backdrop-blur-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
              <p className="font-medium text-sm md:text-base">
                {analysis.error || "We couldn't analyze this meal. Please provide a little more detail."}
              </p>
            </div>
          </Card>
        )}

        {/* Success Results Section */}
        {analysis && analysis.success && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Apple Health Style Totals Cards (5 Metrics: Calories, Protein, Carbs, Fat, Fibre) */}
            <div className="grid gap-3 sm:grid-cols-5">
              {/* Total Calories */}
              <Card className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-background to-background p-5 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    🔥 Calories
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold tracking-tight text-foreground">
                    {total.calories}
                  </span>
                  <span className="text-xs text-muted-foreground">kcal</span>
                </div>
              </Card>

              {/* Total Protein */}
              <Card className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-background to-background p-5 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    💪 Protein
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold tracking-tight text-foreground">
                    {total.protein}
                  </span>
                  <span className="text-xs text-muted-foreground">g</span>
                </div>
              </Card>

              {/* Total Carbohydrates */}
              <Card className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-background to-background p-5 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    🌾 Carbs
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold tracking-tight text-foreground">
                    {total.carbohydrates}
                  </span>
                  <span className="text-xs text-muted-foreground">g</span>
                </div>
              </Card>

              {/* Total Fat */}
              <Card className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-background to-background p-5 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    🥑 Fat
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold tracking-tight text-foreground">
                    {total.fat}
                  </span>
                  <span className="text-xs text-muted-foreground">g</span>
                </div>
              </Card>

              {/* Total Fibre */}
              <Card className="relative overflow-hidden rounded-3xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 via-background to-background p-5 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    🥗 Fibre
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold tracking-tight text-foreground">
                    {total.fibre}
                  </span>
                  <span className="text-xs text-muted-foreground">g</span>
                </div>
              </Card>
            </div>

            {/* Nutrition Table */}
            <Card className="overflow-hidden rounded-3xl border border-border/80 shadow-lg backdrop-blur-md">
              <div className="border-b border-border/60 bg-muted/40 px-6 py-4 flex items-center justify-between">
                <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  Meal Breakdown & Values
                </h3>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Auto-saved to database
                </span>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <THead>
                    <Tr className="border-b border-border/60 bg-muted/20 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Th className="py-3.5 pl-6">Food</Th>
                      <Th className="py-3.5">Estimated Quantity</Th>
                      <Th className="py-3.5 text-right">Calories</Th>
                      <Th className="py-3.5 text-right">Protein</Th>
                      <Th className="py-3.5 text-right">Carbohydrates</Th>
                      <Th className="py-3.5 text-right">Fat</Th>
                      <Th className="py-3.5 pr-6 text-right">Fibre</Th>
                    </Tr>
                  </THead>
                  <TBody>
                    {foods.map((food, idx) => (
                      <Tr
                        key={idx}
                        className="border-b border-border/40 hover:bg-emerald-500/5 transition-colors"
                      >
                        <Td className="py-4 pl-6 font-semibold text-foreground">
                          {food.name}
                        </Td>
                        <Td className="py-4 font-medium text-emerald-600 dark:text-emerald-400">
                          {food.quantity}
                        </Td>
                        <Td className="py-4 text-right font-medium text-foreground">
                          {food.calories} <span className="text-xs text-muted-foreground">kcal</span>
                        </Td>
                        <Td className="py-4 text-right font-medium text-foreground">
                          {food.protein} <span className="text-xs text-muted-foreground">g</span>
                        </Td>
                        <Td className="py-4 text-right font-medium text-foreground">
                          {food.carbohydrates} <span className="text-xs text-muted-foreground">g</span>
                        </Td>
                        <Td className="py-4 text-right font-medium text-foreground">
                          {food.fat} <span className="text-xs text-muted-foreground">g</span>
                        </Td>
                        <Td className="py-4 pr-6 text-right font-medium text-foreground">
                          {food.fibre} <span className="text-xs text-muted-foreground">g</span>
                        </Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageFrame>
  );
}
