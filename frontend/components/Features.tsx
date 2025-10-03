import { CheckCircle, Clock, DollarSign, Users, Shield, TrendingUp } from 'lucide-react'

export default function Features() {
  const features = [
    {
      icon: CheckCircle,
      title: 'Прозрачность',
      description: 'Все процедуры закупок проводятся открыто и прозрачно'
    },
    {
      icon: Clock,
      title: 'Экономия времени',
      description: 'Автоматизированные процессы сокращают время на оформление документов'
    },
    {
      icon: DollarSign,
      title: 'Выгодные цены',
      description: 'Конкурентная борьба поставщиков обеспечивает лучшие условия'
    },
    {
      icon: Users,
      title: 'Широкая база',
      description: 'Доступ к большому количеству квалифицированных поставщиков'
    },
    {
      icon: Shield,
      title: 'Безопасность',
      description: 'Надежная защита данных и финансовых операций'
    },
    {
      icon: TrendingUp,
      title: 'Развитие бизнеса',
      description: 'Возможности для роста и расширения деловых связей'
    }
  ]

  return (
    <div className="py-20 bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            Преимущества нашей платформы
          </h2>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Мы создали современную электронную торговую площадку, 
            которая упрощает процесс закупок для всех участников
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-secondary-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
