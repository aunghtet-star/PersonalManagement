import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Transaction } from '../types';
import { INITIAL_TRANSACTIONS } from '../constants';

export function useTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const configured = isSupabaseConfigured();

    useEffect(() => {
        if (!configured) {
            setTransactions(INITIAL_TRANSACTIONS);
            setLoading(false);
            return;
        }

        fetchTransactions();
    }, [configured]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;

            const transformedTransactions: Transaction[] = (data || []).map((txn: any) => ({
                id: txn.id,
                accountId: txn.account_id,
                type: txn.type,
                amount: parseFloat(txn.amount),
                category: txn.category,
                date: txn.date,
                description: txn.description,
            }));

            setTransactions(transformedTransactions);
        } catch (err: any) {
            console.error('Error fetching transactions:', err);
            setError(err.message);
            setTransactions(INITIAL_TRANSACTIONS);
        } finally {
            setLoading(false);
        }
    };

    const addTransaction = async (newTransaction: Transaction) => {
        if (!configured) {
            setTransactions(prev => [newTransaction, ...prev]);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('transactions')
                .insert([{
                    account_id: newTransaction.accountId,
                    type: newTransaction.type,
                    amount: newTransaction.amount,
                    category: newTransaction.category,
                    date: newTransaction.date,
                    description: newTransaction.description,
                }])
                .select()
                .single();

            if (error) throw error;

            // Use the DB-generated UUID for the transaction
            const savedTransaction: Transaction = {
                id: data.id,
                accountId: data.account_id,
                type: data.type,
                amount: parseFloat(data.amount),
                category: data.category,
                date: data.date,
                description: data.description,
            };

            // Optimistically update local state
            setTransactions(prev => [savedTransaction, ...prev]);
        } catch (err: any) {
            console.error('Error adding transaction:', err);
            setError(err.message);
            // Still add locally as fallback
            setTransactions(prev => [newTransaction, ...prev]);
        }
    };

    return { transactions, loading, error, addTransaction, refetch: fetchTransactions };
}
