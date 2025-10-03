'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react'

interface HeaderProps {
  user: {
    full_name: string
    email: string
    role: string
  }
}

export default function Header({ user }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор'
      case 'contract_manager': return 'Контрактный управляющий'
      case 'manager': return 'Менеджер'
      case 'supplier': return 'Поставщик'
      default: return role
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    window.location.href = '/'
  }

  return (
    <header className="bg-white border-b border-secondary-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-1"></div>

          <div className="flex items-center space-x-4">
            {/* Уведомления */}
            <button className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Профиль */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary-50 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-secondary-900">
                    {user.full_name}
                  </div>
                  <div className="text-xs text-secondary-500">
                    {getRoleName(user.role)}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-secondary-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1">
                  <div className="px-4 py-2 border-b border-secondary-200">
                    <div className="text-sm font-medium text-secondary-900">
                      {user.full_name}
                    </div>
                    <div className="text-xs text-secondary-500">
                      {user.email}
                    </div>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    <span>Настройки</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    <span>Выйти</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
