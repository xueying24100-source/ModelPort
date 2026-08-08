import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

// 与 components/ui/badge.tsx 的语义色板保持一致：成功/健康=emerald，警告/降级=amber，错误/异常=red，默认=slate
const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: '活跃', className: 'bg-emerald-50 text-emerald-700' },
  disabled: { label: '禁用', className: 'bg-slate-100 text-slate-500' },
  suspended: { label: '已暂停', className: 'bg-red-50 text-red-700' },
  success: { label: '成功', className: 'bg-emerald-50 text-emerald-700' },
  error: { label: '错误', className: 'bg-red-50 text-red-700' },
  timeout: { label: '超时', className: 'bg-amber-50 text-amber-700' },
  healthy: { label: '健康', className: 'bg-emerald-50 text-emerald-700' },
  degraded: { label: '降级', className: 'bg-amber-50 text-amber-700' },
  down: { label: '离线', className: 'bg-red-50 text-red-700' },
  inactive: { label: '未激活', className: 'bg-slate-100 text-slate-500' },
  revoked: { label: '已吊销', className: 'bg-red-50 text-red-700' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-slate-100 text-slate-500' }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
