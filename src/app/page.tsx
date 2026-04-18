import { createClient } from '@/utils/supabase/server'
import Dashboard from './Dashboard'

export default async function HomePage() {
  const supabase = await createClient()
  
  // The middleware already protects this route, 
  // so user will be defined here.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <Dashboard user={user} />
}
