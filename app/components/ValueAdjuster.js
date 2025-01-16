'use client';

import React, { useState, useEffect } from 'react';
import getColorForCount from '../utils/colorMapping';

const ValueAdjuster = ({ initialValue = null, onValueChange, onClose }) => {
    const [currentValue, setCurrentValue] = useState(initialValue);
    const [touchStart, setTouchStart] = useState(null);
    const [startValue, setStartValue] = useState(0);
    const [isClearing, setIsClearing] = useState(initialValue === null);
  
  useEffect(() => {
    console.log('State changed:', {
      currentValue,
      startValue,
      isClearing,
      touchStart
    });
  }, [currentValue, startValue, isClearing, touchStart]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    // Only set non-null values
    if (initialValue !== null) {
      setCurrentValue(Math.min(initialValue, 99)); // Ensure initial value doesn't exceed 99
      setStartValue(Math.min(initialValue, 99));
      setIsClearing(false);
    }
  }, [initialValue]);

  const triggerHaptic = (duration = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    setTouchStart(e.touches[0].clientY);
    setStartValue(currentValue ?? 0);
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    
    e.preventDefault();
    const currentTouch = e.touches[0].clientY;
    const diff = touchStart - currentTouch;
    const sensitivity = 15; 
    
    if (isClearing) {
      // Only consider upward swipes when clearing
      if (diff > 0) {
        // Exit clearing state but stay at 0
        setIsClearing(false);
        setCurrentValue(0);
      }
      return;
    }
    
    // Normal value adjustment when not clearing
    const valueChange = Math.floor(diff / sensitivity);
    const computedValue = Math.min(99, Math.max(0, startValue + valueChange)); // Limit between 0 and 99
    
    if (computedValue === 0 && valueChange < 0) {
      triggerHaptic(20);
      setIsClearing(true);
      setCurrentValue(null);
    } else {
      if (computedValue !== currentValue) {
        triggerHaptic(50);
      }
      setCurrentValue(computedValue);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
    onValueChange(isClearing ? null : currentValue);
  };

  const handleTap = (e) => {
    e.stopPropagation();
    if (isClearing) {
      triggerHaptic(20);
      setIsClearing(false);
      setCurrentValue(0);
      onValueChange(0);
    } else {
      triggerHaptic(8);
      const newValue = Math.min(99, (currentValue ?? 0) + 1); // Limit increment to 99
      if (newValue === 99) {
        triggerHaptic(100); // Longer vibration to indicate max value
      }
      setCurrentValue(newValue);
      onValueChange(newValue);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center touch-none"
      onClick={onClose}
    >
      <button 
        className={`w-64 h-64 rounded-xl ${isClearing ? 'bg-gray-500' : getColorForCount(currentValue)} 
          flex flex-col items-center justify-center transition-colors duration-200`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleTap}
      >
        <div className="text-6xl font-bold text-white">
          {isClearing ? '—' : currentValue ?? 0}
        </div>
        <div className="text-white mt-4 opacity-50">
          {isClearing ? 'Tap or swipe up to adjust' : 'Tap or swipe up/down to adjust'}
        </div>
        {currentValue === 99 && !isClearing && (
          <div className="text-white mt-2 opacity-75">Maximum value reached</div>
        )}
        <div className="text-white mt-2 opacity-50">Tap outside to close</div>
      </button>
    </div>
  );
};

export default ValueAdjuster;