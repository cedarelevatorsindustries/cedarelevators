"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

interface SettingsContextType {
    registerSaveHandler: (handler: () => Promise<void>) => void
    unregisterSaveHandler: () => void
    isSaving: boolean
    triggerSave: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [saveHandler, setSaveHandler] = useState<(() => Promise<void>) | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const registerSaveHandler = useCallback((handler: () => Promise<void>) => {
        setSaveHandler(() => handler)
    }, [])

    const unregisterSaveHandler = useCallback(() => {
        setSaveHandler(null)
    }, [])

    const triggerSave = useCallback(async () => {
        if (saveHandler) {
            setIsSaving(true)
            try {
                await saveHandler()
            } finally {
                setIsSaving(false)
            }
        }
    }, [saveHandler])

    return (
        <SettingsContext.Provider value={{
            registerSaveHandler,
            unregisterSaveHandler,
            isSaving,
            triggerSave
        }}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const context = useContext(SettingsContext)
    if (!context) {
        throw new Error("useSettings must be used within a SettingsProvider")
    }
    return context
}
