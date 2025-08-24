# Test Structure

This directory contains all test files organized in a clean, maintainable structure.

## Directory Structure

```
tests/
├── unit/                    # Unit tests
│   ├── core/               # Core application tests (app.controller, etc.)
│   └── modules/            # Module-specific tests
│       ├── users/
│       │   ├── services/   # User service tests
│       │   └── *.spec.ts   # User controller tests
│       ├── settings/       # Settings module tests
│       ├── auth/           # Authentication module tests
│       ├── audit/          # Audit module tests
│       └── roles/          # Roles module tests
├── e2e/                    # End-to-end tests
│   ├── *.e2e-spec.ts      # E2E test files
│   └── jest-e2e.json      # E2E Jest configuration
└── README.md              # This file
```

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test
# or
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Run end-to-end tests
npm run test:e2e
```

### Debug Tests
```bash
# Run tests in debug mode
npm run test:debug
```

## Test File Naming Convention

- Unit tests: `*.spec.ts`
- E2E tests: `*.e2e-spec.ts`

## Configuration

- Unit tests use: `src/config/jest.config.ts`
- E2E tests use: `tests/e2e/jest-e2e.json`

## Path Aliases

Both test configurations support the `@api/*` path alias that maps to `src/*`.

Example:
```typescript
import { UserService } from '@api/modules/users/services/user.service';
```

