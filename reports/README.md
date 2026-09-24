# Test Reports

This folder contains manual testing reports submitted by contributors.

## Structure

**Single flow per issue:**
```
reports/
  Report_FlowName_Issue_42.md
```

**Multiple flows per issue:**
```
reports/
  issue-42/
    Report_FlowName1_Issue_42.md
    Report_FlowName2_Issue_42.md
```

## Naming Convention

- `Report_` prefix
- Flow name in PascalCase (e.g. `ForgotPassword`, `GitHubLogin`, `EditProfile`)
- Issue number suffix (e.g. `Issue_42`)
- Extension: `.md`

## Report Format

Each report must follow the PR description format defined in the issue:

```
## Title
## Closes
## Description + Photos
## Changes
## Result
## Flow Tested
## Notes
```

## Rules

- Testing must be done **manually** on the live site: https://www.offer-hub.org
- **Screenshots are mandatory** — reports without photos will not be accepted
- No AI-generated test results — a real human must perform each step
- Photos must be uploaded directly in the PR description (not committed to the repo)
