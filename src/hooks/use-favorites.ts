"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/lib/auth/client"
import { toggleFavorite, checkIsFavorite } from "@/lib/actions/user-lists"
import { toast } from "sonner"

export function useFavorites(productId: string) {
    const { user, isLoaded } = useUser()
    const [isFavorite, setIsFavorite] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isLoaded) return

        if (!user) {
            // Guest: LocalStorage
            const localFavs = JSON.parse(localStorage.getItem("favorites") || "[]")
            setIsFavorite(localFavs.includes(productId))
            setLoading(false)
        } else {
            // Auth: Server
            checkIsFavorite(productId)
                .then(res => setIsFavorite(res.isFavorite))
                .catch(() => setIsFavorite(false))
                .finally(() => setLoading(false))
        }
    }, [user, isLoaded, productId])

    const toggle = async () => {
        // Optimistic update
        const newState = !isFavorite
        setIsFavorite(newState)

        if (!user) {
            // Guest: LocalStorage
            const localFavs = JSON.parse(localStorage.getItem("favorites") || "[]")
            let newFavs
            if (newState) {
                newFavs = [...localFavs, productId]
                toast.success("Added to favorites")
            } else {
                newFavs = localFavs.filter((id: string) => id !== productId)
                toast.success("Removed from favorites")
            }
            localStorage.setItem("favorites", JSON.stringify(newFavs))
        } else {
            // Auth: Server
            try {
                const res = await toggleFavorite(productId)
                if (!res.success) {
                    setIsFavorite(!newState) // Revert
                    toast.error("Failed to update favorites")
                } else {
                    toast.success(res.isFavorite ? "Added to favorites" : "Removed from favorites")
                    setIsFavorite(!!res.isFavorite) // Ensure sync
                }
            } catch (err) {
                setIsFavorite(!newState) // Revert
                toast.error("An error occurred")
            }
        }
    }

    return { isFavorite, toggle, loading }
}

