import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, CalendarIcon } from 'lucide-react';
import { getDateRangeFromFilter, isDateInRange } from '@/lib/date-utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SummaryEntry {
  id: string;
  date: string;
  description: string;
  plnAmount: number;
  inrAmount: number;
  created_at?: string;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const filterEntries = (entries: SummaryEntry[], yearMonth: string) => {
  if (!yearMonth) return entries;
  const [year, month] = yearMonth.split('-');
  const targetMonth = months.indexOf(month) +1;

  return entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getFullYear().toString() === year && entryDate.getMonth() + 1 === targetMonth;
  });
};

export default function Summary() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [plnAmount, setPlnAmount] = useState('');
  const [inrAmount, setInrAmount] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [isCreatingTable, setIsCreatingTable] = useState(false);

  // Function to check if the currency_entries table exists, and create it if it doesn't
  const checkAndCreateTable = async () => {
    try {
      setIsCreatingTable(true);
      
      // Check if the table exists
      const { data: tableExists, error: checkError } = await supabase
        .from('currency_entries')
        .select('id')
        .limit(1);
      
      // If there's a specific error about the table not existing
      if (checkError && checkError.message.includes('does not exist')) {
        console.log('Table does not exist, creating it...');
        
        // Create the table using SQL
        const { error: createError } = await supabase.rpc('create_currency_entries_table');
        
        if (createError) {
          console.error('Error creating table:', createError);
          toast.error('Failed to create currency entries table');
          return false;
        }
        
        console.log('Table created successfully');
        toast.success('Currency entries table created');
        return true;
      } else if (checkError) {
        console.error('Error checking table:', checkError);
        toast.error('Failed to check currency entries table');
        return false;
      }
      
      console.log('Table exists:', tableExists);
      return true;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setIsCreatingTable(false);
    }
  };

  // Run the table check when the component mounts
  useEffect(() => {
    checkAndCreateTable();
  }, []);

  // Fetch entries from Supabase
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['currencyEntries'],
    queryFn: async () => {
      try {
        // Check if table exists
        const tableExists = await checkAndCreateTable();
        if (!tableExists) return [];
        
        const { data, error } = await supabase
          .from('currency_entries')
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          console.error("Error fetching entries:", error);
          toast.error("Failed to load currency entries");
          throw error;
        }

        if (!data) {
          return [];
        }

        return data.map(entry => ({
          id: entry.id,
          date: entry.date,
          description: entry.description,
          plnAmount: entry.pln_amount,
          inrAmount: entry.inr_amount,
          created_at: entry.created_at
        }));
      } catch (error) {
        console.error("Error fetching currency entries:", error);
        toast.error("Failed to load currency entries");
        return [];
      }
    }
  });

  // Add new entry mutation
  const addEntry = useMutation({
    mutationFn: async (newEntry: Omit<SummaryEntry, 'id' | 'created_at'>) => {
      console.log("Submitting entry:", newEntry);
      
      // Check if table exists first
      const tableExists = await checkAndCreateTable();
      if (!tableExists) {
        throw new Error("Currency entries table doesn't exist");
      }
      
      const { data, error } = await supabase
        .from('currency_entries')
        .insert({
          date: newEntry.date,
          description: newEntry.description,
          pln_amount: Number(newEntry.plnAmount),
          inr_amount: Number(newEntry.inrAmount)
        })
        .select();

      if (error) {
        console.error("Error adding entry:", error);
        toast.error(`Failed to add entry: ${error.message}`);
        throw error;
      }

      if (!data || data.length === 0) {
        console.error("No data returned after insert");
        toast.error("Failed to add entry: No data returned");
        throw new Error("No data returned after insert");
      }

      console.log("Entry added successfully:", data[0]);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencyEntries'] });
      toast.success("Entry added successfully");
      // Reset form fields after success
      setDate('');
      setDescription('');
      setPlnAmount('');
      setInrAmount('');
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    }
  });

  // Delete entry mutation
  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('currency_entries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting entry:", error);
        toast.error("Failed to delete entry");
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencyEntries'] });
      toast.success("Entry deleted successfully");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast.error("Please select a date");
      return;
    }
    
    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }
    
    const parsedPlnAmount = parseFloat(plnAmount);
    const parsedInrAmount = parseFloat(inrAmount);
    
    if (isNaN(parsedPlnAmount) || parsedPlnAmount <= 0) {
      toast.error("Please enter a valid PLN amount");
      return;
    }
    
    if (isNaN(parsedInrAmount) || parsedInrAmount <= 0) {
      toast.error("Please enter a valid INR amount");
      return;
    }

    console.log("Form submitted with:", { date, description, plnAmount: parsedPlnAmount, inrAmount: parsedInrAmount });

    addEntry.mutate({
      date,
      description,
      plnAmount: parsedPlnAmount,
      inrAmount: parsedInrAmount,
    });
  };

  const filteredEntries = useMemo(() => {
    return filterEntries(entries, dateFilter);
  }, [entries, dateFilter]);

  const totalPLN = filteredEntries.reduce((sum, entry) => sum + entry.plnAmount, 0);
  const totalINR = filteredEntries.reduce((sum, entry) => sum + entry.inrAmount, 0);
  const avgPLNtoINR = totalPLN && totalINR ? (totalINR / totalPLN).toFixed(2) : '0';

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-background p-6 rounded-lg space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Currency Summary</h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>{dateFilter ? dateFilter : 'Select Month and Year'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[300px]" align="end">
              <DropdownMenuLabel>Filter by Month and Year</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2">
                {[2026, 2025].map(year => {
                  return(
                    <div key={year} className="mb-4">
                      <div className="font-semibold mb-2">{year}</div>
                      <div className="grid grid-cols-4 gap-1">
                        {months.map((month, index) => (
                          <button 
                            key={`${year}-${month}`}
                            onClick={() => setDateFilter(`${year}-${month}`)}
                            className={`text-sm py-1 px-2 rounded hover:bg-gray-100 focus:outline-none ${dateFilter === `${year}-${month}` ? 'bg-gray-200' : ''}`}
                          >
                            {month.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total PLN</CardDescription>
              <CardTitle className="text-lg">{totalPLN.toFixed(2)} PLN</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total INR</CardDescription>
              <CardTitle className="text-lg">{totalINR.toFixed(2)} INR</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
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
                  selected={date ? new Date(date) : undefined}
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
            <Input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <div className="flex gap-4">
              <Input
                type="number"
                placeholder="Amount (PLN)"
                value={plnAmount}
                onChange={(e) => setPlnAmount(e.target.value)}
                required
              />
              <Input
                type="number"
                placeholder="Amount (INR)"
                value={inrAmount}
                onChange={(e) => setInrAmount(e.target.value)}
                required
              />
              <Button type="submit" disabled={isCreatingTable}>Add</Button>
            </div>
          </div>
        </form>

        <Table>
          <TableHeader>
            <TableRow className="bg-orange-500">
              <TableHead className="text-white">Date</TableHead>
              <TableHead className="text-white">Description</TableHead>
              <TableHead className="text-white">Amount (PLN)</TableHead>
              <TableHead className="text-white">Amount (INR)</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>{entry.plnAmount.toFixed(2)} PLN</TableCell>
                <TableCell>{entry.inrAmount.toFixed(2)} INR</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteEntry.mutate(entry.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}
