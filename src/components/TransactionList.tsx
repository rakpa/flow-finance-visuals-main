import { useMemo, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Search, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { startOfDay, endOfDay } from 'date-fns';
import { Transaction, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DateRange } from "react-day-picker";
import { DateFilterOption, getDateRangeFromFilter, isDateInRange } from '@/lib/date-utils';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
}

const TransactionList = ({
  transactions,
  categories,
  onDeleteTransaction,
  onUpdateTransaction
}: TransactionListProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setDateFilter('custom');
      setShowDatePicker(false);
    }
  };

  const getFilterLabel = () => {
    if (dateFilter === 'custom' && dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`;
    }
    return getDateFilterLabel(dateFilter);
  };

  const filteredTransactions = useMemo(() => {
    const dateRangeToUse = dateFilter === 'custom' && dateRange?.from && dateRange?.to
      ? {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to)
        }
      : getDateRangeFromFilter(dateFilter, dateRange);
    
    return transactions
      .filter((transaction) => {
        if (typeFilter !== 'all' && transaction.type !== typeFilter) {
          return false;
        }
        
        if (!isDateInRange(transaction.date, dateRangeToUse)) {
          return false;
        }
        
        if (searchTerm) {
          const category = categories.find(cat => cat.id === transaction.categoryId);
          const searchTermLower = searchTerm.toLowerCase();
          
          return (
            transaction.description.toLowerCase().includes(searchTermLower) ||
            (category && category.name.toLowerCase().includes(searchTermLower))
          );
        }
        
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, categories, searchTerm, typeFilter, dateFilter]);

  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id);
  };

  const getDateFilterLabel = (filter: DateFilterOption): string => {
    const labels: Record<DateFilterOption, string> = {
      'all': 'All Time',
      'today': 'Today',
      'yesterday': 'Yesterday',
      'this-week': 'This Week',
      'this-month': 'This Month',
      'last-month': 'Last Month',
      'this-year': 'This Year',
      'custom': 'Custom Range'
    };
    return labels[filter];
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2 md:items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>{getFilterLabel()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuLabel>Filter by date</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilterOption)}>
                <DropdownMenuRadioItem value="all">All Time</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="today">Today</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="yesterday">Yesterday</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="this-week">This Week</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="this-month">This Month</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="last-month">Last Month</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="this-year">This Year</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDatePicker(true)}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Custom Range
          </Button>

          <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Select Date Range</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDateRangeSelect}
                  numberOfMonths={2}
                  fromDate={new Date(2020, 0, 1)}
                  toDate={new Date(2030, 11, 31)}
                  defaultMonth={new Date()}
                  className="flex-1 rounded-md border pointer-events-auto"
                  initialFocus
                />
              </div>
            </DialogContent>
          </Dialog>

          <Button
            size="sm"
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={typeFilter === 'income' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('income')}
          >
            Income
          </Button>
          <Button
            size="sm"
            variant={typeFilter === 'expense' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('expense')}
          >
            Expenses
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => {
            const category = getCategoryById(transaction.categoryId);
            return (
              <div 
                key={transaction.id} 
                className={cn(
                  "transaction-item flex items-center justify-between p-4 rounded-lg border",
                  "hover:shadow-sm transition-all duration-200"
                )}
              >
                <div className="flex items-center">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full mr-4",
                    `bg-[${category?.color}]/10`
                  )}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="h-5 w-5" style={{ color: category?.color }} />
                    ) : (
                      <ArrowDownRight className="h-5 w-5" style={{ color: category?.color }} />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">
                      {category?.name || 'Uncategorized'}
                    </div>
                    <div 
                      className="text-sm text-muted-foreground cursor-pointer hover:text-primary"
                      onClick={() => {
                        const newDescription = window.prompt('Edit description:', transaction.description);
                        if (newDescription && newDescription !== transaction.description) {
                          onUpdateTransaction({
                            ...transaction,
                            description: newDescription
                          });
                        }
                      }}
                    >
                      {transaction.description}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <span className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {format(parseISO(transaction.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={cn(
                    "text-lg font-medium mr-4",
                    transaction.type === 'income' ? 'text-finance-income' : 'text-finance-expense'
                  )}>
                    {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)} PLN
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteTransaction(transaction.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
