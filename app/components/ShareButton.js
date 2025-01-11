'use client';

import { useState, useEffect } from 'react';
import { Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

const ShareButton = () => {
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

  const generateImage = async () => {
    setIsGenerating(true);
    try {
      // Find the main calendar element
      const calendarElement = document.querySelector('.calendar-export-container');
      if (!calendarElement) {
        throw new Error('Calendar element not found');
      }

      // Configure html2canvas options for better quality
      const canvas = await html2canvas(calendarElement, {
        scale: 2, // Higher resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Convert to blob for sharing
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 1.0);
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      const imageBlob = await generateImage();
      
      if (isMobile && navigator.share) {
        // Use Web Share API for mobile
        const file = new File([imageBlob], 'calendar.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'My Drink Calendar',
          text: 'Check out my drink tracking calendar!'
        });
      } else {
        // Direct download for desktop
        saveAs(imageBlob, 'drink-calendar.png');
      }
    } catch (error) {
      console.error('Error sharing calendar:', error);
      alert('Failed to share calendar. Please try again.');
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isGenerating}
      className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
    >
      <Share2 className="w-4 h-4" />
      <span>{isGenerating ? 'Generating...' : isMobile ? 'Share' : 'Export'}</span>
    </button>
  );
};

export default ShareButton;