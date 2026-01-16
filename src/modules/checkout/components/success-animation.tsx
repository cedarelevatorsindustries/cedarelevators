"use client"

import { useEffect, useState, useRef } from 'react'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'

interface SuccessAnimationProps {
    children: React.ReactNode
    onAnimationComplete?: () => void
}

/**
 * Success Animation Component
 * 
 * Displays a fullscreen animation sequence:
 * 1. Green background fills screen (0-800ms)
 * 2. Orange checkmark icon appears with scale animation (800-1500ms)
 * 3. Fade transition from green to white (1500-2000ms)
 * 4. Show content with fade-in (2000ms+)
 */
export default function SuccessAnimation({ children, onAnimationComplete }: SuccessAnimationProps) {
    const [phase, setPhase] = useState<'green' | 'icon' | 'fade' | 'content'>('green')
    const [animationData, setAnimationData] = useState<any>(null)
    const lottieRef = useRef<LottieRefCurrentProps>(null)

    useEffect(() => {
        // Fetch the animation data from public folder
        fetch('/animation/Tick Animation.json')
            .then(res => res.json())
            .then(data => setAnimationData(data))
            .catch(err => console.error('Failed to load animation:', err))

        // Phase 1: Green background (0-800ms)
        const iconTimer = setTimeout(() => {
            setPhase('icon')
            lottieRef.current?.play()
        }, 800)

        // Phase 2: Show icon, start fade transition (1500ms)
        const fadeTimer = setTimeout(() => {
            setPhase('fade')
        }, 1500)

        // Phase 3: Show content (2000ms)
        const contentTimer = setTimeout(() => {
            setPhase('content')
            onAnimationComplete?.()
        }, 2000)

        return () => {
            clearTimeout(iconTimer)
            clearTimeout(fadeTimer)
            clearTimeout(contentTimer)
        }
    }, [onAnimationComplete])

    return (
        <>
            {/* Full-screen overlay for animation */}
            <div
                className={`
          fixed inset-0 z-50 flex items-center justify-center transition-all duration-500
          ${phase === 'green' ? 'bg-green-500 opacity-100' : ''}
          ${phase === 'icon' ? 'bg-green-500 opacity-100' : ''}
          ${phase === 'fade' ? 'bg-white opacity-100' : ''}
          ${phase === 'content' ? 'opacity-0 pointer-events-none' : ''}
        `}
                style={{
                    willChange: 'background-color, opacity',
                }}
            >
                {/* Orange checkmark icon container */}
                <div
                    className={`
            transition-all duration-700 ease-out
            ${phase === 'icon' || phase === 'fade' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
          `}
                    style={{
                        willChange: 'transform, opacity',
                        // Use CSS animation for the container pop-in, Lottie handles the internal animation
                        animation: phase === 'icon' || phase === 'fade' ? 'bounceIn 0.7s ease-out' : 'none',
                    }}
                >
                    <div className="w-40 h-40 flex items-center justify-center">
                        {animationData && (
                            <Lottie
                                lottieRef={lottieRef}
                                animationData={animationData}
                                loop={false}
                                autoplay={false} // We play it programmatically when phase becomes 'icon'
                                style={{ width: 160, height: 160 }}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Page content */}
            <div
                className={`
          transition-opacity duration-500
          ${phase === 'content' ? 'opacity-100' : 'opacity-0'}
        `}
                style={{
                    willChange: 'opacity',
                }}
            >
                {children}
            </div>

            {/* Keyframe animations */}
            <style jsx>{`
        @keyframes bounceIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
        </>
    )
}
