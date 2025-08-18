'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, ChartOptions, ChartData, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface PriceChartProps {
  data: {
    date: string
    price: number
    confidence: number
    volume: number
  }[]
}

const PriceChart = ({ data }: PriceChartProps) => {
  const chartRef = useRef<ChartJS<'line'>>(null)

  const chartData = {
    labels: data.map(item => new Date(item.date).toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric' 
    })),
    datasets: [
      {
        label: 'Price per Quintal (₹)',
        data: data.map(item => item.price),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Confidence Level (%)',
        data: data.map(item => item.confidence * 20), // Scale confidence to price range
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y1',
      }
    ]
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 600,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#4f46e5',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            if (label.includes('Confidence')) {
              return `${label}: ${value}%`
            }
            return `${label}: ₹${value}`
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          color: '#6b7280',
          font: {
            size: 12,
            weight: 600,
          },
        },
        grid: {
          color: '#e5e7eb',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Price (₹/quintal)',
          color: '#6b7280',
          font: {
            size: 12,
            weight: 600,
          },
        },
        grid: {
          color: '#e5e7eb',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
          callback: function(value) {
            return '₹' + value
          }
        },
      },
    },
  }

  return (
    <div className="w-full h-80">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  )
}

export default PriceChart
