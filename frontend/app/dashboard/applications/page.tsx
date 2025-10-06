'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../../components/DashboardLayout'
import { 
  Download, 
  Eye, 
  Calendar, 
  DollarSign, 
  User, 
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  FileText
} from 'lucide-react'

interface User {
  id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
}

interface Application {
  id: number
  tender_id: number
  supplier_id: number
  proposed_price: number | null
  comment: string | null
  status: string
  created_at: string
  tender?: {
    id: number
    title: string
    initial_price: number | null
    currency: string
    deadline: string | null
  }
  supplier?: {
    id: number
    full_name: string
    email: string
    supplier_profile?: {
      company_name: string
      inn: string
    }
  }
}

export default function ApplicationsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTender, setSelectedTender] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchUserData()
  }, [router])

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
        if (userData.role !== 'contract_manager' && userData.role !== 'admin' && userData.role !== 'supplier') {
          router.push('/dashboard')
          return
        }
        setUser(userData)
        await fetchApplications(userData.role)
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

  const fetchApplications = async (role: string) => {
    try {
      const token = localStorage.getItem('access_token')
      
      if (role === 'supplier') {
        // Для поставщиков - их собственные заявки
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/applications/my`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setApplications(data)
        }
      } else {
        // Для менеджеров - все заявки (пока пустой массив, так как нет endpoint для всех заявок)
        setApplications([])
      }
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error)
    }
  }

  const handleExportExcel = async (tenderId: number) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/applications/export/tender/${tenderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `tender_${tenderId}_applications.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Ошибка при экспорте данных')
      }
    } catch (error) {
      console.error('Ошибка экспорта:', error)
      alert('Ошибка при экспорте данных')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted': return 'Подана'
      case 'accepted': return 'Принята'
      case 'rejected': return 'Отклонена'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Clock className="h-4 w-4" />
      case 'accepted': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return 'Цена не указана'
    return new Intl.NumberFormat('ru-RU').format(price) + ' ' + currency
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
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
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">
              {user.role === 'supplier' ? 'Мои заявки' : 'Управление заявками'}
            </h1>
            <p className="text-secondary-600">
              {user.role === 'supplier' 
                ? 'Просмотр и отслеживание ваших заявок на тендеры'
                : 'Просмотр и управление заявками поставщиков'
              }
            </p>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">Поданы</p>
                  <p className="text-2xl font-bold text-secondary-900">
                    {applications?.filter(app => app.status === 'submitted').length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">Приняты</p>
                  <p className="text-2xl font-bold text-secondary-900">
                    {applications?.filter(app => app.status === 'accepted').length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">Отклонены</p>
                  <p className="text-2xl font-bold text-secondary-900">
                    {applications?.filter(app => app.status === 'rejected').length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Список заявок */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-secondary-900">
                {user.role === 'supplier' ? 'Ваши заявки' : 'Все заявки'}
              </h2>
              {user.role !== 'supplier' && (
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedTender || ''}
                    onChange={(e) => setSelectedTender(e.target.value ? parseInt(e.target.value) : null)}
                    className="input-field"
                  >
                    <option value="">Выберите тендер</option>
                    {/* Здесь можно добавить список тендеров */}
                  </select>
                  {selectedTender && (
                    <button
                      onClick={() => handleExportExcel(selectedTender)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Экспорт в Excel</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">
                  Заявки не найдены
                </h3>
                <p className="text-secondary-600">
                  {user.role === 'supplier' 
                    ? 'Вы еще не подавали заявки на тендеры'
                    : 'Заявки на тендеры отсутствуют'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications?.map((application) => (
                  <div key={application.id} className="border border-secondary-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-secondary-900">
                            Заявка #{application.id}
                          </h3>
                          <span className={`px-3 py-1 text-sm rounded-full flex items-center space-x-1 ${getStatusColor(application.status)}`}>
                            {getStatusIcon(application.status)}
                            <span>{getStatusText(application.status)}</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-secondary-600">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">
                              Подана: {formatDate(application.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-secondary-600">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-sm">
                              Предложенная цена: {formatPrice(application.proposed_price, 'RUB')}
                            </span>
                          </div>
                        </div>

                        {application.comment && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-secondary-700 mb-1">Комментарий:</h4>
                            <p className="text-sm text-secondary-600 bg-secondary-50 p-3 rounded-lg">
                              {application.comment}
                            </p>
                          </div>
                        )}

                        {/* Информация о тендере */}
                        {application.tender && (
                          <div className="border-t border-secondary-200 pt-4">
                            <h4 className="text-sm font-medium text-secondary-700 mb-2">Информация о тендере:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-secondary-600">Название:</span>
                                <span className="ml-2 font-medium">{application.tender.title}</span>
                              </div>
                              <div>
                                <span className="text-secondary-600">Начальная цена:</span>
                                <span className="ml-2 font-medium">
                                  {formatPrice(application.tender.initial_price, application.tender.currency)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Информация о поставщике (для менеджеров) */}
                        {user.role !== 'supplier' && application.supplier && (
                          <div className="border-t border-secondary-200 pt-4 mt-4">
                            <h4 className="text-sm font-medium text-secondary-700 mb-2">Информация о поставщике:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-secondary-400" />
                                <span className="text-secondary-600">Контактное лицо:</span>
                                <span className="font-medium">{application.supplier.full_name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Building2 className="h-4 w-4 text-secondary-400" />
                                <span className="text-secondary-600">Компания:</span>
                                <span className="font-medium">
                                  {application.supplier.supplier_profile?.company_name || 'Не указано'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button className="btn-secondary flex items-center space-x-2">
                          <Eye className="h-4 w-4" />
                          <span>Подробнее</span>
                        </button>
                        {user.role !== 'supplier' && (
                          <button className="btn-primary text-sm">
                            Изменить статус
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
