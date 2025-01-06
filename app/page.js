'use client';
import MiniMonth from '@/components/MiniMonth'; 
import { useAuth } from './contexts/AuthContext';
import AuthComponent from './components/Auth';
import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import html2canvas from 'html2canvas';
import React from 'react';


// Helper functions
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

const exportToJpg = async (element, filename) => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      logging: false,
    });
    
    const image = canvas.toDataURL('image/jpeg', 1.0);
    const link = document.createElement('a');
    link.download = filename;
    link.href = image;
    link.click();
  } catch (error) {
    console.error('Error exporting image:', error);
    alert('Failed to export image. Please try again.');
  }
};

// MiniMonth component
// const MiniMonth = ({ month, monthIndex, year, drinkData }) => {
//   const startDay = getFirstDayOfMonth(monthIndex, year);
//   const daysInMonth = getDaysInMonth(monthIndex, year);
  
//   return (
//     <div className="p-2">
//       <span className="text-xs font-medium block mb-1">{month}</span>
//       <div className="grid grid-cols-7 gap-[1px]">
//         {/* Day labels */}
//         <div className="text-black text-[5px] text-center">S</div>
//         <div className="text-black text-[5px] text-center">M</div>
//         <div className="text-black text-[5px] text-center">T</div>
//         <div className="text-black text-[5px] text-center">W</div>
//         <div className="text-black text-[5px] text-center">T</div>
//         <div className="text-black text-[5px] text-center">F</div>
//         <div className="text-black text-[5px] text-center">S</div>

//         {/* Empty cells */}
//         {[...Array(startDay)].map((_, i) => (
//           <div key={`empty-${i}`} className="w-[6px] h-[6px]"></div>
//         ))}
        
//         {/* Calendar days with spacing and colors */}
//         {[...Array(daysInMonth)].map((_, i) => {
//           const day = i + 1;
//           const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
//           const drinkCount = drinkData[dateStr];
          
//           return (
//             <div
//               key={i + 1}
//               className="w-[6px] h-[6px] cursor-pointer"
//             >
//               <div className={`w-full h-full ${getColorForCount(drinkCount)}`}></div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

const MonthExport = React.forwardRef(({ month, children, isVisible }, ref) => {
  return (
    <div ref={ref} className="relative w-full">
      <div className="flex flex-col gap-2">
        <div className="w-full">
          {children}
        </div>
        <div className="text-xs text-black invisible pb-4 w-full">  {/* Added w-full */}
          <div className="flex justify-center items-center gap-4">  {/* Added justify-center */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-300 translate-y-[7px]"></div>
              <span>0 drinks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 translate-y-[7px]"></div>
              <span>1-2 drinks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-400 translate-y-[7px]"></div>
              <span>3-5 drinks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 translate-y-[7px]"></div>
              <span>6-9 drinks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-neutral-700 translate-y-[7px]"></div>
              <span>10+ drinks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
MonthExport.displayName = 'MonthExport';


export default function Home() {
  const { user } = useAuth();
  const [drinkData, setDrinkData] = useState({});
  const [loading, setLoading] = useState(true);
  const months = [
    'January 2025', 'February 2025', 'March 2025', 'April 2025', 'May 2025', 'June 2025',
    'July 2025', 'August 2025', 'September 2025', 'October 2025', 'November 2025', 'December 2025'
  ];

  const miniMonths = [
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

  

  const monthRefs = useRef({});
  const yearRef = useRef(null);

  const handleExportMonth = async (month, monthIndex) => {
    const monthElement = monthRefs.current[monthIndex];
    if (monthElement) {
      const legendElement = monthElement.querySelector('.text-xs.text-black');
      if (legendElement) {
        legendElement.classList.remove('invisible');
      }
      
      const filename = `${month}.jpg`;
      await exportToJpg(monthElement, filename);
      
      if (legendElement) {
        legendElement.classList.add('invisible');
      }
    }
  };

  const handleExportYear = async () => {
    const yearElement = yearRef.current;
    if (yearElement) {
      const filename = `summary_${currentYear}.jpg`;
      await exportToJpg(yearElement, filename);
    }
  };



  if (!user) {
    return <AuthComponent />;
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex">
       <main className="w-3/4 p-8 overflow-y-auto">
        
       <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Drink Tracker</h1>
          <a href="https://www.buymeacoffee.com/donahuechrw" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors flex items-center gap-2">
            <span className="text-xl">☕</span>
            <span>Buy me a coffee</span>
          </a>
        </div>
        
      
        {months.map((month, monthIndex) => (
  <MonthExport 
    key={month} 
    month={month} 
    isVisible={false}
    ref={el => monthRefs.current[monthIndex] = el}
  >
    <div className="bg-white rounded-lg shadow p-4 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-black">{month}</h2>
        <button
          onClick={() => handleExportMonth(month, monthIndex)}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
        >
          Export Month
        </button>
      </div>
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
  </MonthExport>
))}
      </main>

      <aside className="w-1/4 p-4 fixed right-0 top-0 h-screen bg-gray-50 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-black">{currentYear} Overview</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportYear}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              Export Year
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
              }}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
        <div ref={yearRef} className="bg-white p-4 rounded-lg">
          <div className="grid grid-cols-3 gap-2 auto-rows-min text-black">
            {miniMonths.map((month, index) => (
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
            <div className="flex items-center gap-2 mb-1 text-black">
              <div className="w-3 h-3 bg-green-300"></div>
              <span>0 drinks</span>
            </div>
            <div className="flex items-center gap-2 mb-1 text-black">
              <div className="w-3 h-3 bg-yellow-400"></div>
              <span>1-2 drinks</span>
            </div>
            <div className="flex items-center gap-2 mb-1 text-black">
              <div className="w-3 h-3 bg-orange-400"></div>
              <span>3-5 drinks</span>
            </div>
            <div className="flex items-center gap-2 mb-1 text-black">
              <div className="w-3 h-3 bg-red-500"></div>
              <span>6-9 drinks</span>
            </div>
            <div className="flex items-center gap-2 text-black">
              <div className="w-3 h-3 bg-neutral-700"></div>
              <span>10+ drinks</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}