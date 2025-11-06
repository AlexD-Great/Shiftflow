# Contributing to ShiftFlow

Thank you for your interest in contributing to ShiftFlow! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js 18+
- Git
- SideShift.ai account

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/shiftflow.git
   cd shiftflow
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create `.env` file:
   ```bash
   cp .env.example .env
   # Add your SideShift credentials
   ```

## Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/my-feature
   ```

2. Make your changes

3. Test your changes:
   ```bash
   npm run build
   npm test
   ```

4. Commit with clear messages:
   ```bash
   git commit -m "feat: add new workflow condition type"
   ```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test updates
- `chore:` - Build/tooling changes

### Pull Request Process

1. Push your branch:
   ```bash
   git push origin feature/my-feature
   ```

2. Open a Pull Request on GitHub

3. Fill out the PR template:
   - Description of changes
   - Related issues
   - Testing performed
   - Screenshots (if UI changes)

4. Wait for review and address feedback

## Project Structure

```
shiftflow/
├── packages/
│   ├── engine/          # Backend workflow engine
│   ├── sdk/             # TypeScript SDK
│   └── web/             # Next.js frontend
├── docs/                # Documentation
└── [config files]
```

## Coding Standards

### TypeScript

- Use TypeScript for all code
- Enable strict mode
- Define proper types (avoid `any`)
- Use interfaces for public APIs

### Style Guide

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Use meaningful variable names
- Add JSDoc comments for public APIs

### Example

```typescript
/**
 * Create a new workflow
 * @param config - Workflow configuration
 * @returns Created workflow
 */
export function createWorkflow(config: WorkflowConfig): Workflow {
  // Implementation
}
```

## Testing

### Running Tests

```bash
npm test                 # Run all tests
npm test -- --watch      # Watch mode
npm test -- --coverage   # Coverage report
```

### Writing Tests

- Write tests for new features
- Maintain test coverage above 80%
- Use descriptive test names

```typescript
describe('WorkflowEngine', () => {
  it('should register a workflow', () => {
    const engine = new WorkflowEngine(secret, affiliateId);
    const workflow = createTestWorkflow();
    
    engine.registerWorkflow(workflow);
    
    expect(engine.getWorkflow(workflow.id)).toBe(workflow);
  });
});
```

## Documentation

### Code Documentation

- Add JSDoc comments for all public APIs
- Include examples in documentation
- Keep README files up to date

### Documentation Files

- Update relevant docs in `/docs`
- Add examples to `EXAMPLES.md`
- Update API reference if needed

## Adding New Features

### New Condition Types

1. Add type to `ConditionType` enum in `types/index.ts`
2. Create interface for condition config
3. Implement evaluation logic in `WorkflowEngine`
4. Add tests
5. Update documentation

### New Action Types

1. Add type to `ActionType` enum
2. Create interface for action config
3. Implement execution logic
4. Add tests
5. Update documentation

## Reporting Issues

### Bug Reports

Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version)
- Error messages/logs

### Feature Requests

Include:
- Use case description
- Proposed solution
- Alternative approaches considered
- Willingness to implement

## Questions?

- Open a GitHub Discussion
- Join our Discord (if available)
- Email: [contact email]

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to ShiftFlow! 🚀
