'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, FileText, Download, AlertCircle, CheckCircle } from 'lucide-react'

export default function ImportPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('access_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/import/tenders/csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {
        const errorData = await response.json()
        setError(`Ошибка ${response.status}: ${errorData.detail}`)
      }
    } catch (err) {
      setError(`Ошибка: ${err}`)
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = `Название,Описание,Начальная цена,Валюта,Статус,Дата публикации,Срок подачи заявок,Код ОКПД2,Код ОКВЭД2,Регион,Способ закупки,Организатор,Юридический адрес,Email организатора,Телефон организатора,Контактное лицо,ИНН организатора,Номер лота,Название лота,Описание лота,Начальная цена лота,Валюта лота,Место поставки,Условия оплаты,Количество,Единица измерения,Номер позиции,Наименование товара,Количество товара,Единица измерения товара
"Тестовый тендер 1","Описание тестового тендера 1",100000,RUB,published,2024-01-01,2024-01-31,01.11.12,01.11.12,Москва,auction,"ООО Тест","г. Москва","test@example.com","+7(495)123-45-67","Иванов И.И.","1234567890",1,"Лот 1","Описание лота 1",100000,RUB,"г. Москва","30 дней",10,шт,1,"Товар 1",10,шт
"Тестовый тендер 2","Описание тестового тендера 2",200000,RUB,draft,2024-02-01,2024-02-28,01.11.13,01.11.13,Санкт-Петербург,auction,"ООО Тест 2","г. СПб","test2@example.com","+7(812)123-45-67","Петров П.П.","0987654321",1,"Лот 1","Описание лота 1",200000,RUB,"г. СПб","30 дней",5,шт,1,"Товар 2",5,шт`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'template_tenders.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">Импорт тендеров</h1>
              <p className="mt-2 text-secondary-600">Загрузка тендеров из CSV файла</p>
            </div>
            <Link
              href="/admin"
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              ← Назад в админку
            </Link>
          </div>
        </div>

        {/* Инструкции */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Инструкции по импорту</h2>
          <div className="space-y-3 text-sm text-blue-800">
            <p>• Обязательные поля: <strong>Название</strong>, <strong>Описание</strong></p>
            <p>• Поддерживаемые форматы дат: YYYY-MM-DD</p>
            <p>• Статусы тендеров: draft, published, in_progress, completed, cancelled</p>
            <p>• Валюты: RUB, USD, EUR</p>
            <p>• Способы закупки: auction, request_for_quotation, single_source</p>
            <p>• Для создания лотов и товаров используйте соответствующие колонки</p>
          </div>
        </div>

        {/* Загрузка файла */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Загрузка CSV файла</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Выберите CSV файл
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".csv"
                className="block w-full text-sm text-secondary-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="h-4 w-4" />
                <span>{uploading ? 'Загрузка...' : 'Загрузить файл'}</span>
              </button>

              <button
                onClick={downloadTemplate}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Скачать шаблон</span>
              </button>
            </div>
          </div>
        </div>

        {/* Результат */}
        {result && (
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h2 className="text-lg font-semibold text-secondary-900">Результат импорта</h2>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">{result.message}</p>
              {result.tender_ids && result.tender_ids.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-green-700">Созданные тендеры:</p>
                  <ul className="text-sm text-green-600 mt-1">
                    {result.tender_ids.map((id: number) => (
                      <li key={id}>• ID: {id}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ошибка */}
        {error && (
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-semibold text-secondary-900">Ошибка импорта</h2>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Пример структуры CSV */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Пример структуры CSV файла</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-secondary-50">
                  <th className="px-3 py-2 text-left font-medium text-secondary-700">Название</th>
                  <th className="px-3 py-2 text-left font-medium text-secondary-700">Описание</th>
                  <th className="px-3 py-2 text-left font-medium text-secondary-700">Начальная цена</th>
                  <th className="px-3 py-2 text-left font-medium text-secondary-700">Валюта</th>
                  <th className="px-3 py-2 text-left font-medium text-secondary-700">Статус</th>
                  <th className="px-3 py-2 text-left font-medium text-secondary-700">Организатор</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2 text-secondary-600">Тестовый тендер 1</td>
                  <td className="px-3 py-2 text-secondary-600">Описание тендера</td>
                  <td className="px-3 py-2 text-secondary-600">100000</td>
                  <td className="px-3 py-2 text-secondary-600">RUB</td>
                  <td className="px-3 py-2 text-secondary-600">published</td>
                  <td className="px-3 py-2 text-secondary-600">ООО Тест</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-secondary-600">Тестовый тендер 2</td>
                  <td className="px-3 py-2 text-secondary-600">Описание тендера 2</td>
                  <td className="px-3 py-2 text-secondary-600">200000</td>
                  <td className="px-3 py-2 text-secondary-600">RUB</td>
                  <td className="px-3 py-2 text-secondary-600">draft</td>
                  <td className="px-3 py-2 text-secondary-600">ООО Тест 2</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-sm text-secondary-600">
            <p>Полный список поддерживаемых колонок доступен в шаблоне CSV файла.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
