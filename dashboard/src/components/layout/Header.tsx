import { useAuthStore, useAppStore } from '@/stores'
import { BreadcrumbNav } from '@/components/shared/BreadcrumbNav'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { isMockMode } from '@/lib/mock-mode'
import { Moon, Sun, Monitor, LogOut, User, Menu, Search } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  onMenuClick?: () => void
  isMobile?: boolean
}

export function Header({ onMenuClick, isMobile }: HeaderProps) {
  const currentUser = useAuthStore((s) => s.currentUser)
  const logout = useAuthStore((s) => s.logout)
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)

  const themeIcons = { light: Sun, dark: Moon, system: Monitor }
  const ThemeIcon = themeIcons[theme]

  // Keyboard shortcut hint for command palette
  const [isMac] = useState(() => navigator.platform.includes('Mac'))

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3 min-w-0">
        {isMobile && (
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onMenuClick}>
            <Menu className="h-4 w-4" />
          </Button>
        )}
        <div className="min-w-0">
          <BreadcrumbNav />
        </div>
        {isMockMode && (
          <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            演示数据
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {/* Command palette trigger */}
        <Button
          variant="outline"
          size="sm"
          className="hidden h-8 gap-2 text-xs text-slate-500 md:flex"
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
        >
          <Search className="h-3.5 w-3.5" />
          <span>搜索...</span>
          <kbd className="pointer-events-none ml-1 select-none rounded border border-slate-200 bg-slate-50 px-1 text-[10px] font-medium text-slate-500">
            {isMac ? '⌘' : 'Ctrl+'}K
          </kbd>
        </Button>

        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ThemeIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="mr-2 h-4 w-4" />
              浅色
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="mr-2 h-4 w-4" />
              深色
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Monitor className="mr-2 h-4 w-4" />
              跟随系统
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                <AvatarFallback className="bg-blue-50 text-blue-600 text-xs font-semibold">
                  {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-slate-900">
                  {currentUser?.username || '用户'}
                </p>
                <p className="text-xs leading-none text-slate-400">
                  {currentUser?.email || ''}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              个人资料
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
