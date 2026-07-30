"use client";

import { useState } from "react";

import { apiFetch } from "@/lib/api";
import { PageFrame } from "@/components/page-frame";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export default function WeightTrackerPage() {
  const [weight, setWeight] = useState("");
  const [value, setValue] = useState(0);

  return (
    <PageFrame title="Weight Tracker" description="Record your daily bodyweight and monitor the trend line.">
      <div className="grid gap-4 p-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Latest weight</p>
          <p className="mt-2 text-4xl font-semibold">{value || "—"} kg</p>
          <div className="mt-4">
            <Progress value={Math.min(100, value ? (value / 120) * 100 : 0)} />
          </div>
          <div className="mt-6 space-y-3">
            <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight in kg" />
            <Button
              onClick={async () => {
                await apiFetch("/api/weight", { method: "POST", body: JSON.stringify({ weight_kg: Number(weight) }) });
                setValue(Number(weight));
                setWeight("");
              }}
            >
              Log weight
            </Button>
          </div>
        </Card>
        <Card className="p-5 text-sm text-muted-foreground">
          The backend stores daily weights and can power weekly and monthly trend charts. BMI is calculated in your profile goals.
        </Card>
      </div>
    </PageFrame>
  );
}

