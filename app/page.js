'use client';
import { useAuth } from './contexts/AuthContext';
import AuthComponent from './components/Auth';
import Calendar, {getColorForCount} from './components/Calendar';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

export default function Home() {
  const { user } = useAuth();
  const [drinkData, setDrinkData] = useState({});
  const [loading, setLoading] = useState(true);

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

  const handleDayClick = async (date, value) => {
    let numCount = value;
    
    // Optimistically update local state first
    if (value === null) {
      setDrinkData(prev => {
        const newData = { ...prev };
        delete newData[date];
        return newData;
      });
    } else {
      setDrinkData(prev => ({
        ...prev,
        [date]: numCount
      }));
    }
  
    // Then update the database
    try {
      if (value === null) {
        const { error } = await supabase
          .from('drinks')
          .delete()
          .match({ user_id: user.id, date: date });
  
        if (error) throw error;
      } else {
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
      }
    } catch (error) {
      // If database update fails, revert the optimistic update
      console.error('Error saving drink count:', error);
      alert('Failed to save drink count. Please try again.');
      fetchDrinkData();  // Refresh from database
    }
  };

  if (!user) {
    return <AuthComponent />;
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Drink Tracker</h1>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <a 
              href="https://www.buymeacoffee.com/donahuechrw" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-xl">☕</span>
              <span>Buy me a coffee</span>
            </a>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
              }}
              className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
  
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow">
            <Calendar 
              drinkData={drinkData} 
              onDayClick={handleDayClick}
            />
          </div>
  
          {/* Legend */}
          <div className="w-full lg:w-64 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-black">Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-300 rounded"></div>
                <span className="text-black">0 drinks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-400 rounded"></div>
                <span className="text-black">1-2 drinks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-400 rounded"></div>
                <span className="text-black">3-5 drinks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-500 rounded"></div>
                <span className="text-black">6-9 drinks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-neutral-700 rounded"></div>
                <span className="text-black">10+ drinks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}