
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, Category } from '@/types';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export function useTransactions() {
  const queryClient = useQueryClient();

  // Fetch transactions
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions
  } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        toast.error('Failed to load transactions');
        throw error;
      }

      // Transform data to match our Transaction interface
      return data.map(item => ({
        id: item.id,
        amount: item.amount,
        description: item.description,
        date: item.date,
        categoryId: item.category_id,
        type: item.type,
        created_at: item.created_at
      })) as Transaction[];
    }
  });

  // Fetch categories
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
        throw error;
      }

      // Make sure we properly map the database rows to our Category interface
      return data.map(category => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
        created_at: category.created_at
      })) as Category[];
    }
  });

  // Add transaction mutation
  const addTransaction = useMutation({
    mutationFn: async (newTransaction: Omit<Transaction, 'id' | 'created_at'>) => {
      // Transform to match database column names
      const dbTransaction = {
        amount: newTransaction.amount,
        description: newTransaction.description,
        category_id: newTransaction.categoryId,
        type: newTransaction.type,
        date: newTransaction.date,
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert(dbTransaction)
        .select()
        .single();

      if (error) {
        console.error('Error adding transaction:', error);
        toast.error('Failed to add transaction');
        throw error;
      }

      // Transform back to our interface
      return {
        id: data.id,
        amount: data.amount,
        description: data.description,
        date: data.date,
        categoryId: data.category_id,
        type: data.type,
        created_at: data.created_at
      } as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction added');
    }
  });

  // Delete transaction mutation
  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting transaction:', error);
        toast.error('Failed to delete transaction');
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted');
    }
  });

  // Add category mutation
  const addCategory = useMutation({
    mutationFn: async (newCategory: Omit<Category, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('categories')
        .insert(newCategory)
        .select()
        .single();

      if (error) {
        console.error('Error adding category:', error);
        toast.error('Failed to add category');
        throw error;
      }

      // Ensure we transform the data to match our Category interface
      return {
        id: data.id,
        name: data.name,
        icon: data.icon,
        color: data.color,
        type: data.type,
        created_at: data.created_at
      } as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category added');
    }
  });

  // Delete category mutation
  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
    }
  });

  const isLoading = isLoadingTransactions || isLoadingCategories;
  const error = transactionsError || categoriesError;

  return {
    transactions,
    categories,
    isLoading,
    error,
    addTransaction: addTransaction.mutate,
    deleteTransaction: deleteTransaction.mutate,
    addCategory: addCategory.mutate,
    deleteCategory: deleteCategory.mutate,
    refetchTransactions,
    refetchCategories
  };
}
