"use client"

import { useState, useCallback } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmOptions {
    title?: string
    description: string
    confirmText?: string
    cancelText?: string
}

export function useConfirmDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const [options, setOptions] = useState<ConfirmOptions>({
        description: '',
    })
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

    const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
        setOptions(opts)
        setIsOpen(true)

        return new Promise<boolean>((resolve) => {
            setResolvePromise(() => resolve)
        })
    }, [])

    const handleConfirm = useCallback(() => {
        setIsOpen(false)
        if (resolvePromise) {
            resolvePromise(true)
            setResolvePromise(null)
        }
    }, [resolvePromise])

    const handleCancel = useCallback(() => {
        setIsOpen(false)
        if (resolvePromise) {
            resolvePromise(false)
            setResolvePromise(null)
        }
    }, [resolvePromise])

    const ConfirmDialog = useCallback(() => (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{options.title || 'Confirm Action'}</AlertDialogTitle>
                    <AlertDialogDescription>{options.description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleCancel}>
                        {options.cancelText || 'Cancel'}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                        {options.confirmText || 'OK'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    ), [isOpen, options, handleConfirm, handleCancel])

    return { confirm, ConfirmDialog }
}
