'use client';
import { useAuth } from './contexts/AuthContext';
import AuthComponent from './components/Auth';
import Calendar, {getColorForCount} from './components/Calendar';
import ShareButton from './components/ShareButton';
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
          <div className="flex justify-between w-full items-center">
            <h1 className="text-2xl font-bold">Drink Tracker</h1>
            <div className="flex gap-2">
              <ShareButton />
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
          <a 
            href="https://www.buymeacoffee.com/donahuechrw" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-xl">☕</span>
            <span>Buy me a coffee</span>
          </a>
        </div>
  
        {/* Main Content */}
        <div className="w-full">
          <Calendar 
            drinkData={drinkData} 
            onDayClick={handleDayClick}
          />
        </div>
      </div>
    </div>
  );
}