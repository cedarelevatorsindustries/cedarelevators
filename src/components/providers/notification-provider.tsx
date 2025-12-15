'use client'

import { Toaster } from 'sonner'

interface NotificationProviderProps {
  children: React.ReactNode
}

export default function NotificationProvider({ children }: NotificationProviderProps) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        toastOptions={{
          duration: 5000,
          style: {
            fontFamily: 'var(--font-space-grotesk)',
          },
        }}
      />
    </>
  )
}
