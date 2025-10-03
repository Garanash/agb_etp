'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, DollarSign, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

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

export default function TenderPreview() {
  const [tenders, setTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTenders()
  }, [])

  const fetchTenders = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tenders/?size=6`)
      if (response.ok) {
        const data = await response.json()
        setTenders(data.items || [])
      }
    } catch (error) {
      console.error('Ошибка загрузки тендеров:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return 'Цена не указана'
    return new Intl.NumberFormat('ru-RU').format(price) + ' ' + currency
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Дата не указана'
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru })
  }

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            Актуальные тендеры
          </h2>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Ознакомьтесь с текущими закупочными процедурами и найдите подходящие возможности
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)]?.map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="h-4 bg-secondary-200 rounded mb-4"></div>
                <div className="h-3 bg-secondary-200 rounded mb-2"></div>
                <div className="h-3 bg-secondary-200 rounded mb-4"></div>
                <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tenders?.map((tender) => (
              <div key={tender.id} className="card hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-lg font-semibold text-secondary-900 mb-2 line-clamp-2">
                  {tender.title}
                </h3>
                <p className="text-secondary-600 mb-4 line-clamp-3">
                  {tender.description}
                </p>
                
                <div className="space-y-2 mb-4">
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

                <Link 
                  href={`/tenders/${tender.id}`}
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  Подробнее
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link 
            href="/tenders" 
            className="btn-primary inline-flex items-center space-x-2"
          >
            <span>Посмотреть все тендеры</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
