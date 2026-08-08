import type { ElementType } from 'react'
import type { LogSummary } from '@/types'
import { cn } from '@/lib/utils'
import { Activity, BadgeDollarSign, DatabaseZap, Gauge } from 'lucide-react'
import { formatInteger, formatMoney, formatPercent } from './log-utils'

// ── Summary metric card ──────────────────────────────────────────

export function SummaryMetric({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  helper: string
  icon: ElementType
  tone: 'teal' | 'emerald' | 'amber' | 'stone'
}) {
  const tones = {
    teal: 'bg-teal-50 text-teal-700 ring-teal-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    stone: 'bg-slate-100 text-slate-600 ring-slate-200',
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 truncate font-mono text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1', tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 truncate text-xs text-muted-foreground">{helper}</p>
    </div>
  )
}

// ── Summary cards grid ───────────────────────────────────────────

export function LogsSummaryGrid({
  summary,
}: {
  summary?: LogSummary
}) {
  const totalRequests = summary?.totalRequests || 0
  const successRequests = summary?.successRequests || 0
  const successRate = totalRequests > 0 ? (successRequests / totalRequests) * 100 : 0
  const cacheTokens = (summary?.totalCacheWriteTokens || 0) + (summary?.totalCacheReadTokens || 0)

  return (
    <div className="grid gap-5 xl:grid-cols-[1.35fr_2fr]">
      {/* 主指标：消耗费用（放大） */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
            <BadgeDollarSign className="h-5 w-5" />
          </span>
          <span className="text-xs text-muted-foreground">{formatInteger(totalRequests)} 次调用</span>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">消耗费用</p>
        <p className="mt-1 font-mono text-4xl font-semibold tracking-tight">
          {formatMoney(summary?.totalCostEstimate || 0, 4)}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          TPM {formatInteger(summary?.tpm || 0)} · RPM {(summary?.rpm || 0).toFixed(2)}
        </p>
        <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-teal-500/[0.06]" />
      </div>

      {/* 三小指标（错落） */}
      <div className="grid gap-5 sm:grid-cols-3">
        <SummaryMetric
          label="成功率"
          value={formatPercent(successRate)}
          helper={`${formatInteger(successRequests)} 成功 / ${formatInteger(totalRequests)} 总计`}
          icon={Activity}
          tone="emerald"
        />
        <SummaryMetric
          label="Tokens"
          value={formatInteger(summary?.totalTokens || 0)}
          helper={`TPM ${formatInteger(summary?.tpm || 0)} · RPM ${(summary?.rpm || 0).toFixed(2)}`}
          icon={Gauge}
          tone="amber"
        />
        <SummaryMetric
          label="缓存"
          value={formatInteger(cacheTokens)}
          helper={`读 ${formatInteger(summary?.totalCacheReadTokens || 0)} / 写 ${formatInteger(summary?.totalCacheWriteTokens || 0)}`}
          icon={DatabaseZap}
          tone="stone"
        />
      </div>
    </div>
  )
}
