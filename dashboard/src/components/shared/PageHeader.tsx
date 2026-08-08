import type { ElementType, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  /** mono 小字眼，如 "MODELS"（会自动加 // 前缀） */
  kicker?: string
  /** 左侧图标芯片 */
  icon?: ElementType
  /** 右侧自定义插槽（与 action 二选一，优先渲染 children） */
  children?: ReactNode
  action?: {
    label: string
    onClick: () => void
    icon?: ElementType
  }
  /** 底部可选面包屑 */
  breadcrumb?: ReactNode
  className?: string
}

/**
 * PageHeader —— 页面标题
 * 左侧标题 + 副标题，右侧操作区（主按钮 + 次要按钮通过 children 组合），底部可选面包屑。
 */
export function PageHeader({
  title,
  description,
  kicker,
  icon: Icon,
  children,
  action,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          {Icon && (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Icon className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0">
            {kicker && (
              <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                {kicker}
              </p>
            )}
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
          </div>
        </div>
        {children ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>
        ) : (
          action && (
            <Button onClick={action.onClick} className="shrink-0">
              {action.icon && <action.icon className="h-4 w-4" />}
              {action.label}
            </Button>
          )
        )}
      </div>
      {breadcrumb}
    </div>
  )
}
