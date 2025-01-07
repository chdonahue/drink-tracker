import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MiniMonth from './MiniMonth';
import DayCell from './DayCell';
import getColorForCount from '../utils/colorMapping';

const Calendar = ({ drinkData, onDayClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();
  
  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + direction);
      return newDate;
    });
  };

  const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-white rounded-lg shadow p-4 w-full">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded text-black font-bold"
          >
            <ChevronLeft className="w-6 h-6 stroke-2" />
          </button>
          
          <h2 className="text-[5vw] font-semibold text-black">{monthYear}</h2>
          
          <button 
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded text-black font-bold"
          >
            <ChevronRight className="w-6 h-6 stroke-2" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold p-2 text-[3vw] text-black">
              {day}
            </div>
          ))}
          
          {[...Array(firstDay)].map((_, i) => (
            <div key={`empty-${i}`} className="p-2"></div>
          ))}
          
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const drinkCount = drinkData[dateStr];
            
            return (
                <div key={day} className="relative">
                  <span className="absolute top-1 left-1 text-[2vw] text-black z-10">
                    {day}
                  </span>
                  <DayCell 
                    date={dateStr}
                    count={drinkCount}
                    onValueChange={(date, value) => onDayClick(date, value)}
                  />
                </div>
              );
            })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 w-full">
        <h2 className="text-lg font-semibold mb-4 text-black text-center text-[5vw]">{currentYear} Overview</h2>
        <div className="grid grid-cols-4 gap-4 w-full min-h-[30vh]">
          {months.map((month, index) => (
            <MiniMonth
              key={month}
              month={month}
              monthIndex={index}
              year={currentYear}
              drinkData={drinkData}
              getColorForCount={getColorForCount}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;