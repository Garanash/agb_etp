import Link from 'next/link'
import { ArrowRight, Users, Shield, Zap } from 'lucide-react'

export default function Hero() {
  return (
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
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/register" 
              className="bg-white text-primary-600 hover:bg-primary-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>Стать поставщиком</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="/tenders" 
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Посмотреть тендеры
            </Link>
          </div>

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
  )
}
