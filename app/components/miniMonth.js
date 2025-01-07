import React from 'react';

const MiniMonth = ({ month, monthIndex, year, drinkData, getColorForCount }) => {
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();
  
  const startDay = getFirstDayOfMonth(monthIndex, year);
  const daysInMonth = getDaysInMonth(monthIndex, year);
  
  return (
    <div className="p-2 w-full">
      <span className="text-[2.5vw] font-medium block mb-1 text-black">{month}</span>
      <div className="grid grid-cols-7 gap-[2%]">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-black text-[1.6vw] text-center">{day}</div>
        ))}

        {[...Array(startDay)].map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square"></div>
        ))}
        
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const drinkCount = drinkData[dateStr];
          
          return (
            <div key={i + 1} className="aspect-square">
              <div className={`w-full h-full ${getColorForCount(drinkCount)}`}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniMonth;