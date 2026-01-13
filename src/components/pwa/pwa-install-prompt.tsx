"use client";

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if running in standalone mode (already installed)
        const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone ||
            document.referrer.includes("android-app://");
        setIsStandalone(isStandaloneMode);

        // Check if iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // Handle beforeinstallprompt (Android/Chrome)
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Update UI notify the user they can install the PWA
            if (!isStandaloneMode) {
                setIsVisible(true);
            }
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Optional: Check if already installed via handler
        window.addEventListener("appinstalled", () => {
            setIsVisible(false);
            setDeferredPrompt(null);
            console.log("PWA was installed");
        });

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        await deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
    };

    if (!isVisible && !isIOS) return null;

    // Don't show if already in standalone mode
    if (isStandalone) return null;

    // iOS specific prompt (since it doesn't support beforeinstallprompt)
    // Only show generic IOS prompt if we haven't dismissed it in session (could use localStorage in real app)
    // For now, focusing on the requested "Toast" style. 
    // We'll show the standard prompt logic mainly, but can add iOS specific UI later if requested.
    // Returning null for IOS for now to focus on the "Install Button" flow which relies on deferredPrompt.
    // If user wants iOS instructions, we can add that logic, but standard Install Button only works with deferredPrompt.
    if (isIOS) return null;

    return (
        <div
            className={cn(
                "fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-4 rounded-xl bg-gray-900 p-4 shadow-xl ring-1 ring-white/10 transition-all duration-300 md:left-auto md:right-4 md:w-96",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
            )}
        >
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white">
                    <Download className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">Install App</span>
                    <span className="text-xs text-gray-400">
                        Add to home screen for better experience
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 px-3 text-xs font-semibold"
                    onClick={handleInstallClick}
                >
                    Install
                </Button>
                <button
                    onClick={handleDismiss}
                    className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Dismiss</span>
                </button>
            </div>
        </div>
    );
}
