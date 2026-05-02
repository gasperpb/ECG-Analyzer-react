import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Analyzer from './pages/Analyzer'
import Results from './pages/Results'
import History from './pages/History'
import Header from './components/Header'
import Navigation from './components/Navigation'
import Onboarding from './components/Onboarding'
import { useHistory } from './hooks/useHistory'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [analysisResults, setAnalysisResults] = useState(null)
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState(null)
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const { saveToHistory } = useHistory()

  const handleAnalysisComplete = (results) => {
    setAnalysisResults(results)
    saveToHistory(results)
    setCurrentPage('results')
  }

  const handleViewAnalysis = (entry) => {
    setSelectedHistoryEntry(entry.fullData || entry)
    setCurrentPage('results')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />
      case 'analyzer':
        return <Analyzer onAnalysisComplete={handleAnalysisComplete} />
      case 'results':
        return <Results 
          data={selectedHistoryEntry || analysisResults} 
          onBack={() => {
            setSelectedHistoryEntry(null)
            setCurrentPage(selectedHistoryEntry ? 'history' : 'dashboard')
          }} 
        />
      case 'history':
        return <History onViewAnalysis={handleViewAnalysis} />
      default:
        return <Dashboard onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 transition-colors">
      <Header onNavigation={setCurrentPage} />
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>
      {!onboardingComplete && <Onboarding onComplete={() => setOnboardingComplete(true)} />}
    </div>
  )
}

export default App
