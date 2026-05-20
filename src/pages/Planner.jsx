import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Toast from '../components/Toast';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const Planner = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [complaintModal, setComplaintModal] = useState(false);
  const [complaintText, setComplaintText] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', description: '', type: 'deepWork' });

  // Focus Items State with localStorage initialization
  const [focusItems, setFocusItems] = useState(() => {
    const saved = localStorage.getItem('plannerFocusItems');
    if (saved) {
      try { 
        return JSON.parse(saved); 
      } catch (e) { 
        console.error("Error parsing saved focus items"); 
      }
    }
    return [
      { id: 1, title: 'Advanced Calculus', tag: 'STEM', tagClass: 'bg-tertiary-fixed text-on-tertiary-fixed', desc: 'Deep work session: 90 mins', completed: false },
      { id: 2, title: 'Metaphysics Review', tag: 'Humanities', tagClass: 'bg-secondary-fixed text-on-secondary-fixed-variant', desc: 'Reading & Annotation: 60 mins', completed: false },
      { id: 3, title: 'Organic Chemistry', tag: 'Science', tagClass: 'bg-surface-variant text-on-surface-variant', desc: 'Completed at 08:30 AM', completed: true },
    ];
  });
  const [newFocus, setNewFocus] = useState('');

  // Image Upload State with localStorage initialization
  const [uploadedImage, setUploadedImage] = useState(() => {
    return localStorage.getItem('plannerUploadedImage') || null;
  });
  const fileInputRef = useRef(null);

  // Crop State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [cropAspect, setCropAspect] = useState(16 / 9);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('plannerFocusItems', JSON.stringify(focusItems));
  }, [focusItems]);

  useEffect(() => {
    if (uploadedImage) {
      localStorage.setItem('plannerUploadedImage', uploadedImage);
    } else {
      localStorage.removeItem('plannerUploadedImage');
    }
  }, [uploadedImage]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  // Standard JS gives 0 for Sunday. We adjust it so Monday is index 0.
  const startingDay = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Get local date string instead of UTC to prevent timezone bugs
  const getLocalDateString = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  };
  const today = getLocalDateString();

  const fetchEvents = async () => {
    try {
      const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
      const res = await api.get(`/planner?month=${monthStr}`);
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [year, month]);

  const getEventsForDate = (dateStr) => events.filter(e => e.date === dateStr);

  const handleOpenModal = (dateStr, event = null) => {
    setSelectedDate(dateStr);
    if (event) {
      setEditingEvent(event);
      setEventForm({ title: event.title, description: event.description, type: event.type });
    } else {
      setEditingEvent(null);
      setEventForm({ title: '', description: '', type: 'deepWork' });
    }
    setModalOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title.trim()) return;
    setLoading(true);
    try {
      if (editingEvent) {
        await api.post('/planner', { id: editingEvent._id, ...eventForm, date: selectedDate });
      } else {
        await api.post('/planner', { ...eventForm, date: selectedDate });
      }
      await fetchEvents();
      setModalOpen(false);
      setToast({ message: 'Event saved', type: 'success' });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error saving event';
      console.error('Save Event Error:', errorMsg);
      setToast({ message: `Error: ${errorMsg}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent) return;
    setLoading(true);
    try {
      await api.delete(`/planner/${editingEvent._id}`);
      await fetchEvents();
      setModalOpen(false);
      setToast({ message: 'Event deleted', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error deleting event', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseIssue = async () => {
    if (!complaintText.trim()) return;
    setLoading(true);
    try {
      await api.post('/complaints', { userId: user.id, text: complaintText });
      setToast({ message: 'Complaint submitted', type: 'success' });
      setComplaintModal(false);
      setComplaintText('');
    } catch (err) {
      setToast({ message: 'Error submitting complaint', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (delta) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  const handleAddFocus = () => {
    if (!newFocus.trim()) return;
    const newItem = {
      id: Date.now(),
      title: newFocus,
      tag: '',
      tagClass: 'hidden',
      desc: '',
      completed: false
    };
    setFocusItems([...focusItems, newItem]);
    setNewFocus('');
  };

  const toggleFocus = (id) => {
    setFocusItems(focusItems.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteFocus = (id) => {
    setFocusItems(focusItems.filter(item => item.id !== id));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is larger than 2MB (2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
      setToast({ message: 'Image is too large. Please upload a file smaller than 2MB.', type: 'error' });
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImgSrc(reader.result);
      setCropModalOpen(true);
      // Reset input so the same file can be selected again if cancelled
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    imgRef.current = e.currentTarget;
    
    // Determine aspect ratio based on window size
    let aspect = 16 / 9;
    if (window.innerWidth >= 1024) aspect = 21 / 9; // PC
    else if (window.innerWidth >= 768) aspect = 16 / 9; // Tablet
    else aspect = 1; // Mobile (Square)
    
    setCropAspect(aspect);

    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  };

  const generateCroppedImage = async () => {
    if (!imgRef.current) return;

    const image = imgRef.current;
    
    // If no crop is selected, treat the whole image as the crop area
    const cropToUse = (completedCrop && completedCrop.width && completedCrop.height)
      ? completedCrop
      : { x: 0, y: 0, width: image.width, height: image.height };

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Ensure actual pixel coordinates based on the original image dimensions
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(cropToUse.width * scaleX * pixelRatio);
    canvas.height = Math.floor(cropToUse.height * scaleY * pixelRatio);
    
    const ctx = canvas.getContext('2d');
    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = cropToUse.x * scaleX;
    const cropY = cropToUse.y * scaleY;
    const cropWidth = cropToUse.width * scaleX;
    const cropHeight = cropToUse.height * scaleY;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    const base64Image = canvas.toDataURL('image/jpeg', 0.9);
    setUploadedImage(base64Image);
    setCropModalOpen(false);
    setImgSrc('');
    setCompletedCrop(null);
    setCrop(undefined);
  };

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const calendarDays = [];
  for (let i = 0; i < startingDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-gutter min-h-screen">
      <header className="mb-section-gap flex flex-col md:flex-row justify-between items-start md:items-end gap-base">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-primary mb-2">Study Planner</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">Curate your mental environment. Organize deep work sessions to master complex subjects with monastic focus.</p>
        </div>
        <div className="flex flex-wrap gap-base mt-4 md:mt-0">
          <button 
            onClick={() => {
              logout();
              navigate('/');
            }} 
            className="flex items-center gap-2 px-4 py-2 border border-surface-variant text-on-surface-variant rounded-lg font-label-md hover:bg-surface-variant transition-all"
          >
            <span className="material-symbols-outlined">logout</span> Logout
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-4 space-y-gutter">
          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-gutter shadow-sm">
            <h2 className="font-headline-md text-headline-md text-primary mb-gutter flex items-center gap-2">
              <span className="material-symbols-outlined">priority_high</span> Today's Focus
            </h2>
            <div className="space-y-4">
              {focusItems.map(item => (
                <div key={item.id} className={`flex items-start gap-3 p-4 border rounded-lg transition-colors bg-surface-container-lowest ${item.completed ? 'border-surface-container-high bg-surface-container-low/50 opacity-60' : 'border-surface-container-high hover:border-primary'}`}>
                  <button onClick={() => toggleFocus(item.id)} className="mt-1 focus:outline-none">
                    <span className={`material-symbols-outlined ${item.completed ? 'text-primary' : 'text-secondary'}`} style={item.completed ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {item.completed ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </button>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <span className={`font-label-md text-primary ${item.completed ? 'line-through' : ''}`}>{item.title}</span>
                      {item.tag && item.tag.toLowerCase() !== 'custom' && (
                        <span className={`text-caption px-2 py-0.5 rounded-full ${item.tagClass}`}>{item.tag}</span>
                      )}
                    </div>
                    {item.desc && !item.desc.toLowerCase().includes('deep work session') && (
                      <p className="text-caption text-on-surface-variant mt-1">{item.desc}</p>
                    )}
                  </div>
                  <button onClick={() => deleteFocus(item.id)} className="text-on-surface-variant hover:text-error transition-colors mt-1">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
              <div className="flex gap-2 mt-4">
                <input 
                  type="text" 
                  value={newFocus} 
                  onChange={(e) => setNewFocus(e.target.value)} 
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddFocus(); }}
                  placeholder="Add new focus task..." 
                  className="flex-1 bg-surface-bright border border-surface-variant rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:border-primary transition-colors"
                />
                <button onClick={handleAddFocus} className="bg-primary text-on-primary px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm">
          <div className="p-gutter border-b border-surface-variant flex justify-between items-center flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <h2 className="font-headline-md text-headline-md text-primary uppercase">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
              <div className="flex gap-2">
                <button onClick={() => changeMonth(-1)} className="material-symbols-outlined p-1 hover:bg-surface-variant rounded transition-colors">chevron_left</button>
                <button onClick={() => changeMonth(1)} className="material-symbols-outlined p-1 hover:bg-surface-variant rounded transition-colors">chevron_right</button>
              </div>
            </div>
            <div className="flex items-center gap-4 font-label-md">
              <span className="flex items-center gap-2 text-on-surface"><span className="w-3 h-3 rounded-full bg-primary"></span> Deep Work</span>
              <span className="flex items-center gap-2 text-on-surface"><span className="w-3 h-3 rounded-full bg-tertiary"></span> Review</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[300px] md:min-w-full">
              <div className="grid grid-cols-7 border-collapse">
                {days.map((day, index) => (
                  <div key={day} className={`p-2 md:p-3 text-center text-xs md:text-sm font-label-md border-r border-b border-surface-variant ${index >= 5 ? 'text-secondary' : 'text-on-surface-variant'}`}>{day}</div>
                ))}
                {calendarDays.map((day, idx) => {
                  const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                  const dayEvents = dateStr ? getEventsForDate(dateStr) : [];
                  const isToday = dateStr === today;
                  const isWeekend = (idx % 7) === 5 || (idx % 7) === 6;
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => day && handleOpenModal(dateStr)}
                      className={`min-h-[60px] md:min-h-[80px] p-1 md:p-2 border-r border-b border-surface-variant hover:bg-surface-bright/30 cursor-pointer transition ${!day ? 'text-on-surface-variant opacity-40' : isToday ? 'ring-2 ring-primary ring-inset bg-primary/10 text-primary font-bold' : isWeekend ? 'text-secondary font-bold' : 'text-primary font-bold'}`}
                    >
                      {day && (
                        <>
                          <span className="text-sm">{day}</span>
                          <div className="mt-1 space-y-1">
                            {dayEvents.map(ev => (
                                <div 
                                  key={ev._id} 
                                  onClick={(e) => { e.stopPropagation(); handleOpenModal(dateStr, ev); }}
                                  className={`text-[10px] p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${ev.type === 'deepWork' ? 'bg-primary text-white' : 'bg-tertiary text-white'}`}
                                >
                                {ev.title}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-section-gap grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
          <div className="absolute -inset-2 bg-gradient-to-r from-primary to-secondary opacity-10 rounded-xl blur-xl transition group-hover:opacity-20"></div>
          <div className="relative aspect-square md:aspect-video lg:aspect-[21/9] rounded-xl overflow-hidden border border-surface-variant bg-surface-container flex items-center justify-center">
            {uploadedImage ? (
              <img className="w-full h-full object-cover grayscale-20 hover:grayscale-0 transition-all duration-700" alt="Serene study corner" src={uploadedImage} />
            ) : (
              <div className="text-center p-6 flex flex-col items-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">add_photo_alternate</span>
                <p className="font-label-md text-on-surface-variant">Click to upload your aesthetic study space</p>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-base pl-0 md:pl-gutter">
          <h3 className="font-headline-md text-headline-md text-primary italic">"The quality of your work is the result of your ability to focus without distraction."</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">"It's the repetition of affirmations that leads to belief. And once that belief becomes a deep conviction, things begin to happen."</p>
        </div>
      </section>

      {/* Event Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-surface-container-lowest rounded-xl p-6 max-w-md w-full border border-surface-variant shadow-lg" onClick={e => e.stopPropagation()}>
              <h3 className="font-headline-md text-headline-md text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">{editingEvent ? 'edit_calendar' : 'event_available'}</span>
                {editingEvent ? 'Edit Session' : 'Schedule Session'}
              </h3>
              <div className="space-y-4">
                <input type="text" placeholder="Session Title (e.g. Theory of Relativity)" className="w-full bg-surface-bright border border-surface-variant rounded-lg p-3 text-on-surface outline-none focus:border-primary transition-colors" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} />
                <textarea placeholder="Description or notes (optional)" rows={3} className="w-full bg-surface-bright border border-surface-variant rounded-lg p-3 text-on-surface outline-none focus:border-primary transition-colors resize-none" value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} />
                <select className="w-full bg-surface-bright border border-surface-variant rounded-lg p-3 text-on-surface outline-none focus:border-primary transition-colors" value={eventForm.type} onChange={e => setEventForm({ ...eventForm, type: e.target.value })}>
                  <option value="deepWork">Deep Work (Primary Focus)</option>
                  <option value="review">Review (Secondary Focus)</option>
                </select>
                <div className="flex gap-3 pt-4">
                  <button onClick={handleSaveEvent} disabled={loading} className="flex-1 bg-primary text-on-primary py-2.5 rounded-lg font-label-md hover:bg-secondary transition-colors">Save Session</button>
                  {editingEvent && <button onClick={handleDeleteEvent} disabled={loading} className="flex-1 border border-error text-error py-2.5 rounded-lg font-label-md hover:bg-error-container transition-colors">Remove</button>}
                  <button onClick={() => setModalOpen(false)} className="flex-1 border border-surface-variant py-2.5 rounded-lg text-on-surface hover:bg-surface-variant/50 transition-colors">Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complaint Modal */}
      <AnimatePresence>
        {complaintModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setComplaintModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-surface-container-lowest rounded-xl p-6 max-w-md w-full border border-surface-variant shadow-lg" onClick={e => e.stopPropagation()}>
              <h3 className="font-headline-md text-headline-md text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">live_help</span> Raise an Issue
              </h3>
              <textarea placeholder="Describe your issue or suggestion here..." rows={4} className="w-full bg-surface-bright border border-surface-variant rounded-lg p-3 mb-4 text-on-surface outline-none focus:border-primary transition-colors resize-none" value={complaintText} onChange={e => setComplaintText(e.target.value)} />
              <div className="flex gap-3">
                <button onClick={handleRaiseIssue} disabled={loading} className="flex-1 bg-primary text-on-primary py-2.5 rounded-lg font-label-md hover:bg-secondary transition-colors">Submit Issue</button>
                <button onClick={() => setComplaintModal(false)} className="flex-1 border border-surface-variant py-2.5 rounded-lg text-on-surface hover:bg-surface-variant/50 transition-colors">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crop Modal */}
      <AnimatePresence>
        {cropModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setCropModalOpen(false); setImgSrc(''); setCrop(undefined); }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-surface-container-lowest rounded-xl p-6 max-w-2xl w-full border border-surface-variant shadow-lg" onClick={e => e.stopPropagation()}>
              <h3 className="font-headline-md text-headline-md text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">crop</span> Crop Image
              </h3>
              <div className="flex justify-center max-h-[70vh] overflow-hidden mb-6 bg-surface-variant rounded-lg p-2">
                {imgSrc && (
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={cropAspect}
                    className="max-h-full"
                  >
                    <img src={imgSrc} onLoad={onImageLoad} alt="Crop" className="max-h-[65vh] w-auto object-contain" />
                  </ReactCrop>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={generateCroppedImage} className="flex-1 bg-primary text-on-primary py-2.5 rounded-lg font-label-md hover:bg-secondary transition-colors">Crop & Save</button>
                <button onClick={() => { setCropModalOpen(false); setImgSrc(''); setCrop(undefined); }} className="flex-1 border border-surface-variant py-2.5 rounded-lg text-on-surface hover:bg-surface-variant/50 transition-colors">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Planner;