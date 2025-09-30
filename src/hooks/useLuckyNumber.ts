import { useState, useEffect } from 'react';

export const useLuckyNumber = () => {
  const [luckyNumber, setLuckyNumber] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLuckyNumber(prev => {
        if (prev >= 99999) {
          return 0; // Reset to 0 after reaching 99999
        }
        return prev + 1;
      });
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, []);

  // Format the number based on its value
  const formatNumber = (num: number): string => {
    if (num <= 9999) {
      return num.toString().padStart(4, '0'); // 4 digits with leading zeros (0000-9999)
    } else {
      return num.toString(); // 5 digits (10000-99999)
    }
  };

  return formatNumber(luckyNumber);
};

// Get lucky number from backend API
export const getPostLuckyNumber = async (postId: string): Promise<string> => {
  try {
    const response = await fetch(`https://stories-be.onrender.com/api/posts/${postId}/lucky-number`);
    if (!response.ok) {
      throw new Error('Failed to fetch lucky number');
    }
    const data = await response.json();
    return data.luckyNumber || '000';
  } catch (error) {
    console.error('Error fetching lucky number:', error);
    return '000'; // Fallback
  }
};

// Legacy function - now just returns the post's lucky number if available
export const generatePostLuckyNumber = (post: any): string => {
  // If post has luckyNumber from backend, use it
  if (post?.luckyNumber) {
    return post.luckyNumber;
  }
  
  // Fallback to old logic for backward compatibility
  const postId = post?.postId || post?._id || '';
  let last3 = postId.slice(-3);
  let num = 0;
  if (/^\d{3}$/.test(last3)) {
    num = parseInt(last3, 10);
  } else {
    for (let i = 0; i < last3.length; i++) {
      num += last3.charCodeAt(i);
    }
    num = num % 1000;
  }
  return num.toString().padStart(3, '0');
}; 