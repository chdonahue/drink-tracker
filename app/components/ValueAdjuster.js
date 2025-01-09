'use client';

// This version is the current version:
// import React, { useState, useEffect } from 'react';
// import getColorForCount from '../utils/colorMapping';

// const ValueAdjuster = ({ initialValue = null, onValueChange, onClose }) => {
//   const [currentValue, setCurrentValue] = useState(null);  // Start with null
//   const [touchStart, setTouchStart] = useState(null);
//   const [startValue, setStartValue] = useState(null);  // Start with null
//   const [isClearing, setIsClearing] = useState(initialValue === null);  // Start in clearing state if initialValue is null

//   useEffect(() => {
//     document.body.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = 'auto';
//     };
//   }, []);

//   useEffect(() => {
//     // Only set non-null values
//     if (initialValue !== null) {
//       setCurrentValue(initialValue);
//       setStartValue(initialValue);
//       setIsClearing(false);
//     }
//   }, [initialValue]);

//   const triggerHaptic = (duration = 10) => {
//     if ('vibrate' in navigator) {
//       navigator.vibrate(duration);
//     }
//   };

//   const handleTouchStart = (e) => {
//     e.preventDefault();
//     setTouchStart(e.touches[0].clientY);
//     // Don't update startValue if we're in clearing state
//     if (!isClearing) {
//       setStartValue(currentValue ?? 0);
//     }
//   };

//   const handleTouchMove = (e) => {
//     if (!touchStart) return;
    
//     e.preventDefault();
//     const currentTouch = e.touches[0].clientY;
//     const diff = touchStart - currentTouch;
//     const sensitivity = 5; 
    
//     if (isClearing) {
//       // If we're in clearing state and user swipes up significantly, exit clearing state
//       if (diff > 50) {
//         triggerHaptic(20);
//         setIsClearing(false);
//         setCurrentValue(0);
//       }
//       return;
//     }
    
//     const valueChange = Math.floor(diff / sensitivity);
//     const computedValue = (startValue ?? 0) + valueChange;
    
//     if (computedValue < 0) {
//       if (!isClearing) {
//         triggerHaptic(20);
//         setIsClearing(true);
//         setCurrentValue(null);
//       }
//     } else {
//       if (computedValue !== currentValue) {
//         triggerHaptic(50);
//       }
//       setCurrentValue(computedValue);
//     }
//   };

//   const handleTouchEnd = () => {
//     setTouchStart(null);
//     onValueChange(isClearing ? null : currentValue);
//   };

//   const handleTap = (e) => {
//     e.stopPropagation();
//     if (isClearing) {
//       triggerHaptic(20);
//       setIsClearing(false);
//       setCurrentValue(0);
//       onValueChange(0);
//     } else {
//       triggerHaptic(8);
//       const newValue = (currentValue ?? 0) + 1;
//       setCurrentValue(newValue);
//       onValueChange(newValue);
//     }
//   };

//   return (
//     <div 
//       className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center touch-none"
//       onClick={onClose}
//     >
//       <button 
//         className={`w-64 h-64 rounded-xl ${isClearing ? 'bg-gray-500' : getColorForCount(currentValue)} 
//           flex flex-col items-center justify-center transition-colors duration-200`}
//         onTouchStart={handleTouchStart}
//         onTouchMove={handleTouchMove}
//         onTouchEnd={handleTouchEnd}
//         onClick={handleTap}
//       >
//         <div className="text-6xl font-bold text-white">
//           {isClearing ? '—' : currentValue ?? 0}
//         </div>
//         <div className="text-white mt-4 opacity-50">
//           {isClearing ? 'Release to clear' : 'Tap to increment'}
//         </div>
//         <div className="text-white mt-2 opacity-50">
//           {isClearing ? 'Swipe up to cancel' : 'Swipe up/down to adjust'}
//         </div>
//         <div className="text-white mt-2 opacity-50">Tap outside to close</div>
//       </button>
//     </div>
//   );
// };

// export default ValueAdjuster;



import React, { useState, useEffect } from 'react';
import getColorForCount from '../utils/colorMapping';

const ValueAdjuster = ({ initialValue = null, onValueChange, onClose }) => {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [touchStart, setTouchStart] = useState(null);
  const [isClearing, setIsClearing] = useState(initialValue === null);
  const [lastTouchY, setLastTouchY] = useState(null);
  const [lastReportedValue, setLastReportedValue] = useState(initialValue);

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
    const touchY = e.touches[0].clientY;
    setTouchStart(touchY);
    setLastTouchY(touchY);
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    
    e.preventDefault();
    const currentTouch = e.touches[0].clientY;
    const incrementalDiff = lastTouchY - currentTouch;
    setLastTouchY(currentTouch);
    
    const sensitivity = 2;
    
    if (isClearing) {
      // Exit clearing state with upward swipe
      if (incrementalDiff < -20) {
        triggerHaptic(20);
        setIsClearing(false);
        setCurrentValue(0);
        // Report value change immediately
        if (lastReportedValue !== 0) {
          setLastReportedValue(0);
          onValueChange(0);
        }
      }
      return;
    }
    
    // Calculate new value based on incremental movement
    const incrementalChange = Math.round(incrementalDiff / sensitivity);
    const computedValue = Math.max(0, (currentValue ?? 0) + incrementalChange);
    
    // Enter clearing state if going below 0
    if (computedValue === 0 && incrementalChange < 0) {
      triggerHaptic(20);
      setIsClearing(true);
      setCurrentValue(null);
      // Report value change immediately
      if (lastReportedValue !== null) {
        setLastReportedValue(null);
        onValueChange(null);
      }
      return;
    }
    
    // Update value if changed
    if (computedValue !== currentValue) {
      triggerHaptic(40);
      setCurrentValue(computedValue);
      // Only report significant changes to avoid database spam
      if (Math.abs(computedValue - (lastReportedValue ?? 0)) >= 1) {
        setLastReportedValue(computedValue);
        onValueChange(computedValue);
      }
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
    setLastTouchY(null);
    // Ensure final value is reported if it changed
    const finalValue = isClearing ? null : currentValue;
    if (finalValue !== lastReportedValue) {
      onValueChange(finalValue);
    }
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
      const newValue = (currentValue ?? 0) + 1;
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