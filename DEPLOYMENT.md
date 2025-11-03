# Deployment Guide

This guide will walk you through deploying your Plant Protein e-commerce store.

## Prerequisites

1. A GitHub account
2. A Vercel account (free tier available at [vercel.com](https://vercel.com))
3. A Supabase account (free tier available at [supabase.com](https://supabase.com))

## Step 1: Setup Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for your project to be provisioned (2-3 minutes)
3. Go to the SQL Editor in your project dashboard
4. Copy and paste the contents of `supabase-schema.sql` and execute it
5. Go to Storage section and create a new bucket:
   - Name: `product-images`
   - Public bucket: Yes (check the box)
6. Go to Project Settings > API to get your credentials:
   - Copy the `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - Copy the `anon/public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

## Step 2: Test Locally (Optional but Recommended)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ADMIN_PASSWORD=your_secure_password_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Visit `http://localhost:3000` to test the storefront
5. Visit `http://localhost:3000/admin` to test the admin (use your ADMIN_PASSWORD)

## Step 3: Push to GitHub

1. Initialize git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Plant Protein e-commerce store"
   ```

2. Create a new repository on GitHub (don't initialize with README)

3. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

## Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure your project:
   - Framework Preset: Next.js (should be auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

5. **IMPORTANT**: Add Environment Variables:
   Click "Environment Variables" and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
   - `ADMIN_PASSWORD` = your secure admin password

6. Click "Deploy"

7. Wait 2-3 minutes for deployment to complete

8. Visit your live site at the URL provided by Vercel (e.g., `your-project.vercel.app`)

## Step 5: Verify Deployment

1. Visit your live site
2. Check that products are loading from Supabase
3. Test adding items to cart
4. Test the checkout flow
5. Visit `/admin` and login to verify admin access
6. Try adding/editing a product in admin

## Post-Deployment

### Custom Domain (Optional)

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS

### Security Considerations

1. **Change the default admin password** in your environment variables
2. Consider implementing proper authentication (Auth0, NextAuth.js, etc.) for production
3. Add rate limiting to API routes
4. Enable Supabase Row Level Security (RLS) policies for production

### Monitoring

1. Check Vercel Analytics for traffic and performance
2. Monitor Supabase usage in your project dashboard
3. Review analytics in your admin dashboard

## Updating Your Site

After making changes to your code:

```bash
git add .
git commit -m "Your commit message"
git push
```

Vercel will automatically detect the push and redeploy your site!

## Troubleshooting

### Images not loading
- Make sure your Supabase storage bucket `product-images` is set to public
- Verify image URLs are correct in the database

### API errors
- Check Vercel deployment logs for errors
- Verify environment variables are set correctly in Vercel
- Check Supabase RLS policies aren't blocking requests

### Admin can't login
- Verify ADMIN_PASSWORD environment variable is set in Vercel
- Try clearing browser session storage

### Build fails
- Check Vercel build logs for specific errors
- Ensure all dependencies are in package.json
- Make sure TypeScript has no errors

## Support

For issues with:
- Next.js: [nextjs.org/docs](https://nextjs.org/docs)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Supabase: [supabase.com/docs](https://supabase.com/docs)

## Costs

Both Vercel and Supabase offer generous free tiers:
- **Vercel**: Free for personal projects, unlimited bandwidth
- **Supabase**: 500MB database, 1GB file storage, 2GB bandwidth/month

Your site should comfortably run on free tiers for testing and small-scale production use.
