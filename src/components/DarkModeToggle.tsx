"use client";
import { useTheme } from "@/contexts/ThemeProvider";
import { useState, useEffect } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

export const DarkModeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Kiểm tra scroll
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={`p-2 rounded-full text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
        isScrolled ? "shadow-md" : ""
      }`}
      aria-label="Chuyển đổi chế độ tối/sáng"
    >
      {theme === "dark" ? (
        <FiSun className="text-amber-400" size={20} />
      ) : (
        <FiMoon className="text-gray-700" size={20} />
      )}
    </button>
  );
};
