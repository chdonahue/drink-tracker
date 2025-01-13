import React from 'react';
import MiniMonth from './MiniMonth';

const YearlyCalendarExport = ({ year, drinkData, getColorForCount }) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="yearly-export-container hidden">
      <div className="bg-white p-4 max-w-4xl mx-auto">
        <h2 className="text-2xl text-center mb-4 text-black">
          {year} Overview
        </h2>
        
        <div className="grid grid-cols-3 gap-4">
          {months.map((month, index) => (
            <div key={month} className="bg-white">
              {/* Adding font-bold to month name */}
              <span className="text-sm md:text-base block mb-1 text-black">{month}</span>
              <div className="grid grid-cols-7 gap-0.5 p-0.5">
                {/* Adding font-bold to day labels and reducing bottom margin */}
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-black text-center text-[0.6rem] mb-0.5">{day}</div>
                ))}
                
                {[...Array(getFirstDayOfMonth(index, year))].map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square"></div>
                ))}
                
                {[...Array(getDaysInMonth(index, year))].map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(index + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const drinkCount = drinkData[dateStr];
                  
                  return (
                    <div key={i + 1} className="aspect-square">
                      <div className={`w-full h-full ${getColorForCount(drinkCount)}`}></div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

            {/* Legend */}
            <div className="mt-6">
                <h3 className="text-sm font-semibold mb-2 text-black">Legend</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-green-300 rounded translate-y-2"></div>
                    <span className="text-black text-xs">0 drinks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-yellow-400 rounded translate-y-2"></div>
                    <span className="text-black text-xs">1-2 drinks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-orange-400 rounded translate-y-2"></div>
                    <span className="text-black text-xs">3-5 drinks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-red-500 rounded translate-y-2"></div>
                    <span className="text-black text-xs">6-9 drinks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-neutral-700 rounded translate-y-2"></div>
                    <span className="text-black text-xs">10+ drinks</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

// Helper functions for date calculations
const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

export default YearlyCalendarExport;