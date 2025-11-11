# Deployment Checklist

## Pre-Deployment Steps

### 1. Environment Variables ✓
- [ ] `.env` file configured with Supabase credentials
- [ ] `VITE_SUPABASE_URL` set correctly
- [ ] `VITE_SUPABASE_ANON_KEY` set correctly
- [ ] `.env` is in `.gitignore` (never commit secrets!)

### 2. Database Setup ✓
- [ ] All migrations in `supabase/migrations/` applied to production database
- [ ] RLS (Row Level Security) policies enabled
- [ ] Storage buckets configured for attachments
- [ ] Realtime subscriptions enabled for required tables

### 3. Code Quality ✓
- [ ] No TypeScript errors (`npm run build`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] All backup files removed
- [ ] Console.log statements removed or replaced with proper logging
- [ ] Error boundaries implemented

### 4. Testing ✓
- [ ] Authentication flow (login/register) works
- [ ] Teacher dashboard loads correctly
- [ ] Student dashboard loads correctly
- [ ] Task CRUD operations work
- [ ] Gamification features (coins, titles) work
- [ ] Shop and inventory systems work
- [ ] File uploads work
- [ ] Comments system works
- [ ] Leaderboard displays correctly

### 5. Performance ✓
- [ ] Images optimized
- [ ] Lazy loading implemented where needed
- [ ] Build size is reasonable (`npm run build`)
- [ ] No memory leaks in React components

### 6. Security ✓
- [ ] API keys not exposed in client code
- [ ] RLS policies prevent unauthorized access
- [ ] File upload validation in place
- [ ] XSS protection enabled
- [ ] CORS configured correctly

## Deployment Platforms

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Project Settings > Environment Variables
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages
```bash
# Add to vite.config.ts:
# base: '/school-task-list/'

# Build
npm run build

# Deploy using gh-pages
npm i -g gh-pages
gh-pages -d dist
```

## Post-Deployment

### 1. Verify Deployment
- [ ] Site loads without errors
- [ ] All routes work correctly
- [ ] Authentication works
- [ ] Database operations work
- [ ] File uploads work
- [ ] Check browser console for errors

### 2. Monitor
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Monitor Supabase usage
- [ ] Check performance metrics

### 3. Documentation
- [ ] Update README with live URL
- [ ] Document any deployment-specific configurations
- [ ] Create user guide if needed

## Rollback Plan

If deployment fails:
1. Check browser console for errors
2. Verify environment variables are set correctly
3. Check Supabase connection
4. Review build logs
5. Rollback to previous version if needed

## Support

For issues, check:
- [Vite Documentation](https://vitejs.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com/)
