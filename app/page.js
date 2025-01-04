'use client';
import { useAuth } from './contexts/AuthContext';
import AuthComponent from './components/Auth';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// Keep your existing helper functions
const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (month, year) => {
  return new Date(year, month, 1).getDay();
};

const getColorForCount = (count) => {
  if (count === undefined) return 'bg-gray-200';
  if (count >= 10) return 'bg-black';
  if (count >= 7) return 'bg-red-500';
  if (count >= 4) return 'bg-orange-300';
  if (count >= 2) return 'bg-yellow-200';
  if (count >= 0) return 'bg-green-300';
  return 'bg-gray-100';
};

// Keep your MiniMonth component
const MiniMonth = ({ month, monthIndex, year, drinkData }) => {
  const startDay = getFirstDayOfMonth(monthIndex, year);
  const daysInMonth = getDaysInMonth(monthIndex, year);
  
  return (
    <div className="p-2">
      <span className="text-xs font-medium block mb-1">{month}</span>
      <div className="grid grid-cols-7 gap-y-[2px]">
        {/* Day labels */}
        <div className="text-black text-[6px] text-center">S</div>
        <div className="text-black text-[6px] text-center">M</div>
        <div className="text-black text-[6px] text-center">T</div>
        <div className="text-black text-[6px] text-center">W</div>
        <div className="text-black text-[6px] text-center">T</div>
        <div className="text-black text-[6px] text-center">F</div>
        <div className="text-black text-[6px] text-center">S</div>

        {/* Empty cells */}
        {[...Array(startDay)].map((_, i) => (
          <div key={`empty-${i}`} className="w-[8px] h-[8px]"></div>
        ))}
        
        {/* Calendar days with spacing and colors */}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const drinkCount = drinkData[dateStr];
          
          return (
            <div
              key={i + 1}
              className="w-[8px] h-[8px] cursor-pointer"
            >
              <div className={`w-full h-full ${getColorForCount(drinkCount)}`}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function Home() {
  const { user } = useAuth();
  const [drinkData, setDrinkData] = useState({});
  const [loading, setLoading] = useState(true);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentYear = new Date().getFullYear();

  // Fetch existing data when component loads
  useEffect(() => {
    if (user) {
      fetchDrinkData();
    }
  }, [user]);

  const fetchDrinkData = async () => {
    try {
      const { data, error } = await supabase
        .from('drinks')
        .select('date, count')
        .eq('user_id', user.id);

      if (error) throw error;

      // Convert array of records to object format
      const formattedData = {};
      data.forEach(record => {
        formattedData[record.date] = record.count;
      });

      setDrinkData(formattedData);
    } catch (error) {
      console.error('Error fetching drink data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = async (date) => {
    const count = prompt('Enter number of drinks:');
    if (count === null) return;
    
    const numCount = parseInt(count);
    if (isNaN(numCount) || numCount < 0) {
      alert('Please enter a valid positive number');
      return;
    }

    try {
      const { error } = await supabase
        .from('drinks')
        .upsert({ 
          user_id: user.id,
          date: date,
          count: numCount
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;

      // Update local state after successful save
      setDrinkData(prev => ({
        ...prev,
        [date]: numCount
      }));
    } catch (error) {
      console.error('Error saving drink count:', error);
      alert('Failed to save drink count. Please try again.');
    }
  };

  if (!user) {
    return <AuthComponent />;
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Your existing return statement
  return (
    <div className="min-h-screen flex">
      <main className="w-3/4 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">{currentYear} Drink Tracker</h1>
        
        {months.map((month, monthIndex) => (
          <div key={month} className="bg-white rounded-lg shadow p-4 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-black">{month}</h2>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold p-2 text-sm text-black">
                  {day}
                </div>
              ))}
              
              {[...Array(getFirstDayOfMonth(monthIndex, currentYear))].map((_, i) => (
                <div key={`empty-${i}`} className="p-2"></div>
              ))}
              
              {[...Array(getDaysInMonth(monthIndex, currentYear))].map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const drinkCount = drinkData[dateStr];
                
                return (
                  <div
                    key={day}
                    onClick={() => handleDayClick(dateStr)}
                    className={`aspect-square border text-center hover:bg-gray-50 cursor-pointer relative group ${getColorForCount(drinkCount)}`}
                  >
                    <span className="absolute top-1 left-1 text-black text-[16px]">
                      {day}
                    </span>
                    {/* Tooltip on hover */}
                    {drinkCount !== undefined && (
                      <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white transition-opacity">
                        {drinkCount}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>

      <aside className="w-1/4 p-4 fixed right-0 top-0 h-screen bg-gray-50 flex flex-col">
        <h2 className="text-lg font-bold mb-4 text-black">{currentYear} Overview</h2>
        <div className="grid grid-cols-3 gap-2 auto-rows-min text-black">
          {months.map((month, index) => (
            <MiniMonth 
              key={month}
              month={month}
              monthIndex={index}
              year={currentYear}
              drinkData={drinkData}
            />
          ))}
        </div>
        {/* Legend */}
        <div className="mt-4 text-xs text-black">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-gray-200"></div>
            <span>N/A</span>
          </div>
          <div className="flex items-center gap-2 mb-1 text-black">
            <div className="w-3 h-3 bg-green-300"></div>
            <span>0-1 drinks</span>
          </div>
          <div className="flex items-center gap-2 mb-1 text-black">
            <div className="w-3 h-3 bg-yellow-200"></div>
            <span>2-3 drinks</span>
          </div>
          <div className="flex items-center gap-2 mb-1 text-black">
            <div className="w-3 h-3 bg-orange-300"></div>
            <span>4-6 drinks</span>
          </div>
          <div className="flex items-center gap-2 mb-1 text-black">
            <div className="w-3 h-3 bg-red-500"></div>
            <span>7-10</span>
          </div>
          <div className="flex items-center gap-2 text-black">
            <div className="w-3 h-3 bg-black"></div>
            <span>10+</span>
          </div>
        </div>
      </aside>
    </div>
  );
}