// lib/supabase.ts — Browser Client
// This is used in client components (anything with "use client" at the top). Handles login, signup, and getting the current user in the browser.Supabase browser clientSupabase browser clientHow it gets used — example login form:
// typescript// app/(public)/login/page.tsx
// "use client"
// import { supabase } from '@/lib/supabase'

// const handleLogin = async () => {
//   const { data, error } = await supabase.auth.signInWithPassword({
//     email: 'user@example.com',
//     password: 'password123'
//   })
//   // data.session contains the JWT automatically
// }