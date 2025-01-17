import React from 'react';
import _ from 'lodash';

const WeeklyStats = ({ drinkData, selectedDate }) => {
  // Get the year from the selected date, defaulting to current year if not provided
  const selectedYear = selectedDate ? new Date(selectedDate).getFullYear() : new Date().getFullYear();
  
  // Debug logs
  console.log('WeeklyStats render:');
  console.log('- selectedDate:', selectedDate);
  console.log('- selectedYear:', selectedYear);
  
  console.log('Selected Date:', selectedDate);
  console.log('Selected Year:', selectedYear);
  const getCurrentWeekDates = () => {
    const today = new Date();
    // Ensure we're working with UTC dates
    const utcToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const currentDay = new Date(utcToday).getUTCDay();
    const diff = new Date(utcToday).getUTCDate() - currentDay;
    const weekStart = new Date(utcToday);
    weekStart.setUTCDate(diff);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setUTCDate(weekStart.getUTCDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);
    }
    return dates;
  };

  const calculateStats = (values) => {
    if (values.length === 0) return { 
      min: 0, q1: 0, median: 0, q3: 0, max: 0, count: 0 
    };
    
    const sorted = _.sortBy(values);
    
    if (values.length === 1) {
      const value = values[0];
      return {
        min: value,
        q1: value,
        median: value,
        q3: value,
        max: value,
        count: 1
      };
    }
    
    if (values.length === 2) {
      return {
        min: sorted[0],
        q1: sorted[0],
        median: (sorted[0] + sorted[1]) / 2,
        q3: sorted[1],
        max: sorted[1],
        count: 2
      };
    }
    
    const getPercentile = (arr, p) => {
      const pos = (arr.length - 1) * p;
      const base = Math.floor(pos);
      const rest = pos - base;
      if (arr[base + 1] !== undefined) {
        return arr[base] + rest * (arr[base + 1] - arr[base]);
      } else {
        return arr[base];
      }
    };

    return {
      min: sorted[0],
      q1: getPercentile(sorted, 0.25),
      median: getPercentile(sorted, 0.5),
      q3: getPercentile(sorted, 0.75),
      max: sorted[sorted.length - 1],
      count: values.length
    };
  };

  const getStats = () => {
    const dayTotals = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
    };

    const currentWeekDates = getCurrentWeekDates();
    const currentWeekData = {
      0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null
    };

    Object.entries(drinkData).forEach(([dateStr, count]) => {
      if (count !== null && count !== undefined) {
        const date = new Date(dateStr + 'T00:00:00Z');
        const dayOfWeek = date.getUTCDay();
        
        // Only include data from selected year
        if (date.getFullYear() === selectedYear) {
          // Add to historical data for the selected year
          dayTotals[dayOfWeek].push(count);
        }
        
        // Track current week separately for the red dots regardless of year
        if (currentWeekDates.includes(dateStr)) {
          currentWeekData[dayOfWeek] = count;
        }
      }
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames.map((day, index) => {
      const values = dayTotals[index];
      const stats = calculateStats(values);
      const current = currentWeekData[index];
      
      return {
        day,
        ...stats,
        current
      };
    });
  };

  const generateYAxisTicks = (maxValue) => {
    // If maxValue is less than 10, use unit increments
    if (maxValue <= 10) {
      return _.range(0, Math.ceil(maxValue) + 1);
    }
    
    // For larger ranges, generate ~5-7 ticks
    const tickCount = 6;
    const roughStep = maxValue / (tickCount - 1);
    
    // Round step to a nice number
    const magnitudeOfStep = Math.pow(10, Math.floor(Math.log10(roughStep)));
    let step = Math.ceil(roughStep / magnitudeOfStep) * magnitudeOfStep;
    
    // Ensure we don't generate too many ticks for nice numbers like 20
    if ((maxValue / step) > tickCount) {
      step = step * 2;
    }
    
    const ticks = [];
    for (let i = 0; i <= maxValue; i += step) {
      ticks.push(i);
    }
    
    // Add the maxValue if it's not already included
    if (ticks[ticks.length - 1] < maxValue) {
      ticks.push(Math.ceil(maxValue));
    }
    
    return ticks;
  };

  const data = getStats();
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.max || 0, d.current || 0)),
    1  // Ensure we always have a non-zero scale
  );

  // SVG dimensions and scales
  const width = 800;
  const height = 300;
  const margin = { top: -200, right: 30, bottom: 0, left: 100 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Calculate scales with padding
  const yScale = (value) => chartHeight - (value / maxValue) * (chartHeight * 0.9);
  
  return (
    <div className="bg-white p-4 w-full">
      <h2 className="text-xl md:text-2xl font-bold mb-2 text-center text-gray-900">
      {selectedYear}: Drinks by Day of Week
      </h2>
      
      <div className="w-full overflow-x-auto">
        <svg 
          width="100%" 
          height={height} 
          viewBox={`0 0 ${width} ${height}`} 
          className="mx-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Y-axis label */}
            <text
              transform="rotate(-90)"
              x={-chartHeight / 2}
              y={-55}
              textAnchor="middle"
              className="text-3xl font-medium fill-gray-600"
            >
              Number of Drinks
            </text>
            
            {/* Legend */}
            <g transform={`translate(${chartWidth - 100}, -5)`}>
              <path
                  d="M 5 -8 L 13 0 L 5 8 L -3 0 Z"
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth={2}
                />
              <text
                x={15}
                y={0}
                dominantBaseline="middle"
                className="text-base fill-gray-600"
              >
                This Week
              </text>
            </g>

            {/* Y-axis */}
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={chartHeight}
              stroke="#374151"
              strokeWidth={1}
            />
            
            {/* Y-axis ticks and labels */}
            {generateYAxisTicks(maxValue).map((tick) => (
              <g key={tick} transform={`translate(0, ${yScale(tick)})`}>
                <line x1={-5} y1={0} x2={chartWidth} y2={0} stroke="#374151" strokeOpacity={0.1} />
                <text x={-10} y={0} textAnchor="end" dominantBaseline="middle" className="text-2xl fill-gray-600">
                  {tick}
                </text>
              </g>
            ))}
            
            {/* Box plots and current week dots */}
            {data.map((d, i) => {
              const x = (i * (chartWidth / 7)) + (chartWidth / 14);
              
              return (
                <g key={d.day} transform={`translate(${x}, 0)`}>
                  {/* Box plot */}
                  {d.count > 0 && (
                    <>
                      {/* Vertical line (whisker) */}
                      <line
                        x1={0}
                        y1={yScale(d.max)}
                        x2={0}
                        y2={yScale(d.min)}
                        stroke="#374151"
                        strokeWidth={1}
                      />
                      
                      {/* Whisker ends */}
                      <line
                        x1={-10}
                        y1={yScale(d.max)}
                        x2={10}
                        y2={yScale(d.max)}
                        stroke="#374151"
                        strokeWidth={1}
                      />
                      <line
                        x1={-10}
                        y1={yScale(d.min)}
                        x2={10}
                        y2={yScale(d.min)}
                        stroke="#374151"
                        strokeWidth={1}
                      />
                      
                      {/* Box */}
                      <rect
                        x={-20}
                        y={yScale(d.q3)}
                        width={40}
                        height={yScale(d.q1) - yScale(d.q3)}
                        fill="#374151"
                        fillOpacity={0.1}
                        stroke="#374151"
                      />
                      
                      {/* Median line */}
                      <line
                        x1={-20}
                        y1={yScale(d.median)}
                        x2={20}
                        y2={yScale(d.median)}
                        stroke="#374151"
                        strokeWidth={2}
                      />
                    </>
                  )}
                  
                  {/* Current week dot */}
                  {d.current !== null && (
                    <path
                      d={`M ${0} ${yScale(d.current) - 10} 
                          L ${8} ${yScale(d.current)} 
                          L ${0} ${yScale(d.current) + 10} 
                          L ${-8} ${yScale(d.current)} Z`}
                      fill="#ef4444"
                      stroke="black"
                      strokeWidth={2}
                    />
                  )}
                  
                  {/* X-axis label */}
                  <text
                    x={0}
                    y={chartHeight + 45}
                    textAnchor="middle"
                    className="text-3xl font-medium fill-gray-600"
                  >
                    {d.day}
                  </text>
                </g>
              );
            })}
            
          </g>
        </svg>
      </div>
    </div>
  );
};

export default WeeklyStats;