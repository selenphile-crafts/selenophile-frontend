import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Toast from '../components/Toast';

// Daily Rotation Math (Zero Backend Storage)
const getDayOfYear = () => Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

const sparksSets = [
  [
    { tag: "Architecture", title: "Structural Logic", desc: "Exploring how physical spaces influence cognitive flow." },
    { tag: "Tactile", title: "The Analog Spark", desc: "Why physical handwriting improves memory retention." },
    { tag: "Digital Art", title: "Visualizing Data", desc: "Converting complex datasets into aesthetic narratives." },
    { tag: "Philosophy", title: "The Quiet Hours", desc: "A study on nocturnal productivity and creative focus." }
  ],
  [
    { tag: "Minimalism", title: "White Space", desc: "The psychology behind breathing room in design." },
    { tag: "Nature", title: "Biophilic Focus", desc: "Integrating natural elements into deep work zones." },
    { tag: "Typography", title: "Serif & Sanity", desc: "How font choice dictates reading comprehension." },
    { tag: "Focus", title: "Monastic Work", desc: "Reclaiming attention in a hyper-connected world." }
  ]
];

const CreativeZone = () => {
  const { user } = useAuth();
  const [textContent, setTextContent] = useState('');
  const [notes, setNotes] = useState([]);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState('Just now');

  // Sketchpad Colors
  const noteColors = ['#fef3c7', '#fce7f3', '#dcfce7', '#dbeafe']; // Yellow, Pink, Green, Blue
  const [selectedColor, setSelectedColor] = useState(noteColors[0]);

  // Tic Tac Toe State
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameMode, setGameMode] = useState('1P'); // '1P' or '2P'

  // Daily Feeds
  const [feedOffset, setFeedOffset] = useState(0);
  const dayIndex = getDayOfYear() + feedOffset;
  const visualFeedDay = getDayOfYear(); // Visual board only changes once a day

  const visualFeed = [
    `https://picsum.photos/seed/visual_${visualFeedDay}_1/800/600`,
    `https://picsum.photos/seed/visual_${visualFeedDay}_2/800/600`,
    `https://picsum.photos/seed/visual_${visualFeedDay}_3/800/600`
  ];

  const sparksFeed = sparksSets[dayIndex % sparksSets.length].map((spark, idx) => ({
    ...spark,
    img: `https://picsum.photos/seed/spark_${dayIndex}_${idx}/500/500`
  }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const textRes = await api.get('/creative/text');
        setTextContent(textRes.data.content);
        const notesRes = await api.get('/creative/notes');
        setNotes(notesRes.data.notes || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const saveText = useCallback(async (content) => {
    try {
      await api.put('/creative/text', { content });
      setLastSaved('Just now');
    } catch (err) {
      console.error(err);
    }
  }, []);

  const saveNotes = useCallback(async (updatedNotes) => {
    try {
      await api.put('/creative/notes', { notes: updatedNotes });
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setTextContent(val);
    setSaving(true);
    setLastSaved('Saving...');
    setTimeout(() => {
      saveText(val);
      setSaving(false);
    }, 1000);
  };

  const addNote = () => {
    const newNote = {
      id: Date.now().toString(),
      text: '',
      x: 20 + Math.random() * 100,
      y: 20 + Math.random() * 100,
      color: selectedColor
    };
    const updated = [...notes, newNote];
    setNotes(updated);
    saveNotes(updated);
  };

  const updateNoteText = (id, newText) => {
    const updated = notes.map(n => n.id === id ? { ...n, text: newText } : n);
    setNotes(updated);
    saveNotes(updated);
  };

  const handleNoteInput = (e, id) => {
    // Auto expand height without scrolling
    e.target.style.height = 'inherit';
    e.target.style.height = `${e.target.scrollHeight}px`;
    updateNoteText(id, e.target.value);
  };

  const handleExport = () => {
    if (!textContent.trim()) {
      setToast({ message: 'Nothing to export!', type: 'error' });
      return;
    }
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `active_thoughts_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ message: 'Export successful!', type: 'success' });
  };

  const deleteNote = (id) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
  };

  const handleDragEnd = (id, info) => {
    const updated = notes.map(n => n.id === id ? { ...n, x: n.x + info.offset.x, y: n.y + info.offset.y } : n);
    setNotes(updated);
    saveNotes(updated);
  };

  // Tic Tac Toe Logic
  const calculateWinner = (squares) => {
    const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    return null;
  };
  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(Boolean);

  const handleTicClick = (i) => {
    if (board[i] || winner) return;
    if (gameMode === '1P' && !xIsNext) return; // Prevent click during computer turn

    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  useEffect(() => {
    if (gameMode === '1P' && !xIsNext && !winner && !isDraw) {
      const timer = setTimeout(() => {
        const newBoard = [...board];

        // Helper to find a winning move for a given player
        const findWinningMove = (player) => {
          const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
          for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            const sq = [newBoard[a], newBoard[b], newBoard[c]];
            if (sq.filter(s => s === player).length === 2 && sq.includes(null)) {
              return lines[i][sq.indexOf(null)];
            }
          }
          return null;
        };

        let moveIndex = findWinningMove('O'); // 1. Try to Win
        if (moveIndex === null) moveIndex = findWinningMove('X'); // 2. Try to Block
        if (moveIndex === null && newBoard[4] === null) moveIndex = 4; // 3. Take Center
        if (moveIndex === null) {
          // 4. Random fallback
          const emptyIndices = newBoard.map((sq, i) => sq === null ? i : null).filter(i => i !== null);
          if (emptyIndices.length > 0) moveIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        }

        if (moveIndex !== null) {
          newBoard[moveIndex] = 'O';
          setBoard(newBoard);
          setXIsNext(true);
        }
      }, 500); // 500ms delay for the AI to "think"
      return () => clearTimeout(timer);
    }
  }, [xIsNext, gameMode, board, winner, isDraw]);

  const resetTicTacToe = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">

      <section className="mb-section-gap">
        <h1 className="font-headline-xl text-headline-xl text-primary mb-base">Creative Zone</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">A curated space for your intellect to wander. Capture raw thoughts, assemble visual inspiration, and sketch the foundations of your next breakthrough.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">

        {/* Left Column: Active Thoughts & Tic-Tac-Toe */}
        <div className="md:col-span-5 flex flex-col gap-gutter">

          {/* Active Thoughts */}
          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-gutter flex flex-col h-[320px]">
            <div className="flex justify-between items-center mb-gutter">
              <div className="flex items-center gap-base">
                <span className="material-symbols-outlined text-secondary">edit_note</span>
                <h2 className="font-headline-md text-headline-md">Active Thoughts</h2>
              </div>
            </div>
            <textarea
              className="flex-grow w-full bg-transparent border-none focus:ring-0 font-body-lg text-body-lg resize-none placeholder-on-surface-variant/40"
              placeholder="Start typing your thesis connections or creative sparks here..."
              value={textContent}
              onChange={handleTextChange}
            />
            <div className="mt-base pt-base border-t border-surface-variant flex justify-between items-center">
              <span className="font-caption text-caption text-on-surface-variant">{lastSaved}</span>
              <button onClick={handleExport} className="text-secondary font-label-md text-label-md flex items-center gap-1 hover:underline">
                <span className="material-symbols-outlined text-[18px]">export_notes</span> Export
              </button>
            </div>
          </div>

          {/* Tic Tac Toe */}
          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-gutter h-[500px] flex flex-col items-center">
            <div className="flex flex-wrap justify-between items-center w-full mb-4 gap-2">
              <h2 className="font-headline-md text-headline-md text-primary flex items-center gap-2 whitespace-nowrap">
                <span className="material-symbols-outlined text-secondary">videogame_asset</span> Mini Break
              </h2>
              <div className="flex items-center gap-2">
                <div className="bg-surface-variant rounded-lg p-1 flex">
                  <button onClick={() => { setGameMode('1P'); resetTicTacToe(); }} className={`px-3 py-1.5 text-xs font-bold rounded ${gameMode === '1P' ? 'bg-primary text-white shadow' : 'text-on-surface-variant hover:text-primary'}`}>1P</button>
                  <button onClick={() => { setGameMode('2P'); resetTicTacToe(); }} className={`px-3 py-1.5 text-xs font-bold rounded ${gameMode === '2P' ? 'bg-primary text-white shadow' : 'text-on-surface-variant hover:text-primary'}`}>2P</button>
                </div>
                <button onClick={resetTicTacToe} className="text-secondary hover:scale-110 transition-transform flex items-center justify-center p-1">
                  <span className="material-symbols-outlined">refresh</span>
                </button>
              </div>
            </div>

            <div className="flex-grow flex items-center justify-center w-full">
              <div className={`grid grid-cols-3 gap-2 bg-surface-variant p-2 rounded-xl shadow-inner transition-all duration-300 w-full max-w-[280px] aspect-square ${winner === 'X' ? 'ring-4 ring-pink-500 shadow-lg shadow-pink-200' :
                  winner === 'O' ? 'ring-4 ring-red-500 shadow-lg shadow-red-200' :
                  isDraw ? 'ring-4 ring-blue-400 shadow-lg shadow-blue-200' :
                    ''
                }`}>
                {board.map((square, i) => (
                  <button
                    key={i}
                    onClick={() => handleTicClick(i)}
                    className={`w-full h-full bg-surface-container-lowest rounded-lg flex items-center justify-center text-3xl md:text-4xl font-black transition-all ${square === 'X' ? 'text-primary' : 'text-secondary'} hover:bg-surface-bright shadow-sm active:scale-95`}
                  >
                    {square}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 font-label-md text-on-surface-variant h-6 text-center">
              {winner ? <span className="text-primary font-bold">Winner: {winner}</span> : isDraw ? "Draw!" : `Next Player: ${xIsNext ? 'X' : 'O'} ${gameMode === '1P' && !xIsNext ? '(Thinking...)' : ''}`}
            </div>
          </div>

        </div>

        {/* Right Column: Visual Board & Sketchpad */}
        <div className="md:col-span-7 flex flex-col gap-gutter">

          {/* Visual Board */}
          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-gutter h-[320px] overflow-hidden relative group">
            <div className="flex items-center gap-base mb-base">
              <span className="material-symbols-outlined text-secondary">collections</span>
              <h2 className="font-headline-md text-headline-md">Visual Board</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 h-full">
              <div className="h-40 rounded bg-surface-variant overflow-hidden">
                <img className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" alt="Visual 1" src={visualFeed[0]} />
              </div>
              <div className="h-40 rounded bg-surface-variant overflow-hidden">
                <img className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" alt="Visual 2" src={visualFeed[1]} />
              </div>
              <div className="h-40 rounded bg-surface-variant overflow-hidden col-span-2">
                <img className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" alt="Visual 3" src={visualFeed[2]} />
              </div>
            </div>
          </div>

          {/* Sketchpad */}
          <div className="bg-surface-container border border-outline-variant rounded-xl p-gutter flex-grow flex flex-col relative min-h-[500px] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-base relative z-10">
              <div className="flex items-center gap-base">
                <span className="material-symbols-outlined text-primary">draw</span>
                <h2 className="font-headline-md text-headline-md">Sketchpad</h2>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 bg-surface-bright px-2 sm:px-3 py-1.5 rounded-full shadow-sm border border-surface-variant shrink-0">
                <div className="flex gap-2 mr-2 border-r border-outline-variant pr-3">
                  {noteColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-5 h-5 rounded-full transition-transform ${selectedColor === color ? 'scale-125 ring-2 ring-primary ring-offset-1 ring-offset-surface-bright' : 'hover:scale-110'}`}
                      style={{ backgroundColor: color }}
                      title="Select Color"
                    />
                  ))}
                </div>
                <button onClick={addNote} className="text-primary hover:text-secondary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">add_circle</span>
                </button>
              </div>
            </div>

            <div className="flex-grow relative bg-surface-bright/50 rounded-lg overflow-hidden min-h-[350px]">
              {notes.map(note => (
                <motion.div
                  key={note.id}
                  drag
                  dragMomentum={false}
                  initial={{ x: note.x, y: note.y }}
                  animate={{ x: note.x, y: note.y }}
                  onDragEnd={(e, info) => handleDragEnd(note.id, info)}
                  className="absolute cursor-grab active:cursor-grabbing min-w-[150px] max-w-[200px] p-3 rounded shadow-md border border-black/5"
                  style={{ backgroundColor: note.color || '#fef3c7', x: note.x, y: note.y }}
                  whileDrag={{ scale: 1.05, zIndex: 50 }}
                >
                  <div className="flex justify-between items-start gap-1">
                    <textarea
                      rows={1}
                      value={note.text}
                      placeholder="Type note..."
                      onChange={(e) => handleNoteInput(e, note.id)}
                      className="bg-transparent border-none focus:ring-0 text-sm w-full resize-none font-caption overflow-hidden outline-none p-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button onClick={() => deleteNote(note.id)} className="text-xs opacity-40 hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                </motion.div>
              ))}
              {notes.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant text-sm">Select a color and click + to add a sticky note.</div>}
            </div>
          </div>

        </div>
      </div>

      {/* Inspiration Feed */}
      <section className="mt-section-gap">
        <div className="flex justify-between items-end mb-gutter">
          <div>
            <span className="font-label-md text-label-md text-secondary uppercase tracking-widest">Inspiration Feed</span>
            <h2 className="font-headline-lg text-headline-lg text-primary">Selenophile Sparks</h2>
          </div>
          <button onClick={() => setFeedOffset(prev => prev + 1)} className="text-primary font-bold hover:underline flex items-center gap-2 text-sm md:text-base transition-colors">
            Refresh Zone <span className="material-symbols-outlined text-base">refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {sparksFeed.map((spark, index) => (
            <div key={index} className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden group shadow-sm">
              <div className="h-48 overflow-hidden">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={spark.title} src={spark.img} />
              </div>
              <div className="p-base">
                <span className="inline-block px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed-variant text-caption font-caption rounded-full mb-2">
                  {spark.tag}
                </span>
                <h3 className="font-label-md text-label-md text-primary mb-1">{spark.title}</h3>
                <p className="font-caption text-caption text-on-surface-variant">{spark.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default CreativeZone;