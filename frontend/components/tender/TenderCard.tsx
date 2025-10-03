'use client'

import Link from 'next/link'
import { 
  FileText,
  Package,
  Calendar,
  DollarSign,
  MapPin,
  Building2,
  Clock
} from 'lucide-react'

interface TenderCardProps {
  tender: {
    id: number
    title: string
    description: string
    initial_price?: number
    currency: string
    status: string
    publication_date?: string
    deadline?: string
    region?: string
    lots: Array<{
      id: number
      lot_number: number
      title: string
      initial_price?: number
      currency: string
      products_count: number
    }>
    documents_count: number
    organizers: Array<{
      id: number
      organization_name: string
      inn: string
    }>
  }
}

export default function TenderCard({ tender }: TenderCardProps) {
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

  return (
    <Link
      href={`/tenders/${tender.id}`}
      className="block bg-white rounded-lg shadow-sm border border-secondary-200 hover:border-primary-300 transition-colors"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-secondary-900 mb-2">
              {tender.title}
            </h2>
            <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
              {tender.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {tender.initial_price && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-secondary-400" />
                  <div>
                    <dt className="text-secondary-600">Начальная цена</dt>
                    <dd className="font-medium text-secondary-900">
                      {formatPrice(tender.initial_price, tender.currency)}
                    </dd>
                  </div>
                </div>
              )}

              {tender.publication_date && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-secondary-400" />
                  <div>
                    <dt className="text-secondary-600">Дата публикации</dt>
                    <dd className="font-medium text-secondary-900">
                      {formatDate(tender.publication_date)}
                    </dd>
                  </div>
                </div>
              )}

              {tender.deadline && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-secondary-400" />
                  <div>
                    <dt className="text-secondary-600">Срок подачи</dt>
                    <dd className="font-medium text-secondary-900">
                      {formatDate(tender.deadline)}
                    </dd>
                  </div>
                </div>
              )}

              {tender.region && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-secondary-400" />
                  <div>
                    <dt className="text-secondary-600">Регион</dt>
                    <dd className="font-medium text-secondary-900">
                      {tender.region}
                    </dd>
                  </div>
                </div>
              )}
            </div>

            {/* Организаторы */}
            {tender.organizers.length > 0 && (
              <div className="mt-4 flex items-center space-x-2 text-sm">
                <Building2 className="h-4 w-4 text-secondary-400" />
                <div>
                  <dt className="text-secondary-600">Организатор</dt>
                  <dd className="font-medium text-secondary-900">
                    {tender.organizers[0].organization_name}
                  </dd>
                </div>
              </div>
            )}
          </div>

          <div className="ml-6 flex flex-col items-end">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mb-4 ${getStatusColor(tender.status)}`}>
              {getStatusText(tender.status)}
            </span>
            <div className="flex items-center space-x-4 text-sm text-secondary-600">
              <div className="flex items-center space-x-1">
                <Package className="h-4 w-4" />
                <span>{tender.lots.length} лотов</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>{tender.documents_count} документов</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
