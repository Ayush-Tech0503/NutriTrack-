"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Apple,
  BarChart3,
  Droplets,
  Home,
  LogOut,
  Scale,
  Settings,
  Salad,
  UserCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { clearToken, getToken, setToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/meal-tracker", label: "Meal Tracker", icon: Salad },
  { href: "/water-tracker", label: "Water Tracker", icon: Droplets },
  { href: "/weight-tracker", label: "Weight Tracker", icon: Scale },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: UserCircle2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then((user) => {
        // If height or weight is not configured yet, redirect to profile setup on first launch
        if (user && (!user.height_cm || !user.current_weight_kg) && pathname !== "/profile") {
          router.replace("/profile");
        }
        setReady(true);
      })
      .catch(() => {
        setReady(true);
      });
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-card/80 px-6 py-4 shadow-xl backdrop-blur-md">
          <Activity className="h-5 w-5 animate-pulse text-emerald-500" />
          <span className="text-sm font-medium text-muted-foreground">Loading NutriTrack...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 border-r border-border/70 bg-white/50 px-4 py-6 backdrop-blur-xl lg:block dark:bg-slate-950/30">
          <div className="mb-8 rounded-3xl bg-gradient-to-br from-primary/15 to-emerald-400/10 p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary p-3 text-primary-foreground shadow-glow">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">NutriTrack</p>
                <p className="text-xs text-muted-foreground">Premium nutrition OS</p>
              </div>
            </div>
          </div>
          <nav className="space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                    active ? "bg-primary text-primary-foreground shadow-glow" : "text-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 space-y-3">
            <ThemeToggle />
            <Button
              variant="outline"
              className="w-full justify-start rounded-2xl"
              onClick={() => {
                router.push("/profile");
              }}
            >
              <UserCircle2 className="h-4 w-4" />
              Profile Settings
            </Button>
          </div>
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

