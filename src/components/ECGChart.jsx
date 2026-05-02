import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function ECGChart({ data, title = 'Gráfico de ECG' }) {
  if (!data || !data.length) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Nenhum dado disponível para exibição
        </p>
      </div>
    )
  }

  const labels = data.map((_, index) => {
    const time = (index / 250).toFixed(2)
    return time
  })

  const samplingRate = Math.max(1, Math.floor(data.length / 1000))
  const filteredData = data.filter((_, i) => i % samplingRate === 0)
  const filteredLabels = labels.filter((_, i) => i % samplingRate === 0)

  const isDark = document.documentElement.classList.contains('dark')

  const chartData = {
    labels: filteredLabels,
    datasets: [
      {
        label: 'ECG (mV)',
        data: filteredData,
        borderColor: '#0ea5e9',
        backgroundColor: isDark ? 'rgba(14, 165, 233, 0.1)' : 'rgba(14, 165, 233, 0.05)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointBackgroundColor: '#0284c7',
        pointBorderColor: '#0284c7',
        pointHoverRadius: 6,
        pointHoverBorderWidth: 2,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12, weight: 'bold' },
          color: isDark ? '#d1d5db' : '#374151'
        }
      },
      title: {
        display: true,
        text: title,
        font: { size: 16, weight: 'bold' },
        padding: 20,
        color: isDark ? '#f3f4f6' : '#111827'
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${context.raw.toFixed(3)} mV`
          },
          title: function(context) {
            return `${context[0].label}s`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Voltagem (mV)',
          font: { weight: 'bold' },
          color: isDark ? '#9ca3af' : '#4b5563'
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#4b5563'
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Tempo (segundos)',
          font: { weight: 'bold' },
          color: isDark ? '#9ca3af' : '#4b5563'
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#4b5563'
        },
        grid: {
          display: false
        }
      }
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <Line data={chartData} options={options} height={300} />
    </div>
  )
}
