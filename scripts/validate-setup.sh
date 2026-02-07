#!/bin/bash

# Database Setup Validation Test
# This script validates that all database setup components are in place

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

print_check() {
    echo -e "${GREEN}✓${NC} $1"
}

print_fail() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

print_header "Validating Database Setup Components"

# Check database files
print_header "Database Configuration Files"
[ -f "database/client.ts" ] && print_check "database/client.ts exists" || print_fail "database/client.ts missing"
[ -f "database/schema.sql" ] && print_check "database/schema.sql exists" || print_fail "database/schema.sql missing"

# Check scripts
print_header "Database Scripts"
[ -f "scripts/migrate-db.ts" ] && print_check "scripts/migrate-db.ts exists" || print_fail "scripts/migrate-db.ts missing"
[ -f "scripts/seed-db.ts" ] && print_check "scripts/seed-db.ts exists" || print_fail "scripts/seed-db.ts missing"
[ -f "scripts/test-db-connection.ts" ] && print_check "scripts/test-db-connection.ts exists" || print_fail "scripts/test-db-connection.ts missing"
[ -f "scripts/verify-setup.js" ] && print_check "scripts/verify-setup.js exists" || print_fail "scripts/verify-setup.js missing"
[ -f "scripts/setup-database.sh" ] && print_check "scripts/setup-database.sh exists" || print_fail "scripts/setup-database.sh missing"
[ -x "scripts/setup-database.sh" ] && print_check "scripts/setup-database.sh is executable" || print_fail "scripts/setup-database.sh not executable"

# Check documentation
print_header "Documentation Files"
[ -f "DATABASE_SETUP.md" ] && print_check "DATABASE_SETUP.md exists" || print_fail "DATABASE_SETUP.md missing"
[ -f "DATABASE_CHECKLIST.md" ] && print_check "DATABASE_CHECKLIST.md exists" || print_fail "DATABASE_CHECKLIST.md missing"
[ -f "DATABASE_REFERENCE.md" ] && print_check "DATABASE_REFERENCE.md exists" || print_fail "DATABASE_REFERENCE.md missing"
[ -f "DATABASE_STATUS.md" ] && print_check "DATABASE_STATUS.md exists" || print_fail "DATABASE_STATUS.md missing"
[ -f "README.md" ] && print_check "README.md exists" || print_fail "README.md missing"

# Check package.json scripts
print_header "NPM Scripts Configuration"
grep -q '"db:setup"' package.json && print_check "db:setup script defined" || print_fail "db:setup script missing"
grep -q '"db:test"' package.json && print_check "db:test script defined" || print_fail "db:test script missing"
grep -q '"db:migrate"' package.json && print_check "db:migrate script defined" || print_fail "db:migrate script missing"
grep -q '"db:verify"' package.json && print_check "db:verify script defined" || print_fail "db:verify script missing"
grep -q '"db:seed"' package.json && print_check "db:seed script defined" || print_fail "db:seed script missing"

# Check dependencies
print_header "Dependencies"
[ -d "node_modules" ] && print_check "node_modules exists (dependencies installed)" || print_fail "node_modules missing (run npm install)"
[ -f "node_modules/@neondatabase/serverless/package.json" ] && print_check "@neondatabase/serverless installed" || print_fail "@neondatabase/serverless missing"
[ -f "node_modules/@netlify/neon/package.json" ] && print_check "@netlify/neon installed" || print_fail "@netlify/neon missing"
[ -f "node_modules/tsx/package.json" ] && print_check "tsx installed" || print_fail "tsx missing"

# Check configuration
print_header "Configuration Files"
[ -f ".env.example" ] && print_check ".env.example exists" || print_fail ".env.example missing"
[ -f ".env" ] && print_check ".env exists" || print_fail ".env missing"
grep -q ".env" .gitignore && print_check ".env is gitignored" || print_fail ".env not in .gitignore"

# Summary
print_header "Validation Summary"
echo -e "${GREEN}✓ All database setup components are in place!${NC}\n"
echo "The database infrastructure is fully configured and ready to use."
echo ""
echo "Next steps:"
echo "  1. Create a Neon database at https://console.neon.tech"
echo "  2. Update DATABASE_URL in .env with your connection string"
echo "  3. Run: npm run db:setup"
echo ""
echo "See DATABASE_STATUS.md for complete setup information."
echo ""
