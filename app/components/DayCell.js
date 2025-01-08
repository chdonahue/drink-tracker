// import { useState, useEffect } from 'react';
// import getColorForCount from '../utils/colorMapping';
// import ValueAdjuster from './ValueAdjuster';

// const DayCell = ({ date, count, onValueChange }) => {
//   const [isMobile, setIsMobile] = useState(false);
//   const [isAdjusting, setIsAdjusting] = useState(false);
//   const MAX_VALUE = 99;

//   useEffect(() => {
//     const checkMobile = () => {
//       const hasTouchScreen = (
//         ('ontouchstart' in window) ||
//         (navigator.maxTouchPoints > 0) ||
//         (navigator.msMaxTouchPoints > 0)
//       );
//       const isMobileDevice = hasTouchScreen && window.innerWidth <= 768;
//       setIsMobile(isMobileDevice);
//     };
    
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   const handleClick = (e) => {
//     if (!isMobile) {
//       const input = prompt('Enter number of drinks (0-99, or clear to reset):', count ?? '');
      
//       // Handle cancel
//       if (input === null) return;
      
//       // Handle clearing/resetting
//       if (input.trim().toLowerCase() === 'clear' || input.trim() === '') {
//         onValueChange(undefined);
//         return;
//       }
      
//       // Handle numeric input
//       const numCount = parseInt(input);
//       // Check if it's a valid number
//       if (isNaN(numCount)) {
//         alert('Please enter a number, "clear", or leave empty to reset');
//         return;
//       }

//       // Check range
//       if (numCount > MAX_VALUE) {
//         alert(`Maximum value is ${MAX_VALUE}`);
//         return;
//       }

//       if (numCount < 0) {
//         alert('Please enter a positive number');
//         return;
//       }
      
//       onValueChange(numCount);
//     } else {
//       setIsAdjusting(true);
//     }
//   };

//   return (
//     <>
//       <button
//         onClick={handleClick}
//         className="w-full aspect-square relative group hover:bg-gray-50 cursor-pointer border-none"
//       >
//         <div className={`w-full h-full ${getColorForCount(count)}`} />
//         {count !== undefined && (
//           <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white transition-opacity">
//             <span className="text-[4vw] font-bold">{count}</span>
//           </div>
//         )}
//       </button>
      
//       {isAdjusting && isMobile && (
//         <ValueAdjuster
//           initialValue={count ?? 0}
//           onValueChange={(value) => {
//             onValueChange(value);
//           }}
//           onClose={() => setIsAdjusting(false)}
//         />
//       )}
//     </>
//   );
// };

// export default DayCell;


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
      const input = prompt('Enter number of drinks:', count ?? '');
      if (input === null) return;
      
      const numCount = parseInt(input);
      if (isNaN(numCount) || numCount < 0) {
        alert('Please enter a valid positive number');
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
          initialValue={count ?? 0}
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