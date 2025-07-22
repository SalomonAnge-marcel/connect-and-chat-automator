// supabase/functions/linkedin-session/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('PUBLIC_SUPABASE_URL') ?? '',
      Deno.env.get('PUBLIC_SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { method } = req
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    )

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    switch (method) {
      case 'POST':
        // Store LinkedIn session
        const body = await req.json()
        const { 
          cookies, 
          li_at_token, 
          linkedin_user_id, 
          profile_data,
          expires_in 
        } = body

        // Calculate expiration date
        const expires_at = expires_in 
          ? new Date(Date.now() + (expires_in * 1000))
          : new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) // Default 30 days

        // First, invalidate any existing sessions for this user
        await supabaseClient
          .from('linkedin_sessions')
          .update({ session_status: 'expired' })
          .eq('user_id', user.id)

        // Store new session
        const { data: session, error: insertError } = await supabaseClient
          .from('linkedin_sessions')
          .insert([
            {
              user_id: user.id,
              session_cookies: cookies,
              li_at_token,
              jsessionid: cookies.JSESSIONID,
              bcookie: cookies.bcookie,
              bscookie: cookies.bscookie,
              linkedin_user_id,
              linkedin_profile_data: profile_data,
              expires_at: expires_at.toISOString(),
              user_agent: req.headers.get('User-Agent'),
              ip_address: req.headers.get('CF-Connecting-IP') || 
                          req.headers.get('X-Forwarded-For') ||
                          'unknown'
            }
          ])
          .select()

        if (insertError) throw insertError

        return new Response(
          JSON.stringify({ success: true, session_id: session[0].id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
        )

      case 'GET':
        // Retrieve active LinkedIn session
        const { data: activeSession, error: getError } = await supabaseClient
          .from('linkedin_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('session_status', 'active')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (getError && getError.code !== 'PGRST116') { // PGRST116 = no rows found
          throw getError
        }

        return new Response(
          JSON.stringify({ session: activeSession || null }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

      case 'DELETE':
        // Invalidate LinkedIn session
        const { error: deleteError } = await supabaseClient
          .from('linkedin_sessions')
          .update({ 
            session_status: 'invalid',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('session_status', 'active')

        if (deleteError) throw deleteError

        return new Response(
          JSON.stringify({ success: true, message: 'Session invalidated' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
        )
    }
  } catch (error) {
    console.error('LinkedIn session error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})