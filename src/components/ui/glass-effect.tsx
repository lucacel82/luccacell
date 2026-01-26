import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: "light" | "medium" | "dark"
}

const GlassEffect = React.forwardRef<HTMLDivElement, GlassEffectProps>(
  ({ className, children, variant = "light", ...props }, ref) => {
    const variantClasses = {
      light: "glass-light",
      medium: "glass-medium", 
      dark: "glass-dark"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <div className="relative z-10 p-6">
          {children}
        </div>
      </div>
    )
  }
)
GlassEffect.displayName = "GlassEffect"

export { GlassEffect }
