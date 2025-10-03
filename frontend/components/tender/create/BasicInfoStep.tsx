'use client'

import { useState } from 'react'
import { 
  FileText,
  DollarSign,
  Calendar,
  MapPin,
  Tag,
  Building2,
  Package,
  X
} from 'lucide-react'

interface BasicInfoStepProps {
  data: {
    title: string
    description: string
    notice_number?: string
    initial_price?: number
    currency: string
    deadline?: string
    okpd_code?: string
    okved_code?: string
    region?: string
    procurement_method: string
  }
  onChange: (data: any) => void
  onNext: () => void
}

export default function BasicInfoStep({ data, onChange, onNext }: BasicInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!data.title) {
      newErrors.title = 'Название тендера обязательно'
    }
    if (!data.description) {
      newErrors.description = 'Описание тендера обязательно'
    }
    if (!data.procurement_method) {
      newErrors.procurement_method = 'Способ закупки обязателен'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">
          Основные сведения
        </h2>
        <p className="text-secondary-600 mb-6">
          Заполните основную информацию о тендере. Поля, отмеченные звездочкой (*), обязательны для заполнения.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Название тендера *
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.title ? 'border-red-300' : 'border-secondary-300'
              }`}
              placeholder="Введите название тендера"
            />
          </div>
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Номер извещения
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              value={data.notice_number || ''}
              onChange={(e) => onChange({ ...data, notice_number: e.target.value })}
              className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Введите номер извещения"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Описание тендера *
          </label>
          <textarea
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.description ? 'border-red-300' : 'border-secondary-300'
            }`}
            placeholder="Введите описание тендера"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Начальная цена
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="number"
              value={data.initial_price || ''}
              onChange={(e) => onChange({ ...data, initial_price: parseFloat(e.target.value) })}
              className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Введите начальную цену"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Валюта
          </label>
          <select
            value={data.currency}
            onChange={(e) => onChange({ ...data, currency: e.target.value })}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="RUB">Российский рубль (RUB)</option>
            <option value="USD">Доллар США (USD)</option>
            <option value="EUR">Евро (EUR)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Срок подачи заявок
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="datetime-local"
              value={data.deadline || ''}
              onChange={(e) => onChange({ ...data, deadline: e.target.value })}
              className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Регион
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              value={data.region || ''}
              onChange={(e) => onChange({ ...data, region: e.target.value })}
              className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Введите регион"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Код ОКПД2
          </label>
          <input
            type="text"
            value={data.okpd_code || ''}
            onChange={(e) => onChange({ ...data, okpd_code: e.target.value })}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Введите код ОКПД2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Код ОКВЭД2
          </label>
          <input
            type="text"
            value={data.okved_code || ''}
            onChange={(e) => onChange({ ...data, okved_code: e.target.value })}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Введите код ОКВЭД2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Способ закупки *
          </label>
          <select
            value={data.procurement_method}
            onChange={(e) => onChange({ ...data, procurement_method: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.procurement_method ? 'border-red-300' : 'border-secondary-300'
            }`}
          >
            <option value="">Выберите способ закупки</option>
            <option value="auction">Аукцион</option>
            <option value="tender">Конкурс</option>
            <option value="request">Запрос предложений</option>
          </select>
          {errors.procurement_method && (
            <p className="mt-1 text-sm text-red-600">{errors.procurement_method}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleNext}
          className="btn-primary"
        >
          Далее
        </button>
      </div>
    </div>
  )
}
