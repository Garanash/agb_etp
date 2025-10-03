'use client'

import { useState } from 'react'
import { 
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Plus,
  Trash2,
  ArrowLeft
} from 'lucide-react'

interface Organizer {
  id?: number
  organization_name: string
  legal_address?: string
  postal_address?: string
  email?: string
  phone?: string
  contact_person?: string
  inn?: string
  kpp?: string
  ogrn?: string
}

interface OrganizersStepProps {
  data: {
    organizers: Organizer[]
  }
  onChange: (data: any) => void
  onNext: () => void
  onBack: () => void
}

export default function OrganizersStep({ data, onChange, onNext, onBack }: OrganizersStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!data.organizers || !data.organizers.length) {
      newErrors.organizers = 'Добавьте хотя бы одного организатора'
    }

    data.organizers?.forEach((org, index) => {
      if (!org.organization_name) {
        newErrors[`organizer_${index}_name`] = 'Название организации обязательно'
      }
      if (!org.inn) {
        newErrors[`organizer_${index}_inn`] = 'ИНН обязателен'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      onNext()
    }
  }

  const addOrganizer = () => {
    onChange({
      ...data,
      organizers: [
        ...data.organizers,
        {
          organization_name: '',
          legal_address: '',
          postal_address: '',
          email: '',
          phone: '',
          contact_person: '',
          inn: '',
          kpp: '',
          ogrn: ''
        }
      ]
    })
  }

  const removeOrganizer = (index: number) => {
    const newOrganizers = [...(data.organizers || [])]
    newOrganizers.splice(index, 1)
    onChange({ ...data, organizers: newOrganizers })
  }

  const updateOrganizer = (index: number, field: keyof Organizer, value: string) => {
    const newOrganizers = [...(data.organizers || [])]
    newOrganizers[index] = { ...newOrganizers[index], [field]: value }
    onChange({ ...data, organizers: newOrganizers })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">
          Организаторы
        </h2>
        <p className="text-secondary-600 mb-6">
          Добавьте информацию об организаторах тендера. Необходимо добавить хотя бы одного организатора.
        </p>
      </div>

      {errors.organizers && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{errors.organizers}</p>
        </div>
      )}

      <div className="space-y-6">
        {data.organizers?.map((organizer, index) => (
          <div 
            key={index}
            className="bg-white border border-secondary-200 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-secondary-900">
                Организатор {index + 1}
              </h3>
              {index > 0 && (
                <button
                  onClick={() => removeOrganizer(index)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Название организации *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <input
                    type="text"
                    value={organizer.organization_name}
                    onChange={(e) => updateOrganizer(index, 'organization_name', e.target.value)}
                    className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors[`organizer_${index}_name`] ? 'border-red-300' : 'border-secondary-300'
                    }`}
                    placeholder="Введите название организации"
                  />
                </div>
                {errors[`organizer_${index}_name`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`organizer_${index}_name`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  ИНН *
                </label>
                <input
                  type="text"
                  value={organizer.inn}
                  onChange={(e) => updateOrganizer(index, 'inn', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors[`organizer_${index}_inn`] ? 'border-red-300' : 'border-secondary-300'
                  }`}
                  placeholder="Введите ИНН"
                />
                {errors[`organizer_${index}_inn`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`organizer_${index}_inn`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  КПП
                </label>
                <input
                  type="text"
                  value={organizer.kpp}
                  onChange={(e) => updateOrganizer(index, 'kpp', e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Введите КПП"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  ОГРН
                </label>
                <input
                  type="text"
                  value={organizer.ogrn}
                  onChange={(e) => updateOrganizer(index, 'ogrn', e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Введите ОГРН"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Юридический адрес
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <input
                    type="text"
                    value={organizer.legal_address}
                    onChange={(e) => updateOrganizer(index, 'legal_address', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Введите юридический адрес"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Почтовый адрес
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <input
                    type="text"
                    value={organizer.postal_address}
                    onChange={(e) => updateOrganizer(index, 'postal_address', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Введите почтовый адрес"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Контактное лицо
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <input
                    type="text"
                    value={organizer.contact_person}
                    onChange={(e) => updateOrganizer(index, 'contact_person', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Введите ФИО контактного лица"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Телефон
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <input
                    type="tel"
                    value={organizer.phone}
                    onChange={(e) => updateOrganizer(index, 'phone', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Введите контактный телефон"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <input
                    type="email"
                    value={organizer.email}
                    onChange={(e) => updateOrganizer(index, 'email', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Введите email"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <button
          onClick={addOrganizer}
          className="btn-secondary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Добавить организатора</span>
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
