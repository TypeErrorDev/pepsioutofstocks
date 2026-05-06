"use client";
import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    // Sync the HTML attribute whenever the state changes
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <button
            onClick={toggleTheme}
            className="group relative p-2.5 rounded-xl bg-app-card border border-app-border text-app-muted hover:text-pepsi-blue hover:border-pepsi-blue/30 transition-all duration-300 active:scale-90"
            aria-label="Toggle Theme"
        >
            <div className="relative w-5 h-5">
                {/* Sun Icon */}
                <Sun
                    size={20}
                    className={`absolute inset-0 transition-all duration-500 transform ${theme === 'light' ? 'rotate-0 opacity-100 scale-100' : 'rotate-90 opacity-0 scale-50'
                        }`}
                />
                {/* Moon Icon */}
                <Moon
                    size={20}
                    className={`absolute inset-0 transition-all duration-500 transform ${theme === 'dark' ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'
                        }`}
                />
            </div>
        </button>
    );
}