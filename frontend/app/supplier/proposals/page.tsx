'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProposalItem {
  id: number;
  proposal_id: number;
  product_id: number;
  is_available: boolean;
  is_analog: boolean;
  price_per_unit: number | null;
  delivery_days: number | null;
  comment: string | null;
  created_at: string;
  updated_at: string | null;
}

interface SupplierProposal {
  id: number;
  tender_id: number;
  supplier_id: number;
  prepayment_percent: number;
  currency: string;
  vat_percent: number;
  general_comment: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
  proposal_items: ProposalItem[];
  tender: {
    id: number;
    title: string;
    description: string;
    initial_price: number | null;
    currency: string;
    status: string;
    publication_date: string | null;
    deadline: string | null;
    region: string | null;
    procurement_method: string;
    created_by: number;
    created_at: string;
    updated_at: string | null;
  };
}

export default function SupplierProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<SupplierProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/v1/suppliers/proposals?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки предложений');
      }

      const data: SupplierProposal[] = await response.json();
      setProposals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      draft: { text: 'Черновик', className: 'bg-yellow-100 text-yellow-800' },
      submitted: { text: 'Отправлено', className: 'bg-blue-100 text-blue-800' },
      accepted: { text: 'Принято', className: 'bg-green-100 text-green-800' },
      rejected: { text: 'Отклонено', className: 'bg-red-100 text-red-800' },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { text: status, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
  };

  const calculateTotalPrice = (proposal: SupplierProposal) => {
    return proposal.proposal_items.reduce((total, item) => {
      if (item.price_per_unit && item.is_available) {
        return total + item.price_per_unit;
      }
      return total;
    }, 0);
  };

  const getAvailableItemsCount = (proposal: SupplierProposal) => {
    return proposal.proposal_items.filter(item => item.is_available).length;
  };

  const getAnalogItemsCount = (proposal: SupplierProposal) => {
    return proposal.proposal_items.filter(item => item.is_analog).length;
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
        <h1 className="text-3xl font-bold text-gray-900">Мои предложения</h1>
        <p className="mt-2 text-gray-600">Просмотр и управление вашими предложениями</p>
      </div>

      {/* Фильтры */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Статус
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все статусы</option>
              <option value="draft">Черновик</option>
              <option value="submitted">Отправлено</option>
              <option value="accepted">Принято</option>
              <option value="rejected">Отклонено</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => fetchProposals()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Обновить
            </button>
          </div>
        </div>
      </div>

      {/* Список предложений */}
      {proposals.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Нет предложений</h3>
            <p className="mt-1 text-sm text-gray-500">У вас пока нет предложений.</p>
            <div className="mt-6">
              <Link
                href="/supplier/tenders"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Подать предложение
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {proposals.map((proposal) => (
              <li key={proposal.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {proposal.tender.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(proposal.status)}
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {proposal.tender.description}
                        </p>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Общая стоимость:</span>
                          <p className="text-sm text-gray-900">
                            {formatPrice(calculateTotalPrice(proposal), proposal.currency)}
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-500">Товаров в наличии:</span>
                          <p className="text-sm text-gray-900">
                            {getAvailableItemsCount(proposal)} из {proposal.proposal_items.length}
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-500">Аналогов:</span>
                          <p className="text-sm text-gray-900">{getAnalogItemsCount(proposal)}</p>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-500">Предоплата:</span>
                          <p className="text-sm text-gray-900">{proposal.prepayment_percent}%</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Создано:</span>
                          <p className="text-sm text-gray-900">{formatDate(proposal.created_at)}</p>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-500">Обновлено:</span>
                          <p className="text-sm text-gray-900">
                            {proposal.updated_at ? formatDate(proposal.updated_at) : 'Не обновлялось'}
                          </p>
                        </div>
                      </div>
                      
                      {proposal.general_comment && (
                        <div className="mt-3">
                          <span className="text-sm font-medium text-gray-500">Комментарий:</span>
                          <p className="text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded">
                            {proposal.general_comment}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex-shrink-0">
                      <Link
                        href={`/supplier/tenders/${proposal.tender_id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {proposal.status === 'draft' ? 'Редактировать' : 'Просмотреть'}
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


