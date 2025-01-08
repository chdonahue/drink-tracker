'use client';

import React, { useState, useEffect } from 'react';
import getColorForCount from '../utils/colorMapping';

const ValueAdjuster = ({ initialValue = 0, onValueChange, onClose }) => {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [touchStart, setTouchStart] = useState(null);
  const [startValue, setStartValue] = useState(initialValue);

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
    const valueChange = Math.floor(diff / sensitivity);
    const newValue = Math.max(0, startValue + valueChange);
    
    setCurrentValue(newValue);
    // Update the parent's value in real-time
    onValueChange(newValue);
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center touch-none"
      onClick={onClose}
    >
      <div 
        className={`w-64 h-64 rounded-xl ${getColorForCount(currentValue)} flex flex-col items-center justify-center`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-6xl font-bold text-white">{currentValue}</div>
        <div className="text-white mt-4 opacity-50">Swipe up/down to adjust</div>
        <div className="text-white mt-2 opacity-50">Tap outside to close</div>
      </div>
    </div>
  );
};

export default ValueAdjuster;