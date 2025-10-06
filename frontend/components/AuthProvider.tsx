'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthToken, removeAuthToken } from '@/lib/auth'

interface User {
  id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = getAuthToken()
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Токен недействителен
        removeAuthToken()
        setUser(null)
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователя:', error)
      removeAuthToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = (token: string, userData: User) => {
    localStorage.setItem('access_token', token)
    setUser(userData)
  }

  const logout = () => {
    removeAuthToken()
    setUser(null)
    router.push('/login')
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}


