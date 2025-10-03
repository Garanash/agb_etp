'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search,
  ArrowRight,
  Users,
  Shield,
  Zap,
  CheckCircle,
  DollarSign,
  TrendingUp,
  FileText,
  Building2,
  Package,
  Clock
} from 'lucide-react'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery) {
      window.location.href = `/tenders?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <div>
      {/* Hero секция */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Электронная торговая площадка
              <span className="block text-primary-200">Алмазгеобур</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Прозрачные и эффективные закупки для всех участников рынка. 
              Присоединяйтесь к нашей платформе и расширяйте свои возможности.
            </p>

            {/* Поиск */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg text-secondary-900 placeholder-secondary-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Поиск по тендерам..."
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors"
                >
                  Найти
                </button>
              </div>
            </form>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Users className="h-8 w-8 text-primary-200" />
                </div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-primary-200">Активных поставщиков</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Shield className="h-8 w-8 text-primary-200" />
                </div>
                <div className="text-3xl font-bold">100%</div>
                <div className="text-primary-200">Безопасность сделок</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Zap className="h-8 w-8 text-primary-200" />
                </div>
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-primary-200">Техническая поддержка</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Преимущества */}
      <div className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Преимущества нашей платформы
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Мы создали современную электронную торговую площадку, которая упрощает процесс закупок для всех участников
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Прозрачность
              </h3>
              <p className="text-secondary-600">
                Все процедуры закупок проводятся открыто и прозрачно
              </p>
            </div>

            <div className="card text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <Clock className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Экономия времени
              </h3>
              <p className="text-secondary-600">
                Автоматизированные процессы сокращают время на оформление документов
              </p>
            </div>

            <div className="card text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <DollarSign className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Выгодные цены
              </h3>
              <p className="text-secondary-600">
                Конкурентная борьба поставщиков обеспечивает лучшие условия
              </p>
            </div>

            <div className="card text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <Users className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Широкая база
              </h3>
              <p className="text-secondary-600">
                Доступ к большому количеству квалифицированных поставщиков
              </p>
            </div>

            <div className="card text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <Shield className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Безопасность
              </h3>
              <p className="text-secondary-600">
                Надежная защита данных и финансовых операций
              </p>
            </div>

            <div className="card text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <TrendingUp className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Развитие бизнеса
              </h3>
              <p className="text-secondary-600">
                Возможности для роста и расширения деловых связей
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Призыв к действию */}
      <div className="bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Готовы начать сотрудничество?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Присоединяйтесь к нашей электронной торговой площадке и получите доступ к новым возможностям для развития вашего бизнеса
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/register"
                className="bg-white text-primary-600 hover:bg-primary-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <span>Зарегистрироваться</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/contacts"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Связаться с нами
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5 text-primary-200" />
                <span className="text-primary-100">Быстрая регистрация</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5 text-primary-200" />
                <span className="text-primary-100">Бесплатное участие</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5 text-primary-200" />
                <span className="text-primary-100">Техническая поддержка</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}