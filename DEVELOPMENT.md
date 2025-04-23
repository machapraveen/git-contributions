# Development Guide

This document contains information for developers working on the Push Activity Logs extension.

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/machapraveen/git-contributions.git
cd git-contributions
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run compile
```

4. Run the extension in development mode:
```bash
npm run watch
```

5. Launch the extension in a new VS Code window:
   - Press F5 in VS Code to launch the debugger

## Project Structure

- `src/extension.ts`: Main entry point for the extension
- `src/activityTracker.ts`: Core functionality for tracking activity
- `src/streakAgent.ts`: Automatic streak maintenance functionality
- `src/dashboard.ts`: Activity dashboard visualization
- `src/githubIntegration.ts`: GitHub API integration
- `src/smartCommit.ts`: Smart commit message generation
- `src/gitService.ts`: Git repository operations
- `src/utilityService.ts`: Utility functions
- `src/test/`: Test files

## Commands for Development

```bash
# Install dependencies
npm install

# Compile the extension
npm run compile

# Watch for changes during development
npm run watch

# Run tests
npm test

# Package the extension for publishing
npm run package
```

## Troubleshooting Common Issues

### Error: Cannot find module

If you see errors like "Cannot find module './activityTracker'", try these steps:

1. Make sure all files are properly created in the `src` directory
2. Run a clean build:
```bash
npm run clean
npm run compile
```

### TypeScript Errors

For TypeScript errors like "Parameter implicitly has an 'any' type":

1. Check the `tsconfig.json` file to ensure proper configuration
2. Add explicit type annotations to variables and parameters
3. Use the `any` type sparingly and only when necessary

### Circular Dependencies

If you encounter circular dependency issues:

1. Use dynamic imports with `await import('./module')` instead of static imports
2. Use interface segregation to break dependency cycles
3. Create separate utility files that don't depend on other modules

### Testing Errors

If tests are failing:

1. Make sure all dependencies are installed
2. Check that test files are in the correct location (`src/test/`)
3. Run tests in isolation to identify the specific issue

## Publishing the Extension

To publish the extension to the VS Code Marketplace:

1. Install vsce:
```bash
npm install -g vsce
```

2. Login to Azure DevOps:
```bash
vsce login MachaPraveen
```

3. Update the version in package.json:
```bash
vsce patch # for 0.0.1 -> 0.0.2
vsce minor # for 0.0.1 -> 0.1.0
vsce major # for 0.0.1 -> 1.0.0
```

4. Package the extension:
```bash
vsce package
```

5. Publish the extension:
```bash
vsce publish
```

## Getting Help

If you encounter any issues not covered here, please:

1. Check the existing issues on GitHub
2. Create a new issue with a detailed description of the problem
3. Include error messages, logs, and steps to reproduce the issue