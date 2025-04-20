import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Hello from cleanup-unverified-users Function!')

// Define the cleanup threshold (e.g., 24 hours in milliseconds)
const CLEANUP_THRESHOLD_MS = 24 * 60 * 60 * 1000; 
// Alternative: Use ISO duration string for Supabase query if needed
// const CLEANUP_THRESHOLD_INTERVAL = '24 hours'; 

Deno.serve(async (req) => {
  // This function should be triggered by a schedule, not HTTP requests.
  // However, we need the basic serve structure for deployment.
  // We can add a check for a secret header if we want manual invocation later.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase Admin client
    // Ensure SUPABASE_SERVICE_ROLE_KEY is set in Function secrets
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { 
        auth: { 
          autoRefreshToken: false, 
          persistSession: false 
        } 
      }
    )

    // Calculate the timestamp for the cleanup threshold
    const cleanupBefore = new Date(Date.now() - CLEANUP_THRESHOLD_MS).toISOString();
    console.log(`Looking for unverified users created before: ${cleanupBefore}`);

    // Fetch unverified users older than the threshold
    // Note: Directly querying auth.users might require specific permissions
    // or might be better done via admin API methods if available/safer.
    // Let's use listUsers which is safer.
    
    let usersToDelete = [];
    let page = 0;
    const pageSize = 100; // Adjust page size as needed

    while (true) {
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page: page + 1, // API uses 1-based indexing for pages
          perPage: pageSize
      });
      
      if (listError) {
        throw new Error(`Failed to list users: ${listError.message}`);
      }

      if (!users || users.length === 0) {
        console.log("No more users found to check.");
        break; // Exit loop if no more users
      }
      
      console.log(`Processing page ${page + 1}, found ${users.length} users.`);

      const olderUnverifiedUsers = users.filter(user => 
        !user.email_confirmed_at && 
        new Date(user.created_at) < new Date(cleanupBefore)
      );

      if (olderUnverifiedUsers.length > 0) {
          usersToDelete.push(...olderUnverifiedUsers.map(user => ({ id: user.id, email: user.email })));
          console.log(`Found ${olderUnverifiedUsers.length} older unverified users on this page.`);
      }
      
      page++;
      
      // Break if we fetched less than page size, indicating last page
      if (users.length < pageSize) {
          break;
      }
    }


    console.log(`Found a total of ${usersToDelete.length} users to delete.`);

    if (usersToDelete.length === 0) {
      return new Response(JSON.stringify({ message: 'No users needed cleanup.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Delete the identified users
    let deletedCount = 0;
    let failedDeletions = [];
    for (const user of usersToDelete) {
      console.log(`Attempting to delete user ID: ${user.id}, Email: ${user.email}`);
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.error(`Failed to delete user ${user.id} (${user.email}): ${deleteError.message}`);
        failedDeletions.push({ id: user.id, email: user.email, error: deleteError.message });
      } else {
        deletedCount++;
      }
      // Add a small delay to avoid rate limiting if deleting many users
      await new Promise(resolve => setTimeout(resolve, 50)); 
    }

    console.log(`Successfully deleted ${deletedCount} users.`);
    if (failedDeletions.length > 0) {
        console.warn(`Failed to delete ${failedDeletions.length} users.`);
    }

    return new Response(JSON.stringify({ 
        message: `Cleanup complete. Deleted ${deletedCount} users.`,
        failures: failedDeletions 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error during cleanup:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

// Note: You need to configure Supabase Function secrets for:
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY
// You also need to set up a schedule (cron) in Supabase dashboard 
// or via CLI (`supabase functions deploy --schedule`) to run this function.
// Example schedule (once daily at 3 AM UTC): "0 3 * * *" 