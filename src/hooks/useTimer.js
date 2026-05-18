import { useState, useEffect, useRef } from 'react';

export const useTimer = (initialMinutes = 25) => {
  const [time, setTime] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('deepWork'); // deepWork, shortBreak, longBreak
  
  const [completedSessions, setCompletedSessions] = useState(() => {
    const saved = localStorage.getItem('dailyProgress');
    const today = new Date().toDateString();
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) return parsed.count;
      } catch (e) {}
    }
    return 0;
  });

  const [customTimeSeconds, setCustomTimeSeconds] = useState(null);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
    }
  }, []);

  const getDuration = () => {
    if (mode === 'custom' && customTimeSeconds !== null) return customTimeSeconds;
    if (mode === 'deepWork') return 25 * 60;
    if (mode === 'shortBreak') return 5 * 60;
    return 15 * 60;
  };

  const reset = () => {
    setIsRunning(false);
    setTime(getDuration());
  };

  const setCustomDuration = (minutes) => {
    setCustomTimeSeconds(minutes * 60);
    setMode('custom');
    setIsRunning(false);
    setTime(minutes * 60);
  };

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);

  const incrementSession = () => {
    setCompletedSessions(prev => {
      const newCount = prev + 1;
      localStorage.setItem('dailyProgress', JSON.stringify({
        date: new Date().toDateString(),
        count: newCount
      }));
      return newCount;
    });
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            audioRef.current?.play().catch(() => {});
            if (mode === 'deepWork') incrementSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);

  useEffect(() => {
    if (!isRunning) setTime(getDuration());
  }, [mode]);

  const progress = 1 - time / getDuration();

  return { time, isRunning, start, pause, reset, mode, setMode, progress, completedSessions, setCustomDuration };
};