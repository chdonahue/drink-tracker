'use client';
import { useAuth } from './contexts/AuthContext';
import AuthComponent from './components/Auth';
import Calendar, {getColorForCount} from './components/Calendar';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import ShareButtons from './components/ShareButtons';
import WeeklyStats from './components/WeeklyStats';
import MonthlyStats from './components/MonthlyStats';
import TabGroup from './components/TabGroup';
import GoalSetter from './components/GoalSetter';

export default function Home() {
  const { user } = useAuth();
  const [drinkData, setDrinkData] = useState({});
  const [weeklyGoal, setWeeklyGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('weekly');

  useEffect(() => {
    if (user) {
      fetchDrinkData();
      fetchWeeklyGoal();
    }
  }, [user]);

  const fetchWeeklyGoal = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('weekly_goal')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
      setWeeklyGoal(data?.weekly_goal ?? null);
    } catch (error) {
      console.error('Error fetching weekly goal:', error);
    }
  };

  const handleGoalChange = async (newGoal) => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({ 
          user_id: user.id,
          weekly_goal: newGoal
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      setWeeklyGoal(newGoal);
    } catch (error) {
      console.error('Error saving weekly goal:', error);
      alert('Failed to save weekly goal. Please try again.');
      fetchWeeklyGoal();  // Refresh from database
    }
  };

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
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Drink Tracker</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">Weekly Goal:</span>
              <GoalSetter 
                value={weeklyGoal}
                onChange={handleGoalChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 w-full gap-4">
            <div className="col-span-2">
              <ShareButtons />
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
              }}
              className="w-full px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
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
        <div className="w-full space-y-8">
          <Calendar 
            drinkData={drinkData} 
            onDayClick={handleDayClick}
            onMonthChange={(date) => setSelectedDate(date)}
          />
          <TabGroup 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          {activeTab === 'weekly' ? (
            <WeeklyStats 
              drinkData={drinkData} 
              selectedDate={selectedDate}
              weeklyGoal={weeklyGoal}
            />
          ) : (
            <MonthlyStats 
              drinkData={drinkData}
              selectedDate={selectedDate}
              weeklyGoal={weeklyGoal}
            />
          )}
        </div>
      </div>
    </div>
  );
}