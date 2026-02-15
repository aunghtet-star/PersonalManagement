import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CalendarEvent } from '../types';

export function useCalendarEvents() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const configured = isSupabaseConfigured();

    useEffect(() => {
        if (!configured) {
            setLoading(false);
            return;
        }

        fetchEvents();
    }, [configured]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('calendar_events')
                .select('*')
                .order('start_time', { ascending: true });

            if (error) throw error;

            const transformedEvents: CalendarEvent[] = (data || []).map((evt: any) => ({
                id: evt.id,
                title: evt.title,
                start: evt.start_time,
                end: evt.end_time,
                type: evt.type,
                color: evt.color,
                description: evt.description,
                location: evt.location,
                calendarId: evt.calendar_id,
            }));

            setEvents(transformedEvents);
        } catch (err: any) {
            console.error('Error fetching calendar events:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addEvent = async (newEvent: CalendarEvent) => {
        // Only persist local/team events to database
        // Google/Microsoft events are fetched via API
        if (newEvent.type !== 'local' && newEvent.type !== 'team') {
            setEvents(prev => [...prev, newEvent]);
            return;
        }

        if (!configured) {
            setEvents(prev => [...prev, newEvent]);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('calendar_events')
                .insert([{
                    title: newEvent.title,
                    start_time: newEvent.start,
                    end_time: newEvent.end,
                    type: newEvent.type,
                    color: newEvent.color,
                    description: newEvent.description,
                    location: newEvent.location,
                    calendar_id: newEvent.calendarId,
                }])
                .select()
                .single();

            if (error) throw error;

            // Use the DB-generated UUID
            const savedEvent: CalendarEvent = {
                id: data.id,
                title: data.title,
                start: data.start_time,
                end: data.end_time,
                type: data.type,
                color: data.color,
                description: data.description,
                location: data.location,
                calendarId: data.calendar_id,
            };

            // Update local state
            setEvents(prev => [...prev, savedEvent]);
        } catch (err: any) {
            console.error('Error adding calendar event:', err);
            setError(err.message);
            // Still add locally as fallback
            setEvents(prev => [...prev, newEvent]);
        }
    };

    return { events, loading, error, addEvent, refetch: fetchEvents };
}
