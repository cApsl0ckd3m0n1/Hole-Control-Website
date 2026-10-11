# Maintenance Guide

## Repository Overview
This repository contains the Hole Control website - a static HTML/CSS/JavaScript site with motion effects.

## Regular Maintenance Tasks

### Dependencies
This site has no runtime dependencies. The only dependency is Node.js for running tests.

### Testing
Run tests with:
```bash
npm test
```

This runs both the motion.js unit tests and page structure integration tests.

### Deployment
Deployed via GitHub Pages from the main branch.

## Making Changes

### Pull Request Process
1. Create a feature branch from `main`
2. Make your changes
3. Run tests to ensure they pass
4. Create a pull request using the PR template
5. Wait for review and approval
6. Merge to `main`

### Code Standards
- Use semantic HTML
- Follow existing code style
- Keep CSS organized by section
- Test motion effects across different screen sizes
- Ensure accessibility (reduced motion support)

## Getting Help
- Review existing documentation in the repository
- Contact the repository maintainers for questions
- Check recent pull requests for examples
