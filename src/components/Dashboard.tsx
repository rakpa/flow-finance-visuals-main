
import { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart4,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { Transaction, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BalanceChart from './charts/BalanceChart';
import ExpenseChart from './charts/ExpenseChart';
import TransactionList from './TransactionList';
import { DateFilterOption, getDateRangeFromFilter, isDateInRange } from '@/lib/date-utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  onDeleteTransaction: (id: string) => void;
}

const Dashboard = ({ transactions, categories, onDeleteTransaction }: DashboardProps) => {
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('this-month');

  // Calculate summary data
  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;

    // Get date range for filtering transactions
    const dateRange = getDateRangeFromFilter(dateFilter);

    // Filter transactions based on date range
    const filteredTransactions = transactions.filter(transaction => {
      return isDateInRange(transaction.date, dateRange);
    });

    for (const transaction of filteredTransactions) {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else {
        totalExpenses += transaction.amount;
      }
    }

    const balance = totalIncome - totalExpenses;

    return {
      income: totalIncome,
      expenses: totalExpenses,
      balance,
      trend: balance >= 0 ? 'positive' : 'negative',
    };
  }, [transactions, dateFilter]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get recent transactions
  const recentTransactions = useMemo(() => {
    // Get date range for filtering transactions
    const dateRange = getDateRangeFromFilter(dateFilter);

    // Filter transactions based on date range and sort by date
    return transactions
      .filter(transaction => isDateInRange(transaction.date, dateRange))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions, dateFilter]);

  // Get date filter label
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
    <div className="space-y-8">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Balance Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Balance</CardDescription>
            <CardTitle className="text-lg">
              {formatCurrency(summary.balance)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {summary.trend === 'positive' ? (
                <TrendingUp className="mr-2 h-4 w-4 text-finance-income" />
              ) : (
                <TrendingDown className="mr-2 h-4 w-4 text-finance-expense" />
              )}
              <span className={summary.trend === 'positive' ? 'text-finance-income' : 'text-finance-expense'}>
                {summary.trend === 'positive' ? 'Positive' : 'Negative'} balance
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Income Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{getDateFilterLabel(dateFilter)} Income</CardDescription>
            <CardTitle className="text-lg text-finance-income">
              {formatCurrency(summary.income)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-finance-income" />
              <span className="text-muted-foreground">Money coming in</span>
            </div>
          </CardContent>
        </Card>

        {/* Expense Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{getDateFilterLabel(dateFilter)} Expenses</CardDescription>
            <CardTitle className="text-lg text-finance-expense">
              {formatCurrency(summary.expenses)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingDown className="mr-2 h-4 w-4 text-finance-expense" />
              <span className="text-muted-foreground">Money going out</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>Track your balance, income, and expenses over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="balance" className="w-full">
            <TabsList className="bg-gray-100">
              <TabsTrigger 
                value="balance" 
                className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
              >
                Balance Trend
              </TabsTrigger>
              <TabsTrigger 
                value="income"
                className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                Income Breakdown
              </TabsTrigger>
              <TabsTrigger 
                value="expenses"
                className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
              >
                Expense Breakdown
              </TabsTrigger>
            </TabsList>
            <TabsContent value="balance">
              <BalanceChart transactions={transactions} />
            </TabsContent>
            <TabsContent value="income">
              <ExpenseChart 
                transactions={transactions} 
                categories={categories} 
                type="income" 
              />
            </TabsContent>
            <TabsContent value="expenses">
              <ExpenseChart 
                transactions={transactions} 
                categories={categories} 
                type="expense" 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activities</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/transactions'}>
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <TransactionList 
            transactions={recentTransactions} 
            categories={categories}
            onDeleteTransaction={onDeleteTransaction}
            onUpdateTransaction={(transaction) => {
              // No-op because we don't need to update transactions in dashboard view
              console.log('Update transaction not implemented in Dashboard view');
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
