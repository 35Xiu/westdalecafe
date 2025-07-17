// Supabase 配置 - 支持环境变量
export const supabaseConfig = {
  url: import.meta.env?.VITE_SUPABASE_URL || 'https://kstxlrhzhqgqcqnsxthw.supabase.co',
  anonKey: import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzdHhscmh6aHFncWNxbnN4dGh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTk2OTMsImV4cCI6MjA2NzA3NTY5M30.MkpDezeD9hccnV0XTfFxzrMvQA1w7DHM9zggApUOTVA'
}; 