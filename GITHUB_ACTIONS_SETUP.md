# GitHub Actions Setup for Neon Preview Branches

This repository includes a GitHub Actions workflow that automatically creates and deletes Neon database branches for pull requests, enabling preview environments.

## Overview

The workflow (`neon-branch-preview.yml`) performs the following:

1. **On PR Open/Reopen/Update**: Creates a new Neon database branch
2. **On PR Close**: Automatically deletes the branch

## Setup Requirements

### 1. GitHub Secrets

Add the following secret to your repository:

Go to **Settings** > **Secrets and variables** > **Actions** > **New repository secret**

- `NEON_API_KEY`: Your Neon API key
  - Get from [Neon Console](https://console.neon.tech) > Account Settings > API Keys

### 2. GitHub Variables

Add the following variable to your repository:

Go to **Settings** > **Secrets and variables** > **Actions** > **Variables** > **New repository variable**

- `NEON_PROJECT_ID`: Your Neon project ID
  - Get from [Neon Console](https://console.neon.tech) > Select your project > Settings > General > Project ID

## How It Works

### Branch Creation

When a pull request is opened, reopened, or synchronized (new commits pushed):

1. Workflow creates a new Neon branch named: `preview/pr-{number}-{branch-name}`
2. Branch automatically expires after 14 days
3. A comment is posted to the PR with branch details
4. Database URL is available via workflow outputs (not logged for security)

Example branch name: `preview/pr-123-fix-blank-page-issue`

### Branch Deletion

When a pull request is closed (merged or not):

1. Workflow deletes the associated Neon branch
2. A comment is posted to the PR confirming deletion

## Features

### Preview Environments

Each PR gets its own isolated database branch, perfect for:

- Testing database migrations
- Running integration tests
- Preview deployments
- Feature testing without affecting production

### Automatic Cleanup

Branches are automatically deleted when:
- PR is closed (merged or rejected)
- 14 days have passed (automatic expiration)

### Security

- Database credentials are never exposed in logs
- Uses GitHub Secrets for sensitive data
- Read-only access to repository contents
- Write access only for PR comments

## Optional Enhancements

### Run Migrations on Branch Creation

Uncomment the following section in `.github/workflows/neon-branch-preview.yml`:

```yaml
- name: Run Migrations
  run: npm run db:migrate
  env:
    DATABASE_URL: "${{ steps.create_neon_branch.outputs.db_url_with_pooler }}"
```

Make sure you have a migration script in `package.json`:

```json
{
  "scripts": {
    "db:migrate": "node scripts/migrate.js"
  }
}
```

### Post Schema Diff Comments

Uncomment the schema diff section to automatically post database schema changes:

```yaml
- name: Post Schema Diff Comment to PR
  uses: neondatabase/schema-diff-action@v1
  with:
    project_id: ${{ vars.NEON_PROJECT_ID }}
    compare_branch: preview/pr-${{ github.event.number }}-${{ needs.setup.outputs.branch }}
    api_key: ${{ secrets.NEON_API_KEY }}
```

## Troubleshooting

### Workflow Not Running

- Ensure `NEON_API_KEY` secret is set correctly
- Ensure `NEON_PROJECT_ID` variable is set correctly
- Check workflow permissions are correct in `.github/workflows/neon-branch-preview.yml`

### Branch Creation Fails

- Verify API key has correct permissions
- Check Neon project ID is correct
- Ensure you haven't reached branch limit in your Neon plan

### Comments Not Appearing on PR

- Verify workflow has `pull-requests: write` permission
- Check GitHub Actions is enabled for the repository
- Review workflow run logs for errors

## Benefits

✅ **Isolated Testing**: Each PR gets its own database  
✅ **Zero Config**: Automatic branch creation and deletion  
✅ **Cost Effective**: Branches auto-expire after 14 days  
✅ **Secure**: No credentials exposed in logs  
✅ **Developer Friendly**: Status updates posted to PR  

## Additional Resources

- [Neon Branching Documentation](https://neon.tech/docs/guides/branching)
- [Neon GitHub Actions](https://neon.tech/docs/guides/github-actions)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Example Workflow Run

1. Developer opens PR #123 with branch `fix-blank-page-issue`
2. Workflow creates Neon branch: `preview/pr-123-fix-blank-page-issue`
3. Bot comments on PR with branch info
4. Developer tests changes using preview database
5. PR is merged
6. Workflow deletes the Neon branch
7. Bot comments confirming deletion
