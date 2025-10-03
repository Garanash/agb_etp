'use client'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Условия использования
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Общие положения
            </h2>
            <p className="text-gray-600 mb-6">
              Настоящие Условия использования регулируют отношения между пользователями и АО «АлмазГеоБур» 
              при использовании электронной торговой площадки.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Регистрация и учетные записи
            </h2>
            <p className="text-gray-600 mb-6">
              Для использования платформы необходимо пройти регистрацию и создать учетную запись. 
              Пользователь обязуется предоставлять достоверную информацию.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Права и обязанности пользователей
            </h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Соблюдать законодательство РФ</li>
              <li>Не нарушать права других пользователей</li>
              <li>Предоставлять достоверную информацию</li>
              <li>Соблюдать конфиденциальность</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Ответственность
            </h2>
            <p className="text-gray-600 mb-6">
              Администрация платформы не несет ответственности за действия пользователей и результаты 
              торговых процедур.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
