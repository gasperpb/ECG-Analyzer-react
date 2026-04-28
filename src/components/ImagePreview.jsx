import React, { useState } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'

export default function ImagePreview({ imageFile, onClear }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [showFull, setShowFull] = useState(false)

  React.useEffect(() => {
    if (imageFile) {
      const reader = new FileReader()
      reader.onload = (e) => setImageUrl(e.target.result)
      reader.readAsDataURL(imageFile)
    }
  }, [imageFile])

  if (!imageUrl) return null

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Visualização da Imagem</h3>
          <button
            onClick={onClear}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="relative bg-gray-50 rounded-lg p-4 flex items-center justify-center max-h-96 overflow-auto">
          <img
            src={imageUrl}
            alt="ECG preview"
            className="max-h-96 max-w-full object-contain rounded"
          />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setShowFull(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-medical-600 hover:bg-medical-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <Eye className="w-5 h-5" />
            Ver em Tamanho Completo
          </button>

          <div className="text-sm text-gray-600 flex items-center px-4 py-2 bg-gray-50 rounded-lg">
            <span>{imageFile.name}</span>
          </div>
        </div>
      </div>

      {showFull && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFull(false)}
        >
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-screen">
            <button
              onClick={() => setShowFull(false)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={imageUrl}
              alt="ECG fullscreen"
              className="max-w-4xl max-h-screen object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}
