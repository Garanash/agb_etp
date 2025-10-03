'use client'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Политика конфиденциальности
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Сбор информации
            </h2>
            <p className="text-gray-600 mb-6">
              Мы собираем информацию, которую вы предоставляете при регистрации и использовании платформы, 
              включая персональные данные и данные о вашей деятельности.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Использование информации
            </h2>
            <p className="text-gray-600 mb-6">
              Собранная информация используется для предоставления услуг платформы, улучшения функциональности 
              и обеспечения безопасности.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Защита данных
            </h2>
            <p className="text-gray-600 mb-6">
              Мы применяем современные методы защиты данных и обеспечиваем их конфиденциальность в соответствии 
              с требованиями законодательства РФ.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Передача данных третьим лицам
            </h2>
            <p className="text-gray-600 mb-6">
              Мы не передаем ваши персональные данные третьим лицам без вашего согласия, за исключением случаев, 
              предусмотренных законодательством.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
