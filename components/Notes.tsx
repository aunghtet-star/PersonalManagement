import React, { useState, useEffect } from 'react';
import { DailyLog } from '../types';
import { formatDate } from '../utils';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  PenLine, 
  StickyNote, 
  ListTodo, 
  CheckSquare, 
  Square,
  Plus
} from 'lucide-react';

interface NotesProps {
  logs: DailyLog[];
  onUpdateLog: (log: DailyLog) => void;
}

export default function Notes({ logs, onUpdateLog }: NotesProps) {
  const [filterMode, setFilterMode] = useState<'day' | 'month' | 'year'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // For 'day' mode editing
  const [currentNote, setCurrentNote] = useState('');
  const [editMode, setEditMode] = useState<'write' | 'checklist'>('write');
  
  const dateKey = selectedDate.toISOString().split('T')[0];

  // Sync current note when date changes (for day mode)
  useEffect(() => {
    const existingLog = logs.find(l => l.date === dateKey);
    setCurrentNote(existingLog?.notes || '');
  }, [dateKey, logs]);

  const saveNote = (newNoteContent: string) => {
    const existingLog = logs.find(l => l.date === dateKey) || {
        date: dateKey,
        waterIntake: 0,
        exerciseMinutes: 0,
        buddhistTimeMinutes: 0,
        sleepHours: 0,
        studyMinutes: 0,
        screenTimeMinutes: 0,
        notes: ''
    };
    
    onUpdateLog({ ...existingLog, notes: newNoteContent });
  };

  const handleBlur = () => {
      saveNote(currentNote);
  };

  const handlePrev = () => {
    const newDate = new Date(selectedDate);
    if (filterMode === 'day') newDate.setDate(selectedDate.getDate() - 1);
    if (filterMode === 'month') newDate.setMonth(selectedDate.getMonth() - 1);
    if (filterMode === 'year') newDate.setFullYear(selectedDate.getFullYear() - 1);
    setSelectedDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    if (filterMode === 'day') newDate.setDate(selectedDate.getDate() + 1);
    if (filterMode === 'month') newDate.setMonth(selectedDate.getMonth() + 1);
    if (filterMode === 'year') newDate.setFullYear(selectedDate.getFullYear() + 1);
    setSelectedDate(newDate);
  };

  // Helper to parse tasks
  const getTaskStats = (text: string) => {
      const lines = text.split('\n');
      const tasks = lines.filter(l => l.trim().match(/^- \[[ x]\]/));
      const completed = tasks.filter(l => l.includes('- [x]'));
      return { total: tasks.length, completed: completed.length };
  };

  const handleToggleTask = (index: number) => {
      const lines = currentNote.split('\n');
      const line = lines[index];
      
      if (line.includes('- [ ]')) {
          lines[index] = line.replace('- [ ]', '- [x]');
      } else if (line.includes('- [x]')) {
          lines[index] = line.replace('- [x]', '- [ ]');
      }
      
      const newText = lines.join('\n');
      setCurrentNote(newText);
      saveNote(newText);
  };

  const insertCheckbox = () => {
      const newText = currentNote + (currentNote.length > 0 && !currentNote.endsWith('\n') ? '\n' : '') + '- [ ] ';
      setCurrentNote(newText);
      // Ideally focus back to textarea, but simple append works for MVP
      saveNote(newText);
  };

  // Get logs for the current filter view
  const getFilteredLogs = () => {
    if (filterMode === 'day') return []; // Handled separately by input

    return logs.filter(log => {
        if (!log.notes.trim()) return false;
        const logDate = new Date(log.date);
        
        if (filterMode === 'month') {
            return logDate.getMonth() === selectedDate.getMonth() && 
                   logDate.getFullYear() === selectedDate.getFullYear();
        }
        if (filterMode === 'year') {
            return logDate.getFullYear() === selectedDate.getFullYear();
        }
        return false;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredLogs = getFilteredLogs();

  const getHeaderTitle = () => {
      if (filterMode === 'day') return formatDate(dateKey);
      if (filterMode === 'month') return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (filterMode === 'year') return selectedDate.getFullYear().toString();
      return '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 h-[calc(100vh-6rem)] flex flex-col">
        
        {/* Header Control Panel */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                    <StickyNote size={20} />
                </div>
                <div>
                    <h2 className="font-bold text-slate-800 dark:text-white">Notes & Focus</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Capture ideas and daily reflections</p>
                </div>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                {(['day', 'month', 'year'] as const).map(mode => (
                    <button
                        key={mode}
                        onClick={() => setFilterMode(mode)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                            filterMode === mode 
                            ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                        {mode}
                    </button>
                ))}
            </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700 flex-shrink-0">
            <button onClick={handlePrev} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
            
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
                <CalendarIcon size={18} className="text-slate-400" />
                {getHeaderTitle()}
            </div>

            <button onClick={handleNext} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
            {filterMode === 'day' ? (
                <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col animate-in fade-in duration-300">
                     <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            {editMode === 'write' ? <PenLine size={18} /> : <ListTodo size={18} />}
                            <span className="font-medium text-sm">{editMode === 'write' ? 'Write Note' : 'Checklist View'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                             {/* Stats Badge */}
                             {(() => {
                                 const { total, completed } = getTaskStats(currentNote);
                                 if (total === 0) return null;
                                 return (
                                     <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full mr-2">
                                         {completed}/{total} Done
                                     </span>
                                 );
                             })()}

                            <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
                                <button 
                                    onClick={() => setEditMode('write')}
                                    className={`p-1.5 rounded transition-all ${editMode === 'write' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    title="Edit Text"
                                >
                                    <PenLine size={16} />
                                </button>
                                <button 
                                    onClick={() => setEditMode('checklist')}
                                    className={`p-1.5 rounded transition-all ${editMode === 'checklist' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    title="Interactive Checklist"
                                >
                                    <ListTodo size={16} />
                                </button>
                            </div>
                        </div>
                     </div>

                     {editMode === 'write' ? (
                         <>
                            <textarea
                                value={currentNote}
                                onChange={(e) => setCurrentNote(e.target.value)}
                                onBlur={handleBlur}
                                placeholder="Write your daily focus, reflections, or start a task list with '- [ ] task'..."
                                className="flex-1 w-full resize-none bg-transparent outline-none text-slate-700 dark:text-slate-200 leading-relaxed placeholder-slate-400 font-mono text-sm"
                                spellCheck={false}
                            />
                            <div className="mt-2 flex justify-between items-center">
                                <button 
                                    onClick={insertCheckbox}
                                    className="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-600 font-medium px-2 py-1 hover:bg-blue-50 dark:hover:bg-slate-700 rounded transition-colors"
                                >
                                    <Plus size={14} /> Add Checkbox
                                </button>
                                <span className="text-xs text-slate-400">
                                    {currentNote ? 'Saved' : 'Start typing...'}
                                </span>
                            </div>
                         </>
                     ) : (
                         <div className="flex-1 overflow-y-auto space-y-1">
                             {currentNote.split('\n').map((line, idx) => {
                                 const isTask = line.trim().startsWith('- [ ]') || line.trim().startsWith('- [x]');
                                 const isChecked = line.trim().startsWith('- [x]');
                                 const content = line.replace(/^- \[[ x]\]/, '').trim();

                                 if (isTask) {
                                     return (
                                         <div key={idx} className="flex items-start gap-3 py-1.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded group">
                                             <button 
                                                 onClick={() => handleToggleTask(idx)}
                                                 className={`mt-0.5 flex-shrink-0 transition-colors ${isChecked ? 'text-blue-500' : 'text-slate-300 hover:text-blue-400'}`}
                                             >
                                                 {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                                             </button>
                                             <span className={`text-sm leading-relaxed transition-all ${isChecked ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                                 {content}
                                             </span>
                                         </div>
                                     );
                                 }
                                 
                                 // Render regular text lines in checklist view too, for context
                                 if (!line.trim()) return <div key={idx} className="h-4"></div>;
                                 return (
                                     <div key={idx} className="text-sm text-slate-500 dark:text-slate-400 py-1 px-2 pl-9">
                                         {line}
                                     </div>
                                 );
                             })}
                             {currentNote.trim().length === 0 && (
                                 <div className="text-center text-slate-400 mt-10">
                                     <p>No content yet.</p>
                                     <button onClick={() => setEditMode('write')} className="text-blue-500 text-sm mt-2 hover:underline">
                                         Start writing
                                     </button>
                                 </div>
                             )}
                         </div>
                     )}
                </div>
            ) : (
                <div className="h-full overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map(log => {
                            const { total, completed } = getTaskStats(log.notes);
                            const progress = total > 0 ? (completed / total) * 100 : 0;
                            
                            return (
                                <div key={log.date} className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-sm font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                            {formatDate(log.date)}
                                        </span>
                                        {total > 0 && (
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-xs font-medium text-slate-500">
                                                    {completed}/{total} Tasks
                                                </span>
                                                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }}></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-sm max-h-32 overflow-hidden relative">
                                        {log.notes.split('\n').slice(0, 5).map((line, i) => (
                                            <div key={i} className="truncate">
                                                {line.replace(/^- \[[ x]\]/, '• ')}
                                            </div>
                                        ))}
                                        {log.notes.split('\n').length > 5 && (
                                            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white dark:from-slate-800 to-transparent"></div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
                                <StickyNote size={32} className="opacity-50" />
                            </div>
                            <p>No notes found for this {filterMode}.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
}