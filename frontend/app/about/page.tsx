'use client'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            О компании
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              АО «АлмазГеоБур» — ведущая компания в области геологоразведочных работ и буровых услуг в Республике Саха (Якутия). 
              Мы специализируемся на проведении геологоразведочных работ, бурении скважин различного назначения и поставке 
              бурового оборудования.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Наша миссия
            </h2>
            <p className="text-gray-600 mb-6">
              Обеспечить эффективное и прозрачное проведение закупочных процедур для всех участников рынка, 
              создавая равные возможности для поставщиков и заказчиков.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Наши ценности
            </h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Прозрачность и открытость всех процедур</li>
              <li>Справедливость и равные возможности</li>
              <li>Качество и надежность</li>
              <li>Инновации и современные технологии</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              История компании
            </h2>
            <p className="text-gray-600 mb-6">
              Компания была основана в 1995 году и с тех пор успешно работает на рынке геологоразведочных услуг. 
              За годы работы мы накопили богатый опыт и создали надежную репутацию среди партнеров и клиентов.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
