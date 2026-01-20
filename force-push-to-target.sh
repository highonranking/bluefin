#!/bin/bash

# Script to force push to target repository
# This will replace the remote repository content with local content

set -e

REPO_OWNER="bharatfiber78"
REPO_NAME="bluefin-fiber"

echo "=== Force Push to ${REPO_OWNER}/${REPO_NAME} ==="
echo ""
echo "WARNING: This will REPLACE all content in the target repository"
echo "with the content from your current local branch (highonranking/bluefin)."
echo ""
echo "Remote repository has different commits:"
git log --oneline target/main 2>/dev/null | head -3 || echo "  (could not fetch)"
echo ""
echo "Your local branch has:"
git log --oneline -3
echo ""
echo "This operation will:"
echo "  - Overwrite the remote repository's history"
echo "  - Replace all files with your local version"
echo "  - Cannot be easily undone"
echo ""
read -p "Are you sure you want to continue? Type 'yes' to confirm: " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "Force pushing to repository..."

# Check if we need to set up the remote URL with token
CURRENT_URL=$(git remote get-url target)
if [[ "$CURRENT_URL" != *"@"* ]]; then
    echo ""
    echo "Authentication required. You'll need to provide credentials."
    echo "Option 1: Run with token in URL"
    echo "  git push -f https://USERNAME:TOKEN@github.com/${REPO_OWNER}/${REPO_NAME}.git main"
    echo ""
    echo "Option 2: Use the push-with-token.sh script first, then run this"
    echo ""
    read -p "Do you want to proceed with force push now? (y/n) " REPLY
    if [ "$REPLY" != "y" ] && [ "$REPLY" != "Y" ]; then
        exit 1
    fi
fi

git push -f target main

echo ""
echo "✓ Successfully force pushed to repository!"
echo "The target repository now has the same code as your local branch."
