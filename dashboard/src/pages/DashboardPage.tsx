import { useMemo, useState, type ElementType } from 'react'
import { Link } from 'react-router-dom'
import { useDashboard, useLogs } from '@/hooks'
import { StatCard } from '@/components/ui/stat-card'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageHeader } from '@/components/ui/page-header'
import { LoadingPage } from '@/components/shared/LoadingPage'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn, formatNumber, formatRelativeTime, parseDate, formatLatency } from '@/lib/utils'
import type { DashboardRange, DashboardStatsParams } from '@/services/dashboard.service'
import type { DashboardStats, RequestLog } from '@/types'
import {
  Activity,
  ArrowRight,
  Box,
  Clock,
  Database,
  Gauge,
  GitBranch,
  KeyRound,
  Layers,
  Route,
  ScrollText,
  ShieldCheck,
  TrendingUp,
  WalletCards,
  Wrench,
  Zap,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Line,
} from 'recharts'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000

const TREND_RANGES: Array<{ value: DashboardRange; label: string }> = [
  { value: '1d', label: '近1天' },
  { value: '3d', label: '近3天' },
  { value: '7d', label: '近7天' },
  { value: 'custom', label: '自定义' },
]

const RANGE_LABELS: Record<DashboardRange, string> = {
  '1d': '24小时',
  '3d': '3天',
  '7d': '7天',
  custom: '自定义',
}

const RANGE_MS: Record<Exclude<DashboardRange, 'custom'>, number> = {
  '1d': DAY_MS,
  '3d': 3 * DAY_MS,
  '7d': 7 * DAY_MS,
}

// 分类配色：与 design-system.md 主色/语义色同源，另补充少量扩展色用于多序列图表
const PIE_COLORS = [
  '#2563EB', // blue-600
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#8B5CF6', // violet-500
  '#EF4444', // red-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#6366F1', // indigo-500
]

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
  },
  labelStyle: { fontWeight: 600, color: '#0F172A' },
}

const AXIS_TICK = { fontSize: 11, fill: '#94A3B8' }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeTrend(series: { value: number }[]): number {
  if (series.length < 2) return 0
  const mid = Math.floor(series.length / 2)
  const firstHalf = series.slice(0, mid).reduce((s, p) => s + p.value, 0)
  const secondHalf = series.slice(mid).reduce((s, p) => s + p.value, 0)
  if (firstHalf === 0) return secondHalf > 0 ? 100 : 0
  return Math.round(((secondHalf - firstHalf) / firstHalf) * 100 * 10) / 10
}

function formatChartTime(timestamp: string, bucketMs?: number): string {
  const date = parseDate(timestamp)
  if (Number.isNaN(date.getTime())) return '--:--'
  if (bucketMs && bucketMs > 60 * 60 * 1000) {
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function rangeLabel(range?: DashboardRange): string {
  return RANGE_LABELS[range ?? '1d'] ?? '24小时'
}

function dashboardTrendParams(
  range: DashboardRange,
  from: string,
  to: string,
): DashboardStatsParams {
  if (range !== 'custom') return { range }
  const fromMs = dateTimeLocalToMillis(from)
  const toMs = dateTimeLocalToMillis(to)
  if (!fromMs || !toMs || Number(fromMs) >= Number(toMs)) return { range: '1d' }
  return { range, from: fromMs, to: toMs }
}

function toDateTimeLocal(timestamp: number): string {
  const date = new Date(timestamp)
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 16)
}

function dateTimeLocalToMillis(value: string): string | undefined {
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? String(timestamp) : undefined
}

function timestampMs(value: string): number {
  const numeric = Number(value)
  if (Number.isFinite(numeric)) return numeric
  const parsed = parseDate(value).getTime()
  return Number.isFinite(parsed) ? parsed : 0
}

function formatUsd(value: number, digits = 4): string {
  return `$${value.toFixed(digits)}`
}

function formatPercentValue(value: number): string {
  return `${value.toFixed(1)}%`
}

function formatRate(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0'
  if (value >= 1000) return formatNumber(value)
  if (value >= 100) return value.toFixed(0)
  if (value >= 10) return value.toFixed(1).replace(/\.0$/, '')
  if (value >= 1) return value.toFixed(2).replace(/\.?0+$/, '')
  return value.toFixed(2)
}

function currentLogFilters(range: DashboardRange, customFrom: string, customTo: string) {
  if (range === 'custom') {
    return { dateFrom: customFrom || undefined, dateTo: customTo || undefined }
  }
  const now = Date.now()
  return {
    dateFrom: toDateTimeLocal(now - RANGE_MS[range]),
    dateTo: toDateTimeLocal(now),
  }
}

interface ModelUsageRow {
  model: string
  provider: string
  requests: number
  tokens: number
  cost: number
}

interface TokenTrendPoint {
  time: string
  input: number
  output: number
  cacheWrite: number
  cacheRead: number
  cacheHitRate: number
}

function buildModelUsageRows(logs: RequestLog[], fallback: DashboardStats['topModels']): ModelUsageRow[] {
  if (logs.length === 0) {
    return fallback.slice(0, 6).map((item) => ({
      model: item.model,
      provider: item.provider,
      requests: item.requests,
      tokens: 0,
      cost: 0,
    }))
  }

  const rows = new Map<string, ModelUsageRow>()
  for (const log of logs) {
    const key = `${log.provider}:${log.resolvedModel || log.model}`
    const current = rows.get(key) || {
      model: log.resolvedModel || log.model,
      provider: log.provider,
      requests: 0,
      tokens: 0,
      cost: 0,
    }
    current.requests += 1
    current.tokens += log.totalTokens ?? (log.inputTokens + log.outputTokens + (log.cacheWriteTokens || 0) + (log.cacheReadTokens || 0))
    current.cost += log.costEstimate || 0
    rows.set(key, current)
  }

  return Array.from(rows.values())
    .sort((a, b) => b.tokens - a.tokens || b.requests - a.requests)
    .slice(0, 6)
}

function buildTokenTrend(logs: RequestLog[], startMs: number, endMs: number, bucketMs: number): TokenTrendPoint[] {
  const safeStart = Number.isFinite(startMs) ? startMs : 0
  const safeEnd = Number.isFinite(endMs) && endMs > safeStart ? endMs : safeStart + DAY_MS
  const safeBucket = Math.max(bucketMs || 60 * 60 * 1000, 30 * 60 * 1000)
  const bucketCount = Math.min(48, Math.max(1, Math.ceil((safeEnd - safeStart) / safeBucket)))
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const bucketStart = safeStart + index * safeBucket
    return {
      start: bucketStart,
      end: index === bucketCount - 1 ? safeEnd + 1 : bucketStart + safeBucket,
      time: formatChartTime(String(bucketStart), safeBucket),
      input: 0,
      output: 0,
      cacheWrite: 0,
      cacheRead: 0,
      cacheHitRate: 0,
    }
  })

  for (const log of logs) {
    const time = timestampMs(log.timestamp)
    const bucket = buckets.find((item) => time >= item.start && time < item.end)
    if (!bucket) continue
    bucket.input += log.inputTokens
    bucket.output += log.outputTokens
    bucket.cacheWrite += log.cacheWriteTokens || 0
    bucket.cacheRead += log.cacheReadTokens || 0
  }

  return buckets.map((bucket) => {
    const billedInput = bucket.input + bucket.cacheWrite + bucket.cacheRead
    return {
      time: bucket.time,
      input: bucket.input,
      output: bucket.output,
      cacheWrite: bucket.cacheWrite,
      cacheRead: bucket.cacheRead,
      cacheHitRate: billedInput > 0 ? Math.round((bucket.cacheRead / billedInput) * 1000) / 10 : 0,
    }
  })
}

function providerTokens(provider: DashboardStats['providerHealth'][number]): number {
  return (
    (provider.inputTokensTotal || 0) +
    (provider.outputTokensTotal || 0) +
    (provider.cacheWriteTokensTotal || 0) +
    (provider.cacheReadTokensTotal || 0)
  )
}

function statusText(status: DashboardStats['providerHealth'][number]['status']): string {
  if (status === 'healthy') return '健康'
  if (status === 'degraded') return '降级'
  if (status === 'cooldown') return '冷却'
  return '不可用'
}

function statusBadgeVariant(status: DashboardStats['providerHealth'][number]['status']): 'success' | 'warning' | 'info' | 'error' {
  if (status === 'healthy') return 'success'
  if (status === 'degraded') return 'warning'
  if (status === 'cooldown') return 'info'
  return 'error'
}

function providerStatusDotClass(status: DashboardStats['providerHealth'][number]['status']): string {
  if (status === 'healthy') return 'bg-emerald-500'
  if (status === 'degraded') return 'bg-amber-500'
  if (status === 'cooldown') return 'bg-blue-400'
  return 'bg-red-500'
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RangeSelector({
  value,
  onChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}: {
  value: DashboardRange
  onChange: (r: DashboardRange) => void
  customFrom: string
  customTo: string
  onCustomFromChange: (v: string) => void
  onCustomToChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {TREND_RANGES.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={value === option.value ? 'default' : 'outline'}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
      {value === 'custom' && (
        <div className="flex items-center gap-2 ml-1">
          <Input
            aria-label="开始时间"
            type="datetime-local"
            value={customFrom}
            onChange={(e) => onCustomFromChange(e.target.value)}
            className="h-8 w-[160px] text-xs"
          />
          <span className="text-slate-400 text-xs">至</span>
          <Input
            aria-label="结束时间"
            type="datetime-local"
            value={customTo}
            onChange={(e) => onCustomToChange(e.target.value)}
            className="h-8 w-[160px] text-xs"
          />
        </div>
      )}
    </div>
  )
}

function GatewayStep({
  title,
  detail,
  icon: Icon,
}: {
  title: string
  detail: string
  icon: ElementType
}) {
  return (
    <div className="min-w-[132px] flex-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  )
}

function GatewayFlowCard({
  stats,
  logs,
  primaryModel,
}: {
  stats: DashboardStats
  logs: RequestLog[]
  primaryModel: string
}) {
  const primaryProvider = stats.providerHealth.find((provider) => provider.status === 'healthy')
    ?? stats.providerHealth[0]
  const streamCount = logs.filter((log) => log.stream === 'stream').length
  const errorCount = logs.filter((log) => log.status !== 'success').length

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <GitBranch className="h-4 w-4 text-blue-600" />
              网关运行概览
            </CardTitle>
            <p className="mt-1 text-xs text-slate-400">
              客户端请求进入 ModelPort 后的鉴权、协议适配、路由和上游状态。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">Trace</Badge>
            <Badge variant="success">Tool Use</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-stretch">
          <GatewayStep title="客户端入口" detail="IDE / CLI / API 请求" icon={Zap} />
          <div className="hidden items-center justify-center text-slate-300 md:flex">
            <ArrowRight className="h-4 w-4" />
          </div>
          <GatewayStep title="协议门禁" detail="鉴权、IP 策略、请求大小" icon={ShieldCheck} />
          <div className="hidden items-center justify-center text-slate-300 md:flex">
            <ArrowRight className="h-4 w-4" />
          </div>
          <GatewayStep title="内部路由" detail="别名解析、工具映射、计量" icon={Route} />
          <div className="hidden items-center justify-center text-slate-300 md:flex">
            <ArrowRight className="h-4 w-4" />
          </div>
          <GatewayStep
            title={primaryProvider?.displayName || 'Provider'}
            detail={primaryModel || '默认路由'}
            icon={Database}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Streaming</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">{formatNumber(streamCount)}</p>
            <p className="mt-1 text-xs text-slate-400">当前范围流式请求</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">协议错误</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">{formatNumber(errorCount)}</p>
            <p className="mt-1 text-xs text-slate-400">已进入错误映射</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">工具调用策略</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="outline" className="font-mono text-[10px]">tool_choice</Badge>
              <Badge variant="outline" className="font-mono text-[10px]">parallel</Badge>
              <Badge variant="outline" className="font-mono text-[10px]">delta</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function UpstreamHealthCard({ stats }: { stats: DashboardStats }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wrench className="h-4 w-4 text-blue-600" />
          上游渠道状态
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="divide-y divide-slate-100">
          {stats.providerHealth.slice(0, 6).map((provider) => (
            <div key={provider.providerId} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', providerStatusDotClass(provider.status))} />
                  <p className="truncate text-sm font-medium text-slate-900">{provider.displayName}</p>
                  {provider.rechargeRequired && (
                    <Badge variant="warning" className="shrink-0 text-[10px]">
                      {provider.rechargeBadge || '代充值'}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 truncate font-mono text-xs text-slate-400">{provider.providerId}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums text-slate-900">{provider.successRate.toFixed(1)}%</p>
                <p className="text-xs text-slate-400">{formatLatency(provider.avgLatencyMs)}</p>
              </div>
            </div>
          ))}
          {stats.providerHealth.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              暂无 Provider
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ProviderBreakdown({
  providers,
}: {
  providers: DashboardStats['providerHealth']
}) {
  const activeProviders = providers.filter((provider) => provider.status === 'healthy' || provider.status === 'degraded')

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base">按平台拆分</CardTitle>
          <p className="mt-1 text-xs text-slate-400">请求 · Token · 费用 · 健康状态</p>
        </div>
        <Badge variant="default">{activeProviders.length} 个可用</Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {providers.slice(0, 6).map((provider) => (
            <div key={provider.providerId} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{provider.displayName}</p>
                    {provider.rechargeRequired && (
                      <Badge variant="warning">{provider.rechargeBadge || '代充值'}</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{provider.providerId}</p>
                </div>
                <Badge variant={statusBadgeVariant(provider.status)}>{statusText(provider.status)}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-slate-400">请求</p>
                  <p className="mt-1 font-medium tabular-nums text-slate-900">{formatNumber(provider.requestsTotal)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Token</p>
                  <p className="mt-1 font-medium tabular-nums text-slate-900">{formatNumber(providerTokens(provider))}</p>
                </div>
                <div>
                  <p className="text-slate-400">费用</p>
                  <p className="mt-1 font-medium tabular-nums text-slate-900">{formatUsd(provider.costEstimateUsdTotal || 0, 4)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ModelDistributionCard({
  rows,
  pieData,
}: {
  rows: ModelUsageRow[]
  pieData: Array<{ name: string; value: number }>
}) {
  const columns: DataTableColumn<ModelUsageRow>[] = [
    {
      key: 'model',
      header: '模型',
      render: (row, idx) => (
        <div className="flex min-w-0 items-start gap-2">
          <span
            className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white"
            style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
          />
          <div className="min-w-0">
            <div className="max-w-[220px] truncate font-mono text-xs font-medium text-slate-900">{row.model}</div>
            <div className="text-xs text-slate-400">{row.provider}</div>
          </div>
        </div>
      ),
    },
    { key: 'requests', header: '请求', align: 'right', render: (row) => <span className="tabular-nums">{formatNumber(row.requests)}</span> },
    { key: 'tokens', header: 'Token', align: 'right', render: (row) => <span className="tabular-nums">{formatNumber(row.tokens)}</span> },
    { key: 'cost', header: '费用', align: 'right', render: (row) => <span className="tabular-nums">{formatUsd(row.cost, 4)}</span> },
  ]

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">模型分布</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-4 xl:grid-cols-[240px_1fr]">
          <div className="flex min-h-[220px] items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={86}
                    paddingAngle={1.2}
                    minAngle={pieData.length > 1 ? 4 : 0}
                    cornerRadius={2}
                    dataKey="value"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
                暂无数据
              </div>
            )}
          </div>
          <DataTable
            columns={columns}
            data={rows}
            rowKey={(row) => `${row.provider}:${row.model}`}
            emptyTitle="暂无模型使用数据"
            className="border-0 shadow-none"
          />
        </div>
      </CardContent>
    </Card>
  )
}

function TokenTrendCard({ data }: { data: TokenTrendPoint[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Token 使用趋势</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="time" tick={AXIS_TICK} tickLine={false} axisLine={false} />
            <YAxis yAxisId="tokens" tick={AXIS_TICK} tickLine={false} axisLine={false} width={54} />
            <YAxis yAxisId="rate" orientation="right" domain={[0, 100]} tick={AXIS_TICK} tickLine={false} axisLine={false} width={42} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#475569' }} />
            <Area yAxisId="tokens" type="monotone" dataKey="input" name="Input" stroke="#2563EB" fill="#2563EB" fillOpacity={0.14} dot={false} />
            <Area yAxisId="tokens" type="monotone" dataKey="output" name="Output" stroke="#10B981" fill="#10B981" fillOpacity={0.12} dot={false} />
            <Area yAxisId="tokens" type="monotone" dataKey="cacheWrite" name="Cache Creation" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.12} dot={false} />
            <Area yAxisId="tokens" type="monotone" dataKey="cacheRead" name="Cache Read" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.12} dot={false} />
            <Line yAxisId="rate" type="monotone" dataKey="cacheHitRate" name="Cache Hit Rate" stroke="#EF4444" strokeDasharray="5 4" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function RecentUsageCard({ logs }: { logs: RequestLog[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">最近使用</CardTitle>
        <Badge variant="default">近 {logs.length} 条</Badge>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {logs.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-400">暂无请求记录</div>
        ) : (
          logs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Box className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm font-medium text-slate-900">{log.resolvedModel || log.model}</p>
                  <p className="text-xs text-slate-400">{formatRelativeTime(log.timestamp)}</p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums text-emerald-600">{formatUsd(log.costEstimate || 0, 4)}</p>
                <p className="text-xs text-slate-400">{formatNumber(log.totalTokens || 0)} tokens</p>
              </div>
            </div>
          ))
        )}
        <Button asChild variant="ghost" className="w-full">
          <Link to="/logs">
            查看全部
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function QuickActionsCard() {
  const actions = [
    { to: '/api-keys', icon: KeyRound, title: '创建 API 密钥', desc: '生成新的 API 密钥' },
    { to: '/logs', icon: ScrollText, title: '查看使用记录', desc: '排查错误、成本和延迟' },
    { to: '/models', icon: Layers, title: '管理模型路由', desc: '检查供应商和别名' },
  ]

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">快捷操作</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.to}
              to={action.to}
              className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-4 transition-colors hover:bg-slate-100"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{action.title}</p>
                  <p className="text-xs text-slate-400">{action.desc}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function DashboardPage() {
  const [trendRange, setTrendRange] = useState<DashboardRange>('1d')
  const [customFrom, setCustomFrom] = useState(() => toDateTimeLocal(Date.now() - DAY_MS))
  const [customTo, setCustomTo] = useState(() => toDateTimeLocal(Date.now()))

  const dashboardParams = useMemo(
    () => dashboardTrendParams(trendRange, customFrom, customTo),
    [customFrom, customTo, trendRange],
  )
  const { data: stats, isLoading, error, refetch } = useDashboard(dashboardParams)
  const logFilters = useMemo(
    () => currentLogFilters(trendRange, customFrom, customTo),
    [customFrom, customTo, trendRange],
  )
  const { data: logsData } = useLogs(logFilters, 1, 500)

  // ---- Derived / memoized data ----

  const requestTrend = useMemo(
    () => (stats ? computeTrend(stats.requestTimeSeries) : 0),
    [stats],
  )

  const chartData = useMemo(() => {
    if (!stats) return []
    return stats.requestTimeSeries.map((p, i) => ({
      time: formatChartTime(p.timestamp, stats.trendRange?.bucketMs),
      requests: p.value,
      errors: stats.errorTimeSeries[i]?.value ?? 0,
    }))
  }, [stats])

  const sparklineRequests = useMemo(
    () => stats?.requestTimeSeries.map((p) => p.value) ?? [],
    [stats],
  )

  const successSparkline = useMemo(() => {
    if (!stats) return []
    return stats.requestTimeSeries.map((p, i) => {
      const err = stats.errorTimeSeries[i]?.value ?? 0
      return p.value === 0 ? 100 : Math.round(((p.value - err) / p.value) * 100)
    })
  }, [stats])

  const modelUsageRows = useMemo(
    () => buildModelUsageRows(logsData?.logs ?? [], stats?.topModels ?? []),
    [logsData?.logs, stats?.topModels],
  )

  const modelPieData = useMemo(
    () => modelUsageRows.map((row) => ({
      name: row.model,
      value: row.tokens || row.requests,
    })),
    [modelUsageRows],
  )

  const tokenTrendData = useMemo(() => {
    if (!stats) return []
    const fallbackStartMs = Number(dateTimeLocalToMillis(customFrom))
    const fallbackEndMs = Number(dateTimeLocalToMillis(customTo))
    const startMs = Number(stats.trendRange?.from ?? fallbackStartMs)
    const endMs = Number(stats.trendRange?.to ?? fallbackEndMs)
    return buildTokenTrend(logsData?.logs ?? [], startMs, endMs, stats.trendRange?.bucketMs ?? 60 * 60 * 1000)
  }, [customFrom, customTo, logsData?.logs, stats])

  // ---- Loading / Error ----

  if (error && !stats) {
    return (
      <ErrorState
        message="仪表盘数据加载失败，请检查网络后重试。"
        onRetry={() => refetch()}
      />
    )
  }

  if (isLoading || !stats) {
    return <LoadingPage />
  }

  const totalTokens =
    (stats.todayInputTokens ?? 0) +
    (stats.todayOutputTokens ?? 0) +
    (stats.todayCacheWriteTokens ?? 0) +
    (stats.todayCacheReadTokens ?? 0)
  const summary = logsData?.summary
  const summaryInputTokens = summary?.totalInputTokens ?? stats.todayInputTokens ?? 0
  const summaryCacheWriteTokens = summary?.totalCacheWriteTokens ?? stats.todayCacheWriteTokens ?? 0
  const summaryCacheReadTokens = summary?.totalCacheReadTokens ?? stats.todayCacheReadTokens ?? 0
  const summaryTokens = summary?.totalTokens ?? totalTokens
  const summaryCost = summary?.totalCostEstimate ?? stats.todayCostEstimate ?? 0
  const billedInputTokens = summaryInputTokens + summaryCacheWriteTokens + summaryCacheReadTokens
  const cacheHitRate = billedInputTokens > 0 ? (summaryCacheReadTokens / billedInputTokens) * 100 : 0

  const rangeName = rangeLabel(stats.trendRange?.range ?? trendRange)
  const primaryModel = modelUsageRows[0]?.model ?? stats.topModels[0]?.model ?? '默认路由'

  const providerCount = stats.providerHealth.length
  const healthyProviders = stats.providerHealth.filter((p) => p.status === 'healthy').length
  const allHealthy = providerCount > 0 && healthyProviders === providerCount
  const statusLine =
    stats.successRate >= 99 && allHealthy
      ? `网关运行平稳 · 健康渠道 ${healthyProviders}/${providerCount} · 成功率 ${stats.successRate.toFixed(1)}%`
      : stats.successRate >= 95
        ? `网关运行中 · 健康渠道 ${healthyProviders}/${providerCount} · 成功率 ${stats.successRate.toFixed(1)}%`
        : `网关运行中，注意部分渠道 · 健康渠道 ${healthyProviders}/${providerCount}`

  const secondaryStats: Array<{ label: string; value: string; icon: ElementType }> = [
    {
      label: 'API 密钥',
      value: `${formatNumber(stats.apiKeysActive ?? 0)}/${formatNumber(stats.apiKeysTotal ?? 0)}`,
      icon: KeyRound,
    },
    { label: '今日 Token', value: formatNumber(totalTokens), icon: Clock },
    { label: '累计 Token', value: formatNumber(summaryTokens), icon: Database },
    { label: '性能', value: `${formatRate(summary?.rpm ?? 0)} RPM`, icon: Zap },
  ]

  // ---- Render ----

  return (
    <div className="space-y-5">
      <PageHeader title="仪表盘" description={`实时监控 API 调用、模型使用与系统健康状态 · ${statusLine}`}>
        <RangeSelector
          value={trendRange}
          onChange={setTrendRange}
          customFrom={customFrom}
          customTo={customTo}
          onCustomFromChange={setCustomFrom}
          onCustomToChange={setCustomTo}
        />
      </PageHeader>

      {/* 主要 KPI（4）— StatCard，带趋势/迷你折线图 */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="今日请求量"
          value={formatNumber(stats.todayRequests ?? stats.totalRequests)}
          icon={Activity}
          sparkline={sparklineRequests}
          trend={{ value: requestTrend, label: `总计 ${formatNumber(stats.totalRequests)}` }}
        />
        <StatCard
          title="今日消耗"
          value={formatUsd(stats.todayCostEstimate ?? 0, 4)}
          icon={WalletCards}
          sparkline={sparklineRequests}
          description={`当前范围 ${formatUsd(summaryCost, 4)}`}
        />
        <StatCard
          title="成功率"
          value={`${stats.successRate.toFixed(1)}%`}
          icon={Gauge}
          sparkline={successSparkline}
          trend={{
            value: Math.round(stats.successRate) >= 99 ? 0 : -1,
            label: '目标 99%',
          }}
        />
        <StatCard
          title="平均响应"
          value={formatLatency(stats.avgLatencyMs)}
          icon={TrendingUp}
          sparkline={sparklineRequests}
          description={`缓存命中 ${formatPercentValue(cacheHitRate)}`}
        />
      </div>

      {/* 次要指标（4）— 紧凑迷你条 */}
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        {secondaryStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400">{stat.label}</p>
                <p className="mt-0.5 truncate text-lg font-bold tabular-nums tracking-tight text-slate-900">
                  {stat.value}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* 网关运行管线（全宽） */}
      <GatewayFlowCard stats={stats} logs={logsData?.logs ?? []} primaryModel={primaryModel} />

      {/* ---------------------------------------------------------------- */}
      {/* Bento：请求量大图 + 上游健康竖列                                  */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">请求量趋势（{rangeName}）</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="requestGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="time" tick={AXIS_TICK} tickLine={false} axisLine={false} />
                <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={50} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Area
                  type="monotone"
                  dataKey="requests"
                  name="请求"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="url(#requestGradient)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="errors"
                  name="错误"
                  stroke="#EF4444"
                  strokeWidth={1.5}
                  fill="url(#errorGradient)"
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <UpstreamHealthCard stats={stats} />
      </div>

      {/* 按平台拆分（全宽） */}
      <ProviderBreakdown providers={stats.providerHealth} />

      {/* 模型分布 + Token 趋势 */}
      <div className="grid gap-5 xl:grid-cols-[7fr_5fr]">
        <ModelDistributionCard rows={modelUsageRows} pieData={modelPieData} />
        <TokenTrendCard data={tokenTrendData} />
      </div>

      {/* 最近使用 + 快捷操作 */}
      <div className="grid gap-5 xl:grid-cols-[7fr_5fr]">
        <RecentUsageCard logs={logsData?.logs ?? []} />
        <QuickActionsCard />
      </div>
    </div>
  )
}
