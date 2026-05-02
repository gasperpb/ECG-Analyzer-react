import { useState } from 'react'
import { X, Copy, Share2, Mail, MessageCircle, Check } from 'lucide-react'
import { copyShareLink, copySummaryText, shareViaWebShare, generateSummaryText } from '../services/shareService'

export default function ShareModal({ data, onClose }) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('link')

  const handleCopyLink = async () => {
    try {
      setLoading(true)
      await copyShareLink(data)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      alert('Erro ao copiar link')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopySummary = async () => {
    try {
      setLoading(true)
      await copySummaryText(data)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      alert('Erro ao copiar resumo')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleWebShare = async () => {
    try {
      setLoading(true)
      await shareViaWebShare(data)
    } catch (error) {
      if (error.message === 'Web Share API não suportada') {
        alert('Compartilhamento não suportado neste navegador. Use a opção de copiar link.')
      } else {
        console.error(error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmailShare = () => {
    try {
      const summary = generateSummaryText(data)
      const subject = 'Relatório ECG Analyzer - Análise de ECG'
      const body = encodeURIComponent(summary)
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${body}`)
    } catch (error) {
      alert('Erro ao abrir email')
      console.error(error)
    }
  }

  const handleWhatsAppShare = () => {
    try {
      const summary = generateSummaryText(data)
      const text = encodeURIComponent(summary)
      window.open(`https://wa.me/?text=${text}`, '_blank')
    } catch (error) {
      alert('Erro ao abrir WhatsApp')
      console.error(error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-medical-600 dark:text-medical-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Compartilhar Resultados</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-3 px-4 font-semibold text-center transition-all ${
              activeTab === 'link'
                ? 'text-medical-600 dark:text-medical-500 border-b-2 border-medical-600 dark:border-medical-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Link
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-3 px-4 font-semibold text-center transition-all ${
              activeTab === 'text'
                ? 'text-medical-600 dark:text-medical-500 border-b-2 border-medical-600 dark:border-medical-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Resumo
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`flex-1 py-3 px-4 font-semibold text-center transition-all ${
              activeTab === 'apps'
                ? 'text-medical-600 dark:text-medical-500 border-b-2 border-medical-600 dark:border-medical-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Apps
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'link' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Copie o link abaixo para compartilhar este relatório:
              </p>
              <button
                onClick={handleCopyLink}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
                  copied
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-800'
                    : 'bg-medical-50 dark:bg-medical-950/30 text-medical-600 dark:text-medical-400 border border-medical-200 dark:border-medical-800 hover:bg-medical-100 dark:hover:bg-medical-950/50'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    {loading ? 'Copiando...' : 'Copiar Link'}
                  </>
                )}
              </button>
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Previewar:</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 truncate font-mono">
                  {window.location.origin}/...shared=...
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                💡 Você pode compartilhar este link com profissionais de saúde ou colegas
              </p>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Copie um resumo em texto para compartilhar:
              </p>
              <button
                onClick={handleCopySummary}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
                  copied
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-800'
                    : 'bg-medical-50 dark:bg-medical-950/30 text-medical-600 dark:text-medical-400 border border-medical-200 dark:border-medical-800 hover:bg-medical-100 dark:hover:bg-medical-950/50'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    {loading ? 'Copiando...' : 'Copiar Resumo'}
                  </>
                )}
              </button>
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg max-h-48 overflow-y-auto">
                <p className="text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {generateSummaryText(data)}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                📝 Perfeito para compartilhar em chats, emails ou mensagens
              </p>
            </div>
          )}

          {activeTab === 'apps' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Compartilhe com aplicativos:
              </p>

              {navigator.share && (
                <button
                  onClick={handleWebShare}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                  {loading ? 'Compartilhando...' : 'Compartilhar (Sistema)'}
                </button>
              )}

              <button
                onClick={handleWhatsAppShare}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold text-white bg-[#25D366] hover:bg-[#20ba5a] transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </button>

              <button
                onClick={handleEmailShare}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold text-white bg-[#EA4335] hover:bg-[#d33e2f] transition-all"
              >
                <Mail className="w-5 h-5" />
                Email
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4">
                ℹ️ Selecione a conta e o destinatário no aplicativo que abrir
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
