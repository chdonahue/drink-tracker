import{ useState } from 'react';
import getColorForCount from '../utils/colorMapping';

const DayCell = ({ date, count, onValueChange }) => {
    const [touchStart, setTouchStart] = useState(null);
    const [initialValue] = useState(count || 0);
    
    const handleTouchStart = (e) => {
      setTouchStart(e.touches[0].clientY);
    };
  
    const handleTouchMove = (e) => {
      if (!touchStart) return;
      
      const currentTouch = e.touches[0].clientY;
      const diff = touchStart - currentTouch;
      const sensitivity = 10; // pixels per increment
      const valueChange = Math.floor(diff / sensitivity);
      
      const newValue = Math.max(0, initialValue + valueChange);
      onValueChange(date, newValue);
    };
  
    const handleClick = () => {
      if (window.innerWidth > 768) { // Desktop only
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
        className="aspect-square touch-none"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setTouchStart(null)}
      >
        <div className={`w-full h-full ${getColorForCount(count)}`}></div>
      </div>
    );
  };
export default DayCell;