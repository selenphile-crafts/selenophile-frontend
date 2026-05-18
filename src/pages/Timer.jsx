import { motion } from 'framer-motion';
import { useTimerContext } from '../context/TimerContext';

const Timer = () => {
  const {
    time, isRunning, start, pause, reset, mode, setMode, progress, completedSessions, setCustomDuration,
    timerMode, setTimerMode,
    stopwatchTime, stopwatchRunning, handleStartStopwatch, pauseStopwatch, resetStopwatch,
    customInputOpen, setCustomInputOpen, customMinutes, setCustomMinutes,
    currentTrackIndex, isPlaying, volume, setVolume, togglePlay, nextTrack, prevTrack,
    isTickEnabled, setIsTickEnabled, bgmAudioRef, bgmTracks
  } = useTimerContext();

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStopwatch = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const millis = Math.floor((ms % 1000) / 10); // 2 digits
    
    let mainTime = "";
    if (hours > 0) {
      mainTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      mainTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return (
      <span className="flex items-baseline justify-center">
        <span>{mainTime}</span>
        <span className="text-4xl md:text-5xl lg:text-[60px] text-on-surface-variant font-normal">.{millis.toString().padStart(2, '0')}</span>
      </span>
    );
  };

  // SVG Configuration
  const radius = 180;
  const circumference = 2 * Math.PI * radius;
  // Progress goes from 0 (start) to 1 (end). 
  // Offset of circumference hides the stroke completely.
  const strokeDashoffset = timerMode === 'pomodoro' ? circumference * progress : 0;
  
  // Progress tracking display
  const targetSessions = 4;
  const displayCompleted = completedSessions % targetSessions || (completedSessions > 0 && completedSessions % targetSessions === 0 ? targetSessions : 0);
  const dailyProgressPercent = (displayCompleted / targetSessions) * 100;

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-section-gap flex flex-col min-h-[calc(100vh-64px)]">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-gutter items-center w-full flex-grow">
        
        {/* Left Column: Study Session Modes */}
        <div className="lg:col-span-3 order-2 lg:order-1 flex flex-col gap-4 lg:gap-gutter w-full">
          <div className="bg-surface-container-lowest border border-surface-variant p-4 lg:p-gutter rounded-xl shadow-sm">
            <h2 className="font-headline-md text-headline-md text-primary mb-4">Study Session</h2>
            <div className="flex flex-col gap-2">
              {[
                { id: 'deepWork', label: 'Deep Work', time: '25:00' },
                { id: 'shortBreak', label: 'Short Break', time: '05:00' },
                { id: 'longBreak', label: 'Long Break', time: '15:00' }
              ].map(item => (
                <div 
                  key={item.id} 
                  onClick={() => { setMode(item.id); reset(); setTimerMode('pomodoro'); pauseStopwatch(); }}
                  className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${mode === item.id && timerMode === 'pomodoro' ? 'bg-surface-container-high border border-outline-variant' : 'hover:bg-surface-container-low'}`}
                >
                  <span className={`font-label-md text-sm lg:text-label-md ${mode === item.id && timerMode === 'pomodoro' ? '' : 'opacity-60'}`}>{item.label}</span>
                  <span className={`font-body-md text-sm lg:text-body-md ${mode === item.id && timerMode === 'pomodoro' ? 'text-primary font-bold' : 'opacity-60'}`}>{item.time}</span>
                </div>
              ))}
              
              {/* Custom Time Option */}
              <div className={`flex flex-col gap-2 p-3 rounded-lg border transition-colors ${mode === 'custom' && timerMode === 'pomodoro' ? 'bg-surface-container-high border-outline-variant' : 'border-transparent hover:bg-surface-container-low'}`}>
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setCustomInputOpen(!customInputOpen)}>
                  <span className={`font-label-md text-sm lg:text-label-md ${mode === 'custom' && timerMode === 'pomodoro' ? '' : 'opacity-60'}`}>Custom Time</span>
                  <span className={`material-symbols-outlined text-sm lg:text-base ${mode === 'custom' && timerMode === 'pomodoro' ? 'text-primary' : 'opacity-60'}`}>{customInputOpen ? 'expand_less' : 'expand_more'}</span>
                </div>
                {customInputOpen && (
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="number" min="1" max="300" 
                      value={customMinutes} 
                      onChange={e => setCustomMinutes(e.target.value)} 
                      placeholder="Min" 
                      className="w-16 bg-surface-container-highest text-on-surface rounded p-1 text-center text-sm focus:outline-primary border-none"
                    />
                    <button 
                      onClick={() => { 
                        if(customMinutes && parseInt(customMinutes) > 0) { 
                          setCustomDuration(parseInt(customMinutes)); 
                          setTimerMode('pomodoro'); 
                          setCustomInputOpen(false); 
                        } 
                      }} 
                      className="px-3 py-1 bg-primary text-on-primary rounded text-sm font-label-md"
                    >
                      Set
                    </button>
                  </div>
                )}
              </div>

              {/* Stopwatch Option */}
              <div 
                onClick={() => { setTimerMode('stopwatch'); pause(); }}
                className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors mt-2 border-t border-surface-variant pt-4 ${timerMode === 'stopwatch' ? 'bg-surface-container-high border border-outline-variant' : 'hover:bg-surface-container-low'}`}
              >
                <span className={`font-label-md text-sm lg:text-label-md ${timerMode === 'stopwatch' ? '' : 'opacity-60'}`}>Stopwatch</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: The Clock */}
        <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-center w-full">
          <div className="relative flex items-center justify-center mb-8 lg:mb-section-gap w-full">
            <svg viewBox="0 0 400 400" className="w-64 h-64 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px] max-w-full -rotate-90">
              <circle cx="200" cy="200" r={radius} fill="none" className="text-surface-bright" stroke="currentColor" strokeWidth="12" />
              <circle
                cx="200" cy="200" r={radius} fill="none" className="text-primary" stroke="currentColor" strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: isRunning ? 'stroke-dashoffset 1s linear' : 'none' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-headline-xl text-5xl md:text-7xl lg:text-[100px] text-primary leading-none tracking-tighter w-full text-center flex justify-center">
                {timerMode === 'pomodoro' ? formatTime(time) : renderStopwatch(stopwatchTime)}
              </span>
              <span className="font-label-md text-xs md:text-sm lg:text-label-md text-outline uppercase tracking-[0.2em] mt-2">
                {timerMode === 'pomodoro' ? (mode === 'deepWork' ? 'Focusing' : (mode === 'custom' ? 'Custom Timer' : 'Break Time')) : 'Stopwatch'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-center w-full">
            <div className="flex items-center justify-center gap-4 lg:gap-gutter">
              <button onClick={timerMode === 'pomodoro' ? reset : resetStopwatch} className="w-12 h-12 lg:w-16 lg:h-16 rounded-full border border-primary text-primary hover:bg-tertiary-fixed transition-all flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px] lg:text-[32px]">refresh</span>
              </button>
              
              {/* Play/Pause Button */}
              {timerMode === 'pomodoro' ? (
                !isRunning ? (
                  <button onClick={start} className="px-6 py-3 lg:px-section-gap lg:py-gutter bg-primary-container text-on-primary rounded-full hover:bg-primary transition-all flex items-center gap-2 shadow-lg">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    <span className="font-label-md text-xs lg:text-label-md text-white">START SESSION</span>
                  </button>
                ) : (
                  <button onClick={pause} className="px-6 py-3 lg:px-section-gap lg:py-gutter bg-surface-container-high text-primary rounded-full hover:bg-surface-variant transition-all flex items-center gap-2 shadow-lg">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>pause</span>
                    <span className="font-label-md text-xs lg:text-label-md">PAUSE SESSION</span>
                  </button>
                )
              ) : (
                !stopwatchRunning ? (
                  <button onClick={handleStartStopwatch} className="px-6 py-3 lg:px-section-gap lg:py-gutter bg-primary-container text-on-primary rounded-full hover:bg-primary transition-all flex items-center gap-2 shadow-lg">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    <span className="font-label-md text-xs lg:text-label-md text-white">START STOPWATCH</span>
                  </button>
                ) : (
                  <button onClick={pauseStopwatch} className="px-6 py-3 lg:px-section-gap lg:py-gutter bg-surface-container-high text-primary rounded-full hover:bg-surface-variant transition-all flex items-center gap-2 shadow-lg">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>pause</span>
                    <span className="font-label-md text-xs lg:text-label-md">PAUSE STOPWATCH</span>
                  </button>
                )
              )}

              {/* Tick Sound Toggle */}
              <button 
                onClick={() => setIsTickEnabled(!isTickEnabled)} 
                className="w-12 h-12 lg:w-16 lg:h-16 rounded-full border border-surface-variant text-on-surface hover:bg-surface-container-low transition-all flex items-center justify-center shrink-0"
                title={isTickEnabled ? "Mute Tick Sound" : "Enable Tick Sound"}
              >
                <span className="material-symbols-outlined text-[20px] lg:text-[24px]">
                  {isTickEnabled ? 'volume_up' : 'volume_off'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Soundscape & Progress */}
        <div className="lg:col-span-3 order-3 flex flex-col gap-4 lg:gap-gutter w-full">
          <div className="bg-surface-container-lowest border border-surface-variant p-4 lg:p-gutter rounded-xl overflow-hidden relative shadow-sm">
            <img alt="Study space" className="absolute inset-0 w-full h-full object-cover opacity-10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBElFHkQOAoids5YNvom_nx4GLK7fc_1mNq5YUTTrTKdwjwXyMme9ztQWm3klYMPWxbgUbhF0SS-L-_oL64jFFFmKx1enwsgljRS4LOiIly6kooemwLqZFNJoIlOwBhntxuwFniW5qpoucbgkuUq1seaxZ8EEQtRQm7R_69H4oxwsx0cYRpZANzT0zEw5DTKDz7TN_FulhCdS2XM2J4H1rxnxJJRwOePmrV4UIJpgdlR1PrYYwsKmuJauuCEuC4a4Wyh_gv2YhIiVzO" />
            <div className="relative z-10">
              <h3 className="font-label-md text-label-md text-primary mb-2 flex justify-between items-center">
                Library Ambience
                <span className="text-xs text-on-surface-variant font-normal">Track {currentTrackIndex + 1}/{bgmTracks.length}</span>
              </h3>
              
              <div className="flex flex-col gap-2 p-3 bg-surface-bright/90 backdrop-blur rounded border border-outline-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm lg:text-base">{bgmTracks[currentTrackIndex].icon}</span>
                  <span className="font-body-md text-sm lg:text-body-md flex-grow truncate">{bgmTracks[currentTrackIndex].title}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <button onClick={prevTrack} className="material-symbols-outlined text-on-surface hover:text-primary transition-colors text-xl">skip_previous</button>
                  <button onClick={togglePlay} className="material-symbols-outlined text-3xl text-primary hover:scale-110 transition-transform">
                    {isPlaying ? 'pause_circle' : 'play_circle'}
                  </button>
                  <button onClick={nextTrack} className="material-symbols-outlined text-on-surface hover:text-primary transition-colors text-xl">skip_next</button>
                </div>
                {/* Volume Slider */}
                <div className="flex items-center gap-2 mt-2 border-t border-outline-variant/30 pt-2">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">volume_down</span>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.01" 
                    value={volume} 
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">volume_up</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest border border-surface-variant p-4 lg:p-gutter rounded-xl shadow-sm">
            <h3 className="font-label-md text-sm lg:text-label-md text-outline uppercase tracking-widest mb-2">Daily Progress</h3>
            <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden mb-2">
              <motion.div 
                className="h-full bg-primary-container"
                initial={{ width: 0 }}
                animate={{ width: `${dailyProgressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="font-caption text-xs lg:text-caption text-on-surface-variant">{displayCompleted} of {targetSessions} sessions completed</p>
            <p className="text-[10px] text-outline mt-1 italic">Total all-time deep work sessions: {completedSessions}</p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Timer;