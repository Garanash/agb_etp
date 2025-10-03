'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BasicInfoStep from '@/components/tender/create/BasicInfoStep'
import OrganizersStep from '@/components/tender/create/OrganizersStep'
import LotsStep from '@/components/tender/create/LotsStep'
import DocumentsStep from '@/components/tender/create/DocumentsStep'
import { FileText, Building2, Package, Upload } from 'lucide-react'

const STEPS = [
  { id: 'basic', title: 'Основные сведения', icon: FileText },
  { id: 'organizers', title: 'Организаторы', icon: Building2 },
  { id: 'lots', title: 'Лоты', icon: Package },
  { id: 'documents', title: 'Документация', icon: Upload }
]

export default function CreateTenderPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState('basic')
  const [formData, setFormData] = useState({
    // Основные сведения
    title: '',
    description: '',
    notice_number: '',
    initial_price: undefined as number | undefined,
    currency: 'RUB',
    deadline: '',
    okpd_code: '',
    okved_code: '',
    region: '',
    procurement_method: '',
    // Организаторы
    organizers: [],
    // Лоты
    lots: [],
    // Документы
    documents: []
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }
  }, [])

  const handleStepChange = (step: string) => {
    setCurrentStep(step)
  }

  const handleDataChange = (data: any) => {
    setFormData({ ...formData, ...data })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tenders/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const tender = await response.json()
        router.push(`/tenders/${tender.id}`)
      } else {
        const error = await response.json()
        setError(error.detail || 'Ошибка создания тендера')
      }
    } catch (err) {
      setError('Ошибка создания тендера')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentStepIndex = () => {
    return STEPS.findIndex(step => step.id === currentStep)
  }

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id)
    }
  }

  const handleBack = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id)
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary-900">
            Создание тендера
          </h1>
          <p className="mt-2 text-secondary-600">
            Заполните необходимую информацию для создания нового тендера
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Прогресс */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {STEPS?.map((step, index) => {
              const StepIcon = step.icon
              const isCurrent = step.id === currentStep
              const isCompleted = getCurrentStepIndex() > index
              const isClickable = index <= getCurrentStepIndex()

              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center relative z-10 ${
                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                  onClick={() => isClickable && handleStepChange(step.id)}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCurrent
                        ? 'bg-primary-600 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-white border-2 border-secondary-300 text-secondary-300'
                    }`}
                  >
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <div className="mt-2 text-sm font-medium text-secondary-900">
                    {step.title}
                  </div>
                </div>
              )
            })}
            {/* Линия прогресса */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-secondary-200">
              <div
                className="h-full bg-primary-600 transition-all duration-300"
                style={{
                  width: `${(getCurrentStepIndex() / (STEPS.length - 1)) * 100}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Шаги */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          {currentStep === 'basic' && (
            <BasicInfoStep
              data={formData}
              onChange={handleDataChange}
              onNext={handleNext}
            />
          )}
          {currentStep === 'organizers' && (
            <OrganizersStep
              data={formData}
              onChange={handleDataChange}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 'lots' && (
            <LotsStep
              data={formData}
              onChange={handleDataChange}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 'documents' && (
            <DocumentsStep
              data={formData}
              onChange={handleDataChange}
              onSubmit={handleSubmit}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  )
}