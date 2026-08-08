export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  API_KEYS: "/api-keys",
  USERS: "/users",
  QUOTAS: "/quotas",
  MODELS: "/models",
  LOGS: "/logs",
  SETTINGS: "/settings",
} as const

export const NAV_ITEMS = [
  { path: ROUTES.DASHBOARD, label: "仪表盘", icon: "LayoutDashboard" },
  { path: ROUTES.API_KEYS, label: "API Keys", icon: "KeyRound" },
  { path: ROUTES.USERS, label: "用户管理", icon: "Users" },
  { path: ROUTES.QUOTAS, label: "配额管理", icon: "Gauge" },
  { path: ROUTES.MODELS, label: "模型管理", icon: "Boxes" },
  { path: ROUTES.LOGS, label: "请求日志", icon: "ScrollText" },
  { path: ROUTES.SETTINGS, label: "系统设置", icon: "Settings" },
] as const

// 侧栏分组（仅 Sidebar 使用；NAV_ITEMS 保留给 BreadcrumbNav / CommandPalette）
export const NAV_GROUPS = [
  {
    label: "概览",
    items: [{ path: ROUTES.DASHBOARD, label: "仪表盘", icon: "LayoutDashboard" }],
  },
  {
    label: "接入管理",
    items: [
      { path: ROUTES.API_KEYS, label: "API Keys", icon: "KeyRound" },
      { path: ROUTES.USERS, label: "用户管理", icon: "Users" },
      { path: ROUTES.QUOTAS, label: "配额管理", icon: "Gauge" },
    ],
  },
  {
    label: "运维",
    items: [
      { path: ROUTES.MODELS, label: "模型管理", icon: "Boxes" },
      { path: ROUTES.LOGS, label: "请求日志", icon: "ScrollText" },
      { path: ROUTES.SETTINGS, label: "系统设置", icon: "Settings" },
    ],
  },
] as const

export const ROLE_LABELS: Record<string, string> = {
  admin: "管理员",
  user: "普通用户",
  viewer: "只读用户",
}

export const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  disabled: "bg-slate-100 text-slate-500",
  suspended: "bg-red-50 text-red-700",
  success: "bg-emerald-50 text-emerald-700",
  error: "bg-red-50 text-red-700",
  timeout: "bg-amber-50 text-amber-700",
  healthy: "bg-emerald-50 text-emerald-700",
  degraded: "bg-amber-50 text-amber-700",
  down: "bg-red-50 text-red-700",
  inactive: "bg-slate-100 text-slate-500",
  error_badge: "bg-red-50 text-red-700",
}

export const PROVIDER_PROTOCOL_LABELS: Record<string, string> = {
  anthropic: "Anthropic",
  "openai-compat": "OpenAI 兼容",
}
