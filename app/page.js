'use client';
import { useAuth } from './contexts/AuthContext';
import AuthComponent from './components/Auth';
import Calendar from './components/Calendar';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

const getColorForCount = (count) => {
  if (count === undefined) return 'bg-gray-200';
  if (count >= 10) return 'bg-neutral-700';
  if (count >= 6) return 'bg-red-500';
  if (count >= 3) return 'bg-orange-400';
  if (count >= 1) return 'bg-yellow-400';
  if (count >= 0) return 'bg-green-300';
  return 'bg-gray-100';
};

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

  return (
    <div className="min-h-screen flex">
      <div className="flex-grow p-8 pr-72">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Drink Tracker</h1>
          <div className="flex gap-4">
            <a 
              href="https://www.buymeacoffee.com/donahuechrw" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors flex items-center gap-2"
            >
              <span className="text-xl">☕</span>
              <span>Buy me a coffee</span>
            </a>
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

        <Calendar 
          drinkData={drinkData} 
          onDayClick={handleDayClick}
        />
      </div>

      <div className="fixed right-0 top-0 w-64 h-screen bg-white shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-black">Legend</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-300"></div>
            <span className="text-black">0 drinks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-400"></div>
            <span className="text-black">1-2 drinks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-400"></div>
            <span className="text-black">3-5 drinks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500"></div>
            <span className="text-black">6-9 drinks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-neutral-700"></div>
            <span className="text-black">10+ drinks</span>
          </div>
        </div>
      </div>
    </div>
  );
}