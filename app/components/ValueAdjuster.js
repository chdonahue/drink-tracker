'use client';

import React, { useState, useEffect } from 'react';
import getColorForCount from '../utils/colorMapping';

const ValueAdjuster = ({ initialValue = 0, onValueChange, onClose }) => {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [touchStart, setTouchStart] = useState(null);
  const [startValue, setStartValue] = useState(initialValue);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const triggerHaptic = (duration = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    setTouchStart(e.touches[0].clientY);
    setStartValue(currentValue);
    setIsClearing(false);
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    
    e.preventDefault();
    const currentTouch = e.touches[0].clientY;
    const diff = touchStart - currentTouch;
    const sensitivity = 5; 
    const valueChange = Math.floor(diff / sensitivity);
    const computedValue = startValue + valueChange;
    
    if (computedValue < 0) {
      if (!isClearing) {
        triggerHaptic(20);
        setIsClearing(true);
        setCurrentValue(0);
      }
    } else {
      if (isClearing) {
        triggerHaptic(20);
        setIsClearing(false);
      }
      if (computedValue !== currentValue) {
        triggerHaptic(50);
      }
      setCurrentValue(computedValue);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
    // Only send the final value when touch ends
    if (isClearing) {
      onValueChange(null);
    } else {
      onValueChange(currentValue);
    }
  };

  const handleTap = (e) => {
    e.stopPropagation(); // Prevent closing the adjuster
    if (isClearing) {
      triggerHaptic(20);
      setIsClearing(false);
      setCurrentValue(1);
      onValueChange(1);
    } else {
      triggerHaptic(8);
      const newValue = currentValue + 1;
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
          {isClearing ? '—' : currentValue}
        </div>
        <div className="text-white mt-4 opacity-50">
          {isClearing ? 'Release to clear' : 'Tap to increment'}
        </div>
        <div className="text-white mt-2 opacity-50">
          {isClearing ? 'Swipe up to cancel' : 'Swipe up/down to adjust'}
        </div>
        <div className="text-white mt-2 opacity-50">Tap outside to close</div>
      </button>
    </div>
  );
};

export default ValueAdjuster;