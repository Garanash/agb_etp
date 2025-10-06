'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TendersSummary {
  status_counts: Record<string, number>;
  total_proposals: number;
  unique_suppliers: number;
  avg_proposal_price: number;
  recent_tenders_30_days: number;
}

interface SupplierPerformance {
  supplier_id: number;
  supplier_name: string;
  supplier_email: string;
  proposals_count: number;
  accepted_proposals: number;
  success_rate: number;
  avg_price: number;
  first_proposal: string;
  last_proposal: string;
}

interface SuppliersResponse {
  items: SupplierPerformance[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

interface PriceAnalysis {
  product_id: number;
  product_name: string;
  position_number: number | null;
  proposals_count: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  price_stddev: number;
  price_range: number;
}

interface PriceAnalysisResponse {
  items: PriceAnalysis[];
  total: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'summary' | 'suppliers' | 'prices'>('summary');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Summary data
  const [summary, setSummary] = useState<TendersSummary | null>(null);
  
  // Suppliers data
  const [suppliers, setSuppliers] = useState<SupplierPerformance[]>([]);
  const [suppliersPage, setSuppliersPage] = useState(1);
  const [suppliersTotalPages, setSuppliersTotalPages] = useState(1);
  const [suppliersSortBy, setSuppliersSortBy] = useState('proposals_count');
  const [suppliersSortOrder, setSuppliersSortOrder] = useState('desc');
  
  // Price analysis data
  const [priceAnalysis, setPriceAnalysis] = useState<PriceAnalysis[]>([]);
  const [productSearch, setProductSearch] = useState('');

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/analytics/tenders/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки сводки');
      }

      const data: TendersSummary = await response.json();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const fetchSuppliers = async (page = 1) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        size: '20',
        sort_by: suppliersSortBy,
        sort_order: suppliersSortOrder,
      });

      const response = await fetch(`/api/v1/analytics/suppliers/performance?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки данных поставщиков');
      }

      const data: SuppliersResponse = await response.json();
      setSuppliers(data.items);
      setSuppliersTotalPages(data.pages);
      setSuppliersPage(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const fetchPriceAnalysis = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        limit: '50',
      });

      if (productSearch) {
        params.append('product_name', productSearch);
      }

      const response = await fetch(`/api/v1/analytics/products/price-analysis?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки анализа цен');
      }

      const data: PriceAnalysisResponse = await response.json();
      setPriceAnalysis(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchSummary();
        await fetchSuppliers();
        await fetchPriceAnalysis();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'suppliers') {
      fetchSuppliers(1);
    }
  }, [suppliersSortBy, suppliersSortOrder]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    const statusMap = {
      published: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      draft: 'bg-yellow-100 text-yellow-800',
    };
    return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Аналитика</h1>
        <p className="mt-2 text-gray-600">Анализ тендеров и поставщиков</p>
      </div>

      {/* Табы */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'summary'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Общая сводка
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'suppliers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Поставщики
          </button>
          <button
            onClick={() => setActiveTab('prices')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'prices'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Анализ цен
          </button>
        </nav>
      </div>

      {/* Общая сводка */}
      {activeTab === 'summary' && summary && (
        <div className="space-y-6">
          {/* Основные метрики */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Всего предложений</dt>
                      <dd className="text-lg font-medium text-gray-900">{summary.total_proposals}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Уникальных поставщиков</dt>
                      <dd className="text-lg font-medium text-gray-900">{summary.unique_suppliers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Средняя цена</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatPrice(summary.avg_proposal_price)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Тендеров за 30 дней</dt>
                      <dd className="text-lg font-medium text-gray-900">{summary.recent_tenders_30_days}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Статусы тендеров */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Тендеры по статусам</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(summary.status_counts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {status === 'published' ? 'Опубликован' :
                       status === 'in_progress' ? 'В процессе' :
                       status === 'completed' ? 'Завершен' :
                       status === 'cancelled' ? 'Отменен' :
                       status === 'draft' ? 'Черновик' : status}
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Поставщики */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          {/* Фильтры */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div>
                <label htmlFor="sort_by" className="block text-sm font-medium text-gray-700 mb-1">
                  Сортировать по
                </label>
                <select
                  id="sort_by"
                  value={suppliersSortBy}
                  onChange={(e) => setSuppliersSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="proposals_count">Количество предложений</option>
                  <option value="avg_price">Средняя цена</option>
                  <option value="success_rate">Процент успеха</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 mb-1">
                  Порядок
                </label>
                <select
                  id="sort_order"
                  value={suppliersSortOrder}
                  onChange={(e) => setSuppliersSortOrder(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">По убыванию</option>
                  <option value="asc">По возрастанию</option>
                </select>
              </div>
            </div>
          </div>

          {/* Таблица поставщиков */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Поставщик
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Предложений
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Принято
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Успешность
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Средняя цена
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Первое предложение
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Последнее предложение
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {suppliers.map((supplier) => (
                    <tr key={supplier.supplier_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{supplier.supplier_name}</div>
                          <div className="text-sm text-gray-500">{supplier.supplier_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {supplier.proposals_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {supplier.accepted_proposals}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          supplier.success_rate >= 70 ? 'bg-green-100 text-green-800' :
                          supplier.success_rate >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {supplier.success_rate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(supplier.avg_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(supplier.first_proposal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(supplier.last_proposal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Пагинация */}
          {suppliersTotalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => fetchSuppliers(suppliersPage - 1)}
                  disabled={suppliersPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Предыдущая
                </button>
                <button
                  onClick={() => fetchSuppliers(suppliersPage + 1)}
                  disabled={suppliersPage === suppliersTotalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Следующая
                </button>
              </div>
              
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Страница <span className="font-medium">{suppliersPage}</span> из{' '}
                    <span className="font-medium">{suppliersTotalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => fetchSuppliers(suppliersPage - 1)}
                      disabled={suppliersPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Предыдущая
                    </button>
                    
                    {Array.from({ length: Math.min(5, suppliersTotalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => fetchSuppliers(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === suppliersPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => fetchSuppliers(suppliersPage + 1)}
                      disabled={suppliersPage === suppliersTotalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Следующая
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Анализ цен */}
      {activeTab === 'prices' && (
        <div className="space-y-6">
          {/* Поиск */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label htmlFor="product_search" className="block text-sm font-medium text-gray-700 mb-1">
                  Поиск по названию товара
                </label>
                <input
                  type="text"
                  id="product_search"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Введите название товара..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={fetchPriceAnalysis}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Поиск
                </button>
              </div>
            </div>
          </div>

          {/* Таблица анализа цен */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Товар
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Предложений
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Средняя цена
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Мин. цена
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Макс. цена
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Разброс цен
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Стандартное отклонение
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {priceAnalysis.map((item) => (
                    <tr key={item.product_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                          {item.position_number && (
                            <div className="text-sm text-gray-500">Позиция: {item.position_number}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.proposals_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(item.avg_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(item.min_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(item.max_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(item.price_range)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(item.price_stddev)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


