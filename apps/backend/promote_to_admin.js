const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function promoteUser(email) {
  console.log(`Searching for user with email: ${email}...`);
  
  // 1. Get the user by email
  const { data: { users }, error: fetchError } = await supabase.auth.admin.listUsers();
  
  if (fetchError) {
    console.error('Error fetching users:', fetchError.message);
    return;
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    console.error(`User with email ${email} not found.`);
    return;
  }

  console.log(`User found! ID: ${user.id}. Promoting to Admin...`);

  // 2. Update user metadata
  const { data, error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { user_metadata: { 
        ...user.user_metadata,
        role: 'admin',
        is_approved: true 
      } 
    }
  );

  if (updateError) {
    console.error('Error updating user:', updateError.message);
    return;
  }

  console.log('✅ Success! Account promoted to Admin.');
  console.log('Please sign out and sign back in on the website to see the Admin Panel.');
}

// Get email from command line argument
const emailArg = process.argv[2];
if (!emailArg) {
  console.error('Usage: node promote_to_admin.js your-email@example.com');
  process.exit(1);
}

promoteUser(emailArg);
