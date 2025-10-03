'use client'

import { 
  DollarSign,
  MapPin,
  Tag,
  CreditCard,
  Package,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useState } from 'react'

interface TenderLotsProps {
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
}

export default function TenderLots({ lots }: TenderLotsProps) {
  const [expandedLots, setExpandedLots] = useState<number[]>([])

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  const toggleLot = (lotId: number) => {
    setExpandedLots(prev => 
      prev.includes(lotId)
        ? prev.filter(id => id !== lotId)
        : [...prev, lotId]
    )
  }

  return (
    <div className="space-y-6">
      {lots.map((lot) => (
        <div
          key={lot.id}
          className="bg-white border border-secondary-200 rounded-lg"
        >
          {/* Заголовок лота */}
          <div
            className="p-4 border-b border-secondary-200 cursor-pointer hover:bg-secondary-50 transition-colors"
            onClick={() => toggleLot(lot.id)}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-secondary-900">
                Лот {lot.lot_number}: {lot.title}
              </h3>
              {expandedLots.includes(lot.id) ? (
                <ChevronUp className="h-5 w-5 text-secondary-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-secondary-400" />
              )}
            </div>
          </div>

          {/* Содержимое лота */}
          {expandedLots.includes(lot.id) && (
            <div className="p-4">
              {lot.description && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-secondary-900 mb-2">Описание</h4>
                  <p className="text-sm text-secondary-600">{lot.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {lot.initial_price && (
                  <div>
                    <dt className="text-sm text-secondary-600">Начальная цена</dt>
                    <dd className="text-sm font-medium text-secondary-900">
                      {formatPrice(lot.initial_price, lot.currency)}
                    </dd>
                  </div>
                )}
                {lot.security_amount && (
                  <div>
                    <dt className="text-sm text-secondary-600">Обеспечение заявки</dt>
                    <dd className="text-sm font-medium text-secondary-900">
                      {formatPrice(lot.security_amount, lot.currency)}
                    </dd>
                  </div>
                )}
                {lot.delivery_place && (
                  <div>
                    <dt className="text-sm text-secondary-600">Место поставки</dt>
                    <dd className="text-sm text-secondary-900">{lot.delivery_place}</dd>
                  </div>
                )}
              </div>

              {/* Коды классификации */}
              {(lot.okpd_code || lot.okved_code) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {lot.okpd_code && (
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-secondary-400" />
                      <div>
                        <dt className="text-sm text-secondary-600">Код ОКПД2</dt>
                        <dd className="text-sm font-mono text-secondary-900">{lot.okpd_code}</dd>
                      </div>
                    </div>
                  )}
                  {lot.okved_code && (
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-secondary-400" />
                      <div>
                        <dt className="text-sm text-secondary-600">Код ОКВЭД2</dt>
                        <dd className="text-sm font-mono text-secondary-900">{lot.okved_code}</dd>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Условия оплаты */}
              {lot.payment_terms && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-secondary-400" />
                    <dt className="text-sm text-secondary-600">Условия оплаты</dt>
                  </div>
                  <dd className="mt-1 text-sm text-secondary-900">{lot.payment_terms}</dd>
                </div>
              )}

              {/* Товары/услуги */}
              {lot.products.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-secondary-900 mb-2">Товары/услуги</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-secondary-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            №
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Наименование
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Количество
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Ед. изм.
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-secondary-200">
                        {lot.products.map((product) => (
                          <tr key={product.id}>
                            <td className="px-4 py-2 text-sm text-secondary-900">
                              {product.position_number}
                            </td>
                            <td className="px-4 py-2 text-sm text-secondary-900">
                              {product.name}
                            </td>
                            <td className="px-4 py-2 text-sm text-secondary-900">
                              {product.quantity || 'Не указано'}
                            </td>
                            <td className="px-4 py-2 text-sm text-secondary-900">
                              {product.unit_of_measure || 'Не указано'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
