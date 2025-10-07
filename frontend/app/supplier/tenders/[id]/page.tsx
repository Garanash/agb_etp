'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

interface TenderDocument {
  id: number;
  title: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  uploaded_at: string;
}

interface TenderOrganizer {
  id: number;
  organization_name: string;
  legal_address: string | null;
  postal_address: string | null;
  email: string | null;
  phone: string | null;
  contact_person: string | null;
  inn: string | null;
  kpp: string | null;
  ogrn: string | null;
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
  documents: TenderDocument[];
  organizers: TenderOrganizer[];
}

interface ProposalItem {
  product_id: number;
  is_available: boolean;
  is_analog: boolean;
  price_per_unit: number | null;
  delivery_days: number | null;
  comment: string | null;
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
}

export default function TenderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const tenderId = parseInt(params.id);
  const [tender, setTender] = useState<Tender | null>(null);
  const [products, setProducts] = useState<TenderProduct[]>([]);
  const [existingProposal, setExistingProposal] = useState<SupplierProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'proposal'>('info');
  const [submitting, setSubmitting] = useState(false);

  // Форма предложения
  const [proposalForm, setProposalForm] = useState({
    prepayment_percent: 0,
    currency: 'RUB',
    vat_percent: 20,
    general_comment: '',
    proposal_items: [] as ProposalItem[],
  });

  const fetchTenderData = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
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

      // Проверяем, есть ли уже предложение
      const proposalsResponse = await fetch(`${apiUrl}/api/v1/suppliers/proposals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (proposalsResponse.ok) {
        const proposals: SupplierProposal[] = await proposalsResponse.json();
        const existing = proposals.find(p => p.tender_id === tenderId);
        if (existing) {
          setExistingProposal(existing);
          setActiveTab('proposal');
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenderData();
  }, [tenderId]);

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

      if (existingProposal) {
        // Обновляем существующее предложение
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/v1/suppliers/proposals/${existingProposal.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(proposalForm),
        });

        if (!response.ok) {
          throw new Error('Ошибка обновления предложения');
        }
      } else {
        // Создаем новое предложение
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
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
      }

      // Отправляем предложение
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const proposalResponse = await fetch(`${apiUrl}/api/v1/suppliers/proposals/${existingProposal?.id || 'new'}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!proposalResponse.ok) {
        throw new Error('Ошибка отправки предложения');
      }

      alert('Предложение успешно отправлено!');
      router.push('/supplier/tenders');
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error || 'Тендер не найден'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/supplier/tenders"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          ← Назад к списку тендеров
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">{tender.title}</h1>
        <p className="mt-2 text-gray-600">{tender.description}</p>
      </div>

      {/* Табы */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Информация о тендере
          </button>
          <button
            onClick={() => setActiveTab('proposal')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'proposal'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {existingProposal ? 'Мое предложение' : 'Подать предложение'}
          </button>
        </nav>
      </div>

      {activeTab === 'info' && (
        <div className="space-y-6">
          {/* Основная информация */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Основная информация</h2>
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

          {/* Лоты и товары */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Лоты и товары</h2>
            <div className="space-y-6">
              {tender.lots.map((lot) => (
                <div key={lot.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Лот {lot.lot_number}: {lot.title}
                  </h3>
                  {lot.description && (
                    <p className="text-sm text-gray-600 mb-3">{lot.description}</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Начальная цена лота:</span>
                      <p className="text-sm text-gray-900">{formatPrice(lot.initial_price, lot.currency)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Место поставки:</span>
                      <p className="text-sm text-gray-900">{lot.delivery_place || 'Не указано'}</p>
                    </div>
                  </div>

                  {lot.products.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-2">Товары в лоте:</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Позиция
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Наименование
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Количество
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Единица измерения
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {lot.products.map((product) => (
                              <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {product.position_number || '-'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {product.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {product.quantity || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {product.unit_of_measure || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Организаторы */}
          {tender.organizers.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Организаторы</h2>
              <div className="space-y-4">
                {tender.organizers.map((organizer) => (
                  <div key={organizer.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900">{organizer.organization_name}</h3>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {organizer.contact_person && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Контактное лицо:</span>
                          <p className="text-sm text-gray-900">{organizer.contact_person}</p>
                        </div>
                      )}
                      {organizer.email && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Email:</span>
                          <p className="text-sm text-gray-900">{organizer.email}</p>
                        </div>
                      )}
                      {organizer.phone && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Телефон:</span>
                          <p className="text-sm text-gray-900">{organizer.phone}</p>
                        </div>
                      )}
                      {organizer.inn && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">ИНН:</span>
                          <p className="text-sm text-gray-900">{organizer.inn}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Документы */}
          {tender.documents.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Документы</h2>
              <div className="space-y-2">
                {tender.documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{document.title}</h3>
                      <p className="text-sm text-gray-500">
                        {document.file_size && `${Math.round(document.file_size / 1024)} KB`}
                        {document.file_type && ` • ${document.file_type}`}
                      </p>
                    </div>
                    <a
                      href={`/api/v1/files/${document.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Скачать
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'proposal' && (
        <div className="space-y-6">
          {/* Общие параметры предложения */}
          <div className="bg-white shadow rounded-lg p-6">
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
          <div className="bg-white shadow rounded-lg p-6">
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
            <button
              onClick={() => setActiveTab('info')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmitProposal}
              disabled={submitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Отправка...' : existingProposal ? 'Обновить предложение' : 'Отправить предложение'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


