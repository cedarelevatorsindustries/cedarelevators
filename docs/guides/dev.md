# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd cedar-storefront

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
pnpm dev
```

Visit http://localhost:3000 to see the application.

## Environment Configuration

### Required Environment Variables

```env
# Next.js
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Redis (Upstash)
REDIS_URL=redis://...
REDIS_TOKEN=...

# Resend (Email)
RESEND_API_KEY=re_...

# Razorpay (Payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

## Project Structure

### Core Directories

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth-related routes
│   ├── (main)/            # Main application routes
│   ├── api/               # API endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/
│   ├── common/            # Reusable UI components
│   ├── guards/            # Access control components
│   └── providers/         # Context providers
├── lib/
│   ├── auth/              # Authentication utilities
│   ├── db/                # Database client and queries
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Utility functions
├── modules/               # Feature-specific modules
│   ├── home/              # Homepage components
│   ├── profile/           # User profile features
│   ├── quote/             # Quote management
│   └── catalog/           # Product catalog
└── middleware.ts          # Route protection middleware
```

### Module Structure

Each module follows a consistent structure:

```
modules/[feature]/
├── components/            # Feature-specific components
│   ├── mobile/           # Mobile-specific components
│   ├── desktop/          # Desktop-specific components
│   └── shared/           # Shared components
├── templates/            # Page templates
├── hooks/                # Feature-specific hooks
├── utils/                # Feature-specific utilities
└── types.ts              # TypeScript types
```

## Development Workflow

### Branch Strategy
- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `hotfix/*` - Hotfix branches

### Code Standards

#### TypeScript
- Strict mode enabled
- Explicit return types for functions
- Interface over type for object definitions
- Proper error handling with try/catch

#### React
- Functional components with hooks
- Custom hooks for reusable logic
- Proper dependency arrays in useEffect
- Memoization for expensive operations

#### Styling
- Tailwind CSS for styling
- Responsive design (mobile-first)
- Consistent spacing and colors
- Dark mode support where applicable

### Component Guidelines

#### Common Components
Located in `src/components/common/`:

```tsx
// Example: Button component
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  children,
  onClick 
}: ButtonProps) {
  // Implementation
}
```

#### Module Components
Feature-specific components in respective module directories:

```tsx
// Example: Quote template component
interface QuoteTemplateProps {
  userType: 'guest' | 'individual' | 'business'
  quotes?: Quote[]
  onCreateQuote?: () => void
}

export function QuoteTemplate({ 
  userType, 
  quotes, 
  onCreateQuote 
}: QuoteTemplateProps) {
  // Implementation
}
```

### State Management

#### Local State
Use React's built-in state management:
- `useState` for component state
- `useReducer` for complex state logic
- `useContext` for shared state

#### Server State
Use appropriate data fetching:
- Server Components for initial data
- Client Components for interactive data
- SWR or React Query for caching (if needed)

#### Global State
- Clerk for authentication state
- Context providers for feature-specific state
- Redis for session persistence

### Database Operations

#### Supabase Client
```tsx
import { createClient } from '@/lib/db'

// Server-side operations
const supabase = createClient()

// Client-side operations
const supabase = createClient()
```

#### Query Patterns
```tsx
// Fetch data
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)

// Insert data
const { data, error } = await supabase
  .from('quotes')
  .insert([{ user_id, items, total }])

// Update data
const { data, error } = await supabase
  .from('quotes')
  .update({ status: 'approved' })
  .eq('id', quoteId)
```

### Authentication

#### Role-based Access
```tsx
import { useAccountType } from '@/lib/hooks/use-account-type'

function BusinessFeature() {
  const { isBusiness, isVerified } = useAccountType()
  
  if (!isBusiness) {
    return <AccessDenied />
  }
  
  return (
    <div>
      {isVerified ? <VerifiedFeatures /> : <UnverifiedFeatures />}
    </div>
  )
}
```

#### Route Protection
```tsx
// middleware.ts
import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: ['/'],
  ignoredRoutes: ['/api/webhooks/(.*)']
})
```

## Testing

### Unit Testing
```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Integration Testing
```bash
# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e
```

### Testing Guidelines
- Test user interactions, not implementation details
- Mock external dependencies
- Use meaningful test descriptions
- Maintain good test coverage (>80%)

## Performance Optimization

### Bundle Optimization
- Code splitting by route
- Dynamic imports for heavy components
- Tree shaking for unused code
- Bundle analysis with `@next/bundle-analyzer`

### Image Optimization
- Use Next.js Image component
- Optimize images for web (WebP format)
- Implement lazy loading
- Use appropriate sizing

### Database Optimization
- Use database indexes
- Implement query optimization
- Use connection pooling
- Cache frequently accessed data

## Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Setup
1. Configure environment variables in Vercel dashboard
2. Set up domain and SSL
3. Configure redirects and rewrites
4. Set up monitoring and analytics

### Database Migration
```bash
# Run Supabase migrations
supabase db push

# Reset database (development only)
supabase db reset
```

## Troubleshooting

### Common Issues

#### Build Errors
- Check TypeScript errors: `pnpm type-check`
- Verify environment variables
- Clear Next.js cache: `rm -rf .next`

#### Authentication Issues
- Verify Clerk configuration
- Check middleware setup
- Validate JWT tokens

#### Database Issues
- Check Supabase connection
- Verify RLS policies
- Review query syntax

### Debug Tools
- React Developer Tools
- Next.js DevTools
- Supabase Dashboard
- Vercel Analytics

## Contributing

### Pull Request Process
1. Create feature branch from `develop`
2. Implement changes with tests
3. Update documentation if needed
4. Submit PR with clear description
5. Address review feedback
6. Merge after approval

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance impact considered
- [ ] Accessibility requirements met

---

**Last Updated**: December 19, 2024