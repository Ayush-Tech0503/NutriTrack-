"use client";

import { useState } from "react";

import { apiFetch } from "@/lib/api";
import { PageFrame } from "@/components/page-frame";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const quickButtons = [250, 500, 750, 1000];

export default function WaterTrackerPage() {
  const [total, setTotal] = useState(0);

  return (
    <PageFrame title="Water Tracker" description="Tap quick buttons to log hydration in seconds.">
      <div className="grid gap-4 p-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Daily goal</p>
              <p className="text-4xl font-semibold">{total / 1000} L</p>
            </div>
            <p className="text-sm text-muted-foreground">of 3.0 L</p>
          </div>
          <div className="mt-4">
            <Progress value={(total / 3000) * 100} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {quickButtons.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                onClick={async () => {
                  await apiFetch("/api/water", { method: "POST", body: JSON.stringify({ amount_ml: amount }) });
                  setTotal((value) => value + amount);
                }}
              >
                +{amount}ml
              </Button>
            ))}
          </div>
        </Card>
        <Card className="p-5 text-sm text-muted-foreground">
          Hydration history and streaks are returned by the backend water log endpoint. This screen is wired for quick logging and live progress.
        </Card>
      </div>
    </PageFrame>
  );
}

