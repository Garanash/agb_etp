'use client'

import { useState } from 'react'
import { 
  Package,
  DollarSign,
  MapPin,
  Tag,
  Plus,
  Trash2,
  ArrowLeft,
  CreditCard
} from 'lucide-react'

interface Product {
  id?: number
  position_number: number
  name: string
  quantity?: string
  unit_of_measure?: string
}

interface Lot {
  id?: number
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
  products: Product[]
}

interface LotsStepProps {
  data: {
    lots: Lot[]
  }
  onChange: (data: any) => void
  onNext: () => void
  onBack: () => void
}

export default function LotsStep({ data, onChange, onNext, onBack }: LotsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!data.lots.length) {
      newErrors.lots = 'Добавьте хотя бы один лот'
    }

    data.lots.forEach((lot, index) => {
      if (!lot.title) {
        newErrors[`lot_${index}_title`] = 'Название лота обязательно'
      }
      if (!lot.products.length) {
        newErrors[`lot_${index}_products`] = 'Добавьте хотя бы один товар/услугу'
      }
      lot.products.forEach((product, productIndex) => {
        if (!product.name) {
          newErrors[`lot_${index}_product_${productIndex}_name`] = 'Название товара/услуги обязательно'
        }
      })
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      onNext()
    }
  }

  const addLot = () => {
    onChange({
      ...data,
      lots: [
        ...data.lots,
        {
          lot_number: data.lots.length + 1,
          title: '',
          description: '',
          initial_price: undefined,
          currency: 'RUB',
          security_amount: undefined,
          delivery_place: '',
          payment_terms: '',
          quantity: '',
          unit_of_measure: '',
          okpd_code: '',
          okved_code: '',
          products: []
        }
      ]
    })
  }

  const removeLot = (index: number) => {
    const newLots = [...data.lots]
    newLots.splice(index, 1)
    // Обновляем номера лотов
    newLots.forEach((lot, i) => {
      lot.lot_number = i + 1
    })
    onChange({ ...data, lots: newLots })
  }

  const updateLot = (index: number, field: keyof Lot, value: any) => {
    const newLots = [...data.lots]
    newLots[index] = { ...newLots[index], [field]: value }
    onChange({ ...data, lots: newLots })
  }

  const addProduct = (lotIndex: number) => {
    const newLots = [...data.lots]
    newLots[lotIndex].products.push({
      position_number: newLots[lotIndex].products.length + 1,
      name: '',
      quantity: '',
      unit_of_measure: ''
    })
    onChange({ ...data, lots: newLots })
  }

  const removeProduct = (lotIndex: number, productIndex: number) => {
    const newLots = [...data.lots]
    newLots[lotIndex].products.splice(productIndex, 1)
    // Обновляем номера позиций
    newLots[lotIndex].products.forEach((product, i) => {
      product.position_number = i + 1
    })
    onChange({ ...data, lots: newLots })
  }

  const updateProduct = (lotIndex: number, productIndex: number, field: keyof Product, value: string) => {
    const newLots = [...data.lots]
    newLots[lotIndex].products[productIndex] = {
      ...newLots[lotIndex].products[productIndex],
      [field]: value
    }
    onChange({ ...data, lots: newLots })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">
          Лоты
        </h2>
        <p className="text-secondary-600 mb-6">
          Добавьте информацию о лотах тендера. Необходимо добавить хотя бы один лот.
        </p>
      </div>

      {errors.lots && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{errors.lots}</p>
        </div>
      )}

      <div className="space-y-6">
        {data.lots.map((lot, lotIndex) => (
          <div 
            key={lotIndex}
            className="bg-white border border-secondary-200 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-secondary-900">
                Лот {lot.lot_number}
              </h3>
              {lotIndex > 0 && (
                <button
                  onClick={() => removeLot(lotIndex)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Название лота *
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <input
                    type="text"
                    value={lot.title}
                    onChange={(e) => updateLot(lotIndex, 'title', e.target.value)}
                    className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors[`lot_${lotIndex}_title`] ? 'border-red-300' : 'border-secondary-300'
                    }`}
                    placeholder="Введите название лота"
                  />
                </div>
                {errors[`lot_${lotIndex}_title`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`lot_${lotIndex}_title`]}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Описание лота
                </label>
                <textarea
                  value={lot.description}
                  onChange={(e) => updateLot(lotIndex, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Введите описание лота"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Начальная цена
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <input
                    type="number"
                    value={lot.initial_price || ''}
                    onChange={(e) => updateLot(lotIndex, 'initial_price', parseFloat(e.target.value))}
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
                  value={lot.currency}
                  onChange={(e) => updateLot(lotIndex, 'currency', e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="RUB">Российский рубль (RUB)</option>
                  <option value="USD">Доллар США (USD)</option>
                  <option value="EUR">Евро (EUR)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Обеспечение заявки
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <input
                    type="number"
                    value={lot.security_amount || ''}
                    onChange={(e) => updateLot(lotIndex, 'security_amount', parseFloat(e.target.value))}
                    className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Введите сумму обеспечения"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Место поставки
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <input
                    type="text"
                    value={lot.delivery_place || ''}
                    onChange={(e) => updateLot(lotIndex, 'delivery_place', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Введите место поставки"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Условия оплаты
                </label>
                <textarea
                  value={lot.payment_terms || ''}
                  onChange={(e) => updateLot(lotIndex, 'payment_terms', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Введите условия оплаты"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Код ОКПД2
                </label>
                <input
                  type="text"
                  value={lot.okpd_code || ''}
                  onChange={(e) => updateLot(lotIndex, 'okpd_code', e.target.value)}
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
                  value={lot.okved_code || ''}
                  onChange={(e) => updateLot(lotIndex, 'okved_code', e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Введите код ОКВЭД2"
                />
              </div>

              {/* Товары/услуги */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-secondary-900">
                    Товары/услуги
                  </h4>
                  <button
                    onClick={() => addProduct(lotIndex)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Добавить товар/услугу</span>
                  </button>
                </div>

                {errors[`lot_${lotIndex}_products`] && (
                  <div className="mb-4">
                    <p className="text-sm text-red-600">{errors[`lot_${lotIndex}_products`]}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {lot.products.map((product, productIndex) => (
                    <div 
                      key={productIndex}
                      className="bg-secondary-50 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium text-secondary-900">
                          Позиция {product.position_number}
                        </h5>
                        {productIndex > 0 && (
                          <button
                            onClick={() => removeProduct(lotIndex, productIndex)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-secondary-700 mb-1">
                            Наименование *
                          </label>
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => updateProduct(lotIndex, productIndex, 'name', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                              errors[`lot_${lotIndex}_product_${productIndex}_name`] ? 'border-red-300' : 'border-secondary-300'
                            }`}
                            placeholder="Введите наименование товара/услуги"
                          />
                          {errors[`lot_${lotIndex}_product_${productIndex}_name`] && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors[`lot_${lotIndex}_product_${productIndex}_name`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">
                            Количество
                          </label>
                          <input
                            type="text"
                            value={product.quantity || ''}
                            onChange={(e) => updateProduct(lotIndex, productIndex, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Введите количество"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">
                            Единица измерения
                          </label>
                          <input
                            type="text"
                            value={product.unit_of_measure || ''}
                            onChange={(e) => updateProduct(lotIndex, productIndex, 'unit_of_measure', e.target.value)}
                            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Введите единицу измерения"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <button
          onClick={addLot}
          className="btn-secondary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Добавить лот</span>
        </button>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Назад</span>
        </button>
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
