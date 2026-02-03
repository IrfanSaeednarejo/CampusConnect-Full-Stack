import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import IconButton from '../common/IconButton';
import Badge from '../common/Badge';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Advanced Analytics Widget Component with multiple chart types and interactive features
 */
const AnalyticsWidget = ({
  title,
  subtitle,
  data,
  type = 'line',
  height = 300,
  showLegend = true,
  showGrid = true,
  animate = true,
  timeRange = '7d',
  onTimeRangeChange,
  loading = false,
  error = null,
  className = '',
  ...props
}) => {
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chartData, setChartData] = useState(null);

  // Time range options
  const timeRanges = [
    { label: '24h', value: '1d' },
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
    { label: '90d', value: '90d' },
    { label: '1y', value: '1y' }
  ];

  // Process data based on type
  useEffect(() => {
    if (!data) return;

    const processedData = {
      labels: data.labels || [],
      datasets: []
    };

    if (type === 'line' || type === 'area') {
      processedData.datasets = data.datasets?.map((dataset, index) => ({
        ...dataset,
        fill: type === 'area',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        backgroundColor: dataset.backgroundColor || `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
        borderColor: dataset.borderColor || `hsl(${(index * 137.5) % 360}, 70%, 50%)`
      })) || [];
    } else if (type === 'bar') {
      processedData.datasets = data.datasets?.map((dataset, index) => ({
        ...dataset,
        backgroundColor: dataset.backgroundColor || `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
        borderColor: dataset.borderColor || `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false
      })) || [];
    } else if (type === 'doughnut' || type === 'pie') {
      processedData.datasets = data.datasets?.map((dataset) => ({
        ...dataset,
        backgroundColor: dataset.backgroundColor || [
          '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
          '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6B7280'
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverBorderWidth: 3
      })) || [];
    }

    setChartData(processedData);
  }, [data, type]);

  // Chart options based on type
  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12
        }
      },
      scales: type !== 'doughnut' && type !== 'pie' ? {
        x: {
          display: true,
          grid: {
            display: showGrid,
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            font: {
              size: 12
            }
          }
        },
        y: {
          display: true,
          grid: {
            display: showGrid,
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            font: {
              size: 12
            },
            beginAtZero: true
          }
        }
      } : undefined,
      animation: animate ? {
        duration: 1000,
        easing: 'easeInOutQuart'
      } : false
    };

    return baseOptions;
  };

  // Render chart based on type
  const renderChart = () => {
    if (!chartData) return null;

    const chartProps = {
      data: chartData,
      options: getChartOptions(),
      height: height
    };

    switch (type) {
      case 'line':
      case 'area':
        return <Line {...chartProps} />;
      case 'bar':
        return <Bar {...chartProps} />;
      case 'doughnut':
      case 'pie':
        return <Doughnut {...chartProps} />;
      default:
        return <Line {...chartProps} />;
    }
  };

  // Metric selector for multi-dataset charts
  const renderMetricSelector = () => {
    if (!data?.datasets || data.datasets.length <= 1) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedMetric('all')}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            selectedMetric === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Metrics
        </button>
        {data.datasets.map((dataset, index) => (
          <button
            key={index}
            onClick={() => setSelectedMetric(index.toString())}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedMetric === index.toString()
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {dataset.label}
          </button>
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <motion.div
        className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex items-center space-x-3">
          <span className="material-symbols-outlined text-red-500">error</span>
          <div>
            <h3 className="text-sm font-medium text-red-800">Analytics Error</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Time Range Selector */}
          {onTimeRangeChange && (
            <div className="flex rounded-lg border border-gray-200 p-1">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => onTimeRangeChange(range.value)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    timeRange === range.value
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <IconButton
            icon="fullscreen"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-gray-400 hover:text-gray-600"
          />

          <IconButton
            icon="more_vert"
            size="sm"
            className="text-gray-400 hover:text-gray-600"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {renderMetricSelector()}

        <div style={{ height: height }} className="relative">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            renderChart()
          )}
        </div>
      </div>

      {/* Footer with insights */}
      {data?.insights && (
        <div className="px-6 pb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Key Insights</h4>
            <ul className="space-y-1">
              {data.insights.map((insight, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                  <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">check_circle</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Preset chart configurations
AnalyticsWidget.Presets = {
  userGrowth: {
    title: 'User Growth',
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'New Users',
        data: [65, 59, 80, 81, 56, 55]
      }]
    }
  },

  eventAttendance: {
    title: 'Event Attendance',
    type: 'bar',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Attendees',
        data: [120, 150, 180, 200]
      }]
    }
  },

  societyDistribution: {
    title: 'Society Distribution',
    type: 'doughnut',
    data: {
      labels: ['Tech', 'Arts', 'Sports', 'Academic', 'Social'],
      datasets: [{
        data: [30, 25, 20, 15, 10]
      }]
    }
  }
};

AnalyticsWidget.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string),
    datasets: PropTypes.arrayOf(PropTypes.object),
    insights: PropTypes.arrayOf(PropTypes.string)
  }),
  type: PropTypes.oneOf(['line', 'area', 'bar', 'doughnut', 'pie']),
  height: PropTypes.number,
  showLegend: PropTypes.bool,
  showGrid: PropTypes.bool,
  animate: PropTypes.bool,
  timeRange: PropTypes.string,
  onTimeRangeChange: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string
};

export default AnalyticsWidget;