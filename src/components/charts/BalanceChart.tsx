
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Transaction } from '@/types';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { DateFilterOption, getDateRangeFromFilter } from '@/lib/date-utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface BalanceChartProps {
  transactions: Transaction[];
}

const BalanceChart: React.FC<BalanceChartProps> = ({ transactions }) => {
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('this-month');
  const isMobile = useIsMobile();

  const chartData = useMemo(() => {
    if (!transactions.length) return [];

    const dateRange = getDateRangeFromFilter(dateFilter);
    if (!dateRange) return [];

    // Get date range for the chart
    const { start, end } = dateRange;

    // Create array of all days in the range
    const days = eachDayOfInterval({ start, end });

    // Initialize data with running balance
    let runningBalance = 0;

    // Calculate initial balance (from before the range start)
    const previousTransactions = transactions.filter(
      t => parseISO(t.date) < start
    );

    for (const transaction of previousTransactions) {
      if (transaction.type === 'income') {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
      }
    }

    // Process each day
    return days.map(day => {
      // Find transactions for this day
      const dayTransactions = transactions.filter(transaction => 
        isSameDay(parseISO(transaction.date), day)
      );

      // Calculate income and expenses for the day
      let income = 0;
      let expense = 0;

      for (const transaction of dayTransactions) {
        if (transaction.type === 'income') {
          income += transaction.amount;
          runningBalance += transaction.amount;
        } else {
          expense += transaction.amount;
          runningBalance -= transaction.amount;
        }
      }

      return {
        date: format(day, 'MMM dd'),
        income,
        expense,
        balance: runningBalance
      };
    });
  }, [transactions, dateFilter]);

  const formatCurrency = (value: number) => {
    return `${value.toFixed(2)} PLN`;
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

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{getDateFilterLabel(dateFilter)}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuLabel>Select period</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilterOption)}>
              <DropdownMenuRadioItem value="today">Today</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="yesterday">Yesterday</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="this-week">This Week</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="this-month">This Month</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="last-month">Last Month</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="this-year">This Year</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="all">All Time</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="h-[300px] w-full">
        {chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center">
            <p className="text-muted-foreground">No data to display for the selected period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }} 
                tickFormatter={(value) => isMobile ? value.split(' ')[1] : value}
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                tickFormatter={(value) => `${value} PLN`} 
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)} PLN`, '']} 
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Bar 
                dataKey="income" 
                name="Income" 
                fill="#22c55e" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="expense" 
                name="Expense" 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="balance" 
                name="Balance" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default BalanceChart;
