# Plant Protein E-Commerce Store

A modern e-commerce website for selling plant-based protein products with fruit powder blends.

## Features

- Product catalog with filtering by category and flavor
- Detailed product pages with nutrition information
- Shopping cart and mock checkout
- Admin dashboard for product management
- Analytics tracking (page views, buy clicks)
- Image upload capability for admin

## Tech Stack

- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings > API to get your credentials
4. Go to SQL Editor and run the `supabase-schema.sql` file
5. Go to Storage and create a bucket named `product-images` (set to public)

### 3. Configure Environment Variables

Update `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ADMIN_PASSWORD=your_admin_password
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the storefront
Visit `http://localhost:3000/admin` to access the admin dashboard

### 5. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel dashboard
4. Deploy!

## Project Structure

```
plant_protein/
├── app/
│   ├── (storefront)/        # Customer-facing pages
│   │   ├── page.tsx         # Home/Product listing
│   │   ├── products/[id]/   # Product detail page
│   │   ├── cart/            # Shopping cart
│   │   └── checkout/        # Checkout flow
│   ├── admin/               # Admin dashboard
│   │   ├── page.tsx         # Dashboard overview
│   │   ├── products/        # Product management
│   │   ├── orders/          # View orders
│   │   └── analytics/       # Analytics dashboard
│   └── api/                 # API routes
├── components/              # Reusable UI components
├── lib/                     # Utility functions & types
└── public/                  # Static assets
```

## Admin Access

Default admin password is set in `.env.local`. Change it before deploying!

## Features Checklist

- [x] Product catalog display
- [x] Nutrition information display
- [x] Shopping cart functionality
- [x] Mock checkout with email/mobile validation
- [x] Admin product management (add, edit, delete)
- [x] Image upload (file upload or URL)
- [x] Order tracking
- [x] Analytics (buy clicks, page views)
- [x] Category and flavor filtering
- [x] Responsive design

## Support

For issues or questions, please refer to the Next.js and Supabase documentation.
