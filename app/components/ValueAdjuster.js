'use client';

import React, { useState, useEffect } from 'react';
import getColorForCount from '../utils/colorMapping';

const ValueAdjuster = ({ initialValue = 0, onValueChange, onClose }) => {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [touchStart, setTouchStart] = useState(null);
  const [startValue, setStartValue] = useState(initialValue);
  const MAX_VALUE = 99;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleTouchStart = (e) => {
    e.preventDefault();
    setTouchStart(e.touches[0].clientY);
    setStartValue(currentValue);
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    
    e.preventDefault();
    const currentTouch = e.touches[0].clientY;
    const diff = touchStart - currentTouch;
    const sensitivity = 10;
    const rawValue = startValue + Math.floor(diff / sensitivity);

    // Handle values <= 0
    if (rawValue <= 0) {
      setCurrentValue(undefined);
      onValueChange(undefined);
      return;
    }

    // Cap at max value
    const newValue = Math.min(rawValue, MAX_VALUE);
    setCurrentValue(newValue);
    onValueChange(newValue);
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  const handleTap = (e) => {
    e.stopPropagation();
    const newValue = (currentValue ?? 0) + 1;
    if (newValue <= MAX_VALUE) {
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
        className={`w-64 h-64 rounded-xl ${getColorForCount(currentValue)} flex flex-col items-center justify-center`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleTap}
      >
        <div className="text-6xl font-bold text-white">
          {currentValue === undefined ? '-' : currentValue}
        </div>
        <div className="text-white mt-4 opacity-50">Tap to increment</div>
        <div className="text-white mt-2 opacity-50">Swipe up/down to adjust</div>
        <div className="text-white mt-2 opacity-50">Swipe down to clear</div>
        <div className="text-white mt-2 opacity-50">Tap outside to close</div>
      </button>
    </div>
  );
};

export default ValueAdjuster;