import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ContainerProps {
  children: ReactNode
  className?: string
  fullHeight?: boolean
}

export function Container({ children, className, fullHeight }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8",
        fullHeight && "flex h-full flex-col",
        className
      )}
    >
      {children}
    </div>
  )
}
