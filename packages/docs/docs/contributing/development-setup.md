---
title: Development Setup
---

This guide will help you set up your development environment for contributing to Actual.

## Prerequisites

:::tip
If you prefer not to install Node and pnpm locally, you can use the [Dev Container](#dev-container) or run [Docker Compose](#docker-compose) directly.
:::

Before you begin, ensure you have the following installed:

- **Node.js**: Version 22 or greater. You can download it from the [Node.js website](https://nodejs.org/en/download) (we recommend the LTS version).
  - Consider using a version manager like [nvm](https://github.com/nvm-sh/nvm) or [asdf](https://asdf-vm.com) to manage multiple Node.js versions.
  - On Windows, during Node.js installation, be sure to select _Automatically install the necessary tools_ from the _Tools for Native Modules_ page. This is required to build better-sqlite3.

- **pnpm**: Version 12.8.1 or greater. pnpm is the package manager used by Actual.
  - Install it with `npm install --global pnpm`; the exact version is pinned by the `packageManager` field in `package.json`.
  - The project uses pnpm workspaces (monorepo structure), declared in `pnpm-workspace.yaml`.

- **Git**: Required for cloning the repository and version control.

## Initial Setup

1. Clone the Actual repository:

   ```bash
   git clone https://github.com/actualbudget/actual.git
   cd actual
   ```

2. Install all dependencies:

   ```bash
   pnpm install
   ```

   This will install dependencies for all packages in the monorepo.

3. Verify your setup by running type checking:
   ```bash
   pnpm typecheck
   ```

## Dev Container

The repo includes a [`.devcontainer/`](https://github.com/actualbudget/actual/tree/master/.devcontainer) configuration that follows the [Dev Containers spec](https://containers.dev/). Any tool that supports the spec can use it — for example VS Code or Cursor (with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)), JetBrains IDEs (via Gateway), GitHub Codespaces, or the [`@devcontainers/cli`](https://github.com/devcontainers/cli).

In an editor that supports the spec, open the cloned repo and accept the **Reopen in Container** prompt (or run the equivalent command from your editor's command palette). The container will build, `pnpm install` will run automatically via `postCreateCommand`, and you'll be dropped into a shell with the toolchain ready.

To start the dev server, open a terminal inside the container and run:

```bash
pnpm start
```

The dev server will be available at `http://localhost:3001/`. Most editors automatically forward the port from the container to your host.

## Docker Compose

For other editors, run from the repo root:

```bash
docker compose up --build
```

This starts a container that runs `pnpm start:browser` on port 3001. Open `http://localhost:3001/` in your browser.

:::note
The container mounts your repo at `/app`. If you've already run `pnpm install` on your host, the native modules (`better-sqlite3`, `bcrypt`, `electron`, `sharp`) will be compiled for your host OS and won't work inside the Linux container. Either delete `node_modules/` first and let the container reinstall, or run the dev container path above (which rebuilds them automatically).
:::

## Essential Development Commands

All commands should be run from the **root directory** of the repository. Never run pnpm commands from child workspace directories.

### Type Checking

```bash
# Run TypeScript type checking (ALWAYS run before committing)
pnpm typecheck
```

### Linting and Formatting

```bash
# Check for linting and formatting issues
pnpm lint

# Auto-fix linting and formatting issues
pnpm lint:fix
```

### Testing

```bash
# Run all tests across all packages
pnpm test

# Run tests without cache (for debugging)
pnpm test:debug
```

For more details on testing, see the [Testing Guide](./testing.md).

### Starting Development Servers

```bash
# Start browser development server
pnpm start
# or explicitly:
pnpm start:browser

# Start with sync server (for testing sync functionality)
pnpm start:server-dev

# Start desktop app development
pnpm start:desktop
```

### Building

```bash
# Build browser version
pnpm build:browser

# Build desktop app
pnpm build:desktop

# Build API package
pnpm build:api

# Build CLI package
pnpm build:cli

# Build sync server
pnpm build:server
```

## Workspace Structure

Actual uses pnpm workspaces to manage a monorepo with multiple packages. For detailed information about each package, see the [Project Structure](./project-details/index.md) documentation.

## Running Workspace-Specific Commands

To run commands for a specific workspace, use:

```bash
pnpm --filter <workspace-name> run <command>
```

Examples:

```bash
# Run tests for @actual-app/core
pnpm --filter @actual-app/core run test

# Start the docs development server
pnpm --filter docs start

# Build the API package
pnpm --filter @actual-app/api build
```

## Common Development Tasks

### Running Specific Tests

See [Testing Guide](./testing.md).

### Debugging

```bash
# Run tests in debug mode (without cache)
pnpm test:debug

# Run E2E tests with headed browser
pnpm --filter @actual-app/web run playwright test --headed --debug accounts.test.ts
```

### Type Checking

TypeScript uses project references. Always run `pnpm typecheck` from the root to check all packages.

### Building for Production

```bash
# Browser build
pnpm build:browser

# Desktop build
pnpm build:desktop

# API build
pnpm build:api

# CLI build
pnpm build:cli

# Sync server build
pnpm build:server
```

## Development Workflow

When making changes:

1. Read relevant files to understand the current implementation
2. Make focused, incremental changes
3. Run type checking: `pnpm typecheck`
4. Run linting: `pnpm lint:fix`
5. Run relevant tests
6. Fix any linter errors that are introduced

For more details, see the [Development Workflow](./index.md#development-workflow) section.

## Troubleshooting

If you encounter issues:

- **Type errors**: Run `pnpm typecheck` to see all type errors
- **Linter errors**: Run `pnpm lint:fix` to auto-fix many issues
- **Test failures**: See the [Testing Guide](./testing.md) for debugging tips
- **Build failures**: Clean build artifacts and reinstall dependencies:
  ```bash
  rm -rf packages/*/dist packages/*/lib-dist packages/*/build
  pnpm install
  ```

For more troubleshooting help, see the [Troubleshooting Guide](./troubleshooting.md).

## Next Steps

- Read the [Contributing Guide](./index.md) for information about submitting changes
- Review the [Code Style Guide](./code-style.md) for coding conventions
- Check out the [Testing Guide](./testing.md) for testing strategies
- Explore the [Project Structure](./project-details/index.md) to understand the codebase organization
