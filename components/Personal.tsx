import React, { useState, useEffect } from 'react';
import { DailyLog } from '../types';
import { 
  Droplets, 
  Dumbbell, 
  Moon, 
  BookOpen, 
  Smartphone, 
  Flower2, 
  BarChart3,
  CalendarCheck
} from 'lucide-react';

interface PersonalProps {
  logs: DailyLog[];
  onUpdateLog: (log: DailyLog) => void;
}

const DEFAULT_LOG: DailyLog = {
  date: '',
  waterIntake: 0,
  exerciseMinutes: 0,
  buddhistTimeMinutes: 0,
  sleepHours: 0,
  studyMinutes: 0,
  screenTimeMinutes: 0,
  notes: ''
};

// --- Reusable Components ---

const TimeMetricCard = ({ 
  icon: Icon, 
  title, 
  value, 
  unit, 
  onChange, 
  colorClass,
  max 
}: { 
  icon: any, 
  title: string, 
  value: number, 
  unit: string, 
  onChange: (val: number) => void,
  colorClass: string,
  max: number
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-20 dark:bg-opacity-20`}>
          <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <h3 className="font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
        <span className="text-sm text-slate-500">{unit}</span>
      </div>
      
      <input 
        type="range" 
        min="0" 
        max={max} 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between mt-2 text-xs text-slate-400">
        <span>0</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
};

const TrendChart = ({ title, data, labels, color, unit, max }: { title: string, data: number[], labels: string[], color: string, unit: string, max: number }) => {
  const average = data.length > 0 ? data.reduce((a, b) => a + b, 0) / data.length : 0;
  
  const showLabel = (index: number) => {
    if (data.length <= 7) return true; // Week view
    if (data.length === 12) return true; // Year view
    return index % 5 === 0; // Month view
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
        <div className="text-right">
            <span className="block text-xs text-slate-400">Avg</span>
            <span className="font-bold text-slate-800 dark:text-white">{average.toFixed(1)} {unit}</span>
        </div>
      </div>
      
      <div className="flex items-end justify-between h-32 gap-1 sm:gap-2 mt-auto">
        {data.map((value, i) => {
          const heightPercentage = Math.min((value / max) * 100, 100);
          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-default min-w-0">
               <div className="relative w-full flex justify-center h-full items-end">
                  <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg">
                     {labels[i]}: {value} {unit}
                  </div>
                  <div 
                    className={`w-full rounded-t-sm sm:rounded-t-md opacity-80 group-hover:opacity-100 transition-all ${color}`}
                    style={{ height: `${heightPercentage}%`, minHeight: value > 0 ? '4px' : '0' }} 
                  ></div>
               </div>
               <span className={`text-[10px] text-slate-400 font-medium ${!showLabel(i) ? 'hidden' : ''}`}>
                 {labels[i]}
               </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Main Component ---

export default function Personal({ logs, onUpdateLog }: PersonalProps) {
  const [activeTab, setActiveTab] = useState<'tracker' | 'insights'>('tracker');
  const [insightView, setInsightView] = useState<'week' | 'month' | 'year'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentLog, setCurrentLog] = useState<DailyLog>(DEFAULT_LOG);

  const dateKey = selectedDate.toISOString().split('T')[0];

  useEffect(() => {
    const existingLog = logs.find(l => l.date === dateKey);
    if (existingLog) {
      setCurrentLog(existingLog);
    } else {
      setCurrentLog({ ...DEFAULT_LOG, date: dateKey });
    }
  }, [dateKey, logs]);

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const updateField = (field: keyof DailyLog, value: any) => {
    const updated = { ...currentLog, [field]: value };
    setCurrentLog(updated);
    onUpdateLog(updated);
  };

  // Helper functions for chart data
  const getLast7DaysData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const log = logs.find(l => l.date === dateStr) || { ...DEFAULT_LOG, date: dateStr };
      days.push({ label: dayName, ...log });
    }
    return days;
  };

  const getMonthData = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const log = logs.find(l => l.date === dateStr) || { ...DEFAULT_LOG, date: dateStr };
        days.push({ label: String(i), ...log });
    }
    return days;
  };

  const getYearData = () => {
    const year = selectedDate.getFullYear();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((monthName, index) => {
       const monthlyLogs = logs.filter(l => {
          const d = new Date(l.date);
          return d.getFullYear() === year && d.getMonth() === index;
       });
       if (monthlyLogs.length === 0) return { label: monthName, ...DEFAULT_LOG };
       
       const sums = monthlyLogs.reduce((acc, log) => ({
          waterIntake: acc.waterIntake + log.waterIntake,
          exerciseMinutes: acc.exerciseMinutes + log.exerciseMinutes,
          buddhistTimeMinutes: acc.buddhistTimeMinutes + log.buddhistTimeMinutes,
          sleepHours: acc.sleepHours + log.sleepHours,
          studyMinutes: acc.studyMinutes + log.studyMinutes,
          screenTimeMinutes: acc.screenTimeMinutes + log.screenTimeMinutes
       }), { 
          waterIntake: 0,
          exerciseMinutes: 0,
          buddhistTimeMinutes: 0,
          sleepHours: 0,
          studyMinutes: 0,
          screenTimeMinutes: 0
       });

       const count = monthlyLogs.length;
       return {
          label: monthName,
          waterIntake: parseFloat((sums.waterIntake / count).toFixed(1)),
          exerciseMinutes: Math.round(sums.exerciseMinutes / count),
          buddhistTimeMinutes: Math.round(sums.buddhistTimeMinutes / count),
          sleepHours: parseFloat((sums.sleepHours / count).toFixed(1)),
          studyMinutes: Math.round(sums.studyMinutes / count),
          screenTimeMinutes: Math.round(sums.screenTimeMinutes / count),
          notes: '',
          date: ''
       };
    });
  };

  const chartData = insightView === 'week' ? getLast7DaysData() : insightView === 'month' ? getMonthData() : getYearData();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Daily Wellness Tracker</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Track your habits, health, and personal growth.</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
           <button
             onClick={() => setActiveTab('tracker')}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
               activeTab === 'tracker' 
                 ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                 : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
             }`}
           >
             <CalendarCheck size={16} /> Tracker
           </button>
           <button
             onClick={() => setActiveTab('insights')}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
               activeTab === 'insights' 
                 ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                 : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
             }`}
           >
             <BarChart3 size={16} /> Insights
           </button>
        </div>
      </div>

      {activeTab === 'tracker' && (
        <>
          {/* Date Selector */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
            <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300">
               ←
            </button>
            <div className="text-center">
              <span className="block font-bold text-lg text-slate-800 dark:text-white">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {new Date().toDateString() === selectedDate.toDateString() ? 'Today' : 'History View'}
              </span>
            </div>
            <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300">
               →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TimeMetricCard 
              icon={Droplets} title="Water Intake" value={currentLog.waterIntake} unit="cups" 
              onChange={(v) => updateField('waterIntake', v)} colorClass="bg-blue-500" max={15}
            />
            <TimeMetricCard 
              icon={Dumbbell} title="Exercise" value={currentLog.exerciseMinutes} unit="mins" 
              onChange={(v) => updateField('exerciseMinutes', v)} colorClass="bg-orange-500" max={180}
            />
            <TimeMetricCard 
              icon={Flower2} title="Meditation / Prayer" value={currentLog.buddhistTimeMinutes} unit="mins" 
              onChange={(v) => updateField('buddhistTimeMinutes', v)} colorClass="bg-yellow-500" max={120}
            />
            <TimeMetricCard 
              icon={Moon} title="Sleep" value={currentLog.sleepHours} unit="hrs" 
              onChange={(v) => updateField('sleepHours', v)} colorClass="bg-indigo-500" max={12}
            />
            <TimeMetricCard 
              icon={BookOpen} title="Study / Learning" value={currentLog.studyMinutes} unit="mins" 
              onChange={(v) => updateField('studyMinutes', v)} colorClass="bg-emerald-500" max={480}
            />
            <TimeMetricCard 
              icon={Smartphone} title="Screen Time" value={currentLog.screenTimeMinutes} unit="mins" 
              onChange={(v) => updateField('screenTimeMinutes', v)} colorClass="bg-red-500" max={720}
            />
          </div>
        </>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
           <div className="flex justify-end gap-2">
              {(['week', 'month', 'year'] as const).map(view => (
                 <button
                   key={view}
                   onClick={() => setInsightView(view)}
                   className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                     insightView === view 
                       ? 'bg-blue-600 text-white' 
                       : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                   }`}
                 >
                   {view}
                 </button>
              ))}
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart title="Study Time" data={chartData.map(d => d.studyMinutes)} labels={chartData.map(d => d.label)} color="bg-emerald-500" unit="mins" max={300} />
              <TrendChart title="Screen Time" data={chartData.map(d => d.screenTimeMinutes)} labels={chartData.map(d => d.label)} color="bg-red-500" unit="mins" max={600} />
              <TrendChart title="Exercise" data={chartData.map(d => d.exerciseMinutes)} labels={chartData.map(d => d.label)} color="bg-orange-500" unit="mins" max={120} />
              <TrendChart title="Meditation" data={chartData.map(d => d.buddhistTimeMinutes)} labels={chartData.map(d => d.label)} color="bg-yellow-500" unit="mins" max={60} />
              <TrendChart title="Sleep" data={chartData.map(d => d.sleepHours)} labels={chartData.map(d => d.label)} color="bg-indigo-500" unit="hrs" max={10} />
              <TrendChart title="Water" data={chartData.map(d => d.waterIntake)} labels={chartData.map(d => d.label)} color="bg-blue-500" unit="cups" max={12} />
           </div>
        </div>
      )}
    </div>
  );
}