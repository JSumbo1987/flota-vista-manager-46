import { createClient } from '@supabase/supabase-js'

// Substitui com os dados do teu projeto Supabase
const supabaseUrl = 'https://kbiwjoecupoulyasrnao.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiaXdqb2VjdXBvdWx5YXNybmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNDc1ODQsImV4cCI6MjA2MDcyMzU4NH0.9Ya-hB_ewu-lj1KAXXKLTTuiUw8ZHEkC_iK21-QbqGE'

export const supabase = createClient(supabaseUrl, supabaseKey)