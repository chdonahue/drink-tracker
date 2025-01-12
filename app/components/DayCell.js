// BELOW IS THE NEW VERSION
import { useState, useEffect } from 'react';
import getColorForCount from '../utils/colorMapping';
import ValueAdjuster from './ValueAdjuster';

const DayCell = ({ date, count, onValueChange }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const hasTouchScreen = (
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0)
      );
      const isMobileDevice = hasTouchScreen && window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClick = (e) => {
    if (!isMobile) {
        const input = prompt('Enter number of drinks (or leave blank to clear):', count ?? '');
        if (input === null) return;  // User clicked Cancel
        
        // Clear the cell if input is empty
        if (input.trim() === '') {
          onValueChange(date, null);
          return;
        }
        
        const numCount = parseInt(input);
        if (isNaN(numCount) || numCount < 0) {
          alert('Please enter a valid positive number or leave blank to clear');
          return;
        }
        
        onValueChange(date, numCount);
    } else {
      setIsAdjusting(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full aspect-square relative group hover:bg-gray-50 cursor-pointer border-none"
      >
        <div className={`w-full h-full ${getColorForCount(count)}`} />
        {count !== undefined && (
          <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white transition-opacity">
            <span className="text-[4vw] font-bold">{count}</span>
          </div>
        )}
      </button>
      
      {isAdjusting && isMobile && (
        <ValueAdjuster
          initialValue={count ?? null}
          onValueChange={(value) => {
            onValueChange(date, value);
          }}
          onClose={() => setIsAdjusting(false)}
        />
      )}
    </>
  );
};

export default DayCell;