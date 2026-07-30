"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/auth";

const authSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(8),
  gender: z.string().optional(),
  age: z.coerce.number().int().positive().optional(),
  height_cm: z.coerce.number().positive().optional(),
  current_weight_kg: z.coerce.number().positive().optional(),
  goal_weight_kg: z.coerce.number().positive().optional(),
  activity_level: z.string().optional(),
  goal: z.string().optional(),
});

type AuthValues = z.infer<typeof authSchema>;

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      gender: "male",
      activity_level: "moderate",
      goal: "maintain",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      const payload =
        mode === "login"
          ? { email: values.email, password: values.password }
          : {
              name: values.name,
              email: values.email,
              password: values.password,
              gender: values.gender,
              age: values.age,
              height_cm: values.height_cm,
              current_weight_kg: values.current_weight_kg,
              goal_weight_kg: values.goal_weight_kg,
              activity_level: values.activity_level,
              goal: values.goal,
            };
      const result = await apiFetch(`/api/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setToken(result.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  });

  return (
    <Card className="mx-auto w-full max-w-xl">
      <div className="space-y-2">
        <CardTitle>{mode === "login" ? "Welcome back" : "Create your account"}</CardTitle>
        <CardDescription>{mode === "login" ? "Sign in to your nutrition dashboard." : "Start tracking calories, protein, carbs, water, and weight."}</CardDescription>
      </div>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {mode === "register" && (
          <Input placeholder="Full name" {...form.register("name")} />
        )}
        <Input placeholder="Email address" type="email" {...form.register("email")} />
        <Input placeholder="Password" type="password" {...form.register("password")} />
        {mode === "register" && (
          <div className="grid gap-4 md:grid-cols-2">
            <Select {...form.register("gender")}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
            <Input placeholder="Age" type="number" {...form.register("age")} />
            <Input placeholder="Height (cm)" type="number" {...form.register("height_cm")} />
            <Input placeholder="Current weight (kg)" type="number" {...form.register("current_weight_kg")} />
            <Input placeholder="Goal weight (kg)" type="number" {...form.register("goal_weight_kg")} />
            <Select {...form.register("activity_level")}>
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="athlete">Athlete</option>
            </Select>
            <Select {...form.register("goal")}>
              <option value="lose_weight">Weight Loss</option>
              <option value="gain_muscle">Muscle Gain</option>
              <option value="maintain">Maintain Weight</option>
            </Select>
          </div>
        )}
        {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full">
          {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>
    </Card>
  );
}

