
import { useState } from 'react';
import Layout from '@/components/Layout';
import CategoryForm from '@/components/CategoryForm';
import CategoryList from '@/components/CategoryList';
import { Category } from '@/types';
import { useTransactions } from '@/hooks/useTransactions';
import { Skeleton } from '@/components/ui/skeleton';

const Categories = () => {
  const {
    transactions,
    categories,
    isLoading,
    addCategory,
    deleteCategory
  } = useTransactions();

  // Handle adding a new category
  const handleAddCategory = (newCategory: Omit<Category, 'id'>) => {
    addCategory(newCategory);
  };

  // Handle deleting a category
  const handleDeleteCategory = (id: string) => {
    // Check if category is in use
    const isInUse = transactions.some(transaction => transaction.categoryId === id);
    
    if (isInUse) {
      return false; // Let TransactionList handle the error toast
    }
    
    deleteCategory(id);
    return true;
  };

  return (
    <Layout>
      <section id="categories">
        <h2 className="text-2xl font-bold mb-6">Categories</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CategoryForm 
              onAddCategory={handleAddCategory}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-card p-6 rounded-lg shadow-sm h-full">
              <h3 className="text-xl font-bold mb-4">Category List</h3>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="w-full h-20" />
                  ))}
                </div>
              ) : (
                <CategoryList 
                  categories={categories} 
                  onDeleteCategory={handleDeleteCategory}
                  transactions={transactions}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Categories;
