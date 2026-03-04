"use client";

import { useLanguage } from "@/components/sahara/LanguageContext";
import { useEffect, useState } from "react";

interface TranslatedTextProps {
    children: string;
    className?: string;
}

export function TranslatedText({ children, className }: TranslatedTextProps) {
    const { translate, language } = useLanguage();
    const [translated, setTranslated] = useState<string>(children);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function performTranslation() {
            if (language === "en") {
                setTranslated(children);
                return;
            }

            setLoading(true);
            const result = await translate(children);
            setTranslated(result);
            setLoading(false);
        }

        performTranslation();
    }, [children, language, translate]);

    if (loading) {
        return <span className={`${className} animate-pulse opacity-50`}>{translated}</span>;
    }

    return <span className={className}>{translated}</span>;
}
