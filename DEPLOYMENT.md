# Domain Chat - Deployment Guide

## Quick Start (Vercel - Recommended)

### 1. Deploy to Vercel
```bash
# From your project directory
npx vercel

# Follow the prompts:
# - Link to existing project or create new
# - Set up environment variables
# - Deploy!
```

### 2. Set Environment Variables in Vercel Dashboard
Go to your Vercel project dashboard → Settings → Environment Variables and add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
CHAT_MODEL=gemini-1.5-flash
EMBEDDING_MODEL=text-embedding-004
```

### 3. Set up Supabase Database
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run the contents of `supabase-schema.sql`
4. Copy your project URL and API keys

### 4. Get Google AI API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your environment variables

## Alternative Deployment Options

### Netlify
```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=.next
```

### Railway
```bash
# Login to Railway
railway login

# Deploy
railway deploy
```

## Post-Deployment Setup

1. **Create Admin User**: The first user to sign up will need admin privileges
2. **Set up Industry Profiles**: Use the admin panel to create industry-specific profiles
3. **Upload Documents**: Add knowledge base documents for RAG functionality

## Domain Setup

### Custom Domain (Optional)
1. In Vercel dashboard → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate is automatically provisioned

## Monitoring & Analytics

- **Vercel Analytics**: Built-in performance monitoring
- **Supabase Dashboard**: Database monitoring and logs
- **Google AI Usage**: Monitor API usage in Google AI Studio

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check environment variables are set correctly
2. **Database Errors**: Ensure Supabase schema is properly set up
3. **API Limits**: Monitor Google AI API usage and limits

### Support:
- Check Vercel deployment logs
- Review Supabase database logs
- Monitor Google AI API usage
