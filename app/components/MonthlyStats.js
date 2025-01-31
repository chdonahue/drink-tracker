import React from 'react';
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, ReferenceLine } from 'recharts';
import _ from 'lodash';

const MonthlyStats = ({ drinkData, selectedDate, weeklyGoal }) => {
  // Use local timezone when parsing the selected date
  const selectedYear = selectedDate ? 
    new Date(selectedDate + 'T00:00:00').getFullYear() : 
    new Date().getFullYear();

  const calculateMonthlyAverages = () => {
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      return {
        month: new Date(0, i).toLocaleString('default', { month: 'short' }),
        average: null
      };
    });

    const groupedByMonth = _.groupBy(Object.entries(drinkData), ([date]) => {
      const dateObj = new Date(date + 'T00:00:00');
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    });

    const monthlyAverages = Object.entries(groupedByMonth).map(([yearMonth, entries]) => {
      const [year, month] = yearMonth.split('-');
      
      if (parseInt(year) !== selectedYear) return null;
      
      const daysWithData = entries.length;
      // Only calculate average if we have at least 5 days of data
      if (daysWithData < 5) return null;
      
      const totalDrinks = _.sumBy(entries, ([_, count]) => count);
      const averagePerWeek = (totalDrinks / daysWithData) * 7;

      return {
        yearMonth,
        month: new Date(0, parseInt(month) - 1).toLocaleString('default', { month: 'short' }),
        average: Math.round(averagePerWeek * 10) / 10
      };
    });

    const calculatedAverages = monthlyAverages
      .filter(item => item !== null)
      .reduce((acc, item) => {
        const [year, month] = item.yearMonth.split('-');
        const monthIndex = parseInt(month) - 1;
        acc[monthIndex] = item;
        return acc;
      }, {});

    return allMonths.map((baseMonth, index) => {
      const calculatedValue = calculatedAverages[index];
      return {
        month: baseMonth.month,
        average: calculatedValue ? calculatedValue.average : null
      };
    });
  };

  const data = calculateMonthlyAverages();
  const maxValue = Math.max(...data.map(d => d.average || 0 || 1.05*weeklyGoal));
  const yAxisMax = Math.ceil(maxValue * 1.05);
  const yAxisTicks = _.range(0, yAxisMax + 3, 3);

  return (
    <div className="bg-white p-4 w-full">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-center text-gray-900">
        Monthly ({selectedYear})
      </h2>
      <div className="w-full" style={{ height: "300px" }}>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 0, left: 0, bottom: 70 }}
            height={300}
            legend={{ verticalAlign: 'top', height: 36 }}
          >
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 14 }}
              padding={{ left: 30, right: 30 }}
              interval={0}
              angle={-90}
              dy={10}
              dx={-5}
              textAnchor="end"
            />
            <YAxis
              tick={{ fontSize: 14 }}
              label={{ 
                value: 'Drinks per Week', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 14 },
                dy: 40
              }}
              domain={[0, yAxisMax]}
              allowDataOverflow={false}
              ticks={yAxisTicks}
            />
            {weeklyGoal !== null && (
              <ReferenceLine 
                y={weeklyGoal} 
                stroke="#4b5563" 
                strokeDasharray="3 3"
                name="Weekly Goal"
                label={{
                  value: `Goal: ${weeklyGoal}`,
                  position: 'right',
                  fill: '#4b5563'
                
                }}
              />
              
            )}
            <Bar
              dataKey="average"
              name="average-bar"
              fill="#e5e7eb"
              stroke="#000000"
              strokeWidth={1}
              radius={[4, 4, 0, 0]}
            />
            <Line 
              type="linear" 
              dataKey="average" 
              name="Average Drinks per Week"
              stroke="#ef4444" 
              strokeWidth={3}
              dot={{ r: 6 }}
              activeDot={{ r: 8 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const value = payload[0].value;
                  const monthName = payload[0].payload.month;
                  return (
                    <div className="bg-white p-2 border border-gray-200">
                      <p>{monthName}</p>
                      <p className="text-red-500">Weekly Average: {value} drinks</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyStats;