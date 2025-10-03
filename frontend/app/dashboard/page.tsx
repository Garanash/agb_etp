'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  FileText,
  Users,
  Building2,
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react'

interface DashboardStats {
  total_tenders: number
  active_tenders: number
  total_applications: number
  total_suppliers: number
  total_users: number
  total_products: number
  total_amount: number
  recent_tenders: Array<{
    id: number
    title: string
    status: string
    created_at: string
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchCurrentUser()
    fetchStats()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data)
      }
    } catch (err) {
      console.error('Ошибка загрузки данных пользователя:', err)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setError('Ошибка загрузки статистики')
      }
    } catch (err) {
      setError('Ошибка загрузки статистики')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'published': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Черновик'
      case 'published': return 'Опубликован'
      case 'in_progress': return 'В процессе'
      case 'completed': return 'Завершен'
      case 'cancelled': return 'Отменен'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Загрузка статистики...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Ошибка</h1>
          <p className="text-secondary-600 mb-4">{error}</p>
          <button
            onClick={() => fetchStats()}
            className="btn-primary"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900">
          Добро пожаловать, {currentUser?.full_name}!
        </h1>
        <p className="mt-2 text-secondary-600">
          Здесь вы можете увидеть основную статистику и последние обновления
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800`}>
              +12% за месяц
            </span>
          </div>
          <h3 className="text-sm font-medium text-secondary-600">
            Всего тендеров
          </h3>
          <p className="text-2xl font-bold text-secondary-900">
            {stats.total_tenders}
          </p>
          <p className="mt-1 text-sm text-secondary-500">
            Активных: {stats.active_tenders}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Building2 className="h-6 w-6 text-primary-600" />
            </div>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800`}>
              +5% за месяц
            </span>
          </div>
          <h3 className="text-sm font-medium text-secondary-600">
            Поставщиков
          </h3>
          <p className="text-2xl font-bold text-secondary-900">
            {stats.total_suppliers}
          </p>
          <p className="mt-1 text-sm text-secondary-500">
            Заявок: {stats.total_applications}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Package className="h-6 w-6 text-primary-600" />
            </div>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800`}>
              +8% за месяц
            </span>
          </div>
          <h3 className="text-sm font-medium text-secondary-600">
            Товаров и услуг
          </h3>
          <p className="text-2xl font-bold text-secondary-900">
            {stats.total_products}
          </p>
          <p className="mt-1 text-sm text-secondary-500">
            В каталоге
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <DollarSign className="h-6 w-6 text-primary-600" />
            </div>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800`}>
              +15% за месяц
            </span>
          </div>
          <h3 className="text-sm font-medium text-secondary-600">
            Общая сумма
          </h3>
          <p className="text-2xl font-bold text-secondary-900">
            {formatPrice(stats.total_amount)}
          </p>
          <p className="mt-1 text-sm text-secondary-500">
            По всем тендерам
          </p>
        </div>
      </div>

      {/* Последние тендеры */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-secondary-900">
            Последние тендеры
          </h2>
          <Link
            href="/dashboard/tenders"
            className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center space-x-1"
          >
            <span>Все тендеры</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Название
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Дата создания
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {stats.recent_tenders.map((tender) => (
                <tr key={tender.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-secondary-900">
                      {tender.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(tender.status)}`}>
                      {getStatusText(tender.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-secondary-600">
                      {formatDate(tender.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link
                      href={`/tenders/${tender.id}`}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                      Подробнее
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentUser?.role === 'admin' && (
          <Link
            href="/dashboard/users/create"
            className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 hover:border-primary-300 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-secondary-900">
                  Добавить пользователя
                </h3>
                <p className="text-sm text-secondary-600">
                  Создать нового пользователя системы
                </p>
              </div>
            </div>
          </Link>
        )}

        {(currentUser?.role === 'admin' || currentUser?.role === 'contract_manager') && (
          <Link
            href="/dashboard/tenders/create"
            className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 hover:border-primary-300 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-secondary-900">
                  Создать тендер
                </h3>
                <p className="text-sm text-secondary-600">
                  Опубликовать новый тендер
                </p>
              </div>
            </div>
          </Link>
        )}

        {currentUser?.role === 'supplier' && (
          <Link
            href="/tenders"
            className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 hover:border-primary-300 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-secondary-900">
                  Найти тендеры
                </h3>
                <p className="text-sm text-secondary-600">
                  Поиск актуальных тендеров
                </p>
              </div>
            </div>
          </Link>
        )}

        <Link
          href="/dashboard/settings"
          className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 hover:border-primary-300 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-secondary-900">
                Настройки профиля
              </h3>
              <p className="text-sm text-secondary-600">
                Управление учетной записью
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}