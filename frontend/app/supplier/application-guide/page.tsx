'use client';

import Link from 'next/link';

export default function ApplicationGuidePage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Как подать заявку на тендер</h1>
        <p className="mt-2 text-gray-600">Пошаговое руководство для поставщиков</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Пошаговая инструкция</h2>
        
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Просмотр доступных тендеров</h3>
              <p className="text-gray-600 mt-1">
                Перейдите в раздел <Link href="/supplier/tenders" className="text-blue-600 hover:text-blue-800">"Тендеры для участия"</Link> 
                чтобы увидеть все доступные тендеры. Используйте фильтры для поиска подходящих тендеров.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Выбор тендера</h3>
              <p className="text-gray-600 mt-1">
                Нажмите на кнопку <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">"Подать предложение"</span> 
                рядом с интересующим вас тендером.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Изучение информации о тендере</h3>
              <p className="text-gray-600 mt-1">
                На вкладке "Информация о тендере" ознакомьтесь с деталями: лотами, товарами, 
                требованиями и документами тендера.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">4</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Заполнение предложения</h3>
              <p className="text-gray-600 mt-1">
                Перейдите на вкладку "Подать предложение" и заполните:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li><strong>Общие параметры:</strong> размер предоплаты, валюта, НДС, общий комментарий</li>
                <li><strong>По каждому товару:</strong> наличие, оригинал/аналог, цена, срок поставки, комментарий</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">5</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Отправка предложения</h3>
              <p className="text-gray-600 mt-1">
                Нажмите кнопку <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">"Отправить предложение"</span> 
                для отправки вашего предложения организатору тендера.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">6</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Отслеживание статуса</h3>
              <p className="text-gray-600 mt-1">
                В разделе <Link href="/supplier/proposals" className="text-blue-600 hover:text-blue-800">"Мои предложения"</Link> 
                вы можете отслеживать статус ваших предложений.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Полезные советы</h3>
        <ul className="text-blue-800 space-y-2">
          <li>• Внимательно изучите все документы тендера перед подачей заявки</li>
          <li>• Укажите точные сроки поставки и наличие товаров</li>
          <li>• Добавьте подробные комментарии к вашему предложению</li>
          <li>• Проверьте правильность указания цен и валюты</li>
          <li>• Сохраняйте черновики предложений для последующего редактирования</li>
        </ul>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-2">✅ Готовы начать?</h3>
        <p className="text-green-800 mb-4">
          Теперь вы знаете, как подать заявку на тендер. Перейдите к списку тендеров и начните работу!
        </p>
        <div className="flex space-x-4">
          <Link
            href="/supplier/tenders"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Перейти к тендерам
          </Link>
          <Link
            href="/supplier/proposals"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Мои предложения
          </Link>
        </div>
      </div>
    </div>
  );
}
