import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfmvyachiypzvtxpdvma.supabase.co'; // ← your actual project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmbXZ5YWNoaXlwenZ0eHBkdm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NzA5NDQsImV4cCI6MjA2MTA0Njk0NH0.fz6hwd9XvrHbLvUQXWombFHso0s-4cXBNoRhaz0g0tg'; // ← your anon public key

export const supabase = createClient(supabaseUrl, supabaseKey);
