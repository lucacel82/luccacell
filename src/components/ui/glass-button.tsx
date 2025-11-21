"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const glassButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 backdrop-blur-md border",
  {
    variants: {
      variant: {
        default: "bg-primary/80 text-primary-foreground border-primary/30 hover:bg-primary/90 hover:shadow-md shadow-lg",
        destructive: "bg-destructive/80 text-destructive-foreground border-destructive/30 hover:bg-destructive/90 shadow-lg",
        glass: "bg-white/10 text-foreground border-white/20 hover:bg-white/20 hover:border-white/30 shadow-lg",
        outline: "bg-transparent text-foreground border-border/50 hover:bg-accent/20 hover:border-accent/50",
        secondary: "bg-secondary/80 text-secondary-foreground border-secondary/30 hover:bg-secondary/90 shadow-lg",
        ghost: "bg-transparent border-transparent hover:bg-accent/20 hover:border-accent/50",
        gold: "bg-primary text-primary-foreground border-primary/30 hover:shadow-md shadow-lg hover:scale-105",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  asChild?: boolean
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(glassButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GlassButton.displayName = "GlassButton"

export { GlassButton, glassButtonVariants }