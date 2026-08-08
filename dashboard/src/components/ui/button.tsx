/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// 变体命名沿用旧版（default/outline/ghost 等）以保持现有调用方不被破坏，
// 视觉上按 design-system.md 的 primary / secondary / text / danger 四类实现。
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        // 主按钮
        default: "bg-blue-600 text-white shadow-sm hover:bg-blue-700",
        // 危险按钮
        destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700",
        // 次按钮
        outline: "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50",
        secondary: "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50",
        // 文字按钮
        ghost: "text-blue-600 hover:bg-blue-50 hover:text-blue-700",
        link: "text-blue-600 underline-offset-4 hover:text-blue-700 hover:underline",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
