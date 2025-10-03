'use client'

import { useState } from 'react'
import { 
  Search,
  Filter,
  Calendar,
  DollarSign,
  MapPin,
  Tag,
  Building2,
  Package,
  X
} from 'lucide-react'

interface TenderFiltersProps {
  filters: {
    search: string
    status: string
    region: string
    okpd_code: string
    okved_code: string
    min_price: string
    max_price: string
    currency: string
    start_date: string
    end_date: string
    procurement_method: string
    organizer_inn: string
  }
  onChange: (field: string, value: string) => void
  onClear: () => void
}

export default function TenderFilters({ filters, onChange, onClear }: TenderFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-6">
      {/* Поиск и кнопка фильтров */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 mr-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onChange('search', e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Поиск по названию, описанию или товарам..."
            />
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>{showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}</span>
        </button>
      </div>

      {/* Расширенные фильтры */}
      {showFilters && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Статус */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Статус
              </label>
              <select
                value={filters.status}
                onChange={(e) => onChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Все статусы</option>
                <option value="published">Опубликован</option>
                <option value="in_progress">В процессе</option>
                <option value="completed">Завершен</option>
                <option value="cancelled">Отменен</option>
              </select>
            </div>

            {/* Регион */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Регион
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="text"
                  value={filters.region}
                  onChange={(e) => onChange('region', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Введите регион"
                />
              </div>
            </div>

            {/* Способ закупки */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Способ закупки
              </label>
              <select
                value={filters.procurement_method}
                onChange={(e) => onChange('procurement_method', e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Все способы</option>
                <option value="auction">Аукцион</option>
                <option value="tender">Конкурс</option>
                <option value="request">Запрос предложений</option>
              </select>
            </div>

            {/* Цена от */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Цена от
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="number"
                  value={filters.min_price}
                  onChange={(e) => onChange('min_price', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Минимальная цена"
                />
              </div>
            </div>

            {/* Цена до */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Цена до
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="number"
                  value={filters.max_price}
                  onChange={(e) => onChange('max_price', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Максимальная цена"
                />
              </div>
            </div>

            {/* Валюта */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Валюта
              </label>
              <select
                value={filters.currency}
                onChange={(e) => onChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Все валюты</option>
                <option value="RUB">Российский рубль (RUB)</option>
                <option value="USD">Доллар США (USD)</option>
                <option value="EUR">Евро (EUR)</option>
              </select>
            </div>

            {/* Дата публикации от */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Дата публикации от
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => onChange('start_date', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Дата публикации до */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Дата публикации до
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => onChange('end_date', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Код ОКПД2 */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Код ОКПД2
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="text"
                  value={filters.okpd_code}
                  onChange={(e) => onChange('okpd_code', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Введите код ОКПД2"
                />
              </div>
            </div>

            {/* Код ОКВЭД2 */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Код ОКВЭД2
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="text"
                  value={filters.okved_code}
                  onChange={(e) => onChange('okved_code', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Введите код ОКВЭД2"
                />
              </div>
            </div>

            {/* ИНН организатора */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                ИНН организатора
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="text"
                  value={filters.organizer_inn}
                  onChange={(e) => onChange('organizer_inn', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Введите ИНН организатора"
                />
              </div>
            </div>
          </div>

          {/* Кнопка сброса фильтров */}
          <div className="flex justify-end">
            <button
              onClick={onClear}
              className="btn-secondary flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Сбросить фильтры</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
