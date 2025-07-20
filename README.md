# Expense Tracker Frontend

A modern, responsive web application for tracking expenses with automatic bank integration using Plaid. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Dashboard**: Overview of financial health with key metrics
- **Account Linking**: Secure bank account connection via Plaid
- **Transaction Management**: View, filter, and analyze transactions
- **Real-time Syncing**: Automatic transaction updates
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Modern UI**: Clean, intuitive interface with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Plaid Integration**: react-plaid-link
- **State Management**: React hooks with Zustand (for future expansion)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running (see backend README)

### Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Start the development server**:

   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3001](http://localhost:3001)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard page
│   ├── link-account/      # Account linking page
│   └── transactions/      # Transactions page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── badge.tsx
│   └── Header.tsx        # Main navigation header
├── lib/                  # Utility functions and services
│   ├── api.ts           # API service layer
│   └── utils.ts         # Helper functions
└── types/               # TypeScript type definitions
    └── index.ts
```

## Key Components

### Dashboard (`/`)

- Financial overview with key metrics
- Recent transactions preview
- Linked accounts summary
- Quick actions for syncing and linking accounts

### Link Account (`/link-account`)

- Secure Plaid integration for bank account linking
- Step-by-step account connection process
- Security information and supported banks
- Success confirmation with linked account details

### Transactions (`/transactions`)

- Comprehensive transaction list with filtering
- Date range and account filters
- Pagination support
- Transaction categorization and status indicators
- Export and analysis features

## API Integration

The frontend communicates with the backend through a RESTful API:

- `POST /api/plaid/create-link-token` - Initialize Plaid Link
- `POST /api/plaid/exchange-token` - Complete account linking
- `GET /api/plaid/accounts` - Fetch linked accounts
- `GET /api/plaid/transactions` - Get transactions with filters
- `POST /api/plaid/sync` - Manual transaction sync

## Styling

The application uses Tailwind CSS for styling with a custom design system:

- **Primary Colors**: Blue-based palette for brand elements
- **Semantic Colors**: Green for income, red for expenses
- **Responsive Design**: Mobile-first approach with breakpoints
- **Component Library**: Reusable UI components with consistent styling

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Component-based architecture
- Custom hooks for reusable logic

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted servers

## Environment Variables

| Variable              | Description     | Default                 |
| --------------------- | --------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3000` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:

- Check the backend README for API documentation
- Review Plaid documentation for integration details
- Open an issue for bugs or feature requests
