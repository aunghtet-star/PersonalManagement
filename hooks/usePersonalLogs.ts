import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DailyLog } from '../types';

export function usePersonalLogs() {
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const configured = isSupabaseConfigured();

    useEffect(() => {
        if (!configured) {
            setLoading(false);
            return;
        }

        fetchLogs();
    }, [configured]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('personal_logs')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;

            const transformedLogs: DailyLog[] = (data || []).map((log: any) => ({
                date: log.date,
                waterIntake: log.water_intake,
                exerciseMinutes: log.exercise_minutes,
                buddhistTimeMinutes: log.buddhist_time_minutes,
                sleepHours: parseFloat(log.sleep_hours),
                studyMinutes: log.study_minutes,
                screenTimeMinutes: log.screen_time_minutes,
                notes: log.notes,
            }));

            setLogs(transformedLogs);
        } catch (err: any) {
            console.error('Error fetching personal logs:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateLog = async (updatedLog: DailyLog) => {
        if (!configured) {
            // Fallback to local state
            setLogs(prev => {
                const index = prev.findIndex(log => log.date === updatedLog.date);
                if (index >= 0) {
                    const newLogs = [...prev];
                    newLogs[index] = updatedLog;
                    return newLogs;
                }
                return [...prev, updatedLog];
            });
            return;
        }

        try {
            // Try to update first (upsert)
            const { error } = await supabase
                .from('personal_logs')
                .upsert({
                    date: updatedLog.date,
                    water_intake: updatedLog.waterIntake,
                    exercise_minutes: updatedLog.exerciseMinutes,
                    buddhist_time_minutes: updatedLog.buddhistTimeMinutes,
                    sleep_hours: updatedLog.sleepHours,
                    study_minutes: updatedLog.studyMinutes,
                    screen_time_minutes: updatedLog.screenTimeMinutes,
                    notes: updatedLog.notes,
                }, {
                    onConflict: 'date'
                });

            if (error) throw error;

            // Update local state
            setLogs(prev => {
                const index = prev.findIndex(log => log.date === updatedLog.date);
                if (index >= 0) {
                    const newLogs = [...prev];
                    newLogs[index] = updatedLog;
                    return newLogs;
                }
                return [...prev, updatedLog];
            });
        } catch (err: any) {
            console.error('Error updating personal log:', err);
            setError(err.message);
        }
    };

    return { logs, loading, error, updateLog, refetch: fetchLogs };
}
