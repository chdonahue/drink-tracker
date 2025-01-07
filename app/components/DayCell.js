import{ useState, useEffect } from 'react';
import getColorForCount from '../utils/colorMapping';

const DayCell = ({ date, count, onValueChange }) => {
    const [touchStart, setTouchStart] = useState(null);
    const [initialValue] = useState(count || 0);
    const [isMobile, setIsMobile] = useState(false);
  
    useEffect(() => {
      setIsMobile(window.innerWidth <= 768);
      const handleResize = () => setIsMobile(window.innerWidth <= 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    const handleTouchStart = (e) => {
      if (isMobile) {
        setTouchStart(e.touches[0].clientY);
        setInitialValue(count || 0);
      }
    };
  
    const handleTouchMove = (e) => {
      if (!touchStart || !isMobile) return;
      
      const currentTouch = e.touches[0].clientY;
      const diff = touchStart - currentTouch;
      const sensitivity = 10;
      const valueChange = Math.floor(diff / sensitivity);
      const newValue = Math.max(0, initialValue + valueChange);
      onValueChange(date, newValue);
    };
  
    const handleClick = (e) => {
      if (!isMobile) {
        const count = prompt('Enter number of drinks:');
        if (count === null) return;
        
        const numCount = parseInt(count);
        if (isNaN(numCount) || numCount < 0) {
          alert('Please enter a valid positive number');
          return;
        }
        
        onValueChange(date, numCount);
      }
    };
  
    return (
      <div
        className="aspect-square touch-none relative group hover:bg-gray-50 cursor-pointer"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setTouchStart(null)}
      >
        <div className={`w-full h-full ${getColorForCount(count)}`} />
        {count !== undefined && (
          <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white transition-opacity">
            <span className="text-[4vw] font-bold">{count}</span>
          </div>
        )}
      </div>
    );
  };
export default DayCell;