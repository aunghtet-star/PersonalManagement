import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Account } from '../types';
import { INITIAL_ACCOUNTS } from '../constants';

export function useAccounts() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const configured = isSupabaseConfigured();

    // Fetch accounts from database
    useEffect(() => {
        if (!configured) {
            // Fallback to initial accounts if Supabase not configured
            setAccounts(INITIAL_ACCOUNTS);
            setLoading(false);
            return;
        }

        fetchAccounts();
    }, [configured]);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Transform from database format to app format
            const transformedAccounts: Account[] = (data || []).map((acc: any) => ({
                id: acc.id,
                name: acc.name,
                type: acc.type,
                balance: parseFloat(acc.balance),
                color: acc.color,
                logo: acc.logo,
            }));

            setAccounts(transformedAccounts);
        } catch (err: any) {
            console.error('Error fetching accounts:', err);
            setError(err.message);
            // Fallback to initial accounts on error
            setAccounts(INITIAL_ACCOUNTS);
        } finally {
            setLoading(false);
        }
    };

    const addAccount = async (newAccount: Account) => {
        if (!configured) {
            // Fallback to local state
            setAccounts(prev => [...prev, newAccount]);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('accounts')
                .insert([{
                    id: newAccount.id,
                    name: newAccount.name,
                    type: newAccount.type,
                    balance: newAccount.balance,
                    color: newAccount.color,
                    logo: newAccount.logo,
                }])
                .select()
                .single();

            if (error) throw error;

            // Optimistically update local state
            setAccounts(prev => [...prev, newAccount]);
        } catch (err: any) {
            console.error('Error adding account:', err);
            setError(err.message);
        }
    };

    const updateAccountBalance = async (accountId: string, newBalance: number) => {
        if (!configured) {
            // Fallback to local state
            setAccounts(prev => prev.map(acc =>
                acc.id === accountId ? { ...acc, balance: newBalance } : acc
            ));
            return;
        }

        try {
            const { error } = await supabase
                .from('accounts')
                .update({ balance: newBalance })
                .eq('id', accountId);

            if (error) throw error;

            // Update local state
            setAccounts(prev => prev.map(acc =>
                acc.id === accountId ? { ...acc, balance: newBalance } : acc
            ));
        } catch (err: any) {
            console.error('Error updating account balance:', err);
            setError(err.message);
        }
    };

    return { accounts, loading, error, addAccount, updateAccountBalance, refetch: fetchAccounts };
}
