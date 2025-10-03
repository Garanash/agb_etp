'use client'

import { 
  FileText,
  Calendar,
  DollarSign,
  MapPin,
  Tag,
  Building2,
  Phone,
  Mail,
  User,
  Package,
  Clock,
  CreditCard,
  Shield,
  Edit,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface TenderInfoProps {
  tender: {
    id: number
    title: string
    description: string
    notice_number?: string
    initial_price?: number
    currency: string
    status: string
    publication_date?: string
    deadline?: string
    okpd_code?: string
    okved_code?: string
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
    documents: Array<{
      id: number
      title: string
      file_path: string
      file_size?: number
      file_type?: string
      uploaded_at: string
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
  }
  currentUser: any
  onTabChange: (tab: string) => void
}

export default function TenderInfo({ tender, currentUser, onTabChange }: TenderInfoProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
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

  const canEditTender = () => {
    if (!currentUser || !tender) return false
    return (
      currentUser.role === 'admin' ||
      (currentUser.role === 'contract_manager' && tender.created_by === currentUser.id)
    )
  }

  return (
    <div>
      {/* Навигация */}
      <div className="mb-6">
        <Link 
          href="/tenders" 
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Назад к тендерам</span>
        </Link>
      </div>

      {/* Заголовок тендера */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">
              {tender.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-secondary-600">
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>№ {tender.notice_number || tender.id}</span>
              </div>
              {tender.publication_date && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Опубликован: {formatDate(tender.publication_date)}</span>
                </div>
              )}
              {tender.deadline && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>До: {formatDate(tender.deadline)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(tender.status)}`}>
              {getStatusText(tender.status)}
            </span>
            {canEditTender() && (
              <Link 
                href={`/dashboard/tenders/${tender.id}/edit`}
                className="ml-4 btn-secondary flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Редактировать</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Основная информация */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">
          Основные сведения
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-secondary-900 mb-3">Общая информация</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-secondary-600">Способ закупки</dt>
                <dd className="text-sm text-secondary-900">{tender.procurement_method}</dd>
              </div>
              {tender.initial_price && (
                <div>
                  <dt className="text-sm text-secondary-600">Начальная цена</dt>
                  <dd className="text-sm text-secondary-900 font-semibold">
                    {formatPrice(tender.initial_price, tender.currency)}
                  </dd>
                </div>
              )}
              {tender.region && (
                <div>
                  <dt className="text-sm text-secondary-600">Регион</dt>
                  <dd className="text-sm text-secondary-900">{tender.region}</dd>
                </div>
              )}
              {tender.okpd_code && (
                <div>
                  <dt className="text-sm text-secondary-600">Код ОКПД2</dt>
                  <dd className="text-sm text-secondary-900 font-mono">{tender.okpd_code}</dd>
                </div>
              )}
              {tender.okved_code && (
                <div>
                  <dt className="text-sm text-secondary-600">Код ОКВЭД2</dt>
                  <dd className="text-sm text-secondary-900 font-mono">{tender.okved_code}</dd>
                </div>
              )}
            </dl>
          </div>
          
          <div>
            <h3 className="font-medium text-secondary-900 mb-3">Сроки</h3>
            <dl className="space-y-3">
              {tender.publication_date && (
                <div>
                  <dt className="text-sm text-secondary-600">Дата публикации</dt>
                  <dd className="text-sm text-secondary-900">{formatDate(tender.publication_date)}</dd>
                </div>
              )}
              {tender.deadline && (
                <div>
                  <dt className="text-sm text-secondary-600">Срок подачи заявок</dt>
                  <dd className="text-sm text-secondary-900">{formatDate(tender.deadline)}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-medium text-secondary-900 mb-3">Организатор</h3>
          {tender.organizers?.map((org) => (
            <div key={org.id} className="bg-secondary-50 rounded-lg p-4">
              <h4 className="font-medium text-secondary-900 mb-2">{org.organization_name}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {org.legal_address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-secondary-400 mt-1" />
                    <div>
                      <dt className="text-secondary-600">Юридический адрес</dt>
                      <dd className="text-secondary-900">{org.legal_address}</dd>
                    </div>
                  </div>
                )}
                {org.postal_address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-secondary-400 mt-1" />
                    <div>
                      <dt className="text-secondary-600">Почтовый адрес</dt>
                      <dd className="text-secondary-900">{org.postal_address}</dd>
                    </div>
                  </div>
                )}
                {org.contact_person && (
                  <div className="flex items-start space-x-2">
                    <User className="h-4 w-4 text-secondary-400 mt-1" />
                    <div>
                      <dt className="text-secondary-600">Контактное лицо</dt>
                      <dd className="text-secondary-900">{org.contact_person}</dd>
                    </div>
                  </div>
                )}
                {org.phone && (
                  <div className="flex items-start space-x-2">
                    <Phone className="h-4 w-4 text-secondary-400 mt-1" />
                    <div>
                      <dt className="text-secondary-600">Телефон</dt>
                      <dd className="text-secondary-900">{org.phone}</dd>
                    </div>
                  </div>
                )}
                {org.email && (
                  <div className="flex items-start space-x-2">
                    <Mail className="h-4 w-4 text-secondary-400 mt-1" />
                    <div>
                      <dt className="text-secondary-600">Email</dt>
                      <dd className="text-secondary-900">{org.email}</dd>
                    </div>
                  </div>
                )}
                {org.inn && (
                  <div className="flex items-start space-x-2">
                    <Building2 className="h-4 w-4 text-secondary-400 mt-1" />
                    <div>
                      <dt className="text-secondary-600">ИНН</dt>
                      <dd className="text-secondary-900 font-mono">{org.inn}</dd>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопки навигации */}
      <div className="flex space-x-4">
        <button
          onClick={() => onTabChange('lots')}
          className="btn-primary flex items-center space-x-2"
        >
          <Package className="h-4 w-4" />
          <span>Перейти к лотам</span>
        </button>
        <button
          onClick={() => onTabChange('docs')}
          className="btn-secondary flex items-center space-x-2"
        >
          <FileText className="h-4 w-4" />
          <span>Документация</span>
        </button>
      </div>
    </div>
  )
}
