# Versioning Strategy

## Overview

This MCP server uses tags to track versions compatible with specific pipeline releases. Each tag represents a known-working state that has been tested with the diagnostic pipeline.

## Tag Format

`vX.Y-pipeline-compatible`

- **X** = Major version (breaking changes to tool interfaces)
- **Y** = Minor version (new tools, backward-compatible changes)
- **pipeline-compatible** suffix indicates testing against the pipeline

## Current Versions

### v1.0-pipeline-compatible (2026-02-12)
**Status:** ✅ Active
**Pipeline:** v3.0
**Tools:** 28 total (8 core + 20 custom)

**Features:**
- Batch testing API integration
- Knowledge base management
- Shared component operations
- Concurrency monitoring
- Extended conversation flow operations

**Known Issues:** None

---

## Creating New Tags

When to create a new tag:

1. **After adding new tools** - Tag as minor version (v1.1, v1.2, etc.)
2. **After modifying tool interfaces** - Tag as major version (v2.0, v3.0, etc.)
3. **After upstream sync** - Tag only if tests pass with pipeline
4. **Before deploying to production** - Always tag the current state

### Tag Creation Commands

```bash
# Minor version (new features, backward compatible)
git tag -a v1.1-pipeline-compatible -m "Add support for X feature"
git push origin v1.1-pipeline-compatible

# Major version (breaking changes)
git tag -a v2.0-pipeline-compatible -m "Breaking: Changed Y interface"
git push origin v2.0-pipeline-compatible
```

## Rollback Procedure

If a pipeline deployment fails:

```bash
# Check available tags
git tag -l

# Rollback to previous version
git checkout v1.0-pipeline-compatible

# Rebuild
npm run build

# Restart Claude Code (to reload MCP server)
```

## Upstream Sync Strategy

**Monthly or as-needed:**

```bash
# Fetch upstream changes
git fetch upstream

# Review what changed
git log HEAD..upstream/main --oneline

# Merge (creates merge commit)
git merge upstream/main

# OR rebase (cleaner history)
git rebase upstream/main

# Resolve conflicts (prioritize custom tools)
# Test with pipeline
# Tag if successful
git tag -a v1.X-pipeline-compatible -m "Upstream sync: [date]"
git push origin main --tags
```

## Version Pinning in Pipeline

The pipeline references this MCP server via `.claude/mcp.json`. To pin to a specific version:

```bash
# Clone at specific tag
git clone --branch v1.0-pipeline-compatible https://github.com/Lease-End/lease-end-retell-mcp.git

# Or checkout existing repo to tag
cd ~/Desktop/lease-end-retell-mcp
git checkout v1.0-pipeline-compatible
npm run build
```

## Changelog

Update this section when creating new tags:

### [v1.0-pipeline-compatible] - 2026-02-12
- Initial Lease End fork
- Added 20 custom tools (batch testing, KB, shared components, concurrency)
- Total 28 tools
- Compatible with diagnostic pipeline v3.0
