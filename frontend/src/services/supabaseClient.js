import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://frqrtlcjikatothymhxp.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-oiti0JWQ4rHm0Cjl4oO6w_-bIyojAt'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
