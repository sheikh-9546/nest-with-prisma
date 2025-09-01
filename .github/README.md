# GitHub Actions Workflows

This directory contains comprehensive GitHub Actions workflows for the NestJS with Prisma project. These workflows provide automated CI/CD, security, performance monitoring, and dependency management.

## 🚀 Workflows Overview

### 1. CI Pipeline (`ci.yml`)
**Triggers:** Push to main/develop, Pull Requests
**Purpose:** Comprehensive continuous integration testing

**Jobs:**
- **Lint and Format Check** - ESLint and Prettier validation
- **Unit Tests** - Run unit tests with coverage reporting
- **E2E Tests** - End-to-end testing with PostgreSQL and Redis
- **Build** - Application build validation
- **Security Audit** - npm audit and audit-ci checks
- **Prisma Checks** - Schema validation and format checking
- **Type Check** - TypeScript compilation validation

### 2. CD Pipeline (`cd.yml`)
**Triggers:** Push to main, Version tags, Manual dispatch
**Purpose:** Continuous deployment with Docker containerization

**Jobs:**
- **Build and Push** - Docker image building and registry push
- **Deploy Staging** - Automated staging deployment
- **Deploy Production** - Production deployment (tags only)
- **Rollback** - Automatic rollback on failure
- **Cleanup** - Old image cleanup

### 3. Security Audit (`security.yml`)
**Triggers:** Daily schedule, Push, Pull Requests, Manual dispatch
**Purpose:** Comprehensive security scanning and monitoring

**Jobs:**
- **Dependency Audit** - npm audit and audit-ci scanning
- **CodeQL Analysis** - GitHub's semantic code analysis
- **Container Scan** - Trivy vulnerability scanning
- **Secrets Scan** - GitLeaks secret detection
- **License Compliance** - License checking and reporting
- **Prisma Security** - Database schema security validation

### 4. PR Validation (`pr-validation.yml`)
**Triggers:** Pull Request events
**Purpose:** Pull request specific validation and checks

**Jobs:**
- **PR Info** - Analyze PR changes (migrations, schema, breaking changes)
- **Quick Checks** - Fast lint, type check, and Prisma validation
- **Test Changes** - Run tests for changed files only
- **Migration Validation** - Validate database migrations
- **Size Impact** - Bundle size comparison with main branch

### 5. Dependency Updates (`dependency-update.yml`)
**Triggers:** Weekly schedule, Manual dispatch
**Purpose:** Automated dependency management and security updates

**Jobs:**
- **Check Updates** - Scan for available dependency updates
- **Create Update PR** - Automated PR creation for updates
- **Security Updates** - Immediate security vulnerability fixes
- **Prisma Updates** - Prisma-specific version monitoring

### 6. Performance Monitoring (`performance.yml`)
**Triggers:** Daily schedule, Push to main, Pull Requests, Manual dispatch
**Purpose:** Application performance testing and monitoring

**Jobs:**
- **Load Testing** - Artillery and Apache Bench load testing
- **Memory Profiling** - Node.js memory analysis with clinic.js
- **Database Performance** - PostgreSQL query performance testing

## 🔧 Configuration Requirements

### Environment Secrets
The following secrets should be configured in your GitHub repository:

```
GITHUB_TOKEN - Automatically provided by GitHub
```

### Optional Secrets (for advanced features):
```
GITLEAKS_LICENSE - GitLeaks Pro license (for enhanced secret scanning)
```

### Environment Variables
Workflows use the following environment variables:

```yaml
NODE_VERSION: '20'        # Node.js version
POSTGRES_VERSION: '15'    # PostgreSQL version
REGISTRY: ghcr.io         # Container registry
```

## 📊 Workflow Features

### Advanced Testing
- **Parallel Job Execution** - Jobs run concurrently for speed
- **Service Dependencies** - PostgreSQL and Redis for E2E tests
- **Test Coverage** - Automatic coverage reporting to Codecov
- **Changed File Testing** - Only test files related to PR changes

### Security Features
- **Multi-layer Security** - Dependencies, code, containers, and secrets
- **Automated Fixes** - Automatic security update PRs
- **Daily Monitoring** - Scheduled security scans
- **Compliance Tracking** - License compliance monitoring

### Performance Monitoring
- **Load Testing** - Multi-phase load testing with Artillery
- **Memory Profiling** - Node.js memory leak detection
- **Database Optimization** - Query performance analysis
- **Bundle Size Tracking** - Monitor application size changes

### Deployment Features
- **Multi-environment** - Staging and production deployments
- **Rollback Capability** - Automatic rollback on deployment failure
- **Health Checks** - Post-deployment validation
- **Docker Optimization** - Multi-platform builds with caching

## 🚦 Workflow Status

### Badge Examples
Add these badges to your main README.md:

```markdown
![CI](https://github.com/your-username/your-repo/workflows/CI%20Pipeline/badge.svg)
![Security](https://github.com/your-username/your-repo/workflows/Security%20Audit/badge.svg)
![Performance](https://github.com/your-username/your-repo/workflows/Performance%20Monitoring/badge.svg)
```

### Status Checks
The workflows create the following status checks:
- ✅ `CI Pipeline` - Required for PR merging
- ✅ `Security Audit` - Security validation
- ✅ `PR Validation` - PR-specific checks

## 📝 Customization

### Modifying Workflows

1. **Test Configuration**: Update test scripts in `package.json`
2. **Security Levels**: Adjust audit levels in `audit-ci.json`
3. **Performance Thresholds**: Modify load testing parameters
4. **Deployment Targets**: Update deployment scripts in CD workflow

### Adding New Workflows

1. Create new `.yml` file in `.github/workflows/`
2. Follow naming convention: `purpose.yml`
3. Include proper triggers and environment variables
4. Add status reporting and artifact uploads

### Environment Specific Configuration

Create environment-specific overrides:
- `staging.env` - Staging environment variables
- `production.env` - Production environment variables
- `k8s/` - Kubernetes deployment manifests
- `terraform/` - Infrastructure as code

## 🐛 Troubleshooting

### Common Issues

1. **Test Failures**
   - Check service dependencies are healthy
   - Verify environment variables are set correctly
   - Ensure database migrations are up to date

2. **Security Scan Failures**
   - Review npm audit results
   - Check for new vulnerabilities in dependencies
   - Verify container base image updates

3. **Deployment Issues**
   - Confirm deployment target accessibility
   - Verify environment secrets are configured
   - Check container registry permissions

4. **Performance Test Failures**
   - Review load testing thresholds
   - Check database performance metrics
   - Verify test data generation

### Debug Mode

Enable debug mode by setting workflow variables:
```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)

---

*Last updated: $(date +'%Y-%m-%d')*
*Workflows version: 1.0.0*
