import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const TimerContext = createContext();

export const useTimerContext = () => {
  return useContext(TimerContext);
};

export const TimerProvider = ({ children }) => {
  // --- From useTimer ---
  const [time, setTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('deepWork'); // deepWork, shortBreak, longBreak, custom
  
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

  // --- From Timer.jsx ---
  const [timerMode, setTimerMode] = useState('pomodoro'); // pomodoro or stopwatch
  const [stopwatchTime, setStopwatchTime] = useState(0); // in milliseconds
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const stopwatchIntervalRef = useRef(null);
  const lastTickRef = useRef(null);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isTickEnabled, setIsTickEnabled] = useState(true);

  const [customInputOpen, setCustomInputOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");

  const bgmAudioRef = useRef(null);
  const tickAudioRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
    }
  }, []);

  const bgmTracks = [
    { id: 1, title: 'Interstellar', url: './audio/interstellar.mp3', icon: 'music_note' },
    { id: 2, title: 'Relaxed', url: './audio/relaxed.mp3', icon: 'music_note' },
    { id: 3, title: 'Rockstar', url: './audio/rockstar.mp3', icon: 'music_note' },
  ];

  const getDuration = (targetMode = mode, customSecs = customTimeSeconds) => {
    if (targetMode === 'custom') {
      return customSecs !== null ? customSecs : 25 * 60;
    }
    if (targetMode === 'deepWork') return 25 * 60;
    if (targetMode === 'shortBreak') return 5 * 60;
    return 15 * 60; // longBreak
  };

  const reset = () => {
    setIsRunning(false);
    setTime(getDuration());
  };

  const changeMode = (newMode) => {
    if (newMode === 'stopwatch') {
      setTimerMode('stopwatch');
      setIsRunning(false);
      setStopwatchRunning(false);
    } else {
      setMode(newMode);
      setIsRunning(false);
      setTimerMode('pomodoro');
      setStopwatchRunning(false);
      const duration = getDuration(newMode);
      setTime(duration);
    }
  };

  const setCustomDuration = (minutes) => {
    const seconds = minutes * 60;
    setCustomTimeSeconds(seconds);
    setMode('custom');
    setIsRunning(false);
    setTimerMode('pomodoro');
    setStopwatchRunning(false);
    setTime(seconds);
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

  const expectedEndTimeRef = useRef(null);
  const lastTickedSecondRef = useRef(null);

  useEffect(() => {
    if (isRunning && timerMode === 'pomodoro') {
      expectedEndTimeRef.current = Date.now() + time * 1000;
      lastTickedSecondRef.current = time;

      intervalRef.current = setInterval(() => {
        const remainingMs = expectedEndTimeRef.current - Date.now();
        const remainingSecs = Math.max(0, Math.ceil(remainingMs / 1000));

        if (remainingSecs !== lastTickedSecondRef.current) {
          if (isTickEnabled && tickAudioRef.current && remainingSecs > 0) {
            tickAudioRef.current.currentTime = 0;
            tickAudioRef.current.play().catch(() => {});
          }
          lastTickedSecondRef.current = remainingSecs;
          setTime(remainingSecs);
        }

        if (remainingSecs <= 0) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          audioRef.current?.play().catch(() => {});
          if (mode === 'deepWork') incrementSession();
        }
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode, timerMode, isTickEnabled]);

  useEffect(() => {
    if (!isRunning) {
      setTime(getDuration());
    }
  }, [mode, customTimeSeconds]);

  const progress = Math.max(0, Math.min(1, 1 - time / getDuration()));

  useEffect(() => {
    tickAudioRef.current = new Audio('./audio/tick.mp3');
    tickAudioRef.current.volume = 0.5;
  }, []);

  const handleStartSession = () => {
    if (tickAudioRef.current && isTickEnabled && timerMode === 'pomodoro') {
      tickAudioRef.current.currentTime = 0;
      tickAudioRef.current.play().catch(() => {});
    }
    start();
  };

  const handleStartStopwatch = () => {
    if (tickAudioRef.current && isTickEnabled && timerMode === 'stopwatch') {
      tickAudioRef.current.currentTime = 0;
      tickAudioRef.current.play().catch(() => {});
    }
    setStopwatchRunning(true);
  };

  const pauseStopwatch = () => {
    setStopwatchRunning(false);
  };

  const resetStopwatch = () => {
    setStopwatchRunning(false);
    setStopwatchTime(0);
  };

  useEffect(() => {
    if (stopwatchRunning && timerMode === 'stopwatch') {
      lastTickRef.current = Date.now();
      stopwatchIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const delta = now - lastTickRef.current;
        setStopwatchTime(prev => {
          const newTime = prev + delta;
          if (Math.floor(newTime / 1000) > Math.floor(prev / 1000)) {
            if (isTickEnabled && tickAudioRef.current) {
              tickAudioRef.current.currentTime = 0;
              tickAudioRef.current.play().catch(() => {});
            }
          }
          return newTime;
        });
        lastTickRef.current = now;
      }, 10);
    } else {
      clearInterval(stopwatchIntervalRef.current);
    }
    return () => clearInterval(stopwatchIntervalRef.current);
  }, [stopwatchRunning, timerMode, isTickEnabled]);

  useEffect(() => {
    const shouldRun = (timerMode === 'pomodoro' && isRunning) || (timerMode === 'stopwatch' && stopwatchRunning);
    if (!shouldRun || !isTickEnabled) {
      if (tickAudioRef.current) {
        tickAudioRef.current.pause();
        tickAudioRef.current.currentTime = 0;
      }
    }
  }, [timerMode, isRunning, stopwatchRunning, isTickEnabled]);

  useEffect(() => {
    if (bgmAudioRef.current) {
      bgmAudioRef.current.volume = volume;
      if (isPlaying) {
        bgmAudioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        bgmAudioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex, volume]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => setCurrentTrackIndex((prev) => (prev + 1) % bgmTracks.length);
  const prevTrack = () => setCurrentTrackIndex((prev) => (prev - 1 + bgmTracks.length) % bgmTracks.length);

  const value = {
    // Timer Core
    time, isRunning, start: handleStartSession, pause, reset, mode, setMode, progress, completedSessions, setCustomDuration,
    changeMode,
    
    // Timer UI State
    timerMode, setTimerMode,
    stopwatchTime, stopwatchRunning, handleStartStopwatch, pauseStopwatch, resetStopwatch,
    customInputOpen, setCustomInputOpen, customMinutes, setCustomMinutes,
    
    // Audio Player State
    currentTrackIndex, isPlaying, volume, setVolume, togglePlay, nextTrack, prevTrack,
    isTickEnabled, setIsTickEnabled, bgmAudioRef, bgmTracks
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
      <audio ref={bgmAudioRef} src={bgmTracks[currentTrackIndex].url} loop />
    </TimerContext.Provider>
  );
};
