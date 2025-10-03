'use client'

import { 
  FileText,
  Download
} from 'lucide-react'

interface TenderDocumentsProps {
  documents: Array<{
    id: number
    title: string
    file_path: string
    file_size?: number
    file_type?: string
    uploaded_at: string
  }>
}

export default function TenderDocuments({ documents }: TenderDocumentsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const units = ['Б', 'КБ', 'МБ', 'ГБ']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div 
          key={doc.id}
          className="flex items-center justify-between p-4 bg-white border border-secondary-200 rounded-lg hover:border-primary-300 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <FileText className="h-6 w-6 text-secondary-400" />
            <div>
              <h3 className="text-sm font-medium text-secondary-900">{doc.title}</h3>
              <p className="text-xs text-secondary-500">
                {formatDate(doc.uploaded_at)}
                {doc.file_size && ` • ${formatFileSize(doc.file_size)}`}
                {doc.file_type && ` • ${doc.file_type}`}
              </p>
            </div>
          </div>
          <a
            href={doc.file_path}
            download
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Скачать</span>
          </a>
        </div>
      ))}

      {documents.length === 0 && (
        <div className="text-center py-8 text-secondary-600">
          Нет доступных документов
        </div>
      )}
    </div>
  )
}
