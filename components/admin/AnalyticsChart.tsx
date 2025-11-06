// @ts-nocheck
'use client';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface AnalyticsChartProps {
  data: DataPoint[];
  title?: string;
  type?: 'bar' | 'line';
  height?: number;
}

export default function AnalyticsChart({ data, title, type = 'bar', height = 300 }: AnalyticsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-yellow-500',
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}

      <div className="relative" style={{ height: `${height}px` }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-500 text-right pr-2">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="absolute left-14 right-0 top-0 bottom-8">
          <div className="h-full flex items-end justify-around gap-2">
            {data.map((point, index) => {
              const percentage = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
              const color = point.color || colors[index % colors.length];

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  {/* Bar */}
                  <div className="w-full flex flex-col items-center">
                    <div className="text-xs font-semibold text-gray-700 mb-1">
                      {point.value}
                    </div>
                    <div
                      className={`w-full ${color} rounded-t transition-all duration-500 hover:opacity-80`}
                      style={{ height: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none">
            {[0, 25, 50, 75, 100].map((percent) => (
              <div
                key={percent}
                className="absolute w-full border-t border-gray-200"
                style={{ bottom: `${percent}%` }}
              />
            ))}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="absolute left-14 right-0 bottom-0 flex justify-around">
          {data.map((point, index) => (
            <div
              key={index}
              className="flex-1 text-center text-xs text-gray-600 truncate px-1"
              title={point.label}
            >
              {point.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple pie chart component
export function PieChart({ data, title }: { data: DataPoint[]; title?: string }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}

      <div className="flex items-center gap-6">
        {/* Simple bar representation instead of actual pie */}
        <div className="flex-1">
          <div className="w-full h-8 flex rounded-lg overflow-hidden">
            {data.map((point, index) => {
              const percentage = total > 0 ? (point.value / total) * 100 : 0;
              const color = point.color || colors[index % colors.length];

              return (
                <div
                  key={index}
                  className={`${color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                  title={`${point.label}: ${point.value} (${percentage.toFixed(1)}%)`}
                />
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {data.map((point, index) => {
            const percentage = total > 0 ? (point.value / total) * 100 : 0;
            const color = point.color || colors[index % colors.length];

            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className={`w-3 h-3 rounded ${color}`} />
                <span className="text-gray-700">
                  {point.label}: <span className="font-semibold">{point.value}</span>
                  <span className="text-gray-500 ml-1">({percentage.toFixed(1)}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
