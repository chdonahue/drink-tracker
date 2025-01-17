import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import _ from 'lodash';

const WeeklyStats = ({ drinkData }) => {
  // Get the start of the current week (Sunday)
  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday
    const diff = today.getDate() - currentDay;
    const weekStart = new Date(today.setDate(diff));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);
    }
    return dates;
  };

  // Process the data to get average by day of week and current week
  const getStats = () => {
    const dayTotals = {
      0: [], // Sunday
      1: [], // Monday
      2: [], // Tuesday
      3: [], // Wednesday
      4: [], // Thursday
      5: [], // Friday
      6: []  // Saturday
    };

    const currentWeekDates = getCurrentWeekDates();
    const currentWeekData = {
      0: null,
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null
    };

    // Group drink counts by day of week
    Object.entries(drinkData).forEach(([dateStr, count]) => {
      if (count !== null && count !== undefined) {
        // Parse the date and force UTC to avoid timezone shifts
        const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
        const date = new Date(Date.UTC(year, month - 1, day));
        const dayOfWeek = date.getUTCDay();
        
        // Add to historical totals if not in current week
        if (!currentWeekDates.includes(dateStr)) {
          dayTotals[dayOfWeek].push(count);
        }
        
        // If it's current week, store in currentWeekData
        if (currentWeekDates.includes(dateStr)) {
          currentWeekData[dayOfWeek] = count;
        }
      }
    });

    // Calculate averages and format for chart
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames.map((day, index) => {
      const values = dayTotals[index];
      const avg = values.length > 0 
        ? _.round(_.mean(values), 1)
        : 0;
      
      // For current week data, only include up to today if the data exists
      const today = new Date();
      const todayDayOfWeek = today.getDay();
      const current = index <= todayDayOfWeek ? currentWeekData[index] : null;  // Remove the || 0
      
      return {
        day,
        average: avg,
        current: current,
        count: values.length
      };
    });
  };

  const data = getStats();
  
  return (
    <div className="bg-white rounded-lg shadow p-4 w-full">
      <h2 className="text-xl md:text-2xl font-semibold mb-6 text-black text-center">
        Drinks by Day of Week
      </h2>
      
      <div className="w-full h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="day" 
              stroke="#374151"
              tick={{ fill: '#374151' }}
            />
            <YAxis 
              stroke="#374151"
              tick={{ fill: '#374151' }}
              domain={[0, 'auto']}
              label={{ 
                value: 'Drinks', 
                angle: -90, 
                position: 'insideLeft',
                style: {
                  textAnchor: 'middle',
                  fill: '#374151',
                  fontSize: '20px'
                }
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}
              formatter={(value, name) => [
                `${value} drinks`,
                name === 'average' ? `${new Date().getFullYear()} Average` : 'Current Week'
              ]}
              labelFormatter={(label) => `${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="average"
              name={`${new Date().getFullYear()} Average`}
              stroke="#525252"
              strokeWidth={2}
              dot={{
                fill: '#000000',
                stroke: '#fff',
                strokeWidth: 1,
                r: 4
              }}
              activeDot={{
                fill: '#000000',
                stroke: '#fff',
                strokeWidth: 2,
                r: 6
              }}
            />
            <Line
              type="monotone"
              dataKey="current"
              name="Current Week"
              stroke="#ef4444"
              strokeWidth={4}
              dot={{
                fill: '#ef4444',
                stroke: '#fff',
                strokeWidth: 2,
                r: 6
              }}
              activeDot={{
                fill: '#dc2626',
                stroke: '#fff',
                strokeWidth: 2,
                r: 8
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data points table
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Day</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">{new Date().getFullYear()} Avg</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Current Week</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Historical Data Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.day}>
                <td className="px-4 py-2 text-sm text-gray-900">{item.day}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{item.average} drinks</td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {item.current !== null ? `${item.current} drinks` : '—'}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">{item.count} days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}
    </div>
  );
};

export default WeeklyStats;