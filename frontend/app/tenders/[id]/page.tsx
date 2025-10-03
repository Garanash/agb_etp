'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TenderInfo from '@/components/tender/TenderInfo'
import TenderLots from '@/components/tender/TenderLots'
import TenderDocuments from '@/components/tender/TenderDocuments'
import { 
  FileText,
  Building2,
  Package,
  XCircle
} from 'lucide-react'

interface Tender {
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

export default function TenderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tender, setTender] = useState<Tender | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('main')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchCurrentUser()
    fetchTender()
  }, [params.id])

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

  const fetchTender = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tenders/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTender(data)
      } else {
        setError('Тендер не найден')
      }
    } catch (err) {
      setError('Ошибка загрузки тендера')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-secondary-600">Загрузка тендера...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !tender) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">Ошибка</h1>
            <p className="text-secondary-600 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="btn-primary"
            >
              Вернуться назад
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                onClick={() => setActiveTab('lots')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'lots'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                Лоты
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'docs'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                Документация
              </button>
            </nav>
          </div>
        </div>

        {/* Содержимое разделов */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          {activeTab === 'main' && (
            <TenderInfo
              tender={tender}
              currentUser={currentUser}
              onTabChange={setActiveTab}
            />
          )}

          {activeTab === 'lots' && (
            <TenderLots lots={tender.lots} />
          )}

          {activeTab === 'docs' && (
            <TenderDocuments documents={tender.documents} />
          )}
        </div>

        {/* Действия */}
        <div className="mt-6 flex justify-end space-x-4">
          {currentUser?.role === 'supplier' && tender.status === 'published' && (
            <a
              href={`/tenders/${tender.id}/apply`}
              className="btn-primary"
            >
              Подать заявку
            </a>
          )}
        </div>
      </div>
    </div>
  )
}