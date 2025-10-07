'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

interface TenderProduct {
  id: number;
  lot_id: number;
  lot_number: number;
  lot_title: string;
  position_number: number | null;
  name: string;
  quantity: string | null;
  unit_of_measure: string | null;
}

interface TenderLot {
  id: number;
  lot_number: number;
  title: string;
  description: string | null;
  initial_price: number | null;
  currency: string;
  security_amount: number | null;
  delivery_place: string | null;
  payment_terms: string | null;
  quantity: string | null;
  unit_of_measure: string | null;
  okpd_code: string | null;
  okved_code: string | null;
  products: TenderProduct[];
}

interface Tender {
  id: number;
  title: string;
  description: string;
  initial_price: number | null;
  currency: string;
  status: string;
  publication_date: string | null;
  deadline: string | null;
  okpd_code: string | null;
  okved_code: string | null;
  region: string | null;
  procurement_method: string;
  created_by: number;
  created_at: string;
  updated_at: string | null;
  lots: TenderLot[];
}

interface ProposalItem {
  product_id: number;
  is_available: boolean;
  is_analog: boolean;
  price_per_unit: number | null;
  delivery_days: number | null;
  comment: string | null;
}

export default function ApplyToTenderPage() {
  const params = useParams();
  const router = useRouter();
  const tenderId = parseInt(params.id as string);
  
  const [tender, setTender] = useState<Tender | null>(null);
  const [products, setProducts] = useState<TenderProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Форма предложения
  const [proposalForm, setProposalForm] = useState({
    prepayment_percent: 0,
    currency: 'RUB',
    vat_percent: 20,
    general_comment: '',
    proposal_items: [] as ProposalItem[],
  });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchTenderData();
    fetchCurrentUser();
  }, [tenderId]);

  const fetchCurrentUser = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
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
        
        // Проверяем, что пользователь - поставщик
        if (data.role !== 'supplier') {
          setError('Только поставщики могут подавать заявки на тендеры');
          return;
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки данных пользователя:', err);
    }
  };

  const fetchTenderData = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // Получаем информацию о тендере
      const tenderResponse = await fetch(`${apiUrl}/api/v1/suppliers/tenders/${tenderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!tenderResponse.ok) {
        throw new Error('Ошибка загрузки тендера');
      }

      const tenderData: Tender = await tenderResponse.json();
      setTender(tenderData);

      // Получаем список товаров для предложения
      const productsResponse = await fetch(`${apiUrl}/api/v1/suppliers/tenders/${tenderId}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (productsResponse.ok) {
        const productsData: TenderProduct[] = await productsResponse.json();
        setProducts(productsData);

        // Инициализируем форму предложения
        const initialProposalItems: ProposalItem[] = productsData.map(product => ({
          product_id: product.id,
          is_available: true,
          is_analog: false,
          price_per_unit: null,
          delivery_days: null,
          comment: null,
        }));

        setProposalForm(prev => ({
          ...prev,
          proposal_items: initialProposalItems,
        }));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleProposalItemChange = (productId: number, field: keyof ProposalItem, value: any) => {
    setProposalForm(prev => ({
      ...prev,
      proposal_items: prev.proposal_items.map(item =>
        item.product_id === productId ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmitProposal = async () => {
    try {
      setSubmitting(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // Создаем новое предложение
      const response = await fetch(`${apiUrl}/api/v1/suppliers/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...proposalForm,
          tender_id: tenderId,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка создания предложения');
      }

      const proposalData = await response.json();

      // Отправляем предложение
      const proposalResponse = await fetch(`${apiUrl}/api/v1/suppliers/proposals/${proposalData.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!proposalResponse.ok) {
        throw new Error('Ошибка отправки предложения');
      }

      alert('Предложение успешно отправлено!');
      router.push('/supplier/proposals');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setSubmitting(false);
    }
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

  const getProductById = (productId: number) => {
    return products.find(p => p.id === productId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error || 'Тендер не найден'}</p>
                </div>
                <div className="mt-4">
                  <Link
                    href="/tenders"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    ← Вернуться к списку тендеров
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href={`/tenders/${tenderId}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Назад к тендеру
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Подача заявки на тендер</h1>
          <p className="mt-2 text-gray-600">{tender.title}</p>
        </div>

        {/* Информация о тендере */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Информация о тендере</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Начальная цена:</span>
              <p className="text-sm text-gray-900">{formatPrice(tender.initial_price, tender.currency)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Срок подачи:</span>
              <p className="text-sm text-gray-900">{tender.deadline ? formatDate(tender.deadline) : 'Не указан'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Регион:</span>
              <p className="text-sm text-gray-900">{tender.region || 'Не указан'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Способ закупки:</span>
              <p className="text-sm text-gray-900">{tender.procurement_method}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Дата публикации:</span>
              <p className="text-sm text-gray-900">{tender.publication_date ? formatDate(tender.publication_date) : 'Не указана'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Статус:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Опубликован
              </span>
            </div>
          </div>
        </div>

        {/* Общие параметры предложения */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Общие параметры предложения</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="prepayment" className="block text-sm font-medium text-gray-700 mb-1">
                Размер предоплаты (%)
              </label>
              <input
                type="number"
                id="prepayment"
                value={proposalForm.prepayment_percent}
                onChange={(e) => setProposalForm(prev => ({ ...prev, prepayment_percent: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Валюта
              </label>
              <select
                id="currency"
                value={proposalForm.currency}
                onChange={(e) => setProposalForm(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="RUB">RUB - Российский рубль</option>
                <option value="USD">USD - Доллар США</option>
                <option value="EUR">EUR - Евро</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="vat" className="block text-sm font-medium text-gray-700 mb-1">
                НДС (%)
              </label>
              <input
                type="number"
                id="vat"
                value={proposalForm.vat_percent}
                onChange={(e) => setProposalForm(prev => ({ ...prev, vat_percent: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="general_comment" className="block text-sm font-medium text-gray-700 mb-1">
              Общий комментарий к предложению
            </label>
            <textarea
              id="general_comment"
              value={proposalForm.general_comment}
              onChange={(e) => setProposalForm(prev => ({ ...prev, general_comment: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите общий комментарий к вашему предложению..."
            />
          </div>
        </div>

        {/* Предложения по товарам */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Предложения по товарам</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Товар
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    В наличии
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Аналог
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Цена за единицу
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Срок поставки (дни)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Комментарий
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proposalForm.proposal_items.map((item) => {
                  const product = getProductById(item.product_id);
                  if (!product) return null;
                  
                  return (
                    <tr key={item.product_id}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-gray-500">Лот {product.lot_number}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={item.is_available}
                          onChange={(e) => handleProposalItemChange(item.product_id, 'is_available', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={item.is_analog}
                          onChange={(e) => handleProposalItemChange(item.product_id, 'is_analog', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          value={item.price_per_unit || ''}
                          onChange={(e) => handleProposalItemChange(item.product_id, 'price_per_unit', parseFloat(e.target.value) || null)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={item.delivery_days || ''}
                          onChange={(e) => handleProposalItemChange(item.product_id, 'delivery_days', parseInt(e.target.value) || null)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={item.comment || ''}
                          onChange={(e) => handleProposalItemChange(item.product_id, 'comment', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Комментарий..."
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex justify-end space-x-4">
          <Link
            href={`/tenders/${tenderId}`}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Отмена
          </Link>
          <button
            onClick={handleSubmitProposal}
            disabled={submitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Отправка...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Отправить предложение
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
