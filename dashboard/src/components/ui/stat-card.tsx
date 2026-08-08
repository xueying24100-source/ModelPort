import type { LucideIcon } from 'lucide-react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/shared/Skeleton'
import { Sparkline } from '@/components/shared/Sparkline'

export interface StatCardProps {
  /** 卡片标题（左上方小字） */
  title: string
  /** 主数字，已格式化的字符串或数字 */
  value: string | number
  /** 左上角圆形图标 */
  icon?: LucideIcon
  /** 右上角趋势徽章：正值绿色向上箭头，负值红色向下箭头 */
  trend?: {
    value: number
    /** 趋势旁的说明文字，例如 "较上周期" */
    label?: string
  }
  /** 底部描述文字（未提供 trend.label 时展示） */
  description?: string
  /** 底部迷你折线图数据 */
  sparkline?: number[]
  loading?: boolean
  className?: string
}

/**
 * StatCard —— 统计卡片
 * 结构：图标圆形浅底（左上）+ 趋势徽章（右上，可选）+ 大数字 + 描述/变化率 + 迷你折线图（可选）
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  sparkline,
  loading,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <div className={cn('rounded-xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
        <div className="flex items-start justify-between">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="mt-4 h-4 w-24" />
        <Skeleton className="mt-2 h-8 w-28" />
        <Skeleton className="mt-3 h-3 w-32" />
      </div>
    )
  }

  const isPositive = (trend?.value ?? 0) >= 0

  return (
    <div
      className={cn(
        'group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Icon className="h-5 w-5" />
          </div>
        )}
        {trend && (
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
              isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
            )}
          >
            {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-600">{title}</p>
          <p className="mt-1 truncate text-2xl font-bold tabular-nums text-slate-900">{value}</p>
        </div>
        {sparkline && sparkline.length > 0 && (
          <Sparkline
            data={sparkline}
            width={72}
            height={28}
            color="#2563EB"
            className="shrink-0 opacity-70"
          />
        )}
      </div>

      {(description || trend?.label) && (
        <p className="mt-2 truncate text-xs text-slate-400">{trend?.label ?? description}</p>
      )}
    </div>
  )
}
