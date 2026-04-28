import React, { useState, useRef } from 'react'
import { Upload, FileCheck, AlertCircle } from 'lucide-react'

export default function FileUpload({ onFileSelect, loading = false, supportedFormats = ['.csv', '.json', '.ecg', '.png', '.jpg', '.jpeg', '.bmp'] }) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()

    if (file.size > maxSize) {
      setError('Arquivo muito grande. Máximo: 10MB')
      return false
    }

    if (!supportedFormats.includes(fileExtension)) {
      setError(`Formato inválido. Suportados: ${supportedFormats.join(', ')}`)
      return false
    }

    return true
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    setError('')
    
    if (validateFile(file)) {
      setSelectedFile(file)
      onFileSelect(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleChange}
        accept={supportedFormats.join(',')}
        className="hidden"
        disabled={loading}
      />

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-8 cursor-pointer transition-all text-center
          ${dragActive 
            ? 'border-medical-600 bg-medical-50' 
            : 'border-gray-300 bg-gray-50 hover:border-medical-600 hover:bg-medical-50'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {!selectedFile ? (
          <>
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Arraste ou clique para fazer upload
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Formatos suportados: {supportedFormats.join(', ')}
            </p>
            <p className="text-gray-500 text-xs">
              Máximo: 10MB
            </p>
          </>
        ) : (
          <>
            <FileCheck className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedFile.name}
            </h3>
            <p className="text-gray-600 text-sm">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedFile(null)
                setError('')
              }}
              className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-medical-600 font-medium"
            >
              Trocar arquivo
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-300 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
