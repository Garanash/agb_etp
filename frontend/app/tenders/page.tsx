'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import TenderFilters from '../../components/tender/TenderFilters'
import TenderCard from '../../components/tender/TenderCard'
import { ChevronLeft, ChevronRight, XCircle } from 'lucide-react'

interface Tender {
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

interface PaginatedResponse {
  items: Tender[]
  total: number
  page: number
  size: number
  pages: number
}

export default function TendersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tenders, setTenders] = useState<PaginatedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    region: searchParams.get('region') || '',
    okpd_code: searchParams.get('okpd_code') || '',
    okved_code: searchParams.get('okved_code') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    currency: searchParams.get('currency') || '',
    start_date: searchParams.get('start_date') || '',
    end_date: searchParams.get('end_date') || '',
    procurement_method: searchParams.get('procurement_method') || '',
    organizer_inn: searchParams.get('organizer_inn') || '',
    sort: searchParams.get('sort') || 'by_published_desc',
    page: parseInt(searchParams.get('page') || '1'),
    size: parseInt(searchParams.get('size') || '20')
  })

  useEffect(() => {
    fetchTenders()
  }, [filters])

  const fetchTenders = async () => {
    try {
      // Формируем строку запроса
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.set(key, value.toString())
        }
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tenders/?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setTenders(data)
      } else {
        setError('Ошибка загрузки тендеров')
      }
    } catch (err) {
      setError('Ошибка загрузки тендеров')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Сбрасываем страницу при изменении фильтров
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }))
  }

  const handleSort = (sortField: string) => {
    setFilters(prev => ({
      ...prev,
      sort: sortField,
      page: 1
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      region: '',
      okpd_code: '',
      okved_code: '',
      min_price: '',
      max_price: '',
      currency: '',
      start_date: '',
      end_date: '',
      procurement_method: '',
      organizer_inn: '',
      sort: 'by_published_desc',
      page: 1,
      size: 20
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-secondary-600">Загрузка тендеров...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">Ошибка</h1>
            <p className="text-secondary-600 mb-4">{error}</p>
            <button
              onClick={() => fetchTenders()}
              className="btn-primary"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary-900">
            Тендеры
          </h1>
          <p className="mt-2 text-secondary-600">
            Найдите подходящие тендеры и примите участие в закупках
          </p>
        </div>

        {/* Фильтры */}
        <TenderFilters
          filters={filters}
          onChange={handleFilterChange}
          onClear={clearFilters}
        />

        {/* Результаты поиска */}
        {tenders && tenders.items.length > 0 ? (
          <div className="space-y-6">
            {/* Сортировка и статистика */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-secondary-600">
                Найдено {tenders.total} тендеров
              </p>
              <div className="flex items-center space-x-4">
                <label className="text-sm text-secondary-700">Сортировка:</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleSort(e.target.value)}
                  className="text-sm border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 px-3 py-1.5"
                >
                  <option value="by_published_desc">По дате публикации (сначала новые)</option>
                  <option value="by_published_asc">По дате публикации (сначала старые)</option>
                  <option value="by_deadline_asc">По сроку подачи (сначала ближайшие)</option>
                  <option value="by_deadline_desc">По сроку подачи (сначала дальние)</option>
                  <option value="by_price_asc">По цене (по возрастанию)</option>
                  <option value="by_price_desc">По цене (по убыванию)</option>
                </select>
              </div>
            </div>

            {/* Список тендеров */}
            <div className="space-y-4">
              {tenders.items?.map((tender) => (
                <TenderCard key={tender.id} tender={tender} />
              ))}
            </div>

            {/* Пагинация */}
            {tenders.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className={`btn-secondary ${
                      filters.page === 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-secondary-600">
                    Страница {filters.page} из {tenders.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page === tenders.pages}
                    className={`btn-secondary ${
                      filters.page === tenders.pages ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <select
                  value={filters.size}
                  onChange={(e) => handleFilterChange('size', e.target.value)}
                  className="text-sm border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 px-3 py-1.5"
                >
                  <option value="10">10 на странице</option>
                  <option value="20">20 на странице</option>
                  <option value="50">50 на странице</option>
                  <option value="100">100 на странице</option>
                </select>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-secondary-600">
              {filters.search || Object.values(filters).some(v => v !== '') ? 'По вашему запросу ничего не найдено' : 'Нет доступных тендеров'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}