
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, X, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category, Transaction, TransactionType } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
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

interface TransactionFormProps {
  categories: Category[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  isLoading?: boolean;
}

const TransactionForm = ({ categories, onAddTransaction, isLoading = false }: TransactionFormProps) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
  });
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  // Update filtered categories when type or categories change
  useEffect(() => {
    setFilteredCategories(
      categories.filter(cat => cat.type === type || cat.type === 'both')
    );
  }, [type, categories]);

  // Reset category if current selection is invalid for the selected type
  useEffect(() => {
    const validCategory = filteredCategories.find(cat => cat.id === categoryId);
    if (categoryId && !validCategory) {
      setCategoryId('');
    }
  }, [filteredCategories, categoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }

    // Create transaction
    onAddTransaction({
      amount: Number(amount),
      description,
      categoryId,
      type,
      date: new Date(date).toISOString(),
    });

    // Reset form
    setAmount('');
    setDescription('');
    setCategoryId('');
    setDate(new Date().toISOString().slice(0, 10));
  };

  if (isLoading) {
    return (
      <div className="space-y-6 bg-card p-6 rounded-lg shadow-sm">
        <Skeleton className="h-8 w-3/4 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Add Transaction</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="transaction-type">Transaction Type</Label>
          <RadioGroup 
            defaultValue="expense" 
            value={type}
            onValueChange={(value) => setType(value as TransactionType)}
            className="flex gap-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="expense" id="expense" />
              <Label htmlFor="expense" className="cursor-pointer">Expense</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="income" id="income" />
              <Label htmlFor="income" className="cursor-pointer">Income</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                PLN
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                className="pr-12"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(new Date(date), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={new Date(date)}
                  onSelect={(newDate) => {
                    if (newDate) {
                      const adjusted = new Date(newDate);
                      adjusted.setMinutes(adjusted.getMinutes() - adjusted.getTimezoneOffset());
                      setDate(adjusted.toISOString().slice(0, 10));
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="e.g., Groceries at Whole Foods"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center">
                      <span 
                        className="mr-2 w-5 h-5 flex items-center justify-center"
                        style={{ color: category.color }}
                      >
                        <DynamicIcon name={category.icon} className="h-4 w-4" />
                      </span>
                      {category.name}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No categories available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full">
        <Plus className="mr-2 h-4 w-4" /> Add {type === 'income' ? 'Income' : 'Expense'}
      </Button>
    </form>
  );
};

export default TransactionForm;
