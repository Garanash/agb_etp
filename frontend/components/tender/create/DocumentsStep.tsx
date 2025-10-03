'use client'

import { useState } from 'react'
import { 
  FileText,
  Upload,
  Trash2,
  ArrowLeft,
  Save
} from 'lucide-react'

interface Document {
  id?: number
  title: string
  file_path: string
  file_size?: number
  file_type?: string
  uploaded_at?: string
}

interface DocumentsStepProps {
  data: {
    documents: Document[]
  }
  onChange: (data: any) => void
  onSubmit: () => void
  onBack: () => void
}

export default function DocumentsStep({ data, onChange, onSubmit, onBack }: DocumentsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!data.documents.length) {
      newErrors.documents = 'Добавьте хотя бы один документ'
    }

    data.documents.forEach((doc, index) => {
      if (!doc.title) {
        newErrors[`document_${index}_title`] = 'Название документа обязательно'
      }
      if (!doc.file_path) {
        newErrors[`document_${index}_file`] = 'Файл обязателен'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSubmit()
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('access_token')
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        const newDocument: Document = {
          title: file.name,
          file_path: result.file_path,
          file_size: file.size,
          file_type: file.type,
          uploaded_at: new Date().toISOString()
        }
        onChange({
          ...data,
          documents: [...data.documents, newDocument]
        })
      } else {
        const error = await response.json()
        setErrors({ upload: error.detail || 'Ошибка загрузки файла' })
      }
    } catch (err) {
      setErrors({ upload: 'Ошибка загрузки файла' })
    } finally {
      setUploading(false)
    }
  }

  const removeDocument = (index: number) => {
    const newDocuments = [...data.documents]
    newDocuments.splice(index, 1)
    onChange({ ...data, documents: newDocuments })
  }

  const updateDocument = (index: number, field: keyof Document, value: string) => {
    const newDocuments = [...data.documents]
    newDocuments[index] = { ...newDocuments[index], [field]: value }
    onChange({ ...data, documents: newDocuments })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Б'
    const k = 1024
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">
          Документация
        </h2>
        <p className="text-secondary-600 mb-6">
          Загрузите документы тендера. Необходимо добавить хотя бы один документ.
        </p>
      </div>

      {errors.documents && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{errors.documents}</p>
        </div>
      )}

      {errors.upload && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{errors.upload}</p>
        </div>
      )}

      <div className="space-y-4">
        {data.documents.map((doc, index) => (
          <div 
            key={index}
            className="bg-white border border-secondary-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Название документа *
                  </label>
                  <input
                    type="text"
                    value={doc.title}
                    onChange={(e) => updateDocument(index, 'title', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors[`document_${index}_title`] ? 'border-red-300' : 'border-secondary-300'
                    }`}
                    placeholder="Введите название документа"
                  />
                  {errors[`document_${index}_title`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`document_${index}_title`]}</p>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-secondary-600">
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>{doc.file_path.split('/').pop()}</span>
                  </div>
                  {doc.file_size && (
                    <span>{formatFileSize(doc.file_size)}</span>
                  )}
                  {doc.uploaded_at && (
                    <span>
                      {new Date(doc.uploaded_at).toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeDocument(index)}
                className="text-red-600 hover:text-red-800 transition-colors ml-4"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <label
          htmlFor="file-upload"
          className={`btn-secondary flex items-center space-x-2 cursor-pointer ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Upload className="h-4 w-4" />
          <span>{uploading ? 'Загрузка...' : 'Загрузить документ'}</span>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleFileUpload(file)
              }
            }}
            disabled={uploading}
          />
        </label>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Назад</span>
        </button>
        <button
          onClick={handleSubmit}
          className="btn-primary flex items-center space-x-2"
          disabled={uploading}
        >
          <Save className="h-4 w-4" />
          <span>Создать тендер</span>
        </button>
      </div>
    </div>
  )
}
