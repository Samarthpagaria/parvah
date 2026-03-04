"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "hi" | "en" | "mr" | "bn" | "ta" | "te";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    translate: (text: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

    const t = (key: string): string => key;
    const translate = async (text: string): Promise<string> => text;

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, translate }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        // Fallback for when provider is missing
        return {
            language: "en",
            setLanguage: () => {},
            t: (key: string) => key,
            translate: async (text: string) => text
        };
    }
    return ctx;
}
