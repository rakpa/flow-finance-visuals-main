
-- Create a function to create the currency_entries table if it doesn't exist
CREATE OR REPLACE FUNCTION create_currency_entries_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the table exists
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'currency_entries'
    ) THEN
        -- Create the table
        CREATE TABLE public.currency_entries (
            id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
            date date NOT NULL,
            description text NOT NULL,
            pln_amount numeric NOT NULL,
            inr_amount numeric NOT NULL,
            created_at timestamp with time zone DEFAULT now() NOT NULL
        );
        
        -- Create an index on date
        CREATE INDEX currency_entries_date_idx ON public.currency_entries USING btree (date);
        
        -- Enable Row Level Security
        ALTER TABLE public.currency_entries ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Enable read access for all users" ON public.currency_entries
            FOR SELECT USING (true);
        
        CREATE POLICY "Enable insert access for all users" ON public.currency_entries
            FOR INSERT WITH CHECK (true);
        
        CREATE POLICY "Enable update access for all users" ON public.currency_entries
            FOR UPDATE USING (true);
        
        CREATE POLICY "Enable delete access for all users" ON public.currency_entries
            FOR DELETE USING (true);
            
        RETURN true;
    ELSE
        RETURN true;
    END IF;
END;
$$;
