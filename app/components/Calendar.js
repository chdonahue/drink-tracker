import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';


const getColorForCount = (count) => {
    if (count === undefined) return 'bg-gray-200';
    if (count >= 10) return 'bg-neutral-700';
    if (count >= 6) return 'bg-red-500';
    if (count >= 3) return 'bg-orange-400';
    if (count >= 1) return 'bg-yellow-400';
    if (count >= 0) return 'bg-green-300';
    return 'bg-gray-100';
  };

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
  
    return (
      <div className="bg-white rounded-lg shadow p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 text-black rounded"
          >
            <ChevronLeft className="w-6 h-6 stroke-2" />
          </button>
          
          <h2 className="text-xl font-semibold text-black">{monthYear}</h2>
          
          <button 
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 text-black rounded"
          >
            <ChevronRight className="w-6 h-6 stroke-2" />
          </button>
        </div>
  
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold p-2 text-sm text-black">
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
              <div
                key={day}
                onClick={() => onDayClick(dateStr)}
                className={`aspect-square border text-center hover:bg-gray-50 cursor-pointer relative group ${getColorForCount(drinkCount)}`}
              >
                <span className="absolute top-1 left-1 text-sm text-black">
                  {day}
                </span>
                {drinkCount !== undefined && (
                  <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white transition-opacity">
                    <span className="text-2xl font-bold">
                      {drinkCount}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  export default Calendar;