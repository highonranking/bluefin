#!/bin/bash

# Script to create repository on GitHub and push code
# This assumes you have GitHub CLI (gh) installed, or will guide you through manual creation

set -e

REPO_NAME="bluefin-fiber"
REPO_OWNER="bharatfiber78"
TARGET_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}.git"

echo "=== Setting up repository: ${REPO_OWNER}/${REPO_NAME} ==="
echo ""

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo "GitHub CLI found. Checking authentication..."
    if gh auth status &> /dev/null; then
        echo "✓ GitHub CLI authenticated"
        echo ""
        echo "Creating repository on GitHub..."
        gh repo create ${REPO_OWNER}/${REPO_NAME} --public --source=. --remote=target --push 2>&1 || {
            echo ""
            echo "Repository might already exist or you don't have permission."
            echo "Trying to add remote and push..."
            git remote remove target 2>/dev/null || true
            git remote add target ${TARGET_URL}
            git push -u target main
        }
        echo ""
        echo "✓ Repository created and code pushed!"
        exit 0
    else
        echo "GitHub CLI not authenticated. Run: gh auth login"
    fi
fi

# Manual instructions
echo "GitHub CLI not available or not authenticated."
echo ""
echo "MANUAL STEPS:"
echo "1. Go to: https://github.com/new"
echo "2. Repository name: ${REPO_NAME}"
echo "3. Owner: ${REPO_OWNER}"
echo "4. Choose Public or Private"
echo "5. DO NOT initialize with README, .gitignore, or license"
echo "6. Click 'Create repository'"
echo ""
echo "After creating the repository, run:"
echo "  git remote add target ${TARGET_URL}"
echo "  git push -u target main"
echo ""
echo "Or if target remote already exists:"
echo "  git push -u target main"
echo ""
read -p "Press Enter after you've created the repository on GitHub, then I'll push the code..."

# Try to push
echo ""
echo "Pushing code to repository..."
git remote remove target 2>/dev/null || true
git remote add target ${TARGET_URL}
git push -u target main || {
    echo ""
    echo "Push failed. This might be due to:"
    echo "1. Repository not created yet"
    echo "2. Authentication required (you'll be prompted)"
    echo "3. No write access to the repository"
    echo ""
    echo "Try running manually:"
    echo "  git push -u target main"
}
