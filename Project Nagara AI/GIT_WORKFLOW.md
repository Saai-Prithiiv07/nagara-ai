# NAGARA AI - Engineering Practices & Git Workflow Guide

## 1. Branching Strategy: Git Flow & Trunk-Based Hybrid

The NAGARA AI engineering team adheres to a strict Git branching model to ensure auditability, deterministic releases, and zero-downtime deployments.

```
main (Production: AWS Amplify / CloudFront)
  ▲
  │ (Release PR after passing full CI/CD test suite)
develop (Staging & Integration testing)
  ▲
  ├── feature/knapsack-optimization-engine
  ├── feature/spatial-gis-choropleth
  ├── feature/postgresql-relational-schema
  └── fix/rate-limiter-sliding-window
```

### Branch Taxonomy
* `main`: Protected production branch. Deploys automatically to AWS Amplify via webhook triggers. Direct pushes are disabled; changes require an approved Pull Request and 100% CI pass rate.
* `develop`: Integration branch where feature branches merge.
* `feature/<feature-name>`: Scoped branches branched from `develop` for new capabilities.
* `fix/<bug-name>`: Non-critical bug fixes.
* `hotfix/<critical-issue>`: Emergency hotfixes branched directly from `main` and back-merged into `develop`.

---

## 2. Semantic Commit Message Conventions

We enforce the **Conventional Commits v1.0.0** specification:

* `feat: <description>`: Introduces a new user-facing capability or API endpoint (e.g. `feat: add postgres relational schema and foreign key constraints`).
* `fix: <description>`: Resolves a defect (e.g. `fix: handle null values in rawlsian equity calculator`).
* `docs: <description>`: Documentation additions or updates (e.g. `docs: add HLD sequence diagrams and API schemas`).
* `test: <description>`: Introduces or enhances unit, regression, or integration test suites (e.g. `test: add 20 automated REST API integration test cases`).
* `refactor: <description>`: Code restructuring without modifying behavior (e.g. `refactor: extract redis cache-aside service`).
* `chore: <description>`: Dependency updates, build script adjustments (e.g. `chore: upgrade vite to v8.3.4`).

---

## 3. Pull Request (PR) & Code Review Checklist

Before any PR can be merged into `develop` or `main`:
1. **Automated Verification:** All 82 Vitest suites (optimization algorithms, JavaScript concepts, backend REST API integration) must pass.
2. **Linting & Formatting:** Oxlint reports zero warnings or errors.
3. **Environment Security:** No private API keys or unencrypted secrets committed to git.
4. **Peer Review:** Minimum of 1 peer sign-off verifying computational determinism and edge-case error handling.
