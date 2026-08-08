import { useState, type ElementType } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Boxes,
  Cloud,
  Code2,
  Database,
  Eye,
  Globe,
  KeyRound,
  Layers3,
  Loader2,
  Network,
  Package,
  Plug,
  ShieldCheck,
  Shuffle,
  UserRound,
  Wrench,
  Zap,
} from 'lucide-react'

function ClientItem({
  icon: Icon,
  title,
}: {
  icon: ElementType
  title: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-md px-2 py-2 text-xs text-slate-300">
      <Icon className="h-3.5 w-3.5 shrink-0 text-blue-400" />
      <span className="truncate">{title}</span>
    </div>
  )
}

function ProviderItem({
  label,
  icon: Icon,
  tone,
}: {
  label: string
  icon: ElementType
  tone: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.045] px-2.5 py-2">
      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${tone}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="truncate text-xs font-medium text-slate-200">{label}</span>
    </div>
  )
}

function CapabilityCell({
  icon: Icon,
  label,
  tone = 'blue',
}: {
  icon: ElementType
  label: string
  tone?: 'blue' | 'sky' | 'indigo' | 'cyan' | 'slate'
}) {
  const toneClass = {
    blue: 'text-blue-300',
    sky: 'text-sky-300',
    indigo: 'text-indigo-300',
    cyan: 'text-cyan-300',
    slate: 'text-slate-300',
  }[tone]

  return (
    <div className="flex min-w-0 flex-col items-center justify-center gap-2 border-r border-white/[0.10] px-3 py-3 last:border-r-0">
      <Icon className={`h-4 w-4 ${toneClass}`} />
      <span className="max-w-full text-center text-[11px] leading-4 text-slate-300">{label}</span>
    </div>
  )
}

function GatewayTopology() {
  return (
    <div className="relative mx-auto h-[390px] w-full max-w-[780px]">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 780 390"
        fill="none"
        aria-hidden="true"
      >
        <path d="M190 142 C262 142 298 174 348 174" stroke="rgba(59,130,246,0.45)" />
        <path d="M190 190 C264 190 302 194 348 194" stroke="rgba(56,189,248,0.35)" />
        <path d="M190 238 C262 238 298 214 348 214" stroke="rgba(37,99,235,0.32)" />
        <path d="M432 174 C482 174 518 142 590 142" stroke="rgba(129,140,248,0.45)" />
        <path d="M432 194 C486 194 522 190 590 190" stroke="rgba(59,130,246,0.40)" />
        <path d="M432 214 C482 214 518 238 590 238" stroke="rgba(37,99,235,0.34)" />
        <path d="M390 78 L390 139" stroke="rgba(129,140,248,0.28)" />
        <path d="M390 249 L390 306" stroke="rgba(59,130,246,0.28)" />
        <circle cx="270" cy="166" r="3" fill="#60A5FA" />
        <circle cx="285" cy="166" r="3" fill="#38BDF8" />
        <circle cx="516" cy="166" r="3" fill="#818CF8" />
        <circle cx="532" cy="166" r="3" fill="#60A5FA" />
        <circle cx="516" cy="232" r="3" fill="#60A5FA" />
        <circle cx="532" cy="232" r="3" fill="#93C5FD" />
      </svg>

      <div className="absolute left-0 top-1/2 w-[180px] -translate-y-1/2 rounded-lg border border-blue-400/20 bg-slate-800/90 p-3.5 shadow-[0_20px_54px_rgba(0,0,0,0.26)]">
        <div className="mb-2.5 flex items-center gap-2 px-2 text-xs font-semibold text-blue-200">
          <Network className="h-3.5 w-3.5" />
          Client Apps
        </div>
        <div className="space-y-0.5">
          <ClientItem icon={Plug} title="IDE / Plugins" />
          <ClientItem icon={Globe} title="Web / Mobile" />
          <ClientItem icon={Package} title="Third-party Apps" />
          <ClientItem icon={Code2} title="Custom Clients" />
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 flex h-[142px] w-[142px] -translate-x-1/2 -translate-y-1/2 rotate-45 items-center justify-center rounded-[24px] border border-blue-400/50 bg-slate-900 shadow-[0_0_54px_rgba(37,99,235,0.30)]">
        <div className="-rotate-45 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10 text-blue-200">
            <Zap className="h-6 w-6" />
          </div>
          <p className="mt-2 text-sm font-semibold text-white">ModelPort</p>
          <p className="mt-0.5 text-[11px] text-blue-300">Gateway</p>
        </div>
      </div>

      <div className="absolute left-1/2 top-8 -translate-x-1/2 rounded-md border border-indigo-400/25 bg-indigo-400/10 px-3 py-2 text-[11px] text-indigo-200">
        Policy &amp; Guardrails
      </div>
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 rounded-md border border-white/[0.10] bg-slate-900/95 px-3 py-2 text-[11px] text-slate-300 shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
        Routing · Load Balancing · Limits
      </div>

      <div className="absolute right-0 top-1/2 w-[190px] -translate-y-1/2 rounded-lg border border-blue-400/20 bg-slate-800/90 p-3.5 shadow-[0_20px_54px_rgba(0,0,0,0.26)]">
        <div className="mb-3 flex items-center gap-2 px-1 text-xs font-semibold text-blue-200">
          <Cloud className="h-3.5 w-3.5" />
          Provider Pool
        </div>
        <div className="space-y-2">
          <ProviderItem label="OpenAI" icon={Zap} tone="bg-blue-400/12 text-blue-200" />
          <ProviderItem label="Anthropic" icon={Boxes} tone="bg-indigo-400/12 text-indigo-200" />
          <ProviderItem label="Gemini" icon={Globe} tone="bg-sky-400/12 text-sky-200" />
          <ProviderItem label="Local Models" icon={Database} tone="bg-cyan-400/12 text-cyan-200" />
          <ProviderItem label="Custom" icon={Layers3} tone="bg-violet-400/12 text-violet-200" />
        </div>
      </div>
    </div>
  )
}

export function LoginPage() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError('请输入用户名和密码')
      return
    }

    setLoading(true)
    setError('')

    try {
      await login(username.trim(), password)
      navigate('/dashboard')
    } catch {
      setError('登录失败，请检查用户名或密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.045)_1px,transparent_1px)] [background-size:52px_52px] px-5 py-8 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(37,99,235,0.08),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(59,130,246,0.08),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.6),rgba(248,250,252,0.6))]" />
      <Card className="relative grid h-auto min-h-[640px] w-full max-w-[1380px] overflow-hidden border-slate-200 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.12)] lg:min-h-[730px] lg:grid-cols-[1.42fr_0.88fr]">
        <div className="relative hidden min-h-[730px] flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white xl:p-12 lg:flex">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_54%_18%,rgba(59,130,246,0.15),transparent_42%)]" />

          <div className="relative">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-blue-300">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">ModelPort</p>
                  <p className="text-sm text-slate-400">Admin Console</p>
                </div>
              </div>
              <div className="rounded-md border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-medium text-blue-200">
                local gateway
              </div>
            </div>
          </div>

          <div className="relative border-t border-blue-400/15 pt-9">
            <GatewayTopology />
          </div>

          <div className="relative space-y-5">
            <div className="grid overflow-hidden rounded-lg border border-white/[0.10] bg-white/[0.045] shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:grid-cols-3 xl:grid-cols-6">
              <CapabilityCell icon={Code2} label="Anthropic-compatible" />
              <CapabilityCell icon={Boxes} label="OpenAI-compatible" tone="sky" />
              <CapabilityCell icon={Wrench} label="Tool Use" />
              <CapabilityCell icon={Eye} label="Trace Ready" tone="cyan" />
              <CapabilityCell icon={Shuffle} label="Fallback" tone="indigo" />
              <CapabilityCell icon={Database} label="Local Models" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4 text-xs leading-5">
              <span className="font-medium text-slate-300">Local model routing gateway</span>
              <span className="text-slate-400">Auth · Protocols · Tool Use · Fallback · Provider Health</span>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[640px] items-center justify-center border-l border-slate-200 bg-white px-7 py-10 sm:px-10 lg:min-h-[730px]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.8),rgba(248,250,252,0.4)_54%,rgba(255,255,255,0.6))]" />
          <div className="relative w-full max-w-[360px]">
            <CardHeader className="items-center px-0 pb-8 text-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600">
                <Zap className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <p className="text-2xl font-semibold text-slate-900">ModelPort</p>
                <p className="text-sm text-slate-400">Admin Console</p>
              </div>
            </CardHeader>

            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs font-medium text-slate-600">用户名</Label>
                  <div className="relative">
                    <UserRound className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="请输入用户名"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                      autoComplete="username"
                      className="h-11 pl-9 pr-4 shadow-[0_8px_18px_rgba(15,23,42,0.05)]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-medium text-slate-600">密码</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="请输入密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      autoComplete="current-password"
                      className="h-11 pl-9 pr-4 shadow-[0_8px_18px_rgba(15,23,42,0.05)]"
                    />
                  </div>
                  {error && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {error}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="mt-2 h-11 w-full shadow-[0_18px_38px_rgba(37,99,235,0.24)]"
                  disabled={loading}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  登录
                </Button>
                <div className="flex items-center gap-3 pt-3 text-xs text-slate-400">
                  <div className="h-px flex-1 bg-slate-200" />
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <p className="text-center text-xs text-slate-400">本地部署 · 仅管理员访问 · 安全可靠</p>
              </form>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  )
}
