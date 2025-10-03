'use client'

import { 
  HelpCircle,
  BookOpen,
  MessageCircle,
  Phone,
  Mail
} from 'lucide-react'

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Справка и поддержка
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Найдем ответы на ваши вопросы и поможем решить любые проблемы
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <BookOpen className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Документация
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Подробные инструкции по использованию платформы
            </p>
            <button className="text-primary-600 hover:text-primary-700 font-medium">
              Открыть документацию →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <MessageCircle className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Часто задаваемые вопросы
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Ответы на самые популярные вопросы пользователей
            </p>
            <button className="text-primary-600 hover:text-primary-700 font-medium">
              Посмотреть FAQ →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Свяжитесь с поддержкой
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Phone className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Телефон
              </h3>
              <p className="text-gray-600">+7 (4112) 12-34-56</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Mail className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Email
              </h3>
              <p className="text-gray-600">support@almazgeobur.ru</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <HelpCircle className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Онлайн чат
              </h3>
              <p className="text-gray-600">Доступен 24/7</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
