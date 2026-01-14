"use client";

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const PWA_PROMPT_SHOWN_KEY = "pwa-install-prompt-shown";
const AUTO_DISMISS_DELAY = 8000; // 8 seconds

export function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const pathname = usePathname();

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

        // Check if prompt has been shown before
        const hasBeenShown = localStorage.getItem(PWA_PROMPT_SHOWN_KEY);

        // Only show on homepage and if not shown before
        const isHomepage = pathname === "/";

        // Handle beforeinstallprompt (Android/Chrome)
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Only show if on homepage, not in standalone mode, and hasn't been shown before
            if (!isStandaloneMode && isHomepage && !hasBeenShown) {
                setIsVisible(true);
                // Mark as shown in localStorage
                localStorage.setItem(PWA_PROMPT_SHOWN_KEY, "true");

                // Auto-dismiss after delay
                setTimeout(() => {
                    setIsVisible(false);
                }, AUTO_DISMISS_DELAY);
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
    }, [pathname]);

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
    if (isIOS) return null;

    return (
        <div
            className={cn(
                "fixed top-4 left-4 right-4 z-50 flex items-center justify-between gap-4 rounded-xl bg-gray-900 p-4 shadow-xl ring-1 ring-white/10 transition-all duration-300 md:left-auto md:right-4 md:w-96",
                isVisible ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0 pointer-events-none"
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
                    className="h-8 px-3 text-xs font-semibold bg-white text-gray-900 hover:bg-gray-100"
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
