import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'

export default function CallToAction() {
  return (
    <div className="bg-primary-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Готовы начать сотрудничество?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Присоединяйтесь к нашей электронной торговой площадке и получите доступ 
            к новым возможностям для развития вашего бизнеса
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
  )
}
