import React, { useState } from 'react';
import { CalendarEvent, ExternalCalendar } from '../types';
import { generateId } from '../utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Plus, 
  Clock, 
  MapPin, 
  Loader2,
  RefreshCw,
  Settings2,
  Check,
  CalendarDays,
  Mail,
  Users,
  Globe
} from 'lucide-react';

interface ScheduleProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
  isGoogleConnected: boolean;
  onConnectGoogle: () => void;
  isMicrosoftConnected: boolean;
  onConnectMicrosoft: () => void;
  calendars?: ExternalCalendar[];
  onToggleCalendar?: (id: string) => void;
  onAddCalendar?: (calendar: ExternalCalendar) => void;
}

export default function Schedule({ 
  events, 
  onAddEvent, 
  isGoogleConnected, 
  onConnectGoogle,
  isMicrosoftConnected,
  onConnectMicrosoft,
  calendars = [],
  onToggleCalendar,
  onAddCalendar
}: ScheduleProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCalendarList, setShowCalendarList] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // New Team Calendar State
  const [newTeamMemberName, setNewTeamMemberName] = useState('');
  
  // New Event State
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '09:00',
    duration: 60, // minutes
    description: '',
    location: '',
    calendarId: 'local-1' // Default to personal
  });

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500); // Visual feedback
    // Trigger refreshes
    if (isGoogleConnected) onConnectGoogle();
    if (isMicrosoftConnected) onConnectMicrosoft();
  };

  const handleAddTeamCalendar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamMemberName.trim() || !onAddCalendar) return;

    // Generate a random pastel color
    const hue = Math.floor(Math.random() * 360);
    const color = `hsl(${hue}, 70%, 50%)`;

    onAddCalendar({
        id: generateId(),
        summary: newTeamMemberName,
        provider: 'team',
        selected: true,
        backgroundColor: color
    });
    setNewTeamMemberName('');
  };

  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !newEvent.title) return;

    // Construct start/end dates
    const startDateTime = new Date(selectedDate);
    const [hours, minutes] = newEvent.time.split(':').map(Number);
    startDateTime.setHours(hours, minutes);
    
    const endDateTime = new Date(startDateTime.getTime() + newEvent.duration * 60000);

    // Find selected calendar to get details
    const targetCalendar = calendars.find(c => c.id === newEvent.calendarId);
    
    const event: CalendarEvent = {
      id: generateId(),
      title: newEvent.title,
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      type: targetCalendar?.provider || 'local',
      description: newEvent.description,
      location: newEvent.location,
      color: targetCalendar?.backgroundColor || '#3b82f6',
      calendarId: newEvent.calendarId
    };

    onAddEvent(event);
    setShowAddModal(false);
    setNewEvent({ title: '', time: '09:00', duration: 60, description: '', location: '', calendarId: 'local-1' });
  };

  // --- Group Calendars for Display ---
  // "My Calendars": Local + API Primary Calendars
  const myCalendars = calendars.filter(c => c.provider === 'local' || c.primary);
  
  // "Team & Other": API Non-Primary + Manual Team
  const teamCalendars = calendars.filter(c => c.provider === 'team' || (!c.primary && c.provider !== 'local'));

  // Helpers for Icon Display
  const getProviderIcon = (provider: string) => {
    switch(provider) {
      case 'google': return <img src="https://www.google.com/favicon.ico" alt="Google" className="w-3.5 h-3.5" />;
      case 'microsoft': return <img src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" alt="Outlook" className="w-3.5 h-3.5" />;
      case 'team': return <Users size={14} className="text-indigo-500" />;
      default: return null;
    }
  };

  // Filter events for the selected date AND visible calendars
  const selectedDayEvents = events.filter(e => {
    if (!selectedDate) return false;
    
    // Check if calendar is selected
    if (e.calendarId) {
        const cal = calendars.find(c => c.id === e.calendarId);
        if (cal && !cal.selected) return false;
    } else if (e.type === 'google') {
       // Fallback for events without ID (shouldn't happen with new logic but safe to keep)
       const googleCals = calendars.filter(c => c.provider === 'google' && c.selected);
       if (googleCals.length === 0) return false;
    }

    const eventDate = new Date(e.start);
    return eventDate.toDateString() === selectedDate.toDateString();
  }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // Get calendar grid data
  const { days, firstDay } = getDaysInMonth(currentDate);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const monthDays = Array.from({ length: days }, (_, i) => i + 1);

  // Helper to check if a day has events
  const getDayEvents = (day: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(e => {
        const eventDate = new Date(e.start);
        const matchesDate = eventDate.toDateString() === checkDate.toDateString();
        
        // Visibility check
        let isVisible = true;
        if (e.calendarId) {
            const cal = calendars.find(c => c.id === e.calendarId);
            if (cal && !cal.selected) isVisible = false;
        }

        return matchesDate && isVisible;
    });
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 h-[calc(100vh-6rem)]">
      
      {/* Left Column: Calendar Grid */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col relative">
        {/* Header */}
        <div className="flex flex-col xl:flex-row justify-between xl:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-1">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
              </button>
              <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
             {/* Connection Buttons */}
             {!isGoogleConnected && (
                <button
                onClick={onConnectGoogle}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                <span>Connect Google</span>
                </button>
             )}
             
             {!isMicrosoftConnected && (
                 <button
                 onClick={onConnectMicrosoft}
                 className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                 >
                 <img src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" alt="Outlook" className="w-4 h-4" />
                 <span>Connect Outlook</span>
                 </button>
             )}

            {/* Calendar Settings */}
            <div className="relative">
                <button 
                onClick={() => setShowCalendarList(!showCalendarList)}
                className={`p-2 border rounded-lg transition-colors ${
                    showCalendarList 
                    ? 'bg-blue-50 border-blue-200 text-blue-600' 
                    : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
                title="Manage Calendars"
                >
                <Settings2 size={20} />
                </button>

                {/* Calendar Dropdown */}
                {showCalendarList && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 p-2 animate-in fade-in zoom-in-95 duration-200 max-h-[400px] overflow-y-auto">
                    
                    {/* My Calendars Group */}
                    <div className="mb-2">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase px-2 py-1">My Calendars</h3>
                        {myCalendars.map(cal => (
                        <button
                            key={cal.id}
                            onClick={() => onToggleCalendar && onToggleCalendar(cal.id)}
                            className="w-full flex items-center gap-3 px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-left"
                        >
                            <div 
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${cal.selected ? 'border-transparent' : 'border-slate-300'}`}
                            style={{ backgroundColor: cal.selected ? cal.backgroundColor : 'transparent' }}
                            >
                            {cal.selected && <Check size={10} className="text-white" />}
                            </div>
                            <span className="text-sm truncate flex-1 text-slate-700 dark:text-slate-200">{cal.summary}</span>
                            {getProviderIcon(cal.provider)}
                        </button>
                        ))}
                    </div>

                    {/* Team & Other Calendars Group */}
                    <div className="mb-2 border-t border-slate-100 dark:border-slate-700 pt-2">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase px-2 py-1 flex items-center gap-2">
                             <Users size={12} /> Team & Subscribed
                        </h3>
                        {teamCalendars.length === 0 && (
                            <p className="text-xs text-slate-400 px-2 py-1 italic">No team calendars found.</p>
                        )}
                        {teamCalendars.map(cal => (
                            <button
                                key={cal.id}
                                onClick={() => onToggleCalendar && onToggleCalendar(cal.id)}
                                className="w-full flex items-center gap-3 px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-left"
                            >
                                <div 
                                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${cal.selected ? 'border-transparent' : 'border-slate-300'}`}
                                style={{ backgroundColor: cal.selected ? cal.backgroundColor : 'transparent' }}
                                >
                                {cal.selected && <Check size={10} className="text-white" />}
                                </div>
                                <span className="text-sm truncate flex-1 text-slate-700 dark:text-slate-200">{cal.summary}</span>
                                {getProviderIcon(cal.provider)}
                            </button>
                        ))}
                        
                        {/* Manual Add Team Member (Offline) */}
                        <form onSubmit={handleAddTeamCalendar} className="px-2 mt-2 flex gap-1 pt-2 border-t border-slate-100 dark:border-slate-700">
                            <input 
                                type="text"
                                placeholder="Add manual calendar..."
                                value={newTeamMemberName}
                                onChange={(e) => setNewTeamMemberName(e.target.value)}
                                className="w-full text-xs px-2 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-blue-500 dark:text-white"
                            />
                            <button 
                                type="submit"
                                disabled={!newTeamMemberName.trim()}
                                className="bg-blue-600 text-white rounded p-1 hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Plus size={14} />
                            </button>
                        </form>
                    </div>

                </div>
                )}
            </div>

            {/* Sync Button */}
            {(isGoogleConnected || isMicrosoftConnected) && (
                <button
                onClick={handleSync}
                disabled={isSyncing}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                title="Sync All Calendars"
                >
                {isSyncing ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
                </button>
            )}
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 mb-4">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 flex-1">
          {blanks.map(i => (
            <div key={`blank-${i}`} className="bg-slate-50/50 dark:bg-slate-800/50 rounded-lg"></div>
          ))}
          
          {monthDays.map(day => {
            const isToday = 
              day === new Date().getDate() && 
              currentDate.getMonth() === new Date().getMonth() && 
              currentDate.getFullYear() === new Date().getFullYear();
            
            const isSelected = 
              selectedDate && 
              day === selectedDate.getDate() && 
              currentDate.getMonth() === selectedDate.getMonth() && 
              currentDate.getFullYear() === selectedDate.getFullYear();

            const dayEvents = getDayEvents(day);

            return (
              <div 
                key={day}
                onClick={() => handleDateClick(day)}
                className={`
                  relative min-h-[80px] p-2 rounded-xl border transition-all cursor-pointer group
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 dark:bg-slate-700 shadow-sm ring-1 ring-blue-500' 
                    : 'border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'}
                  ${isToday ? 'bg-slate-50 dark:bg-slate-700/30' : ''}
                `}
              >
                <span className={`
                  text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1
                  ${isToday 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                    : isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}
                `}>
                  {day}
                </span>

                {/* Event Indicators */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((ev, i) => (
                    <div 
                      key={ev.id} 
                      className="text-[10px] truncate px-1.5 py-0.5 rounded-sm text-white opacity-90 flex items-center gap-1"
                      style={{ backgroundColor: ev.color || '#3b82f6' }}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-slate-400 px-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Events & Add Form */}
      <div className="flex flex-col gap-6">
        
        {/* Selected Day Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-6">
             <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                   {selectedDayEvents.length} events scheduled
                </p>
             </div>
             <button 
               onClick={() => setShowAddModal(true)}
               className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
             >
               <Plus size={20} />
             </button>
          </div>

          <div className="space-y-3 overflow-y-auto flex-1 pr-2">
            {selectedDayEvents.map(event => (
              <div 
                key={event.id} 
                className="group relative bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border-l-4 transition-all hover:shadow-md hover:bg-white dark:hover:bg-slate-700"
                style={{ borderLeftColor: event.color || '#3b82f6' }}
              >
                <h4 className="font-semibold text-slate-800 dark:text-white mb-1 pr-6">{event.title}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     - 
                    {new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {event.location && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-2">
                     <MapPin size={12} /> {event.location}
                  </div>
                )}
                {event.description && (
                   <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{event.description}</p>
                )}
                
                {/* Provider Icon */}
                <div className="absolute top-3 right-3" title={event.type}>
                  {event.type === 'google' && <CalendarDays size={14} className="text-blue-500 opacity-60" />}
                  {event.type === 'microsoft' && <Mail size={14} className="text-blue-400 opacity-60" />}
                  {event.type === 'team' && <Users size={14} className="text-indigo-400 opacity-60" />}
                </div>
              </div>
            ))}
            
            {selectedDayEvents.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center">
                 <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full mb-3">
                   <Calendar size={24} className="opacity-50" />
                 </div>
                 <p className="text-sm">No events for this day.</p>
                 <button onClick={() => setShowAddModal(true)} className="text-blue-500 text-sm mt-2 hover:underline">
                   Add an event
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white">Add New Event</h3>
               <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                 &times;
               </button>
            </div>
            
            <form onSubmit={handleSubmitEvent} className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Event Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Meeting with Client"
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Calendar</label>
                  <select
                    value={newEvent.calendarId}
                    onChange={e => setNewEvent({...newEvent, calendarId: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                     <optgroup label="My Calendars">
                        {myCalendars.map(c => (
                            <option key={c.id} value={c.id}>{c.summary}</option>
                        ))}
                     </optgroup>
                     {teamCalendars.length > 0 && (
                        <optgroup label="Team & Subscribed">
                             {teamCalendars.map(c => (
                                <option key={c.id} value={c.id}>{c.summary}</option>
                            ))}
                        </optgroup>
                     )}
                  </select>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                    <input 
                      type="time" 
                      required
                      value={newEvent.time}
                      onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration (mins)</label>
                    <input 
                      type="number" 
                      min="15"
                      step="15"
                      value={newEvent.duration}
                      onChange={e => setNewEvent({...newEvent, duration: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location (Optional)</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Add location"
                      value={newEvent.location}
                      onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea 
                    placeholder="Add details"
                    rows={3}
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"
                  />
               </div>

               <div className="flex gap-3 pt-2">
                 <button 
                   type="button" 
                   onClick={() => setShowAddModal(false)}
                   className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit" 
                   className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                 >
                   Save Event
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}