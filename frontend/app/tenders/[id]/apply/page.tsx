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
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchTenderData();
    fetchCurrentUser();
  }, [tenderId]);

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
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
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
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
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
        {/* Заголовок */}
        <div className="mb-8">
          <Link
            href={`/tenders/${tenderId}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Назад к тендеру
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Запрос предложений №{tenderId} от {tender.publication_date ? formatDate(tender.publication_date) : 'Н/Д'}</h1>
          <p className="text-gray-600 mt-1">{tender.title}</p>
        </div>

        {/* Табы */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button className="py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
              Аналитика
            </button>
            <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
              Результаты
            </button>
          </nav>
        </div>

        {/* Информация о тендере */}
        <div className="bg-gray-800 text-white rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-gray-300">ПРЕДЛОЖЕНИЙ</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">склад поставщика</div>
              <div className="text-sm text-gray-300">МЕСТО ПОСТАВКИ</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">Н/П</div>
              <div className="text-sm text-gray-300">ДАТА ПОСТАВКИ ДО</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{tender.deadline ? formatDate(tender.deadline) : 'Н/Д'}</div>
              <div className="text-sm text-gray-300">ДАТА ЗАВЕРШЕНИЯ</div>
            </div>
          </div>
        </div>

        {/* Предупреждение */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Внимание!</strong> Спецификацию можно отправить только один раз.
              </p>
            </div>
          </div>
        </div>

        {/* Форма предложения */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Ваше предложение к тендеру №{tenderId}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="prepayment" className="block text-sm font-medium text-gray-700 mb-2">
                РАЗМЕР ПРЕДОПЛАТЫ:
              </label>
              <div className="relative">
                <select
                  id="prepayment"
                  value={proposalForm.prepayment_percent}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, prepayment_percent: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="0">0%</option>
                  <option value="10">10%</option>
                  <option value="20">20%</option>
                  <option value="30">30%</option>
                  <option value="50">50%</option>
                  <option value="100">100%</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="vat" className="block text-sm font-medium text-gray-700 mb-2">
                ЦЕНЫ С УЧЕТОМ НДС:
              </label>
              <div className="relative">
                <select
                  id="vat"
                  value={proposalForm.vat_percent}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, vat_percent: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="0">Без НДС</option>
                  <option value="10">НДС 10%</option>
                  <option value="20">НДС 20%</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ФАЙЛЫ:
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Перетащите файлы сюда или нажмите для выбора</p>
            </div>
          </div>
          
          <div>
            <label htmlFor="general_comment" className="block text-sm font-medium text-gray-700 mb-2">
              ОБЩИЙ КОММЕНТАРИЙ К ВАШЕМУ ПРЕДЛОЖЕНИЮ:
            </label>
            <textarea
              id="general_comment"
              value={proposalForm.general_comment}
              onChange={(e) => setProposalForm(prev => ({ ...prev, general_comment: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите общий комментарий к вашему предложению..."
            />
          </div>
        </div>

        {/* Таблица товаров */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    НАИМ. ТМЦ/УСЛУГИ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    КОЛ-ВО
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    В НАЛИЧИИ
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    АНАЛОГ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ЦЕНА С УЧЕТОМ НДС
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ВРЕМЯ ДОСТАВКИ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    КОММЕНТАРИЙ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proposalForm.proposal_items.map((item) => {
                  const product = getProductById(item.product_id);
                  if (!product) return null;
                  
                  return (
                    <tr key={item.product_id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-gray-500 text-xs">{product.position_number ? `${product.position_number} / ` : ''}${product.id}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {product.quantity ? `x${product.quantity}` : '-'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.is_available}
                            onChange={(e) => handleProposalItemChange(item.product_id, 'is_available', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                        </label>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.is_analog}
                            onChange={(e) => handleProposalItemChange(item.product_id, 'is_analog', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                        </label>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-1">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={item.price_per_unit || ''}
                            onChange={(e) => handleProposalItemChange(item.product_id, 'price_per_unit', parseFloat(e.target.value) || null)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="number"
                          value={item.delivery_days || ''}
                          onChange={(e) => handleProposalItemChange(item.product_id, 'delivery_days', parseInt(e.target.value) || null)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-4">
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
            className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Отмена
          </Link>
          <button
            onClick={handleSubmitProposal}
            disabled={submitting}
            className="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
