'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import ApplicationModal from '@/components/ApplicationModal'
import { 
  Plus, 
  Eye, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Search,
  Filter,
  FileText,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'

interface User {
  id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
}

interface Tender {
  id: number
  title: string
  description: string
  initial_price: number | null
  currency: string
  status: string
  publication_date: string | null
  deadline: string | null
  region: string | null
  created_at: string
}

interface TenderFilters {
  search: string
  region: string
  status: string
  sort: string
}

export default function TendersPage() {
  const [user, setUser] = useState<User | null>(null)
  const [tenders, setTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<TenderFilters>({
    search: '',
    region: '',
    status: '',
    sort: 'by_published_desc'
  })
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null)
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchUserData()
  }, [router])

  useEffect(() => {
    if (user) {
      fetchTenders()
    }
  }, [user, page, filters])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        localStorage.removeItem('access_token')
        router.push('/login')
      }
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error)
      localStorage.removeItem('access_token')
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchTenders = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const params = new URLSearchParams({
        page: page.toString(),
        size: '20',
        sort: filters.sort
      })
      
      if (filters.search) params.append('search', filters.search)
      if (filters.region) params.append('region', filters.region)
      if (filters.status) params.append('status', filters.status)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tenders/?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTenders(data.items || [])
        setTotalPages(data.pages || 1)
      }
    } catch (error) {
      console.error('Ошибка загрузки тендеров:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof TenderFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return 'Цена не указана'
    return new Intl.NumberFormat('ru-RU').format(price) + ' ' + currency
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Дата не указана'
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Опубликован'
      case 'in_progress': return 'В процессе'
      case 'completed': return 'Завершен'
      case 'cancelled': return 'Отменен'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const handleApplicationSubmit = async (data: { proposed_price: number; comment: string }) => {
    if (!selectedTender) return

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/applications/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tender_id: selectedTender.id,
          proposed_price: data.proposed_price,
          comment: data.comment
        }),
      })

      if (response.ok) {
        alert('Заявка успешно подана!')
        setIsApplicationModalOpen(false)
        setSelectedTender(null)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Ошибка при подаче заявки')
      }
    } catch (error: any) {
      throw error
    }
  }

  const openApplicationModal = (tender: Tender) => {
    setSelectedTender(tender)
    setIsApplicationModalOpen(true)
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout userRole={user.role} userName={user.full_name}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Заголовок */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                  {user.role === 'supplier' ? 'Доступные тендеры' : 'Управление тендерами'}
                </h1>
                <p className="text-secondary-600">
                  {user.role === 'supplier' 
                    ? 'Найдите подходящие тендеры для участия'
                    : 'Создавайте и управляйте тендерами'
                  }
                </p>
              </div>
              {(user.role === 'contract_manager' || user.role === 'admin') && (
                <Link 
                  href="/dashboard/tenders/create"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Создать тендер</span>
                </Link>
              )}
            </div>
          </div>

          {/* Фильтры */}
          <div className="card mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Поиск
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="input-field pl-10"
                    placeholder="Название или описание"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Регион
                </label>
                <input
                  type="text"
                  value={filters.region}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                  className="input-field"
                  placeholder="Москва"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Статус
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="input-field"
                >
                  <option value="">Все статусы</option>
                  <option value="published">Опубликован</option>
                  <option value="in_progress">В процессе</option>
                  <option value="completed">Завершен</option>
                  <option value="cancelled">Отменен</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Сортировка
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="input-field"
                >
                  <option value="by_published_desc">По дате публикации (новые)</option>
                  <option value="by_published_asc">По дате публикации (старые)</option>
                  <option value="by_deadline_asc">По сроку подачи (ближайшие)</option>
                  <option value="by_deadline_desc">По сроку подачи (дальние)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Список тендеров */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)]?.map((_, index) => (
                <div key={index} className="card animate-pulse">
                  <div className="h-6 bg-secondary-200 rounded mb-4"></div>
                  <div className="h-4 bg-secondary-200 rounded mb-2"></div>
                  <div className="h-4 bg-secondary-200 rounded mb-4 w-3/4"></div>
                  <div className="flex space-x-4">
                    <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
                    <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
                    <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {tenders?.map((tender) => (
                <div key={tender.id} className="card hover:shadow-lg transition-shadow duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-secondary-900 flex-1 mr-4">
                      {tender.title}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(tender.status)}`}>
                      {getStatusIcon(tender.status)}
                      <span>{getStatusText(tender.status)}</span>
                    </span>
                  </div>
                  
                  <p className="text-secondary-600 mb-4 line-clamp-3">
                    {tender.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-secondary-500">
                      <DollarSign className="h-4 w-4 mr-2" />
                      {formatPrice(tender.initial_price, tender.currency)}
                    </div>
                    {tender.region && (
                      <div className="flex items-center text-sm text-secondary-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        {tender.region}
                      </div>
                    )}
                    {tender.deadline && (
                      <div className="flex items-center text-sm text-secondary-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        До {formatDate(tender.deadline)}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-secondary-500">
                      Опубликован: {formatDate(tender.publication_date)}
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        href={`/tenders/${tender.id}`}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Подробнее</span>
                      </Link>
                      {user.role === 'supplier' && tender.status === 'published' && (
                        <button 
                          onClick={() => openApplicationModal(tender)}
                          className="btn-primary"
                        >
                          Подать заявку
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-2 border border-secondary-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-50"
                >
                  Назад
                </button>
                
                {[...Array(totalPages)]?.map((_, index) => {
                  const pageNum = index + 1
                  if (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - page) <= 2) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 border rounded-lg ${
                          pageNum === page
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'border-secondary-300 hover:bg-secondary-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  } else if (pageNum === page - 3 || pageNum === page + 3) {
                    return <span key={pageNum} className="px-3 py-2">...</span>
                  }
                  return null
                })}
                
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-2 border border-secondary-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-50"
                >
                  Вперед
                </button>
              </div>
            </div>
          )}

          {tenders.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                Тендеры не найдены
              </h3>
              <p className="text-secondary-600">
                Попробуйте изменить параметры поиска или создать новый тендер
              </p>
            </div>
          )}
        </div>

        {/* Модальное окно подачи заявки */}
        {selectedTender && (
          <ApplicationModal
            isOpen={isApplicationModalOpen}
            onClose={() => {
              setIsApplicationModalOpen(false)
              setSelectedTender(null)
            }}
            tender={selectedTender}
            onSubmit={handleApplicationSubmit}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
