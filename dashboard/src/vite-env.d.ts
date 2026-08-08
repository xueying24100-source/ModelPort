/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 后端网关 API 地址，留空则走同源相对路径 */
  readonly VITE_API_BASE_URL?: string
  /** 设为 '1' 时全站走内置 mock 数据，无需真实后端 */
  readonly VITE_MODELPORT_MOCK?: string
  /** 设为 '1' 时自动预置 mock 会话并直达仪表盘（用于本地/作品集演示） */
  readonly VITE_DEMO?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
