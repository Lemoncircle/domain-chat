# Supabase Email Confirmation Fix

## Problem
Email confirmation links redirect to `localhost` instead of your production domain, causing "ERR_CONNECTION_REFUSED" errors.

## Solution: Update Supabase Configuration

### Step 1: Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in and select your project
3. Go to **Authentication** → **URL Configuration**

### Step 2: Update Site URL
Change the **Site URL** from:
```
http://localhost:3000
```
To:
```
https://domain-chat-8oqp8thas-mins-projects-5314d674.vercel.app
```

### Step 3: Add Redirect URLs
In the **Redirect URLs** section, add:
```
https://domain-chat-8oqp8thas-mins-projects-5314d674.vercel.app/auth/callback
```

### Step 4: Save Changes
Click **Save** to apply the changes.

## Alternative: Manual Confirmation

If you can't access Supabase dashboard right now:

1. **Copy the confirmation link** from your email
2. **Replace `localhost:3000`** with your production domain
3. **Visit the modified link**

Example:
- Original: `http://localhost:3000/auth/callback?token=...`
- Modified: `https://domain-chat-8oqp8thas-mins-projects-5314d674.vercel.app/auth/callback?token=...`

## Test the Fix

1. Try signing up with a new email address
2. Check that the confirmation link now points to your production domain
3. Click the link to complete authentication

## Environment Variables Check

Make sure these are set in your Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Troubleshooting

If still having issues:
1. Clear browser cookies for the domain
2. Try incognito/private browsing mode
3. Check Supabase logs in the dashboard
4. Verify the redirect URL is exactly correct
