/**
 * Install Git Hooks Script
 * Automatically installs pre-commit hooks for code quality
 */

const fs = require('fs');
const path = require('path');

const gitDir = path.join(__dirname, '..', '.git');
const hooksDir = path.join(gitDir, 'hooks');

// Pre-commit hook content
const preCommitHook = `#!/bin/sh
# Pre-commit hook for BJ Probability Engine
# Validates code quality before commits

echo "Running pre-commit checks..."

# Check for console.log statements (warn only)
CONSOLE_LOGS=$(git diff --cached --name-only --diff-filter=ACM | xargs grep -l "console.log" 2>/dev/null | grep -v "performance.js" || true)
if [ -n "$CONSOLE_LOGS" ]; then
  echo "⚠️  Warning: console.log found in:"
  echo "$CONSOLE_LOGS"
  echo "Consider removing before production."
fi

# Check for debugger statements (block commit) - exclude hooks and CI files
DEBUGGERS=$(git diff --cached --name-only --diff-filter=ACM | grep -v "install-hooks" | grep -v "ci.yml" | grep -v ".sh$" | xargs grep -l "debug""ger" 2>/dev/null || true)
if [ -n "$DEBUGGERS" ]; then
  echo "Error: debug""ger statement found in:"
  echo "$DEBUGGERS"
  echo "Remove debug""ger statements before committing."
  exit 1
fi

# Check for large files (>500KB)
LARGE_FILES=$(git diff --cached --name-only --diff-filter=ACM | while read file; do
  if [ -f "$file" ]; then
    size=$(wc -c < "$file")
    if [ "$size" -gt 512000 ]; then
      echo "$file ($size bytes)"
    fi
  fi
done)
if [ -n "$LARGE_FILES" ]; then
  echo "⚠️  Warning: Large files detected:"
  echo "$LARGE_FILES"
fi

# Validate JSON files
JSON_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep "\\.json$" || true)
for file in $JSON_FILES; do
  if [ -f "$file" ]; then
    node -e "JSON.parse(require('fs').readFileSync('$file'))" 2>/dev/null
    if [ $? -ne 0 ]; then
      echo "❌ Error: Invalid JSON in $file"
      exit 1
    fi
  fi
done

echo "✅ Pre-commit checks passed!"
exit 0
`;

// Create hooks directory if it doesn't exist
if (fs.existsSync(gitDir)) {
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  // Write pre-commit hook
  const hookPath = path.join(hooksDir, 'pre-commit');
  fs.writeFileSync(hookPath, preCommitHook);

  // Make executable on Unix systems
  try {
    fs.chmodSync(hookPath, '755');
  } catch (e) {
    // Windows doesn't need chmod
  }

  console.log('✅ Git pre-commit hook installed successfully!');
} else {
  console.log('⚠️  Not a git repository, skipping hook installation');
}
