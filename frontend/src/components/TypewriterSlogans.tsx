'use client';

import { useEffect, useState } from 'react';

const slogans = [
  '“Where Moments Sparkle.”',
  '“A Glint of Every Memory.”',
  '“Catch the Light of Your Life.”',
  '“Tiny Sparks, Timeless Stories.”',
  '“Aesthetic. Artistic. Yours.”',
  '“Swipe, Snap, Spark.”',
  '“Minimal Meets Magical.”',
  '“Because Every Memory Deserves to Shine.”',
  '“Hold on to the Highlights.”',
];

export default function TypewriterSlogans() {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullText = slogans[index];
    const typingSpeed = isDeleting ? 50 : 100;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(fullText.substring(0, displayText.length + 1));
        if (displayText === fullText) {
          setTimeout(() => setIsDeleting(true), 1500); // pause before deleting
        }
      } else {
        setDisplayText(fullText.substring(0, displayText.length - 1));
        if (displayText === '') {
          setIsDeleting(false);
          setIndex((prev) => (prev + 1) % slogans.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, index]);

  return (
    <div className="text-xl md:text-2xl text-white font-light min-h-[40px]">
      <span className="border-r-2 border-white pr-1 animate-pulse">{displayText}</span>
    </div>
  );
}
