import React from 'react'

export default function Loading({ message = 'Carregando...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-medical-600 border-r-medical-600 animate-spin"></div>
      </div>
      <p className="text-gray-600 font-medium text-center">{message}</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  )
}
