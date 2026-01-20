#!/bin/bash

# Script to push to target repository with proper authentication
# This will help you authenticate with the correct GitHub account

set -e

REPO_OWNER="bharatfiber78"
REPO_NAME="bluefin-fiber"
TARGET_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}.git"

echo "=== Pushing to ${REPO_OWNER}/${REPO_NAME} ==="
echo ""
echo "The repository exists but authentication failed."
echo "Git tried to use 'highonranking' credentials, but needs '${REPO_OWNER}' credentials."
echo ""

# Update remote URL to include username prompt
echo "Updating remote URL..."
git remote set-url target ${TARGET_URL}

echo ""
echo "OPTIONS:"
echo ""
echo "Option 1: Use Personal Access Token (Recommended)"
echo "  1. Go to: https://github.com/settings/tokens"
echo "  2. Generate a new token (classic) with 'repo' permissions"
echo "  3. When prompted for password, paste the token instead"
echo ""
echo "Option 2: Update Git credentials"
echo "  The next push will prompt for username and password/token"
echo ""

read -p "Press Enter to attempt push (you'll be prompted for credentials)..."

echo ""
echo "Pushing to repository..."
echo "When prompted:"
echo "  Username: Enter your GitHub username (${REPO_OWNER} or your account)"
echo "  Password: Enter your Personal Access Token (NOT your GitHub password)"
echo ""

git push -u target main

echo ""
echo "✓ Push completed successfully!"
