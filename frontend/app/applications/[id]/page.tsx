'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, 
  DollarSign, 
  MapPin, 
  FileText, 
  Building2, 
  Clock,
  Download,
  Eye,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Users,
  TrendingUp,
  Award,
  Shield
} from 'lucide-react'

interface TenderApplication {
  id: number
  tender_id: number
  supplier_id: number
  proposed_price?: number
  comment?: string
  status: string
  created_at: string
  updated_at: string
  supplier: {
    id: number
    email: string
    full_name: string
    phone?: string
    role: string
    supplier_profile?: {
      id: number
      company_name: string
      inn: string
      kpp?: string
      ogrn?: string
      legal_address?: string
      actual_address?: string
      bank_name?: string
      bank_account?: string
      correspondent_account?: string
      bic?: string
      contact_person?: string
      contact_phone?: string
      contact_email?: string
      is_verified: boolean
    }
  }
  tender: {
    id: number
    title: string
    description: string
    initial_price?: number
    currency: string
    status: string
    publication_date?: string
    deadline?: string
    okpd_code?: string
    region?: string
    procurement_method: string
    created_by: number
    created_at: string
    lots: Array<{
      id: number
      lot_number: number
      title: string
      description?: string
      initial_price?: number
      currency: string
      security_amount?: number
      delivery_place?: string
      payment_terms?: string
      quantity?: string
      unit_of_measure?: string
      okpd_code?: string
      okved_code?: string
      products: Array<{
        id: number
        position_number: number
        name: string
        quantity?: string
        unit_of_measure?: string
      }>
    }>
    organizers: Array<{
      id: number
      organization_name: string
      legal_address?: string
      postal_address?: string
      email?: string
      phone?: string
      contact_person?: string
      inn?: string
      kpp?: string
      ogrn?: string
    }>
    documents: Array<{
      id: number
      title: string
      file_path: string
      file_size?: number
      file_type?: string
      uploaded_at: string
    }>
  }
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<TenderApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('main')

  useEffect(() => {
    fetchApplication()
  }, [params.id])

  const fetchApplication = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/applications/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setApplication(data)
      } else if (response.status === 403) {
        setError('Недостаточно прав доступа')
      } else {
        setError('Заявка не найдена')
      }
    } catch (err) {
      setError('Ошибка загрузки заявки')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number, currency: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Clock className="h-4 w-4 text-blue-500" />
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <AlertCircle className="h-4 w-4 text-yellow-500" />
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-secondary-600">Загрузка заявки...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">Ошибка</h1>
            <p className="text-secondary-600 mb-4">{error}</p>
            <Link href="/dashboard/applications" className="btn-primary">
              Вернуться к заявкам
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Навигация */}
        <div className="mb-6">
          <Link 
            href="/dashboard/applications" 
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Назад к заявкам</span>
          </Link>
        </div>

        {/* Заголовок заявки */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-secondary-900 mb-2">
                Заявка на тендер: {application.tender.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-secondary-600">
                <div className="flex items-center space-x-1">
                  {getStatusIcon(application.status)}
                  <span>{getStatusText(application.status)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Подана: {formatDate(application.created_at)}</span>
                </div>
                {application.proposed_price && (
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>Предложенная цена: {formatPrice(application.proposed_price, application.tender.currency)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(application.status)}`}>
                {getStatusText(application.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Навигация по разделам */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 mb-6">
          <div className="border-b border-secondary-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('main')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'main'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                Основные сведения
              </button>
              <button
                onClick={() => setActiveTab('supplier')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'supplier'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                Информация о поставщике
              </button>
              <button
                onClick={() => setActiveTab('tender')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tender'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                Информация о тендере
              </button>
            </nav>
          </div>
        </div>

        {/* Содержимое разделов */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          {activeTab === 'main' && (
            <div>
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Основные сведения о заявке</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-secondary-900 mb-3">Детали заявки</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-secondary-600">ID заявки</dt>
                      <dd className="text-sm text-secondary-900 font-mono">#{application.id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-secondary-600">Статус</dt>
                      <dd className="text-sm text-secondary-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                          {getStatusText(application.status)}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-secondary-600">Дата подачи</dt>
                      <dd className="text-sm text-secondary-900">{formatDate(application.created_at)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-secondary-600">Последнее обновление</dt>
                      <dd className="text-sm text-secondary-900">{formatDate(application.updated_at)}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="font-medium text-secondary-900 mb-3">Финансовые условия</h3>
                  <dl className="space-y-3">
                    {application.proposed_price && (
                      <div>
                        <dt className="text-sm text-secondary-600">Предложенная цена</dt>
                        <dd className="text-sm text-secondary-900 font-semibold text-lg">
                          {formatPrice(application.proposed_price, application.tender.currency)}
                        </dd>
                      </div>
                    )}
                    {application.tender.initial_price && (
                      <div>
                        <dt className="text-sm text-secondary-600">Начальная цена тендера</dt>
                        <dd className="text-sm text-secondary-900">
                          {formatPrice(application.tender.initial_price, application.tender.currency)}
                        </dd>
                      </div>
                    )}
                    {application.proposed_price && application.tender.initial_price && (
                      <div>
                        <dt className="text-sm text-secondary-600">Экономия</dt>
                        <dd className="text-sm text-green-600 font-semibold">
                          {formatPrice(application.tender.initial_price - application.proposed_price, application.tender.currency)}
                          <span className="text-xs ml-1">
                            ({(((application.tender.initial_price - application.proposed_price) / application.tender.initial_price) * 100).toFixed(1)}%)
                          </span>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
              
              {application.comment && (
                <div className="mt-6">
                  <h3 className="font-medium text-secondary-900 mb-3">Комментарий поставщика</h3>
                  <div className="bg-secondary-50 rounded-lg p-4">
                    <p className="text-secondary-700">{application.comment}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'supplier' && (
            <div>
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Информация о поставщике</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-secondary-900 mb-3">Контактная информация</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-secondary-600">ФИО</dt>
                      <dd className="text-sm text-secondary-900">{application.supplier.full_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-secondary-600">Email</dt>
                      <dd className="text-sm text-secondary-900">{application.supplier.email}</dd>
                    </div>
                    {application.supplier.phone && (
                      <div>
                        <dt className="text-sm text-secondary-600">Телефон</dt>
                        <dd className="text-sm text-secondary-900">{application.supplier.phone}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm text-secondary-600">Роль</dt>
                      <dd className="text-sm text-secondary-900">{application.supplier.role}</dd>
                    </div>
                  </dl>
                </div>
                
                {application.supplier.supplier_profile && (
                  <div>
                    <h3 className="font-medium text-secondary-900 mb-3">Данные компании</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm text-secondary-600">Наименование</dt>
                        <dd className="text-sm text-secondary-900">{application.supplier.supplier_profile.company_name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-secondary-600">ИНН</dt>
                        <dd className="text-sm text-secondary-900 font-mono">{application.supplier.supplier_profile.inn}</dd>
                      </div>
                      {application.supplier.supplier_profile.kpp && (
                        <div>
                          <dt className="text-sm text-secondary-600">КПП</dt>
                          <dd className="text-sm text-secondary-900 font-mono">{application.supplier.supplier_profile.kpp}</dd>
                        </div>
                      )}
                      {application.supplier.supplier_profile.ogrn && (
                        <div>
                          <dt className="text-sm text-secondary-600">ОГРН</dt>
                          <dd className="text-sm text-secondary-900 font-mono">{application.supplier.supplier_profile.ogrn}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-sm text-secondary-600">Статус верификации</dt>
                        <dd className="text-sm text-secondary-900">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            application.supplier.supplier_profile.is_verified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {application.supplier.supplier_profile.is_verified ? 'Верифицирован' : 'Не верифицирован'}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>
              
              {application.supplier.supplier_profile && (
                <div className="mt-6">
                  <h3 className="font-medium text-secondary-900 mb-3">Адреса</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {application.supplier.supplier_profile.legal_address && (
                      <div>
                        <dt className="text-sm text-secondary-600">Юридический адрес</dt>
                        <dd className="text-sm text-secondary-900">{application.supplier.supplier_profile.legal_address}</dd>
                      </div>
                    )}
                    {application.supplier.supplier_profile.actual_address && (
                      <div>
                        <dt className="text-sm text-secondary-600">Фактический адрес</dt>
                        <dd className="text-sm text-secondary-900">{application.supplier.supplier_profile.actual_address}</dd>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tender' && (
            <div>
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Информация о тендере</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-secondary-900 mb-3">Основные данные</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-secondary-600">Название</dt>
                      <dd className="text-sm text-secondary-900">{application.tender.title}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-secondary-600">Описание</dt>
                      <dd className="text-sm text-secondary-900">{application.tender.description}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-secondary-600">Способ закупки</dt>
                      <dd className="text-sm text-secondary-900">{application.tender.procurement_method}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-secondary-600">Статус</dt>
                      <dd className="text-sm text-secondary-900">{application.tender.status}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="font-medium text-secondary-900 mb-3">Финансовые условия</h3>
                  <dl className="space-y-3">
                    {application.tender.initial_price && (
                      <div>
                        <dt className="text-sm text-secondary-600">Начальная цена</dt>
                        <dd className="text-sm text-secondary-900">{formatPrice(application.tender.initial_price, application.tender.currency)}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm text-secondary-600">Валюта</dt>
                      <dd className="text-sm text-secondary-900">{application.tender.currency}</dd>
                    </div>
                    {application.tender.publication_date && (
                      <div>
                        <dt className="text-sm text-secondary-600">Дата публикации</dt>
                        <dd className="text-sm text-secondary-900">{formatDate(application.tender.publication_date)}</dd>
                      </div>
                    )}
                    {application.tender.deadline && (
                      <div>
                        <dt className="text-sm text-secondary-600">Срок подачи заявок</dt>
                        <dd className="text-sm text-secondary-900">{formatDate(application.tender.deadline)}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
              
              {application.tender.lots.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-secondary-900 mb-3">Лоты тендера</h3>
                  <div className="space-y-4">
                    {application.tender.lots.map((lot) => (
                      <div key={lot.id} className="border border-secondary-200 rounded-lg p-4">
                        <h4 className="font-medium text-secondary-900 mb-2">
                          Лот {lot.lot_number}: {lot.title}
                        </h4>
                        {lot.description && (
                          <p className="text-sm text-secondary-600 mb-2">{lot.description}</p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {lot.initial_price && (
                            <div>
                              <dt className="text-secondary-600">Начальная цена</dt>
                              <dd className="text-secondary-900">{formatPrice(lot.initial_price, lot.currency)}</dd>
                            </div>
                          )}
                          {lot.quantity && (
                            <div>
                              <dt className="text-secondary-600">Количество</dt>
                              <dd className="text-secondary-900">{lot.quantity}</dd>
                            </div>
                          )}
                          {lot.unit_of_measure && (
                            <div>
                              <dt className="text-secondary-600">Единица измерения</dt>
                              <dd className="text-secondary-900">{lot.unit_of_measure}</dd>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Действия */}
        <div className="mt-6 flex justify-end space-x-4">
          <Link href={`/tenders/${application.tender.id}`} className="btn-secondary">
            Просмотр тендера
          </Link>
          <button className="btn-primary">
            Принять заявку
          </button>
        </div>
      </div>
    </div>
  )
}
