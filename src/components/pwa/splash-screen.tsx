"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        // Prevent scrolling while splash is visible
        if (isVisible) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        // Minimum display time for the splash screen (e.g., 2 seconds)
        // to prevent it from flashing too quickly
        const timer = setTimeout(() => {
            setOpacity(0);

            // Remove from DOM after transition matches duration
            setTimeout(() => {
                setIsVisible(false);
            }, 500); // 500ms fade-out duration
        }, 2000);

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = "unset";
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500",
                opacity === 0 ? "opacity-0" : "opacity-100"
            )}
        >
            <div className="relative flex flex-col items-center animate-in zoom-in-95 duration-700">
                <div className="relative h-24 w-64 md:h-32 md:w-80 overflow-hidden">
                    {/* Using standard img tag fallback if Next.js Image fails or for simplicity without width/height knowledge, 
                 but Next.js Image is preferred. Assuming standard logo aspect ratio. 
                 Using object-contain to be safe. */}
                    <Image
                        src="/logo/cedarelevators.png"
                        alt="Cedar Elevators"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Optional Loading Indicator */}
                <div className="mt-8 flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-orange-600 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 rounded-full bg-orange-600 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 rounded-full bg-orange-600 animate-bounce"></div>
                </div>
            </div>
        </div>
    );
}
