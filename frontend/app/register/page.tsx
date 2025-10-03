'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Building2, User, Mail, Phone, MapPin, CreditCard, FileText } from 'lucide-react'

interface RegistrationForm {
  email: string
  password: string
  confirmPassword: string
  full_name: string
  phone: string
  legal_form: string
  company_name: string
  inn: string
  kpp: string
  ogrn: string
  legal_address: string
  actual_address: string
  bank_name: string
  bank_account: string
  correspondent_account: string
  bic: string
  contact_person: string
  contact_phone: string
  contact_email: string
}

const legalForms = [
  { value: 'ip', label: 'Индивидуальный предприниматель (ИП)' },
  { value: 'ooo', label: 'Общество с ограниченной ответственностью (ООО)' },
  { value: 'oao', label: 'Открытое акционерное общество (ОАО)' },
  { value: 'zao', label: 'Закрытое акционерное общество (ЗАО)' },
  { value: 'pao', label: 'Публичное акционерное общество (ПАО)' },
  { value: 'other', label: 'Другое' }
]

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegistrationForm>()
  
  const password = watch('password')

  const onSubmit = async (data: RegistrationForm) => {
    setIsSubmitting(true)
    setSubmitMessage('')
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register-supplier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setSubmitMessage('Регистрация успешно завершена! Проверьте email для подтверждения.')
      } else {
        const errorData = await response.json()
        setSubmitMessage(`Ошибка: ${errorData.detail}`)
      }
    } catch (error) {
      setSubmitMessage('Произошла ошибка при регистрации. Попробуйте позже.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Регистрация поставщика
          </h1>
          <p className="text-secondary-600">
            Заполните форму для регистрации в качестве поставщика на нашей платформе
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Личная информация */}
            <div>
              <h2 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-primary-600" />
                Личная информация
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    {...register('email', { required: 'Email обязателен' })}
                    className="input-field"
                    placeholder="example@company.ru"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    ФИО *
                  </label>
                  <input
                    type="text"
                    {...register('full_name', { required: 'ФИО обязательно' })}
                    className="input-field"
                    placeholder="Иванов Иван Иванович"
                  />
                  {errors.full_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Пароль *
                  </label>
                  <input
                    type="password"
                    {...register('password', { 
                      required: 'Пароль обязателен',
                      minLength: { value: 6, message: 'Пароль должен содержать минимум 6 символов' }
                    })}
                    className="input-field"
                    placeholder="Минимум 6 символов"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Подтвердите пароль *
                  </label>
                  <input
                    type="password"
                    {...register('confirmPassword', { 
                      required: 'Подтверждение пароля обязательно',
                      validate: value => value === password || 'Пароли не совпадают'
                    })}
                    className="input-field"
                    placeholder="Повторите пароль"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="input-field"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>
            </div>

            {/* Информация о компании */}
            <div>
              <h2 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-primary-600" />
                Информация о компании
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Правовая форма *
                  </label>
                  <select
                    {...register('legal_form', { required: 'Правовая форма обязательна' })}
                    className="input-field"
                  >
                    <option value="">Выберите правовую форму</option>
                    {legalForms.map(form => (
                      <option key={form.value} value={form.value}>
                        {form.label}
                      </option>
                    ))}
                  </select>
                  {errors.legal_form && (
                    <p className="text-red-500 text-sm mt-1">{errors.legal_form.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Название компании *
                  </label>
                  <input
                    type="text"
                    {...register('company_name', { required: 'Название компании обязательно' })}
                    className="input-field"
                    placeholder="ООО Пример"
                  />
                  {errors.company_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.company_name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    ИНН *
                  </label>
                  <input
                    type="text"
                    {...register('inn', { 
                      required: 'ИНН обязателен',
                      pattern: {
                        value: /^\d{10}$|^\d{12}$/,
                        message: 'ИНН должен содержать 10 или 12 цифр'
                      }
                    })}
                    className="input-field"
                    placeholder="1234567890"
                  />
                  {errors.inn && (
                    <p className="text-red-500 text-sm mt-1">{errors.inn.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    КПП
                  </label>
                  <input
                    type="text"
                    {...register('kpp')}
                    className="input-field"
                    placeholder="123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    ОГРН
                  </label>
                  <input
                    type="text"
                    {...register('ogrn')}
                    className="input-field"
                    placeholder="1234567890123"
                  />
                </div>
              </div>
            </div>

            {/* Адрес */}
            <div>
              <h2 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                Адрес
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Юридический адрес
                  </label>
                  <textarea
                    {...register('legal_address')}
                    className="input-field"
                    rows={3}
                    placeholder="г. Москва, ул. Примерная, д. 1, оф. 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Фактический адрес
                  </label>
                  <textarea
                    {...register('actual_address')}
                    className="input-field"
                    rows={3}
                    placeholder="г. Москва, ул. Примерная, д. 1, оф. 1"
                  />
                </div>
              </div>
            </div>

            {/* Банковские реквизиты */}
            <div>
              <h2 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-primary-600" />
                Банковские реквизиты
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Название банка
                  </label>
                  <input
                    type="text"
                    {...register('bank_name')}
                    className="input-field"
                    placeholder="ПАО Сбербанк"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Расчетный счет
                  </label>
                  <input
                    type="text"
                    {...register('bank_account')}
                    className="input-field"
                    placeholder="40702810123456789012"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Корреспондентский счет
                  </label>
                  <input
                    type="text"
                    {...register('correspondent_account')}
                    className="input-field"
                    placeholder="30101810100000000593"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    БИК
                  </label>
                  <input
                    type="text"
                    {...register('bic')}
                    className="input-field"
                    placeholder="044525593"
                  />
                </div>
              </div>
            </div>

            {/* Контактное лицо */}
            <div>
              <h2 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary-600" />
                Контактное лицо
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    ФИО контактного лица
                  </label>
                  <input
                    type="text"
                    {...register('contact_person')}
                    className="input-field"
                    placeholder="Петров Петр Петрович"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Телефон контактного лица
                  </label>
                  <input
                    type="tel"
                    {...register('contact_phone')}
                    className="input-field"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Email контактного лица
                  </label>
                  <input
                    type="email"
                    {...register('contact_email')}
                    className="input-field"
                    placeholder="contact@company.ru"
                  />
                </div>
              </div>
            </div>

            {submitMessage && (
              <div className={`p-4 rounded-lg ${
                submitMessage.includes('успешно') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {submitMessage}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
