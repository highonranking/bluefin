#!/bin/bash

# Script to push using Personal Access Token
# This avoids credential conflicts

set -e

REPO_OWNER="bharatfiber78"
REPO_NAME="bluefin-fiber"

echo "=== Push to ${REPO_OWNER}/${REPO_NAME} using Personal Access Token ==="
echo ""
echo "To push to this repository, you need a GitHub Personal Access Token."
echo ""
echo "Steps:"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Give it a name (e.g., 'bluefin-push')"
echo "4. Select scope: 'repo' (full control of private repositories)"
echo "5. Click 'Generate token'"
echo "6. COPY THE TOKEN (you won't see it again!)"
echo ""
read -p "Have you created a token? (y/n) " REPLY
if [ "$REPLY" != "y" ] && [ "$REPLY" != "Y" ]; then
    echo "Please create a token first, then run this script again."
    exit 1
fi

echo ""
printf "Enter your GitHub username (for ${REPO_OWNER} account): "
read GITHUB_USERNAME

printf "Enter your Personal Access Token: "
read -s GITHUB_TOKEN
echo ""

# Update remote URL with token
TARGET_URL="https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${REPO_OWNER}/${REPO_NAME}.git"
git remote set-url target ${TARGET_URL}

echo ""
echo "Pushing to repository..."
git push -u target main

# Remove token from URL for security (store in credential helper instead)
git remote set-url target https://github.com/${REPO_OWNER}/${REPO_NAME}.git

echo ""
echo "✓ Successfully pushed to repository!"
echo ""
echo "Note: Token has been removed from remote URL for security."
echo "Future pushes will use Git's credential helper if configured."
