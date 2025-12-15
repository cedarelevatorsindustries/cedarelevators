"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface NotificationSidebarContextType {
  isOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void
}

const NotificationSidebarContext = createContext<NotificationSidebarContextType | undefined>(undefined)

export function NotificationSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openSidebar = () => setIsOpen(true)
  const closeSidebar = () => setIsOpen(false)
  const toggleSidebar = () => setIsOpen(prev => !prev)

  return (
    <NotificationSidebarContext.Provider value={{ isOpen, openSidebar, closeSidebar, toggleSidebar }}>
      {children}
    </NotificationSidebarContext.Provider>
  )
}

export function useNotificationSidebar() {
  const context = useContext(NotificationSidebarContext)
  if (context === undefined) {
    throw new Error('useNotificationSidebar must be used within a NotificationSidebarProvider')
  }
  return context
}
