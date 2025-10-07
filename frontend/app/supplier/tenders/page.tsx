'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tender {
  id: number;
  title: string;
  description: string;
  initial_price: number | null;
  currency: string;
  status: string;
  publication_date: string;
  deadline: string;
  region: string;
  procurement_method: string;
  created_at: string;
  has_proposal: boolean;
  proposal_status: string | null;
  proposals_count: number;
}

interface TendersResponse {
  items: Tender[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export default function SupplierTendersPage() {
  const router = useRouter();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  const fetchTenders = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        size: '20',
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (regionFilter) params.append('region', regionFilter);

      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/v1/suppliers/tenders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки тендеров');
      }

      const data: TendersResponse = await response.json();
      setTenders(data.items);
      setTotalPages(data.pages);
      setCurrentPage(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenders();
  }, []);

  const handleSearch = () => {
    fetchTenders(1);
  };

  const handlePageChange = (page: number) => {
    fetchTenders(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return 'Не указана';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency === 'RUB' ? 'RUB' : 'USD',
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      published: { text: 'Опубликован', className: 'bg-green-100 text-green-800' },
      in_progress: { text: 'В процессе', className: 'bg-blue-100 text-blue-800' },
      completed: { text: 'Завершен', className: 'bg-gray-100 text-gray-800' },
      cancelled: { text: 'Отменен', className: 'bg-red-100 text-red-800' },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { text: status, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
  };

  const getProposalStatusBadge = (hasProposal: boolean, proposalStatus: string | null) => {
    if (!hasProposal) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Нет предложения</span>;
    }
    
    const statusMap = {
      draft: { text: 'Черновик', className: 'bg-yellow-100 text-yellow-800' },
      submitted: { text: 'Отправлено', className: 'bg-blue-100 text-blue-800' },
      accepted: { text: 'Принято', className: 'bg-green-100 text-green-800' },
      rejected: { text: 'Отклонено', className: 'bg-red-100 text-red-800' },
    };
    
    const statusInfo = statusMap[proposalStatus as keyof typeof statusMap] || { text: proposalStatus, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
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
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Тендеры для участия</h1>
        <p className="mt-2 text-gray-600">Просмотр и подача заявок на тендеры</p>
      </div>
      {/* Фильтры */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Поиск
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Название тендера..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Статус
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все статусы</option>
              <option value="published">Опубликован</option>
              <option value="in_progress">В процессе</option>
              <option value="completed">Завершен</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
              Регион
            </label>
            <input
              type="text"
              id="region"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              placeholder="Регион..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Поиск
            </button>
          </div>
        </div>
      </div>

      {/* Список тендеров */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {tenders.map((tender) => (
            <li key={tender.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {tender.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(tender.status)}
                        {getProposalStatusBadge(tender.has_proposal, tender.proposal_status)}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {tender.description}
                      </p>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Начальная цена:</span>
                        <p className="text-sm text-gray-900">{formatPrice(tender.initial_price, tender.currency)}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-500">Срок подачи:</span>
                        <p className="text-sm text-gray-900">{formatDate(tender.deadline)}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-500">Регион:</span>
                        <p className="text-sm text-gray-900">{tender.region || 'Не указан'}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-500">Предложений:</span>
                        <p className="text-sm text-gray-900">{tender.proposals_count}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    <Link
                      href={`/supplier/tenders/${tender.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {tender.has_proposal ? 'Просмотреть предложение' : 'Подать предложение'}
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Предыдущая
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Следующая
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Страница <span className="font-medium">{currentPage}</span> из{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Предыдущая
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
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
  );
}


