// frontend/src/hooks/useDarkMode.js
import { useEffect, useState } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Add fade effect on toggle
  useEffect(() => {
    const body = document.body;
    body.classList.add("transition-opacity");
    body.style.transition = "background-color 0.5s ease, color 0.5s ease";
  }, []);

  // Apply dark class to <html>
  useEffect(() => {
    const root = document.documentElement;

    // Small fade animation
    root.style.transition = "background-color 0.5s ease, color 0.5s ease";
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("darkMode", String(isDark));
  }, [isDark]);

  const toggle = () => setIsDark((prev) => !prev);

  return { isDark, toggle };
}
