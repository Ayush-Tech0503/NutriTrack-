import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Droplets,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Target,
  UtensilsCrossed,
  Weight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

const stats = [
  { label: "Calories tracked", value: "Smart" },
  { label: "Protein goals", value: "Adaptive" },
  { label: "Water streaks", value: "Daily" },
  { label: "Weight trends", value: "Weekly" },
];

const features = [
  { icon: UtensilsCrossed, title: "Meal tracker", text: "Log meals by food, quantity, and serving with instant totals." },
  { icon: Target, title: "Goal engine", text: "BMI, BMR, TDEE, and daily nutrition targets update automatically." },
  { icon: Droplets, title: "Hydration flow", text: "Track water with one-tap quick buttons and streak history." },
  { icon: Weight, title: "Weight trends", text: "Visualize daily, weekly, and monthly bodyweight progress." },
  { icon: BarChart3, title: "Analytics", text: "See intake patterns, top foods, averages, and nutrition trends." },
  { icon: ShieldCheck, title: "Secure auth", text: "JWT auth, bcrypt hashing, protected routes, and admin tooling." },
];

export default function LandingPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary p-3 text-primary-foreground shadow-glow">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div>
            <p className="font-space text-lg font-semibold tracking-tight">NutriTrack</p>
            <p className="text-xs text-muted-foreground">Nutrition intelligence for the modern athlete</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button asChild>
            <Link href="/dashboard">
              Open Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Intelligent Single-User Nutrition OS
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl font-space text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Track Your Nutrition Smarter.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Track calories, protein, carbohydrates, water, and weight in one beautiful dashboard powered by scientific formulas.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/profile">Setup Profile</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-xl font-semibold">{stat.value}</p>
              </Card>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-emerald-300/10 to-transparent blur-3xl" />
          <Card className="overflow-hidden p-0">
            <div className="border-b border-border/60 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900 px-6 py-5 text-white">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Daily Snapshot</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  ["Calories", "1,840 / 2,100"],
                  ["Protein", "132g / 150g"],
                  ["Carbs", "211g / 260g"],
                  ["Water", "2.4L / 3.0L"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-white/60">{label}</p>
                    <p className="mt-2 text-xl font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3">
                  <span className="font-medium">Eggs and oats breakfast</span>
                  <span className="text-sm text-muted-foreground">482 kcal</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3">
                  <span className="font-medium">Chicken bowl lunch</span>
                  <span className="text-sm text-muted-foreground">612 kcal</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3">
                  <span className="font-medium">Greek yogurt snack</span>
                  <span className="text-sm text-muted-foreground">168 kcal</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mt-20 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className={`p-6 ${index === 0 ? "shadow-glow" : ""}`}>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.text}</p>
            </Card>
          );
        })}
      </section>

      <section className="mt-20 grid gap-6 lg:grid-cols-2">
        <Card className="p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Testimonials</p>
          <div className="mt-4 space-y-4">
            <blockquote className="text-lg leading-8">
              "NutriTrack gave me the clarity MyFitnessPal lacked and the polish I expect from a modern SaaS product."
            </blockquote>
            <p className="text-sm text-muted-foreground">Ava, strength coach</p>
          </div>
        </Card>
        <Card className="p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">FAQ</p>
          <div className="mt-4 space-y-4 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Is the food database custom?</strong> Yes, it is imported from the attached PDF during setup.</p>
            <p><strong className="text-foreground">Can I add custom foods?</strong> Yes, users can create their own foods and meals.</p>
            <p><strong className="text-foreground">Does it support reports?</strong> Yes, CSV, Excel, and PDF export paths are included in the backend.</p>
          </div>
        </Card>
      </section>
    </div>
  );
}

