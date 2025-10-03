'use client'

import { useState } from 'react'
import { X, DollarSign, MessageSquare, Save } from 'lucide-react'

interface ApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  tender: {
    id: number
    title: string
    initial_price: number | null
    currency: string
  }
  onSubmit: (data: { proposed_price: number; comment: string }) => void
}

export default function ApplicationModal({ isOpen, onClose, tender, onSubmit }: ApplicationModalProps) {
  const [proposedPrice, setProposedPrice] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!proposedPrice || parseFloat(proposedPrice) <= 0) {
      setError('Укажите корректную цену')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        proposed_price: parseFloat(proposedPrice),
        comment: comment.trim()
      })
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Ошибка при подаче заявки')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setProposedPrice('')
    setComment('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <h2 className="text-xl font-semibold text-secondary-900">
            Подача заявки
          </h2>
          <button
            onClick={handleClose}
            className="text-secondary-400 hover:text-secondary-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              {tender.title}
            </h3>
            {tender.initial_price && (
              <p className="text-secondary-600">
                Начальная цена: {new Intl.NumberFormat('ru-RU').format(tender.initial_price)} {tender.currency}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Ваша цена *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                  className="input-field pl-10"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Комментарий
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-secondary-400" />
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="input-field pl-10"
                  rows={4}
                  placeholder="Дополнительная информация о вашем предложении..."
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isSubmitting ? 'Отправка...' : 'Подать заявку'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
