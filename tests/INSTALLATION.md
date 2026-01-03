# Test Suite Installation Guide

## Required Dependencies

To run the test suite, you need to install the following dependencies:

```bash
# Install test dependencies
pnpm add -D jest @types/jest ts-jest \
  @testing-library/react @testing-library/jest-dom \
  @playwright/test \
  dotenv
```

## Dependency Breakdown

### Jest (Unit & Integration Testing)
- `jest` - Core testing framework
- `@types/jest` - TypeScript types for Jest
- `ts-jest` - TypeScript support for Jest

### Testing Library (React Testing)
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom DOM matchers

### Playwright (E2E Testing)
- `@playwright/test` - End-to-end testing framework

### Utilities
- `dotenv` - Environment variable loading

## Installation Steps

1. **Install dependencies:**
```bash
pnpm add -D jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom @playwright/test dotenv
```

2. **Install Playwright browsers:**
```bash
pnpm exec playwright install
```

3. **Verify installation:**
```bash
# Check Jest
pnpm test --version

# Check Playwright
pnpm exec playwright --version
```

## After Installation

Once dependencies are installed, you can run:

```bash
# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run all tests
pnpm test:all
```

For more details, see [tests/README.md](./README.md)
