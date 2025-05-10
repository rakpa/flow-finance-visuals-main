
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
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
import { Category, TransactionType } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

// Common emoji categories
const commonEmojis = [
  { emoji: '🍔', name: 'Food' },
  { emoji: '🏠', name: 'Housing' },
  { emoji: '🚗', name: 'Transportation' },
  { emoji: '💊', name: 'Health' },
  { emoji: '🎮', name: 'Entertainment' },
  { emoji: '👕', name: 'Shopping' },
  { emoji: '💼', name: 'Work' },
  { emoji: '💰', name: 'Salary' },
  { emoji: '📱', name: 'Technology' },
  { emoji: '✈️', name: 'Travel' },
  { emoji: '🏦', name: 'Banking' },
  { emoji: '🎓', name: 'Education' },
  { emoji: '🎁', name: 'Gifts' },
  { emoji: '💸', name: 'Investments' },
  { emoji: '🧾', name: 'Bills & Utilities' },
  { emoji: '💝', name: 'Donations' },
  { emoji: '🏋️', name: 'Fitness' },
  { emoji: '🎭', name: 'Arts' },
  { emoji: '💇', name: 'Personal Care' },
  { emoji: '👪', name: 'Family' },
];

// Color options
const colorOptions = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#22c55e", label: "Green" },
  { value: "#ef4444", label: "Red" },
  { value: "#a855f7", label: "Purple" },
  { value: "#f97316", label: "Orange" },
  { value: "#eab308", label: "Yellow" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#6366f1", label: "Indigo" },
];

interface CategoryFormProps {
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  isLoading?: boolean;
}

const CategoryForm = ({ onAddCategory, isLoading = false }: CategoryFormProps) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [type, setType] = useState<TransactionType | 'both'>('expense');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    if (!icon) {
      toast.error('Please select an icon');
      return;
    }

    // Create category
    onAddCategory({
      name,
      icon,
      color,
      type,
    });

    // Reset form
    setName('');
    setIcon('');
    setColor('#3b82f6');
    setType('expense');
  };

  if (isLoading) {
    return (
      <div className="space-y-4 bg-card p-6 rounded-lg shadow-sm">
        <Skeleton className="h-8 w-3/4 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Add Category</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category-name">Category Name</Label>
          <Input
            id="category-name"
            placeholder="e.g., Groceries"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Category Type</Label>
          <RadioGroup 
            defaultValue="expense" 
            value={type}
            onValueChange={(value) => setType(value as TransactionType | 'both')}
            className="flex flex-wrap gap-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="expense" id="type-expense" />
              <Label htmlFor="type-expense" className="cursor-pointer">Expense</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="income" id="type-income" />
              <Label htmlFor="type-income" className="cursor-pointer">Income</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="type-both" />
              <Label htmlFor="type-both" className="cursor-pointer">Both</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an icon">
                  {icon && (
                    <span className="text-xl mr-2" role="img">
                      {icon}
                    </span>
                  )}
                  {icon ? 'Selected' : 'Choose icon'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <div className="grid grid-cols-4 gap-2 p-2">
                  {commonEmojis.map((emoji) => (
                    <SelectItem 
                      key={emoji.emoji} 
                      value={emoji.emoji}
                      className="flex items-center justify-center text-2xl cursor-pointer p-2 rounded hover:bg-muted"
                    >
                      <span role="img" aria-label={emoji.name} title={emoji.name}>
                        {emoji.emoji}
                      </span>
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a color">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: color }}
                    />
                    {colorOptions.find(c => c.value === color)?.label || 'Custom'}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((colorOption) => (
                  <SelectItem key={colorOption.value} value={colorOption.value}>
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2" 
                        style={{ backgroundColor: colorOption.value }}
                      />
                      {colorOption.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full">
        <Plus className="mr-2 h-4 w-4" /> Add Category
      </Button>
    </form>
  );
};

export default CategoryForm;
