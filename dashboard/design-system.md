# ModelPort Design System

统一的视觉与组件规范。所有页面、组件必须遵守本文档；新增页面前请先查阅本文件，避免出现风格漂移。

---

## 1. 颜色系统

| 用途 | Token / Tailwind | 值 |
|---|---|---|
| 主色 | `blue-600` | `#2563EB` |
| 主色 hover | `blue-700` | `#1D4ED8` |
| 主色浅底 | `blue-50` | `#EFF6FF` |
| 成功 | `emerald-500` | `#10B981` |
| 警告 | `amber-500` | `#F59E0B` |
| 错误 | `red-500` | `#EF4444` |
| 页面背景 | `slate-50` | `#F8FAFC` |
| 卡片背景 | `white` | `#FFFFFF` |
| 一级文字 | `slate-900` | `#0F172A` |
| 二级文字 | `slate-600` | `#475569` |
| 三级/辅助文字 | `slate-400` | `#94A3B8` |
| 边框/分割线 | `slate-200` | `#E2E8F0` |

实现方式：这些值通过 `src/index.css` 中的 CSS 变量（`--primary`、`--background`、`--foreground`、`--muted-foreground`、`--border`、`--success`、`--warning`、`--destructive` 等）承载，供 `components/ui/*`（Button、Badge、Card、Dialog、Select、Tabs…）统一读取。**新写业务代码时优先使用本文档列出的字面量 Tailwind 类**（如 `text-slate-900`、`bg-blue-600`），只有在明确要跟随主题切换的场景才使用语义类（`bg-primary`、`text-muted-foreground`）。

深色模式：保留现有主题切换功能，`.dark` 下对应调整为深色 slate 背景 + 稍提亮的蓝色主色，语义保持一致（详见 `index.css`）。

## 2. 字体与排版

- 字体族：`Inter, system-ui, -apple-system, sans-serif`（中文回退 `Noto Sans SC` / `Microsoft YaHei`）
- 页面大标题：`text-2xl font-semibold text-slate-900`
- 卡片标题：`text-base font-semibold text-slate-900`
- 正文：`text-sm text-slate-600 leading-relaxed`
- 辅助文字：`text-xs text-slate-400`
- 数据数字：`font-medium tabular-nums`
- 统计卡大数字：`text-2xl font-bold text-slate-900`

## 3. 间距与圆角

| 场景 | 规则 |
|---|---|
| 页面左右内边距 | `px-6` / `px-8` |
| 卡片内边距 | `p-5` / `p-6` |
| 卡片间距 | `gap-5` |
| 元素垂直间距 | `space-y-4` |
| 卡片圆角 | `rounded-xl` |
| 按钮/输入框圆角 | `rounded-lg` |
| 徽章/标签圆角 | `rounded-full` |
| 小元素圆角 | `rounded-md` |

## 4. 阴影与动效

- 卡片默认：`shadow-sm`
- 卡片 hover：`shadow-md` + `translateY(-1px)` + `transition-all duration-200`
- 按钮 hover：`transition-colors duration-150`
- 弹窗/下拉框：`shadow-lg ring-1 ring-black/5`

## 5. 基础组件（`components/ui/`）

| 组件 | 文件 | 说明 |
|---|---|---|
| StatCard | `stat-card.tsx` | 统计卡片：图标圆形浅底 + 可选趋势徽章 + 大数字 + 描述/迷你折线图 |
| PageHeader | `page-header.tsx`（转出自 `components/shared/PageHeader.tsx`） | 标题 + 副标题 + 右侧操作区 + 可选面包屑 |
| DataTable | `data-table.tsx` | 表头 `bg-slate-50 text-slate-500 text-xs uppercase tracking-wide`，行高 `h-14`，hover `bg-slate-50/50`，内置空状态 |
| Button | `button.tsx` | primary / secondary / text(ghost) / danger(destructive)，尺寸 `h-10`/`h-8` |
| Input | `input.tsx` | `border-slate-200`，focus `ring-2 ring-blue-500/20 border-blue-500` |
| Badge | `badge.tsx` | success / warning / error / info / default，`rounded-full px-2.5 py-0.5 text-xs font-medium` |

## 6. 布局规范

- 侧边栏：`w-64`，白底，右边框 `border-slate-200`；菜单项 `h-10 px-3 rounded-lg hover:bg-slate-100`；选中态 `bg-blue-50 text-blue-700 font-medium` + 左侧 3px 蓝色竖条
- 顶部导航栏：`h-16`，白底，底部边框
- 内容区：`max-w-7xl mx-auto py-6 px-6`，页面背景 `bg-slate-50`

## 7. 落地状态

| 范围 | 状态 |
|---|---|
| 设计令牌（`index.css`） | ✅ 已切换 |
| Button / Input / Badge | ✅ 已按规范重做（保留原 props，避免破坏现有调用） |
| StatCard / DataTable | ✅ 新增 |
| PageHeader / StatusBadge | ✅ 已按规范拍平重做 |
| Table（`ui/table.tsx`） | ✅ 表头 `bg-slate-50` 大写小字、`h-14` 行高、hover 高亮，全站表格自动继承 |
| Card / Dialog / Select / DropdownMenu / Tabs / Switch | ✅ 圆角、阴影、ring、白色表面已对齐规范 |
| Layout（Sidebar / Header / AppLayout） | ✅ 已按规范重做 |
| DashboardPage | ✅ 完整样板页 |
| LoginPage | ✅ 品牌插画配色已从莫兰迪绿改为蓝色系 |
| ApiKeysPage / ModelsPage / UsersPage / QuotasPage / SettingsPage / LogsPage | ✅ 已完成配色/间距/圆角对齐（详见下方说明） |
