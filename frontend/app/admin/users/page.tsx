'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Key, 
  Eye, 
  EyeOff,
  UserPlus,
  Shield,
  Building2,
  FileText,
  AlertCircle
} from 'lucide-react'

interface User {
  id: number
  email: string
  full_name: string
  phone?: string
  role: string
  is_active: boolean
  created_at: string
}

interface CreateUserData {
  email: string
  full_name: string
  phone?: string
  role: string
}

export default function UsersManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [createUserData, setCreateUserData] = useState<CreateUserData>({
    email: '',
    full_name: '',
    phone: '',
    role: 'supplier'
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      if (!token) {
        router.push('/login')
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/v1/users/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else if (response.status === 403) {
        setError('Недостаточно прав доступа')
      } else {
        setError('Ошибка загрузки пользователей')
      }
    } catch (err) {
      setError('Ошибка загрузки пользователей')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/v1/users/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createUserData)
      })

      if (response.ok) {
        const newUser = await response.json()
        setUsers([...users, newUser])
        setShowCreateModal(false)
        setCreateUserData({ email: '', full_name: '', phone: '', role: 'supplier' })
        alert(`Пользователь создан! Временный пароль: ${newUser.generated_password}`)
      } else {
        const errorData = await response.json()
        alert(`Ошибка: ${errorData.detail}`)
      }
    } catch (err) {
      alert('Ошибка создания пользователя')
    }
  }

  const handleResetPassword = async (userId: number) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/v1/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNewPassword(data.new_password)
        setShowPasswordModal(true)
      } else {
        alert('Ошибка сброса пароля')
      }
    } catch (err) {
      alert('Ошибка сброса пароля')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/v1/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setUsers(users?.filter(user => user.id !== userId) || [])
        alert('Пользователь удален')
      } else {
        const errorData = await response.json()
        alert(`Ошибка: ${errorData.detail}`)
      }
    } catch (err) {
      alert('Ошибка удаления пользователя')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4 text-red-500" />
      case 'contract_manager': return <FileText className="h-4 w-4 text-blue-500" />
      case 'manager': return <Building2 className="h-4 w-4 text-green-500" />
      case 'supplier': return <UserPlus className="h-4 w-4 text-purple-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор'
      case 'contract_manager': return 'Контрактный управляющий'
      case 'manager': return 'Менеджер'
      case 'supplier': return 'Поставщик'
      default: return role
    }
  }

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !roleFilter || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-secondary-600">Загрузка пользователей...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">Ошибка</h1>
            <p className="text-secondary-600 mb-4">{error}</p>
            <Link href="/dashboard" className="btn-primary">
              Вернуться в дашборд
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">Управление пользователями</h1>
              <p className="mt-2 text-secondary-600">Создание, редактирование и управление пользователями системы</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/admin/import"
                className="btn-secondary flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Импорт тендеров</span>
              </Link>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Добавить пользователя</span>
              </button>
            </div>
          </div>
        </div>

        {/* Фильтры */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Поиск по имени или email
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Введите имя или email..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Фильтр по роли
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Все роли</option>
                <option value="admin">Администратор</option>
                <option value="contract_manager">Контрактный управляющий</option>
                <option value="manager">Менеджер</option>
                <option value="supplier">Поставщик</option>
              </select>
            </div>
          </div>
        </div>

        {/* Таблица пользователей */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Роль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Дата создания
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {filteredUsers?.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-secondary-900">{user.full_name}</div>
                        <div className="text-sm text-secondary-500">{user.email}</div>
                        {user.phone && (
                          <div className="text-sm text-secondary-500">{user.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        <span className="text-sm text-secondary-900">{getRoleText(user.role)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Активен' : 'Заблокирован'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {new Date(user.created_at).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Сбросить пароль"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Удалить пользователя"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Модальное окно создания пользователя */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-secondary-900 mb-4">Создать пользователя</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={createUserData.email}
                    onChange={(e) => setCreateUserData({...createUserData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Полное имя *
                  </label>
                  <input
                    type="text"
                    value={createUserData.full_name}
                    onChange={(e) => setCreateUserData({...createUserData, full_name: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    value={createUserData.phone}
                    onChange={(e) => setCreateUserData({...createUserData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Роль *
                  </label>
                  <select
                    value={createUserData.role}
                    onChange={(e) => setCreateUserData({...createUserData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="supplier">Поставщик</option>
                    <option value="contract_manager">Контрактный управляющий</option>
                    <option value="manager">Менеджер</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-secondary-700 bg-secondary-100 rounded-md hover:bg-secondary-200 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleCreateUser}
                  className="btn-primary"
                >
                  Создать
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно с новым паролем */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-secondary-900 mb-4">Новый пароль</h2>
              
              <div className="mb-4">
                <p className="text-sm text-secondary-600 mb-2">
                  Для пользователя: {selectedUser?.email}
                </p>
                <div className="bg-secondary-50 p-3 rounded-md">
                  <p className="text-lg font-mono text-center">{newPassword}</p>
                </div>
                <p className="text-xs text-secondary-500 mt-2 text-center">
                  Сохраните этот пароль! Он больше не будет показан.
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowPasswordModal(false)
                    setNewPassword('')
                    setSelectedUser(null)
                  }}
                  className="btn-primary"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
