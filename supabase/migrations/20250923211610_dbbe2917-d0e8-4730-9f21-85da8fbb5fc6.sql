-- Add user_id column to vendas table to associate sales with users
ALTER TABLE public.vendas 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing sales to belong to the first user (if any exists)
-- This is a one-time migration to handle existing data
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    IF first_user_id IS NOT NULL THEN
        UPDATE public.vendas SET user_id = first_user_id WHERE user_id IS NULL;
    END IF;
END $$;

-- Make user_id required for new records
ALTER TABLE public.vendas 
ALTER COLUMN user_id SET NOT NULL;

-- Drop the insecure "Allow all sales operations" policy
DROP POLICY IF EXISTS "Allow all sales operations" ON public.vendas;

-- Create secure user-specific policies
CREATE POLICY "Users can view their own sales" 
ON public.vendas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sales" 
ON public.vendas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales" 
ON public.vendas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales" 
ON public.vendas 
FOR DELETE 
USING (auth.uid() = user_id);