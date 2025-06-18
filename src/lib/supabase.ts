import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yrehfncbxrvjjjgtogtn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZWhmbmNieHJ2ampqZ3RvZ3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNzE3NDksImV4cCI6MjA2NTg0Nzc0OX0.IQWdFp7hgSnqLvCX2CNCxQyBapQ4VZqrFMCKaLpYePE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);