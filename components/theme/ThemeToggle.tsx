"use client";
import { useEffect, useState } from "react";
import Toggle from "@rinzai/components/Toggle";

export default function ThemeToggle() {
    const [isDarkMode, setDarkMode] = useState(false);
    useEffect(() => {
        if (
            localStorage.theme === "dark" ||
            (!("theme" in localStorage) &&
                window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
            document.documentElement.setAttribute("data-theme", "dark");
            setDarkMode(true);
        } else {
            document.documentElement.setAttribute("data-theme", "light");
            setDarkMode(false);
        }
    }, []);

    return (
        <Toggle
            checked={isDarkMode}
            onChange={(checked) => {
                if (checked) {
                    document.documentElement.setAttribute("data-theme", "dark");
                    localStorage.setItem("theme", "dark");
                    setDarkMode(true);
                } else {
                    document.documentElement.setAttribute(
                        "data-theme",
                        "light",
                    );
                    localStorage.setItem("theme", "light");
                    setDarkMode(false);
                }
            }}
        />
    );
}
