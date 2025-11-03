# Quick Start Guide

Get your Plant Protein e-commerce store running in 5 minutes!

## Step 1: Setup Supabase (3 minutes)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
   - Enter project name: `plant-protein-store`
   - Enter a database password (save this!)
   - Choose a region close to you
   - Click "Create new project"
3. Wait 2-3 minutes for project to initialize
4. Go to **SQL Editor** tab
   - Click "New Query"
   - Copy contents from `supabase-schema.sql` file
   - Click "Run" to create tables and sample data
5. Go to **Storage** tab
   - Click "Create new bucket"
   - Name: `product-images`
   - Check "Public bucket"
   - Click "Create"
6. Go to **Project Settings** > **API**
   - Copy `Project URL`
   - Copy `anon public` key

## Step 2: Configure Environment (1 minute)

Open `.env.local` file and update:

```env
NEXT_PUBLIC_SUPABASE_URL=paste_your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_anon_key_here
ADMIN_PASSWORD=admin123
```

**IMPORTANT**: Change `admin123` to a secure password!

## Step 3: Run the App (1 minute)

```bash
npm run dev
```

Wait for the server to start, then open your browser to:

- **Storefront**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin

## Testing the Application

### Test Storefront:
1. Browse the 4 sample products
2. Filter by category and flavor
3. Click on a product to see details
4. Add items to cart
5. Go to cart and adjust quantities
6. Proceed to checkout
7. Fill form with either email OR mobile (one required)
8. Place mock order

### Test Admin:
1. Go to http://localhost:3000/admin
2. Login with your ADMIN_PASSWORD
3. View dashboard statistics
4. Go to Products → Add a new product
5. Try both image URL and file upload options
6. Go to Orders → See your test orders
7. Go to Analytics → See buy clicks and page views

## What's Included?

### Storefront Features:
- Product listing with category/flavor filters
- Product detail pages with full nutrition info
- Shopping cart with quantity management
- Checkout with email/mobile validation
- Mock order processing

### Admin Features:
- Dashboard with statistics
- Product management (CRUD operations)
- Image upload OR URL input
- Order viewing with customer details
- Analytics tracking (clicks, views, conversions)
- Simple password authentication

### Technical Features:
- TypeScript for type safety
- Tailwind CSS for styling
- Supabase for database & storage
- Next.js API routes
- Real-time analytics tracking
- Responsive design

## Next Steps

1. **Add More Products**: Use the admin to add your actual products
2. **Customize Styling**: Edit the Tailwind theme in `tailwind.config.ts`
3. **Deploy to Production**: Follow `DEPLOYMENT.md` guide
4. **Add Payment Processing**: Integrate Stripe following their docs

## Common Issues

**Products not loading?**
- Check `.env.local` has correct Supabase credentials
- Verify SQL schema was run successfully in Supabase

**Can't login to admin?**
- Check ADMIN_PASSWORD in `.env.local`
- Try clearing browser session storage
- Default password is `admin123`

**Images not uploading?**
- Verify `product-images` bucket exists in Supabase Storage
- Ensure bucket is set to public
- Try using image URL instead

## Quick Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Project Structure

```
plant_protein/
├── app/
│   ├── (storefront)/    # Customer pages
│   ├── admin/           # Admin dashboard
│   └── api/             # API endpoints
├── components/          # Reusable components
├── lib/                 # Utilities & types
└── public/             # Static files
```

## Need Help?

- Check `README.md` for full documentation
- See `DEPLOYMENT.md` for deployment guide
- Review code comments for implementation details

Happy selling! 🌱
