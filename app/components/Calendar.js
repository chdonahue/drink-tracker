import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MiniMonth from './MiniMonth';
import DayCell from './DayCell';
import getColorForCount from '../utils/colorMapping';
import YearlyCalendarExport from './YearlyCalendarExport';


const Calendar = ({ drinkData, onDayClick, onMonthChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();
  
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(1);  // Ensure the first day of the month
    newDate.setMonth(newDate.getMonth() + direction);
    
    setCurrentDate(newDate);
  
    if (onMonthChange) {
      onMonthChange(newDate.toISOString().split('T')[0]);
    }
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

  const handleMonthChange = ({ activeStartDate }) => {
    // activeStartDate will be the first date visible in the new month view
    onMonthChange(activeStartDate.toISOString().split('T')[0]);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Monthly view export container */}
      <div className="calendar-export-container space-y-8">
        {/* Main Calendar */}
        <div className="bg-white rounded-lg shadow p-4 w-full">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded text-black font-bold"
            >
              <ChevronLeft className="w-6 h-6 stroke-2" />
            </button>
            
            <h2 className="text-2xl md:text-3xl font-semibold text-black">{monthYear}</h2>
            
            <button 
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded text-black font-bold"
            >
              <ChevronRight className="w-6 h-6 stroke-2" />
            </button>
          </div>
  
          <div className="grid grid-cols-7 gap-x-1.5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold p-2 text-sm md:text-base text-black">
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
                  <span className="absolute top-1 left-1 text-xs md:text-sm text-black z-10">
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
  
        {/* Legend */}
        <div className="w-full bg-white rounded-lg shadow-lg py-3 px-4">
          <h3 className="text-sm font-semibold mb-2 text-black">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-green-300 rounded"></div>
              <span className="text-black text-xs">0 drinks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span className="text-black text-xs">1-2 drinks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-orange-400 rounded"></div>
              <span className="text-black text-xs">3-5 drinks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-black text-xs">6-9 drinks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-neutral-700 rounded"></div>
              <span className="text-black text-xs">10+ drinks</span>
            </div>
          </div>
        </div>
      </div>
  
      {/* Yearly view export container (hidden by default) */}
      <YearlyCalendarExport
        year={currentYear}
        drinkData={drinkData}
        getColorForCount={getColorForCount}
      />
  
      {/* Mini Calendar (not part of export) */}
      <div className="bg-white rounded-lg shadow p-4 w-full">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-black text-center">
          {currentYear} Overview
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full">
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
     {/* Weekly Stats */}
      {/* <WeeklyStats drinkData={drinkData} /> */}
    </div>
  );
};

export default Calendar;