# Agent Development Guide for Vben Admin Monorepo

This document provides comprehensive guidelines for AI agents and developers working in this repository. Follow these instructions to ensure consistency, quality, and compatibility with the existing codebase.

## 1. Project Overview

- **Architecture**: Monorepo using `pnpm` workspaces and `turbo` for build orchestration.
- **Framework**: Vue 3 (Composition API) with TypeScript.
- **Build Tool**: Vite 7.
- **Styling**: Tailwind CSS v3 (with `clsx` and `tailwind-merge` for utility class management).
- **State Management**: Pinia (Modular stores).
- **Package Manager**: `pnpm` (>= 10.0.0). DO NOT use `npm` or `yarn`.

## 2. Development Workflow & Commands

### 2.1 Installation

Always use `pnpm` for dependency management.

```bash
pnpm install
```

### 2.2 Development Server

Start the development server for all apps or specific apps.

```bash
# Start all apps (may be resource intensive)
pnpm dev

# Start specific app (Recommended)
pnpm dev:naive    # Naive UI version
pnpm dev:antd     # Ant Design Vue version
pnpm dev:ele      # Element Plus version
```

### 2.3 Building

Build the project for production.

```bash
# Build all packages and apps
pnpm build

# Build specific app
pnpm build:naive
```

### 2.4 Linting & Formatting

Ensure code quality before committing. The project uses `vsh` (Vben Shell) for linting.

```bash
# Run linting (ESLint, Stylelint, Prettier)
pnpm lint

# Fix linting issues and format code automatically
pnpm format

# Type checking
pnpm check:type
```

### 2.5 Testing

The project uses Vitest for unit testing and Playwright for E2E testing.

```bash
# Run all unit tests
pnpm test:unit

# Run specific test file (Unit)
# Usage: pnpm exec vitest run [path/to/file]
pnpm exec vitest run packages/stores/src/modules/user.test.ts

# Run E2E tests
pnpm test:e2e
```

### 2.6 Committing

Follow Conventional Commits. The project uses `commitlint` and `czg`.

```bash
# Commit changes using the CLI wizard
pnpm commit
```

## 3. Code Style Guidelines

### 3.1 TypeScript

- **Strict Mode**: Enabled. No implicit `any`.
- **Types vs Interfaces**: Use `interface` for object definitions and `type` for unions/intersections.
- **Explicit Returns**: Always define return types for exported functions.
- **No `any`**: Avoid `any`. Use `unknown` with narrowing or generic types if necessary.

### 3.2 Vue Components

- **Syntax**: Use `<script setup lang="ts">`.
- **Naming**:
  - Files: PascalCase (e.g., `UserProfile.vue`).
  - Components in template: PascalCase (e.g., `<UserProfile />`).
- **Props/Emits**: Use `defineProps` and `defineEmits` with type arguments.

  ```typescript
  const props = defineProps<{
    user: User;
    active?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update', value: User): void;
  }>();
  ```

### 3.3 Imports & Exports

- **Aliases**: Use path aliases mapped in `tsconfig.json`.
  - `@/` -> App source root
  - `#/...` -> Internal packages (e.g., `#/utils`, `#/hooks`)
- **Ordering**:
  1. External frameworks (`vue`, `vue-router`, `pinia`)
  2. External libraries (`lodash`, `axios`)
  3. Internal packages (`@vben/utils`, `@core/...`)
  4. Relative imports (`./Component.vue`)
- **Explicit Imports**: Prefer explicit imports over auto-imports for clarity in agent-generated code.

### 3.4 Styling (Tailwind CSS)

- **Utility First**: Use Tailwind utility classes directly in `class`.
- **Conditional Classes**: Use `clsx` or `cn` helper (if available) for conditional styling.
  ```vue
  <div :class="clsx('flex items-center', { 'bg-blue-500': isActive })">
  ```
- **Scoped Styles**: Avoid `<style scoped>` unless necessary for complex animations or overrides not possible with Tailwind.

### 3.5 State Management (Pinia)

- **Stores**: Define stores in `packages/stores` or locally if app-specific.
- **Setup Syntax**: Use `defineStore` with the setup function syntax (Composition API style).
  ```typescript
  export const useUserStore = defineStore('user', () => {
    const user = ref<User | null>(null);
    function login() {
      /* ... */
    }
    return { user, login };
  });
  ```

### 3.6 Error Handling

- **API Errors**: Handle errors in the service layer or using global interceptors.
- **UI Errors**: Use Error Boundaries or `onErrorCaptured` for component-level handling.
- **Try/Catch**: Use try/catch blocks for async operations, especially in stores and actions.

## 4. Testing Guidelines

### 4.1 Unit Tests (Vitest)

- **Location**: Co-located `__tests__` directory or adjacent `.test.ts` files.
- **Environment**: `happy-dom` is configured.
- **Mocking**: Use `vi.mock()` for external dependencies.
- **Example**:

  ```typescript
  import { describe, it, expect } from 'vitest';
  import { add } from './math';

  describe('math utils', () => {
    it('should add numbers', () => {
      expect(add(1, 2)).toBe(3);
    });
  });
  ```

## 5. Directory Structure Key

- `apps/`: Application entry points (e.g., `web-antd`, `web-naive`).
- `packages/`: Shared workspace packages.
  - `@core/`: Core framework logic.
  - `stores/`: Global state management.
  - `utils/`: Shared utilities.
  - `effects/`: Side effects and integrations (API, etc.).
- `internal/`: Build configuration and scripts.

## 6. Agent Behavior Rules

- **Do not** modify lockfiles (`pnpm-lock.yaml`) unless adding/removing dependencies.
- **Do not** create new configuration files unless explicitly requested.
- **Always** run `pnpm check:type` after significant TypeScript changes.
- **Always** verify changes with `pnpm test:unit` if modifying logic covered by tests.
