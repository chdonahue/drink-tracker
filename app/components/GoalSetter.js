import { useState, useEffect } from 'react';
import ValueAdjuster from './ValueAdjuster';

const GoalSetter = ({ value, onChange }) => {
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

  const handleClick = () => {
    if (!isMobile) {
      const input = prompt('Enter weekly drink goal (or leave blank to clear):', value ?? '');
      if (input === null) return;  // User clicked Cancel
      
      if (input.trim() === '') {
        onChange(null);
        return;
      }
      
      const numValue = parseInt(input);
      if (isNaN(numValue) || numValue < 0 || numValue > 99) {
        alert('Please enter a number between 0 and 99, or leave blank to clear');
        return;
      }
      
      onChange(numValue);
    } else {
      setIsAdjusting(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="px-3 py-1.5 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 transition-colors"
      >
        <span className="text-base font-medium">
          {value === null ? '—' : value}
        </span>
      </button>
      
      {isAdjusting && isMobile && (
        <ValueAdjuster
            initialValue={value}
            onValueChange={(newValue) => {
            onChange(newValue);
            setIsAdjusting(false);
            }}
            onClose={() => setIsAdjusting(false)}
            customClassName="bg-green-500"
        />
        )}
    </>
  );
};

export default GoalSetter;