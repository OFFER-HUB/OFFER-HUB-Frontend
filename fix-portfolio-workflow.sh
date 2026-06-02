#!/bin/bash
set -e

# Configure git
git config --global user.email "copilot@offer-hub.dev"
git config --global user.name "GitHub Copilot"

# Create and checkout new branch
git checkout -b fix/portfolio-remove-mock-flag

# Stage changes
git add src/lib/api/portfolio.ts

# Commit with descriptive message
git commit -m "fix: Remove hardcoded mock flag from portfolio API client

- Remove USE_MOCK flag and mock data imports from portfolio.ts
- Remove in-memory mock store (mockStore)
- Remove mock utility functions (simulateDelay, generateId)
- Enable real API calls for all portfolio operations:
  * getPortfolioItems() - calls GET /portfolio
  * getPortfolioItemById() - calls GET /portfolio/{id}
  * createPortfolioItem() - calls POST /portfolio
  * updatePortfolioItem() - calls PATCH /portfolio/{id}
  * deletePortfolioItem() - calls DELETE /portfolio/{id}
  * reorderPortfolioItems() - calls POST /portfolio/reorder
- Preserve error handling and image normalization
- No silent fallback to mock data on API errors

Fixes #194"

# Push branch
git push -u origin fix/portfolio-remove-mock-flag

echo "✅ Branch created, committed, and pushed successfully!"
echo "🔗 Create PR at: https://github.com/OFFER-HUB/OFFER-HUB-Frontend/pull/new/fix/portfolio-remove-mock-flag"
