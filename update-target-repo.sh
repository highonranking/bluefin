#!/bin/bash

# Script to update bharatfiber78/bluefin-fiber with code from highonranking/bluefin

set -e

echo "=== Updating target repository ==="
echo "Source: highonranking/bluefin (current repo)"
echo "Target: bharatfiber78/bluefin-fiber"
echo ""

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Warning: You're not on main branch. Current branch: $CURRENT_BRANCH"
    printf "Continue anyway? (y/n) "
    read REPLY
    if [ "$REPLY" != "y" ] && [ "$REPLY" != "Y" ]; then
        exit 1
    fi
fi

# Ensure target remote is set - try HTTPS first (more reliable)
TARGET_URL_HTTPS="https://github.com/bharatfiber78/bluefin-fiber.git"
TARGET_URL_SSH="git@github.com:bharatfiber78/bluefin-fiber.git"

if ! git remote | grep -q "^target$"; then
    echo "Adding target remote (using HTTPS)..."
    git remote add target "$TARGET_URL_HTTPS"
else
    echo "Target remote already exists"
    # Check current URL and update if needed
    CURRENT_URL=$(git remote get-url target 2>/dev/null || echo "")
    if [ "$CURRENT_URL" != "$TARGET_URL_HTTPS" ] && [ "$CURRENT_URL" != "$TARGET_URL_SSH" ]; then
        git remote set-url target "$TARGET_URL_HTTPS"
    fi
fi

# Try to fetch (optional, will fail if no access)
echo ""
echo "Attempting to fetch from target repository..."
git fetch target 2>/dev/null || echo "Note: Could not fetch from target (this is okay, will proceed with push)"

# Show current status
echo ""
echo "Current commit:"
git log --oneline -1

# Push to target
echo ""
echo "Pushing main branch to target repository..."
echo "This will update bharatfiber78/bluefin-fiber with the current code"
printf "Continue? (y/n) "
read REPLY
if [ "$REPLY" = "y" ] || [ "$REPLY" = "Y" ]; then
    echo "Pushing..."
    git push target main
    echo ""
    echo "✓ Successfully updated target repository!"
else
    echo "Cancelled."
    exit 1
fi
