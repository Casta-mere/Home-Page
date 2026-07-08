"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { RxMoon, RxSun } from "react-icons/rx";

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  // The real theme is only known on the client; render a neutral placeholder
  // until mounted so server and client markup match.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedTheme === "dark";

  return (
    <button
      className="hl-btn"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {dark ? <RxMoon /> : <RxSun />}
    </button>
  );
};

export default ThemeToggle;
