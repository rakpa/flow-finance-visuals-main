
import { useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import Layout from "@/components/Layout";

const MonthlySummary = () => {
  const { transactions, categories } = useTransactions();

  const monthlySummary = useMemo(() => {
    if (!transactions.length) return [];

    // Get date range from transactions
    const dates = transactions.map(t => parseISO(t.date).getTime());
    const start = startOfMonth(new Date(Math.min(...dates)));
    const end = endOfMonth(new Date(Math.max(...dates)));

    // Get all months in range
    const months = eachMonthOfInterval({ start, end });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      // Filter transactions for this month
      const monthTransactions = transactions.filter(t => {
        const date = parseISO(t.date);
        return date >= monthStart && date <= monthEnd;
      });

      // Calculate income
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      // Calculate expenses by category
      const expensesByCategory = categories
        .filter(c => c.type === 'expense' || c.type === 'both')
        .map(category => {
          const amount = monthTransactions
            .filter(t => t.type === 'expense' && t.categoryId === category.id)
            .reduce((sum, t) => sum + t.amount, 0);
          return {
            category: category.name,
            amount
          };
        })
        .filter(e => e.amount > 0);

      // Calculate total expenses
      const totalExpenses = expensesByCategory.reduce((sum, e) => sum + e.amount, 0);

      return {
        month: format(month, 'MMMM yyyy'),
        income,
        expensesByCategory,
        totalExpenses,
        netBalance: income - totalExpenses
      };
    }).sort((a, b) => {
      const [monthA, yearA] = a.month.split(' ');
      const [monthB, yearB] = b.month.split(' ');
      
      // First compare years in descending order
      if (yearA !== yearB) {
        return parseInt(yearB) - parseInt(yearA);
      }
      
      // If years are same, compare months in ascending order
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
      return months.indexOf(monthA) - months.indexOf(monthB);
    });
  }, [transactions, categories]);

  return (
    <Layout>
      <Card>
      <CardHeader>
        <CardTitle>Monthly Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table className="border border-gray-200">
          <TableHeader>
            <TableRow className="bg-[#A020F0] border-b">
              <TableHead className="text-white border-r w-[15%]">Month</TableHead>
              <TableHead className="text-white border-r w-[20%]">Income</TableHead>
              <TableHead className="text-white border-r w-[30%]">Expenses by Category</TableHead>
              <TableHead className="text-white border-r w-[15%]">Total Expenses</TableHead>
              <TableHead className="text-white w-[20%]">Net Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlySummary.map((summary) => (
              <TableRow key={summary.month} className="border-b hover:bg-gray-50">
                <TableCell className="font-medium border-r">{summary.month}</TableCell>
                <TableCell className="text-finance-income border-r">
                  {summary.income.toLocaleString('en-US', { style: 'currency', currency: 'PLN' })}
                </TableCell>
                <TableCell className="border-r">
                  <div className="space-y-1">
                    {summary.expensesByCategory.map((expense) => (
                      <div key={expense.category}>
                        {expense.category}: {expense.amount.toLocaleString('en-US', { style: 'currency', currency: 'PLN' })}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-finance-expense border-r">
                  {summary.totalExpenses.toLocaleString('en-US', { style: 'currency', currency: 'PLN' })}
                </TableCell>
                <TableCell className={`${summary.netBalance >= 0 ? 'text-finance-income' : 'text-finance-expense'}`}>
                  {summary.netBalance.toLocaleString('en-US', { style: 'currency', currency: 'PLN' })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </Layout>
  );
};

export default MonthlySummary;
