import { useState, useEffect } from 'react'
import { X, Eye } from 'lucide-react'

export default function ImagePreview({ imageFile, onClear }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [showFull, setShowFull] = useState(false)

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader()
      reader.onload = (e) => setImageUrl(e.target.result)
      reader.readAsDataURL(imageFile)
    }
  }, [imageFile])

  if (!imageUrl) return null

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Visualização da Imagem</h3>
          <button
            onClick={onClear}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="relative bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-center max-h-96 overflow-auto">
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

          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <span>{imageFile.name}</span>
          </div>
        </div>
      </div>

      {showFull && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFull(false)}
        >
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl max-h-screen">
            <button
              onClick={() => setShowFull(false)}
              className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-6 h-6 text-gray-900 dark:text-gray-100" />
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
