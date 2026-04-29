import { auth } from '@clerk/nextjs/server'
import { createServerSupabase } from '../../../../lib/supabase-server'

export async function DELETE(request, { params }) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const { error } = await supabase
    .from('user_cities')
    .delete()
    .eq('user_id', userId)
    .eq('city_id', params.cityId)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
