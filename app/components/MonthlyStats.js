import React from 'react';
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar } from 'recharts';
import _ from 'lodash';

const MonthlyStats = ({ drinkData, selectedDate }) => {
  const selectedYear = selectedDate ? new Date(selectedDate).getFullYear() : new Date().getFullYear();

  const calculateMonthlyAverages = () => {
    // Initialize array for all months
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      return {
        month: new Date(0, i).toLocaleString('default', { month: 'short' }),
        average: null
      };
    });

    // Group drinks by year and month
    const groupedByMonth = _.groupBy(Object.entries(drinkData), ([date]) => {
      const [year, month] = date.split('-');
      return `${year}-${month}`;
    });

    // Calculate average drinks per week for each month
    const monthlyAverages = Object.entries(groupedByMonth).map(([yearMonth, entries]) => {
      const [year, month] = yearMonth.split('-');
      
      // Only process data for the selected year
      if (parseInt(year) !== selectedYear) return null;
      
      // Sum all drinks in the month
      const totalDrinks = _.sumBy(entries, ([_, count]) => count);
      
      // Count number of days with data
      const daysWithData = entries.length;
      
      // Calculate weekly average
      const averagePerWeek = (totalDrinks / daysWithData) * 7;

      return {
        yearMonth,
        month: new Date(0, parseInt(month) - 1).toLocaleString('default', { month: 'short' }),
        average: Math.round(averagePerWeek * 10) / 10
      };
    });

    // Merge calculated averages with the base array of all months
    const calculatedAverages = monthlyAverages
      .filter(item => item !== null)
      .reduce((acc, item) => {
        const [year, month] = item.yearMonth.split('-');
        const monthIndex = parseInt(month) - 1;  // Month is 1-based, convert to 0-based
        acc[monthIndex] = item;
        return acc;
      }, {});

    // Return array with all months, using calculated values where available
    return allMonths.map((baseMonth, index) => {
      const calculatedValue = calculatedAverages[index];
      return {
        month: baseMonth.month,
        average: calculatedValue ? calculatedValue.average : null
      };
    });
  };

  const data = calculateMonthlyAverages();
  const maxValue = Math.max(...data.map(d => d.average || 0));
  const yAxisMax = Math.ceil(maxValue * 1.05);
  const yAxisTicks = _.range(0, yAxisMax + 3, 3);  // Generate ticks from 0 to max in steps of 3

  return (
    <div className="bg-white p-4 w-full">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-center text-gray-900">
        {selectedYear}: Average Drinks per Week by Month
      </h2>
      <div className="w-full" style={{ height: "300px" }}>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 50, bottom: 70 }}
            height={300}
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
                dy: 40  // Add dy to center the label
              }}
              domain={[0, yAxisMax]}
              allowDataOverflow={false}
              ticks={yAxisTicks}
            />
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
              name="Weekly Average"
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