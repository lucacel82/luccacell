import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const GlassEffect = React.forwardRef<HTMLDivElement, GlassEffectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative backdrop-blur-md bg-gradient-to-br from-primary/20 via-primary/10 to-transparent",
          "border border-primary/30 rounded-2xl shadow-[0_8px_32px_0_rgba(255,215,0,0.37)]",
          "before:absolute before:inset-0 before:rounded-2xl before:p-[1px]",
          "before:bg-gradient-to-br before:from-primary/40 before:to-transparent",
          "before:mask-[linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
          "before:mask-composite-subtract",
          className
        )}
        {...props}
      >
        <div className="relative z-10 p-6">
          {children}
        </div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      </div>
    )
  }
)
GlassEffect.displayName = "GlassEffect"

export { GlassEffect }