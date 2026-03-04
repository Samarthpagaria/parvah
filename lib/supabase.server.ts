// 2. lib/supabase.server.ts — Server ClientSupabase server clientSupabase server clientHow it gets used — example server component:
// typescript// app/(public)/dashboard/page.tsx
// // NO "use client" here — this is a server component
// import { createSupabaseServerClient } from '@/lib/supabase.server'

// export default async function Dashboard() {
//   const supabase = await createSupabaseServerClient()
  
//   // Get current logged in user on the SERVER
//   const { data: { user } } = await supabase.auth.getUser()
  
//   return <div>Welcome {user?.email}</div>
// }