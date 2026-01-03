/**
 * Test Setup Configuration
 * Jest test environment setup for checkout module testing
 */

import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'rzp_test_mock_key_id'
process.env.RAZORPAY_KEY_SECRET = 'mock_key_secret'
process.env.RAZORPAY_WEBHOOK_SECRET = 'mock_webhook_secret'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock-supabase-url.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key'
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock'
process.env.CLERK_SECRET_KEY = 'sk_test_mock'

// Global test timeout
jest.setTimeout(30000)

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn()
  }),
  usePathname: () => '/checkout',
  useSearchParams: () => new URLSearchParams()
}))

// Mock Clerk authentication
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => ({
    userId: 'user_test_123',
    sessionId: 'session_test_123'
  }))
}))

jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    userId: 'user_test_123'
  }),
  useUser: () => ({
    isLoaded: true,
    user: {
      id: 'user_test_123',
      publicMetadata: {
        accountType: 'business',
        verificationStatus: 'verified'
      }
    }
  })
}))

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null
          })),
          order: jest.fn(() => ({
            data: [],
            error: null
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {},
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: {},
          error: null
        }))
      }))
    })),
    rpc: jest.fn(() => ({
      data: null,
      error: null
    }))
  }))
}))

// Global console suppression for tests (optional)
if (process.env.SUPPRESS_CONSOLE === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks()
})
