import React from 'react'
import { Heart, Activity } from 'lucide-react'

export default function Header({ onNavigation }) {
  return (
    <header className="bg-white shadow-lg border-b-4 border-medical-600">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
            onClick={() => onNavigation('dashboard')}
          >
            <div className="p-3 bg-gradient-to-br from-medical-600 to-red-600 rounded-full">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-medical-600 to-red-600 bg-clip-text text-transparent">
                ECG Analyzer
              </h1>
              <p className="text-gray-600 text-sm font-medium">
                Sistema de Análise Cardíaca Inteligente
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-medical-600">
            <Activity className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-semibold">Sistema Online</span>
          </div>
        </div>
      </div>
    </header>
  )
}
