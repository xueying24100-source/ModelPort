import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'secondary' | 'destructive' | 'error' | 'outline' | 'success' | 'warning' | 'info'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  // 视觉对照 design-system.md「徽章/标签」章节：浅底 + 深字，rounded-full。
  const variants: Record<string, string> = {
    default: "border-transparent bg-slate-100 text-slate-700",
    secondary: "border-transparent bg-slate-100 text-slate-700",
    outline: "border-slate-200 bg-white text-slate-600",
    destructive: "border-transparent bg-red-50 text-red-700",
    error: "border-transparent bg-red-50 text-red-700",
    success: "border-transparent bg-emerald-50 text-emerald-700",
    warning: "border-transparent bg-amber-50 text-amber-700",
    info: "border-transparent bg-blue-50 text-blue-700",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }
