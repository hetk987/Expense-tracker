# Backend Integration Setup Guide

This guide will help you integrate your Express.js backend into the Next.js frontend using serverless functions.

## Prerequisites

1. Make sure you have Node.js 18+ installed
2. PostgreSQL database running
3. Plaid API credentials

## Step 1: Install Dependencies

```bash
cd frontend
npm install
```

## Step 2: Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/expense_tracker"

# Plaid Configuration
PLAID_CLIENT_ID="your_plaid_client_id"
PLAID_SECRET="your_plaid_secret"
PLAID_ENV="sandbox" # or "development" or "production"
PLAID_WEBHOOK_URL="https://your-domain.com/api/plaid/webhook"

# Next.js
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Step 3: Database Setup

1. Copy your existing database or create a new one
2. Run Prisma migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

## Step 4: Update Webhook URL

Update your Plaid webhook URL in the Plaid dashboard to point to:
`https://your-domain.com/api/plaid/webhook`

## Step 5: Start Development Server

```bash
npm run dev
```

## API Endpoints

The following API endpoints are now available:

- `POST /api/plaid/create-link-token` - Create Plaid link token
- `POST /api/plaid/exchange-token` - Exchange public token for access token
- `GET /api/plaid/accounts` - Get all linked accounts
- `GET /api/plaid/transactions` - Get transactions with filters
- `POST /api/plaid/sync` - Manually sync transactions
- `POST /api/plaid/webhook` - Handle Plaid webhooks

## Benefits of This Integration

1. **Single Deployment**: Everything is now in one Next.js application
2. **Serverless Functions**: API routes run as serverless functions
3. **Better Performance**: No network latency between frontend and backend
4. **Easier Management**: Single codebase and deployment pipeline
5. **Cost Effective**: Serverless functions only run when needed

## Migration Notes

- The frontend API client has been updated to use the new endpoints
- All backend logic has been moved to the `src/lib` directory
- API routes are organized as individual files in `src/app/api/plaid/`
- Database schema remains the same
- Environment variables need to be updated

## Deployment

When deploying to Vercel or similar platforms:

1. Set the environment variables in your deployment platform
2. The API routes will automatically be deployed as serverless functions
3. Make sure your database is accessible from the deployment platform
4. Update the webhook URL to point to your production domain
