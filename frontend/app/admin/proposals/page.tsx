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
  tender_info?: {
    title: string;
    status: string;
    initial_price: number | null;
    currency: string | null;
    deadline: string | null;
  };
  supplier_info?: {
    full_name: string;
    email: string | null;
    phone: string | null;
  };
}

export default function AdminProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<SupplierProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchCurrentUser();
    fetchProposals();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
        
        // Проверяем, что пользователь имеет права на просмотр предложений
        if (!['admin', 'contract_manager', 'manager'].includes(data.role)) {
          setError('У вас нет прав для просмотра предложений');
          return;
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки данных пользователя:', err);
    }
  };

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`${apiUrl}/api/v1/tenders/proposals?${params}`, {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
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

  const handleStatusFilter = () => {
    fetchProposals();
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
        <h1 className="text-3xl font-bold text-gray-900">Все предложения</h1>
        <p className="mt-2 text-gray-600">Просмотр всех предложений по тендерам</p>
      </div>

      {/* Фильтры */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <option value="draft">Черновик</option>
              <option value="submitted">Отправлено</option>
              <option value="accepted">Принято</option>
              <option value="rejected">Отклонено</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleStatusFilter}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Применить фильтр
            </button>
          </div>
        </div>
      </div>

      {/* Список предложений */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {proposals.map((proposal) => (
            <li key={proposal.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        Предложение #{proposal.id}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(proposal.status)}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      {proposal.tender_info && (
                        <p className="text-sm text-gray-600">
                          <strong>Тендер:</strong> {proposal.tender_info.title}
                        </p>
                      )}
                      {proposal.supplier_info && (
                        <p className="text-sm text-gray-600">
                          <strong>Поставщик:</strong> {proposal.supplier_info.full_name}
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Предоплата:</span>
                        <p className="text-sm text-gray-900">{proposal.prepayment_percent}%</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-500">Валюта:</span>
                        <p className="text-sm text-gray-900">{proposal.currency}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-500">НДС:</span>
                        <p className="text-sm text-gray-900">{proposal.vat_percent}%</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-500">Дата создания:</span>
                        <p className="text-sm text-gray-900">{formatDate(proposal.created_at)}</p>
                      </div>
                    </div>

                    {proposal.general_comment && (
                      <div className="mt-3">
                        <span className="text-sm font-medium text-gray-500">Комментарий:</span>
                        <p className="text-sm text-gray-900 mt-1">{proposal.general_comment}</p>
                      </div>
                    )}

                    {proposal.tender_info && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Начальная цена тендера:</span>
                          <p className="text-sm text-gray-900">
                            {formatPrice(proposal.tender_info.initial_price, proposal.tender_info.currency || 'RUB')}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Срок подачи:</span>
                          <p className="text-sm text-gray-900">
                            {proposal.tender_info.deadline ? formatDate(proposal.tender_info.deadline) : 'Не указан'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    <Link
                      href={`/admin/proposals/${proposal.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Просмотреть детали
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {proposals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Предложения не найдены</p>
        </div>
      )}
    </div>
  );
}
