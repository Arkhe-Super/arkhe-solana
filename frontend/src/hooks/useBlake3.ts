import { useState } from 'react';
import { TAJ_MAHAL, DA_YA_THINK } from '../demo/demoData';

export function useBlake3() {
  const [isHashing, setIsHashing] = useState(false);

  const calculateHash = async (file: File): Promise<string> => {
    setIsHashing(true);

    // Simulate hashing time
    await new Promise(resolve => setTimeout(resolve, 800));

    setIsHashing(false);

    // Return mock hash based on filename if it matches our demo data
    if (file.name === TAJ_MAHAL.audioFile) {
      return TAJ_MAHAL.hashBlake3;
    } else if (file.name === DA_YA_THINK.audioFile) {
      return DA_YA_THINK.hashBlake3;
    }

    // Fallback random hash
    return Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  return { calculateHash, isHashing };
}
