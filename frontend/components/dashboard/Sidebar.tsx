'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Building2,
  Package,
  ChevronDown,
  ChevronUp,
  LogOut,
  BarChart3
} from 'lucide-react'

interface SidebarProps {
  userRole: string
}

interface SubmenuItem {
  title: string
  href: string
  roles?: string[]
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    )
  }

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Дашборд',
      icon: LayoutDashboard,
      href: '/dashboard',
      roles: ['admin', 'contract_manager', 'manager', 'supplier']
    },
    {
      id: 'tenders',
      title: 'Тендеры',
      icon: FileText,
      submenu: [
        {
          title: 'Все тендеры',
          href: '/dashboard/tenders'
        },
        {
          title: 'Создать тендер',
          href: '/dashboard/tenders/create',
          roles: ['admin', 'contract_manager']
        },
        {
          title: 'Мои тендеры',
          href: '/dashboard/tenders/my',
          roles: ['admin', 'contract_manager']
        },
        {
          title: 'Мои заявки',
          href: '/dashboard/tenders/applications',
          roles: ['supplier']
        },
        {
          title: 'Тендеры для участия',
          href: '/supplier/tenders',
          roles: ['supplier']
        },
        {
          title: 'Мои предложения',
          href: '/supplier/proposals',
          roles: ['supplier']
        }
      ] as SubmenuItem[]
    },
    {
      id: 'users',
      title: 'Пользователи',
      icon: Users,
      submenu: [
        {
          title: 'Все пользователи',
          href: '/admin/users'
        },
        {
          title: 'Добавить пользователя',
          href: '/admin/users'
        }
      ] as SubmenuItem[],
      roles: ['admin']
    },
    {
      id: 'suppliers',
      title: 'Поставщики',
      icon: Building2,
      submenu: [
        {
          title: 'Все поставщики',
          href: '/dashboard/suppliers'
        },
        {
          title: 'Верификация',
          href: '/dashboard/suppliers/verification'
        }
      ] as SubmenuItem[],
      roles: ['admin', 'manager']
    },
    {
      id: 'products',
      title: 'Товары и услуги',
      icon: Package,
      submenu: [
        {
          title: 'Каталог',
          href: '/dashboard/products'
        },
        {
          title: 'Категории',
          href: '/dashboard/products/categories'
        },
        {
          title: 'Добавить товар',
          href: '/dashboard/products/create'
        }
      ] as SubmenuItem[],
      roles: ['admin', 'contract_manager']
    },
    {
      id: 'analytics',
      title: 'Аналитика',
      icon: BarChart3,
      href: '/admin/analytics',
      roles: ['admin', 'contract_manager', 'manager']
    },
    {
      id: 'settings',
      title: 'Настройки',
      icon: Settings,
      href: '/dashboard/settings',
      roles: ['admin', 'contract_manager', 'manager', 'supplier']
    }
  ]

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    window.location.href = '/'
  }

  return (
    <div className="w-64 bg-white border-r border-secondary-200 min-h-screen">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-8">
          <img
            src="/logo.svg"
            alt="Алмазгеобур"
            className="h-8 w-8"
          />
          <span className="text-xl font-bold text-secondary-900">
            Алмазгеобур
          </span>
        </div>

        <nav className="space-y-1">
          {menuItems?.map((item) => {
            if (item.roles && !item.roles.includes(userRole)) {
              return null
            }

            const ItemIcon = item.icon

            if (item.submenu) {
              if (item.roles && !item.roles.includes(userRole)) {
                return null
              }

              const isExpanded = expandedMenus.includes(item.id)
              const hasActiveChild = item.submenu?.some(subitem => 
                !subitem.roles || subitem.roles.includes(userRole)
                  ? isActive(subitem.href)
                  : false
              )

              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      hasActiveChild
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-secondary-700 hover:text-secondary-900 hover:bg-secondary-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <ItemIcon className="h-5 w-5 mr-3" />
                      <span>{item.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="mt-1 pl-10 space-y-1">
                      {item.submenu?.map((subitem) => {
                        if (subitem.roles && !subitem.roles.includes(userRole)) {
                          return null
                        }

                        return (
                          <Link
                            key={subitem.href}
                            href={subitem.href}
                            className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                              isActive(subitem.href)
                                ? 'text-primary-600 bg-primary-50'
                                : 'text-secondary-700 hover:text-secondary-900 hover:bg-secondary-50'
                            }`}
                          >
                            {subitem.title}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-secondary-700 hover:text-secondary-900 hover:bg-secondary-50'
                }`}
              >
                <ItemIcon className="h-5 w-5 mr-3" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 w-64 p-4 border-t border-secondary-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Выйти</span>
        </button>
      </div>
    </div>
  )
}
