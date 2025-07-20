// CDN oficial de Supabase (sin redirecciones)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.52.0/+esm';

// 2. Tus claves reales
const SUPABASE_URL  = 'https://rafqhqpailpvdvvhgvqo.supabase.co'; // reemplaza por la tuya
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZnFocXBhaWxwdmR2dmhndnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDEyMjgsImV4cCI6MjA2ODU3NzIyOH0.LpP9i9KS0FYO2tp2F_yqZ1mL9pkIp3L2qiPQeVuLGIE'; // reemplaza por la tuya

// 3. Cliente exportado
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);