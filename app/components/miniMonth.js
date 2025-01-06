'use client';
import React from 'react';

// Helper functions (moved from page.js)
const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (month, year) => {
  return new Date(year, month, 1).getDay();
};

const getColorForCount = (count) => {
  if (count === undefined) return 'bg-gray-200';
  if (count >= 10) return 'bg-neutral-700';
  if (count >= 6) return 'bg-red-500';
  if (count >= 3) return 'bg-orange-400';
  if (count >= 1) return 'bg-yellow-400';
  if (count >= 0) return 'bg-green-300';
  return 'bg-gray-100';
};

const MiniMonth = ({ month, monthIndex, year, drinkData }) => {
  const startDay = getFirstDayOfMonth(monthIndex, year);
  const daysInMonth = getDaysInMonth(monthIndex, year);
  
  return (
    <div className="p-2 w-full">
      <div className="grid">
        <div className="h-6 flex items-center justify-start">
          <span className="text-[1vw] md:text-[0.8vw] lg:text-[0.6vw] font-medium truncate">
            {month.split(' ')[0]}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-[2%] aspect-square w-full">
        {/* Day labels */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={day + i} className="text-black text-[0.8vw] md:text-[0.6vw] lg:text-[0.5vw] text-center">{day}</div>
        ))}

        {/* Empty cells */}
        {[...Array(startDay)].map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square"></div>
        ))}
        
        {/* Calendar days */}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const drinkCount = drinkData[dateStr];
          
          return (
            <div
              key={i + 1}
              className="aspect-square relative"
            >
              <div className={`absolute inset-0 ${getColorForCount(drinkCount)}`}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniMonth;