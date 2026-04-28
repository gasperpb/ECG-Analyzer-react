import React from 'react'
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
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500 text-center">
          Nenhum dado disponível para exibição
        </p>
      </div>
    )
  }

  // Cria labels para o eixo X (tempo em segundos)
  const labels = data.map((_, index) => {
    const time = (index / 250).toFixed(2) // Assumindo 250 Hz de sample rate
    return time
  })

  // Limita a quantidade de pontos exibidos para melhor performance
  const samplingRate = Math.max(1, Math.floor(data.length / 1000))
  const filteredData = data.filter((_, i) => i % samplingRate === 0)
  const filteredLabels = labels.filter((_, i) => i % samplingRate === 0)

  const chartData = {
    labels: filteredLabels,
    datasets: [
      {
        label: 'ECG (mV)',
        data: filteredData,
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.05)',
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
          font: { size: 12, weight: 'bold' }
        }
      },
      title: {
        display: true,
        text: title,
        font: { size: 16, weight: 'bold' },
        padding: 20
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
          font: { weight: 'bold' }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Tempo (segundos)',
          font: { weight: 'bold' }
        },
        grid: {
          display: false
        }
      }
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <Line data={chartData} options={options} height={300} />
    </div>
  )
}
