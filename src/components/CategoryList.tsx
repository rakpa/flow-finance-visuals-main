
import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

// Type for dynamic icon component
type IconComponentProps = {
  name: string;
  className?: string;
};

// Dynamic icon component
const DynamicIcon = ({ name, className }: IconComponentProps) => {
  // Using type assertion with 'as any' to avoid TypeScript errors
  // This is safe because we're checking if the icon exists before using it
  const icons = LucideIcons as any;
  
  // Convert kebab-case to PascalCase (e.g., "file-text" -> "FileText")
  const iconName = name.split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  
  const LucideIcon = icons[iconName];

  // Fallback if icon not found
  if (!LucideIcon) {
    console.warn(`Icon not found: ${name} (converted to ${iconName})`);
    return <span className={className}>{name}</span>;
  }

  return <LucideIcon className={className} />;
};

interface CategoryListProps {
  categories: Category[];
  onDeleteCategory: (id: string) => void;
  transactions: { categoryId: string }[];
}

const CategoryList = ({ 
  categories, 
  onDeleteCategory, 
  transactions 
}: CategoryListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'both'>('all');
  
  console.log('Categories in CategoryList:', categories);

  const filteredCategories = useMemo(() => {
    return categories
      .filter((category) => {
        // Type filter
        if (filter !== 'all' && category.type !== filter) {
          return false;
        }
        
        // Search filter
        if (searchTerm) {
          const searchTermLower = searchTerm.toLowerCase();
          return category.name.toLowerCase().includes(searchTermLower);
        }
        
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, searchTerm, filter]);

  if (categories.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No categories yet</p>
      </div>
    );
  }

  // Helper to check if a category is in use
  const isCategoryInUse = (categoryId: string) => {
    return transactions.some(transaction => transaction.categoryId === categoryId);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2 md:items-center justify-between">
        <Input
          placeholder="Search categories..."
          className="w-full md:w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="flex space-x-2 mt-2 md:mt-0">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === 'income' ? 'default' : 'outline'}
            onClick={() => setFilter('income')}
          >
            Income
          </Button>
          <Button
            size="sm"
            variant={filter === 'expense' ? 'default' : 'outline'}
            onClick={() => setFilter('expense')}
          >
            Expenses
          </Button>
          <Button
            size="sm"
            variant={filter === 'both' ? 'default' : 'outline'}
            onClick={() => setFilter('both')}
          >
            Both
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => {
            const categoryInUse = isCategoryInUse(category.id);
            return (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:shadow-sm"
                style={{ borderColor: `${category.color}40` }}
              >
                <div className="flex items-center">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full mr-4"
                    style={{ 
                      backgroundColor: `${category.color}20`, 
                      color: category.color 
                    }}
                  >
                    <DynamicIcon name={category.icon} className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    <span className={cn(
                      "text-xs",
                      category.type === 'income' ? 'text-finance-income' : 
                      category.type === 'expense' ? 'text-finance-expense' : 
                      'text-muted-foreground'
                    )}>
                      {category.type === 'income' ? 'Income' : 
                       category.type === 'expense' ? 'Expense' : 'Both'}
                    </span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={categoryInUse}
                  title={categoryInUse ? "Cannot delete category in use" : "Delete category"}
                  onClick={() => onDeleteCategory(category.id)}
                  className={cn(
                    "h-8 w-8",
                    categoryInUse 
                      ? "text-muted-foreground cursor-not-allowed opacity-50" 
                      : "text-muted-foreground hover:text-destructive"
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 col-span-full">
            <p className="text-muted-foreground">No categories match your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
