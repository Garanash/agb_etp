'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../components/AuthProvider'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true)
    setSubmitMessage('')
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const tokenData = await response.json()
        
        // Получаем данные пользователя
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        })
        
        if (userResponse.ok) {
          const userData = await userResponse.json()
          login(tokenData.access_token, userData)
          setSubmitMessage('Вход выполнен успешно!')
          // Перенаправление в личный кабинет
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 1000)
        } else {
          setSubmitMessage('Ошибка получения данных пользователя')
        }
      } else {
        const errorData = await response.json()
        setSubmitMessage(`Ошибка: ${errorData.detail}`)
      }
    } catch (error) {
      setSubmitMessage('Произошла ошибка при входе. Попробуйте позже.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <LogIn className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Вход в систему
          </h1>
          <p className="text-secondary-600">
            Войдите в свой аккаунт для доступа к платформе
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="email"
                  {...register('email', { required: 'Email обязателен' })}
                  className="input-field pl-10"
                  placeholder="example@company.ru"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Пароль обязателен' })}
                  className="input-field pl-10 pr-10"
                  placeholder="Введите пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-700">
                  Запомнить меня
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="text-primary-600 hover:text-primary-500">
                  Забыли пароль?
                </Link>
              </div>
            </div>

            {submitMessage && (
              <div className={`p-4 rounded-lg ${
                submitMessage.includes('успешно') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {submitMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-secondary-600">
              Нет аккаунта?{' '}
              <Link href="/register" className="text-primary-600 hover:text-primary-500 font-medium">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
