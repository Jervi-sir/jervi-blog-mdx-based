"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative cursor-pointer overflow-hidden"
    >
      <img
        src="/charlie-1.png"
        alt="Magic UI"
        className="w-10 h-10 object-cover rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      />
      <img
        src="/charlie-2.png"
        alt="Magic UI"
        className="w-10 h-10 object-cover absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
