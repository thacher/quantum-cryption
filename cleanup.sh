#!/bin/bash

# Quantum Cryption Cleanup Script
# Removes temporary files and cleans up the project

echo "🧹 Quantum Cryption Cleanup"
echo "=========================="
echo ""

# Remove temporary test files
echo "Removing temporary files..."
rm -f test.txt test.encrypted

# Clean up any build artifacts
echo "Cleaning build artifacts..."
rm -rf .next/
rm -rf out/

# Clean up node modules if requested
if [ "$1" = "--deep" ]; then
    echo "Deep cleaning (removing node_modules)..."
    rm -rf node_modules/
    echo "Run 'npm install' to reinstall dependencies"
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Available test commands:"
echo "  npm run test       - Test crypto functionality"
echo "  npm run test-app   - Test web application"
echo "  npm run test-all   - Run all tests"
echo ""
echo "Development commands:"
echo "  npm run dev        - Start development server"
echo "  npm run build      - Build for production"
echo "  npm run lint       - Run linting"
