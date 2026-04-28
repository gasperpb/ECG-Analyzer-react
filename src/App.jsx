import React, { useState } from 'react'
import { Heart } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Analyzer from './pages/Analyzer'
import Results from './pages/Results'
import Header from './components/Header'
import Navigation from './components/Navigation'
import DebugHelper from './components/DebugHelper'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [analysisResults, setAnalysisResults] = useState(null)

  const handleAnalysisComplete = (results) => {
    setAnalysisResults(results)
    setCurrentPage('results')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />
      case 'analyzer':
        return <Analyzer onAnalysisComplete={handleAnalysisComplete} />
      case 'results':
        return <Results data={analysisResults} onBack={() => setCurrentPage('dashboard')} />
      default:
        return <Dashboard onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-blue-50">
      <Header onNavigation={setCurrentPage} />
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>
      
      {/* Debug Helper - Visible during development */}
      <DebugHelper isOpen={false} />
    </div>
  )
}

export default App
