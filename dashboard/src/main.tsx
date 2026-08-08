import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// 作品集在线演示：预置 mock 会话，自动登录直达仪表盘（仅 VITE_DEMO 生效）
if (import.meta.env.VITE_DEMO === '1') {
  try {
    if (!localStorage.getItem('modelport_mock_session')) {
      localStorage.setItem('modelport_mock_session', 'usr_001')
    }
  } catch {
    /* ignore */
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
