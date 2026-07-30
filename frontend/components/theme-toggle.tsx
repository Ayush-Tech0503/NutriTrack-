"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getTheme, setTheme } from "@/lib/auth";

export function ThemeToggle() {
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  useEffect(() => {
    const initial = getTheme() as "light" | "dark";
    setThemeState(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setThemeState(next);
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <Button variant="outline" size="sm" onClick={toggle} className="rounded-full">
      {theme === "light" ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
      {theme === "light" ? "Dark mode" : "Light mode"}
    </Button>
  );
}

