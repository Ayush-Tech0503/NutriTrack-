"use client";

import { useEffect, useState } from "react";
import { BarChart3, Flame, Trophy } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { PageFrame } from "@/components/page-frame";
import { Card } from "@/components/ui/card";
import { NutritionChart } from "@/components/nutrition-chart";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>({ series: [], topFoods: [], averages: {} });

  useEffect(() => {
    apiFetch("/api/analytics").then(setData).catch(() => setData({ series: [], topFoods: [], averages: {} }));
  }, []);

  return (
    <PageFrame title="Analytics" description="View daily, weekly, and monthly nutrition trends at a glance.">
      <div className="grid gap-4 p-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <h3 className="mb-4 text-lg font-semibold">Nutrition trends</h3>
          <NutritionChart data={data.series || []} />
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Flame className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Average calories</p>
                <p className="text-2xl font-semibold">{data.averages?.calories ?? 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Average protein</p>
                <p className="text-2xl font-semibold">{data.averages?.protein ?? 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Most eaten foods</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {(data.topFoods || []).map((food: any) => (
                    <li key={food.name} className="flex items-center justify-between">
                      <span>{food.name}</span>
                      <span className="text-muted-foreground">{food.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageFrame>
  );
}

