"use client"

import { ReactNode } from "react"

interface SectionWrapperProps {
  children: ReactNode
  className?: string
  spacing?: "none" | "sm" | "md" | "lg" | "xl"
  background?: "white" | "gray" | "transparent"
  border?: boolean
  rounded?: boolean
  shadow?: boolean
}

export default function SectionWrapper({
  children,
  className = "",
  spacing = "md",
  background = "white",
  border = false,
  rounded = true,
  shadow = false
}: SectionWrapperProps) {
  const spacingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-10"
  }

  const backgroundClasses = {
    white: "bg-white",
    gray: "bg-gray-50",
    transparent: "bg-transparent"
  }

  return (
    <div
      className={`
        ${spacingClasses[spacing]}
        ${backgroundClasses[background]}
        ${border ? "border-2 border-gray-200" : ""}
        ${rounded ? "rounded-xl" : ""}
        ${shadow ? "shadow-sm" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
