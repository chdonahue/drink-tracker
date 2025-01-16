import React, { useState, useEffect } from 'react';
import { Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

const ShareButtons = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const getFileName = (mode) => {
    const date = new Date();
    const year = date.getFullYear();
    
    if (mode === 'month') {
      const monthNames = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ];
      const month = monthNames[date.getMonth()];
      return `${month}_${year}.png`;
    } else {
      return `${year}.png`;
    }
  };

  const generateImage = async (mode) => {
    setIsGenerating(true);
    try {
      // Select the appropriate container based on mode
      const selector = mode === 'month' 
        ? '.calendar-export-container'
        : '.yearly-export-container';
      
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`Export element not found: ${selector}`);
      }

      // If yearly view, make it visible temporarily
      if (mode === 'year') {
        element.style.display = 'block';
      }

      const canvas = await html2canvas(element, {
        scale: mode === 'month' ? 2 : 1.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: true,
      });

      // Hide yearly view again if needed
      if (mode === 'year') {
        element.style.display = 'none';
      }

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 1.0);
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async (mode) => {
    try {
      const imageBlob = await generateImage(mode);
      const fileName = getFileName(mode);
      
      if (isMobile && navigator.share) {
        const file = new File([imageBlob], fileName, { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: `My Drink Calendar - ${mode === 'month' ? 'Monthly' : 'Yearly'} View`,
          text: 'Check out my drink tracking calendar!'
        });
      } else {
        saveAs(imageBlob, fileName);
      }
    } catch (error) {
      console.error('Error sharing calendar:', error);
      alert('Failed to share calendar. Please try again.');
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      <button
        onClick={() => handleShare('month')}
        disabled={isGenerating}
        className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        <span>{isGenerating ? 'Generating...' : 'Share Month'}</span>
      </button>
  
      <button
        onClick={() => handleShare('year')}
        disabled={isGenerating}
        className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        <span>{isGenerating ? 'Generating...' : 'Share Year'}</span>
      </button>
    </div>
  );
};

export default ShareButtons;