
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import { useTransactions } from '@/hooks/useTransactions';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const {
    transactions,
    categories,
    isLoading,
    deleteTransaction
  } = useTransactions();

  // Handle deleting a transaction
  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
  };

  return (
    <Layout>
      <section id="dashboard" className="mb-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        {isLoading ? (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="w-full h-32" />
              ))}
            </div>
            <Skeleton className="w-full h-80" />
            <Skeleton className="w-full h-96" />
          </div>
        ) : (
          <Dashboard 
            transactions={transactions} 
            categories={categories}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}
      </section>
    </Layout>
  );
};

export default Index;
