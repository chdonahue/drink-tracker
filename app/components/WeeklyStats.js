import React from 'react';
import _ from 'lodash';
import { getUserTimeZone, getLocalDateString, getStartOfWeek } from '../utils/time';

const WeeklyStats = ({ drinkData, selectedDate }) => {
  const selectedYear = selectedDate ? 
    new Date(selectedDate + 'T00:00:00').getFullYear() : 
    new Date().getFullYear();

  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = today.getDate() - currentDay;
    const weekStart = new Date(today);
    weekStart.setDate(diff);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      dates.push(dateStr);
    }
    return dates;
  };

  const calculateStats = (values) => {
    if (values.length === 0) return { 
      mean: 0, 
      std: 0,
      count: 0,
      boxMin: 0,
      boxMax: 0,
      maxValue: 0
    };
    
    const mean = _.sum(values) / values.length;
    const maxValue = Math.max(...values);
    
    // If all values are the same
    const allSame = values.every(v => v === values[0]);
    if (allSame) {
      return {
        mean: values[0],
        std: 0,
        count: values.length,
        boxMin: values[0],
        boxMax: values[0],
        maxValue: values[0]
      };
    }
    
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const std = Math.sqrt(_.sum(squareDiffs) / values.length);
    
    return {
      mean: mean,
      std: std,
      count: values.length,
      boxMin: Math.max(0, mean - std),
      boxMax: mean + std,
      maxValue: maxValue
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
        const date = new Date(dateStr + 'T12:00:00');
        const dayOfWeek = date.getDay();
        
        if (currentWeekDates.includes(dateStr)) {
          currentWeekData[dayOfWeek] = count;
        } else if (date.getFullYear() === selectedYear) {
          dayTotals[dayOfWeek].push(count);
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
    if (maxValue <= 10) {
      return _.range(0, Math.ceil(maxValue) + 1);
    }
    
    const tickCount = 6;
    const roughStep = maxValue / (tickCount - 1);
    const magnitudeOfStep = Math.pow(10, Math.floor(Math.log10(roughStep)));
    let step = Math.ceil(roughStep / magnitudeOfStep) * magnitudeOfStep;
    
    if ((maxValue / step) > tickCount) {
      step = step * 2;
    }
    
    const ticks = [];
    for (let i = 0; i <= maxValue; i += step) {
      ticks.push(i);
    }
    
    if (ticks[ticks.length - 1] < maxValue) {
      ticks.push(Math.ceil(maxValue));
    }
    
    return ticks;
  };

  const data = getStats();
  const maxValue = Math.max(
    ...data.map(d => Math.max(
      d.maxValue || 0,
      d.current || 0
    )),
    1
  );

  const width = 800;
  const height = 500;
  const margin = { top: 50, right: 30, bottom: 50, left: 100 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  const yScale = (value) => chartHeight - (value / maxValue) * (chartHeight * 0.9);
  
  return (
    <div className="bg-white p-4 w-full">
      <h2 className="text-xl md:text-2xl font-bold mb-2 text-center text-gray-900">
         Day of Week ({selectedYear})
      </h2>
      
      <div className="w-full relative" style={{ minHeight: "400px" }}>
        <svg 
          width="100%" 
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            <text
              transform="rotate(-90)"
              x={-chartHeight / 2}
              y={-55}
              textAnchor="middle"
              className="text-3xl font-medium fill-gray-600"
            >
              Number of Drinks
            </text>
            
            <g transform={`translate(${chartWidth - 100}, -15)`}>
              <path
                d="M 0 -8 L 8 0 L 0 8 L -8 0 Z"
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
                Current Week
              </text>
              
              <path
                d="M 0,20 L 2,26 8,26 4,30 6,36 0,32 -6,36 -4,30 -8,26 -2,26 Z"
                fill="#374151"
                stroke="none"
              />
              <text
                x={15}
                y={30}
                dominantBaseline="middle"
                className="text-base fill-gray-600"
              >
                Max
              </text>
            </g>

            <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#374151" strokeWidth={1} />
            
            {generateYAxisTicks(maxValue).map((tick) => (
              <g key={tick} transform={`translate(0, ${yScale(tick)})`}>
                <line x1={-5} y1={0} x2={chartWidth} y2={0} stroke="#374151" strokeOpacity={0.1} />
                <text x={-10} y={0} textAnchor="end" dominantBaseline="middle" className="text-2xl fill-gray-600">
                  {tick}
                </text>
              </g>
            ))}
            
            {data.map((d, i) => {
              const x = (i * (chartWidth / 7)) + (chartWidth / 14);
              
              return (
                <g key={d.day} transform={`translate(${x}, 0)`}>
                  {d.count > 0 && (
                    <>
                      {/* Max value star */}
                      <path
                        d="M 0,-8 L 2,-2 8,-2 4,2 6,8 0,4 -6,8 -4,2 -8,-2 -2,-2 Z"
                        transform={`translate(0,${yScale(d.maxValue)})`}
                        fill="#374151"
                        stroke="none"
                      />
                      
                      {/* Box (±1 STD) */}
                      <rect
                        x={-20}
                        y={yScale(d.boxMax)}
                        width={40}
                        height={yScale(d.boxMin) - yScale(d.boxMax)}
                        fill="#374151"
                        fillOpacity={0.1}
                        stroke="#374151"
                      />
                      
                      {/* Mean line */}
                      <line
                        x1={-20}
                        y1={yScale(d.mean)}
                        x2={20}
                        y2={yScale(d.mean)}
                        stroke="#374151"
                        strokeWidth={2}
                      />
                    </>
                  )}
                  
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

            <path
              d={data.reduce((path, d, i) => {
                const x = (i * (chartWidth / 7)) + (chartWidth / 14);
                const today = new Date();
                const dayIndex = today.getDay();
                
                if (d.current === null || i > dayIndex) return path;
                
                return path + `${path ? 'L' : 'M'} ${x} ${yScale(d.current)}`;
              }, '')}
              stroke="#ef4444"
              strokeWidth={4}
              fill="none"
            />

            {data.map((d, i) => {
              const x = (i * (chartWidth / 7)) + (chartWidth / 14);
              const today = new Date();
              const dayIndex = today.getDay();
              
              if (d.current === null || i > dayIndex) return null;
              
              return (
                <path
                  key={`current-${d.day}`}
                  d={`M ${x} ${yScale(d.current) - 10} 
                      L ${x + 8} ${yScale(d.current)} 
                      L ${x} ${yScale(d.current) + 10} 
                      L ${x - 8} ${yScale(d.current)} Z`}
                  fill="#ef4444"
                  stroke="black"
                  strokeWidth={2}
                />
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default WeeklyStats;