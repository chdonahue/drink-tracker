import React from 'react';
import _ from 'lodash';
import { getUserTimeZone, getLocalDateString, getStartOfWeek } from '../utils/time';


const WeeklyStats = ({ drinkData, selectedDate }) => {
  // Use local timezone when parsing the selected date
  const selectedYear = selectedDate ? 
    new Date(selectedDate + 'T00:00:00').getFullYear() : 
    new Date().getFullYear();
  // Debug logs
  console.log('WeeklyStats render:');
  console.log('- selectedDate:', selectedDate);
  console.log('- selectedYear:', selectedYear);
  
  console.log('Selected Date:', selectedDate);
  console.log('Selected Year:', selectedYear);
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
      // Format the date string to match the format in drinkData
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      dates.push(dateStr);
    }
    
    // Debug
    console.log('Generated dates:', dates);
    console.log('Sample from drinkData:', Object.keys(drinkData).slice(0, 3));
    
    return dates;
  };

  const calculateStats = (values) => {
    if (values.length === 0) return { 
      min: 0, 
      mean: 0, 
      std: 0,
      count: 0,
      boxMin: 0,
      boxMax: 0,
      whiskerMin: 0,
      whiskerMax: 0
    };
    
    const mean = _.sum(values) / values.length;
    
    // If all values are the same, std will be 0
    const allSame = values.every(v => v === values[0]);
    if (allSame) {
      return {
        min: values[0],
        mean: values[0],
        std: 0,
        count: values.length,
        boxMin: values[0],
        boxMax: values[0],
        whiskerMin: values[0],
        whiskerMax: values[0]
      };
    }
    
    // Calculate standard deviation
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const std = Math.sqrt(_.sum(squareDiffs) / values.length);
    
    // Ensure we don't go below 0 for any values
    return {
      min: Math.min(...values),
      mean: mean,
      std: std,
      count: values.length,
      boxMin: Math.max(0, mean - std),
      boxMax: mean + std,
      whiskerMin: Math.max(0, mean - 2 * std),
      whiskerMax: mean + 2 * std
    };    
    // const getPercentile = (arr, p) => {
    //   const pos = (arr.length - 1) * p;
    //   const base = Math.floor(pos);
    //   const rest = pos - base;
    //   if (arr[base + 1] !== undefined) {
    //     return arr[base] + rest * (arr[base + 1] - arr[base]);
    //   } else {
    //     return arr[base];
    //   }
    // };

    // return {
    //   min: sorted[0],
    //   q1: getPercentile(sorted, 0.25),
    //   median: getPercentile(sorted, 0.5),
    //   q3: getPercentile(sorted, 0.75),
    //   max: sorted[sorted.length - 1],
    //   count: values.length
    // };
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
        // Add time to ensure consistent date parsing
        const date = new Date(dateStr + 'T12:00:00');
        const dayOfWeek = date.getDay();
        
        if (currentWeekDates.includes(dateStr)) {
          currentWeekData[dayOfWeek] = count;
        } else if (date.getFullYear() === selectedYear) {
          dayTotals[dayOfWeek].push(count);
        }
      }
    });
    
    // After processing, log the current week data
    console.log('Current week data:', currentWeekData);
    

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
    ...data.map(d => Math.max(
      d.whiskerMax || 0,  // Consider the whisker max (mean + 2*std)
      d.current || 0      // Consider current week's value
    )),
    1  // Ensure we always have a non-zero scale
  );

  // SVG dimensions and scales
  const width = 800;
  const height = 500;
  const margin = { top: 50, right: 30, bottom: 50, left: 100 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Calculate scales with padding
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
            {/* All existing SVG elements remain exactly the same */}
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
                Current Week
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
                        y1={yScale(d.whiskerMax)}
                        x2={0}
                        y2={yScale(d.whiskerMin)}
                        stroke="#374151"
                        strokeWidth={1}
                      />
                      
                      {/* Whisker ends */}
                      <line
                        x1={-10}
                        y1={yScale(d.whiskerMax)}
                        x2={10}
                        y2={yScale(d.whiskerMax)}
                        stroke="#374151"
                        strokeWidth={1}
                      />
                      <line
                        x1={-10}
                        y1={yScale(d.whiskerMin)}
                        x2={10}
                        y2={yScale(d.whiskerMin)}
                        stroke="#374151"
                        strokeWidth={1}
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
                  
                  {/* Current week dot
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
                    
                  )} */}
                  
                  
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
            {/* Connecting line for current week values */}
            <path
              d={data.reduce((path, d, i) => {
                const x = (i * (chartWidth / 7)) + (chartWidth / 14);
                const today = new Date();
                const dayIndex = today.getDay();
                
                // Only include points up to current day of week
                if (d.current === null || i > dayIndex) return path;
                
                return path + `${path ? 'L' : 'M'} ${x} ${yScale(d.current)}`;
              }, '')}
              stroke="#ef4444"
              strokeWidth={4}
              fill="none"
            />

            {/* Current week dots (rendered last to be on top) */}
            {data.map((d, i) => {
              const x = (i * (chartWidth / 7)) + (chartWidth / 14);
              const today = new Date();
              const dayIndex = today.getDay();
              
              // Only show dots up to current day of week
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