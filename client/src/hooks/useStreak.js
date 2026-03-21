import { useState, useEffect } from 'react';

const STORAGE_KEYS = {
  LAST_VISIT: 'devlok_last_visit',
  STREAK: 'devlok_streak',
};

/**
 * useStreak — tracks consecutive daily visits to /today
 * Returns { streak, isNewDay, isToday }
 */
export function useStreak() {
  const [streak, setStreak] = useState(0);
  const [isNewDay, setIsNewDay] = useState(false);

  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const lastVisit = localStorage.getItem(STORAGE_KEYS.LAST_VISIT);
    const storedStreak = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || '0', 10);

    if (!lastVisit) {
      // First ever visit
      localStorage.setItem(STORAGE_KEYS.LAST_VISIT, todayStr);
      localStorage.setItem(STORAGE_KEYS.STREAK, '1');
      setStreak(1);
      setIsNewDay(true);
      return;
    }

    if (lastVisit === todayStr) {
      // Already visited today — no change
      setStreak(storedStreak);
      setIsNewDay(false);
      return;
    }

    // Check if yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const newStreak = lastVisit === yesterdayStr ? storedStreak + 1 : 1;
    localStorage.setItem(STORAGE_KEYS.LAST_VISIT, todayStr);
    localStorage.setItem(STORAGE_KEYS.STREAK, String(newStreak));
    setStreak(newStreak);
    setIsNewDay(true);
  }, []);

  return { streak, isNewDay };
}
