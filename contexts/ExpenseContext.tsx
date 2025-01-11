'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useProfile } from './ProfileContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Expense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenses,
  PaymentMethod,
  SortField,
  SortOrder
} from '@/lib/expenseService';
import { startOfMonth, endOfMonth } from 'date-fns';

interface ExpenseContextType {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editExpense: (expenseId: string, updates: Partial<Omit<Expense, 'id' | 'profileId'>>) => Promise<void>;
  removeExpense: (expenseId: string) => Promise<void>;
  refreshExpenses: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { activeProfile } = useProfile();
  const { toast } = useToast();

  // State for month/year selection
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const refreshExpenses = useCallback(async () => {
    if (!activeProfile) return;

    try {
      setLoading(true);
      setError(null);

      // Get start and end of selected month
      const start = startOfMonth(new Date(selectedYear, selectedMonth));
      const end = endOfMonth(new Date(selectedYear, selectedMonth));

      const fetchedExpenses = await getExpenses(
        activeProfile.id,
        'date',
        'desc',
        start,
        end
      );
      setExpenses(fetchedExpenses);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to fetch expenses');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch expenses',
      });
    } finally {
      setLoading(false);
    }
  }, [activeProfile, selectedMonth, selectedYear, toast]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!activeProfile) return;

    try {
      await createExpense(expense);
      toast({
        title: 'Success',
        description: 'Expense added successfully',
      });
      refreshExpenses();
    } catch (err) {
      console.error('Error adding expense:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add expense',
      });
    }
  }, [activeProfile, refreshExpenses, toast]);

  const editExpense = useCallback(async (
    expenseId: string,
    updates: Partial<Omit<Expense, 'id' | 'profileId'>>
  ) => {
    if (!activeProfile) return;

    try {
      await updateExpense(activeProfile.id, expenseId, updates);
      toast({
        title: 'Success',
        description: 'Expense updated successfully',
      });
      refreshExpenses();
    } catch (err) {
      console.error('Error updating expense:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update expense',
      });
    }
  }, [activeProfile, refreshExpenses, toast]);

  const removeExpense = useCallback(async (expenseId: string) => {
    if (!activeProfile) return;

    try {
      await deleteExpense(activeProfile.id, expenseId);
      toast({
        title: 'Success',
        description: 'Expense deleted successfully',
      });
      refreshExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete expense',
      });
    }
  }, [activeProfile, refreshExpenses, toast]);

  // Refresh expenses when profile or selected month/year changes
  useEffect(() => {
    refreshExpenses();
  }, [activeProfile, selectedMonth, selectedYear, refreshExpenses]);

  const value = {
    expenses,
    loading,
    error,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    addExpense,
    editExpense,
    removeExpense,
    refreshExpenses,
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
}
