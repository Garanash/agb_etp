'use client'

import { useState, useEffect } from 'react'

export default function TestApiPage() {
  const [apiUrl, setApiUrl] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setApiUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
  }, [])

  const testApi = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/v1/tenders/`)
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponse(`Ошибка: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Тест API</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Настройки</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API URL:
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={testApi}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Тестирование...' : 'Тестировать API'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Ответ API</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
            {response || 'Нажмите "Тестировать API" для проверки связи'}
          </pre>
        </div>
      </div>
    </div>
  )
}
