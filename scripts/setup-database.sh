#!/bin/bash

# Database Setup Script
# This script guides you through setting up the RFE database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check Node.js version
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        print_info "Please install Node.js 18 or higher from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version must be 18 or higher (current: $(node -v))"
        exit 1
    fi
    
    print_success "Node.js $(node -v) detected"
}

# Check npm
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm $(npm -v) detected"
}

# Check if .env exists
check_env_file() {
    if [ ! -f ".env" ]; then
        print_warning ".env file not found"
        print_info "Creating .env from .env.example..."
        cp .env.example .env
        print_success ".env file created"
        print_warning "Please edit .env and add your Neon database connection string"
        print_info "Get your connection string from: https://console.neon.tech"
        return 1
    fi
    print_success ".env file exists"
    return 0
}

# Check DATABASE_URL
check_database_url() {
    if ! grep -q "DATABASE_URL=" .env 2>/dev/null; then
        print_error "DATABASE_URL not found in .env"
        return 1
    fi
    
    # Check if it's still the placeholder
    if grep -q "ep-project-1234" .env || grep -q "postgres://user:password" .env; then
        print_warning "DATABASE_URL appears to be a placeholder"
        print_info "Please update it with your actual Neon connection string"
        print_info "Get it from: https://console.neon.tech"
        return 1
    fi
    
    print_success "DATABASE_URL is configured"
    return 0
}

# Install dependencies
install_dependencies() {
    if [ ! -d "node_modules" ]; then
        print_info "Installing dependencies..."
        npm install
        print_success "Dependencies installed"
    else
        print_success "Dependencies already installed"
    fi
}

# Main setup process
print_header "RFE Database Setup"

echo "This script will guide you through setting up the database for the RFE Spray Foam App."
echo ""

# Step 1: Prerequisites
print_header "Step 1: Checking Prerequisites"
check_node
check_npm

# Step 2: Install dependencies
print_header "Step 2: Installing Dependencies"
install_dependencies

# Step 3: Environment configuration
print_header "Step 3: Environment Configuration"
ENV_CONFIGURED=false
if check_env_file; then
    if check_database_url; then
        ENV_CONFIGURED=true
    fi
fi

if [ "$ENV_CONFIGURED" = false ]; then
    echo ""
    print_warning "Environment configuration is incomplete"
    echo ""
    echo "To complete the setup:"
    echo "  1. Create a Neon database at https://console.neon.tech"
    echo "  2. Copy the 'Pooled connection' string (port 6543)"
    echo "  3. Update DATABASE_URL in the .env file"
    echo ""
    print_info "After configuring .env, run this script again or follow these steps:"
    echo ""
    echo "  npm run db:test      # Test connection"
    echo "  npm run db:migrate   # Create schema"
    echo "  npm run db:verify    # Verify setup"
    echo "  npm run db:seed      # Optional: Add demo data"
    echo ""
    print_info "See DATABASE_SETUP.md for detailed instructions"
    exit 0
fi

# Step 4: Test connection
print_header "Step 4: Testing Database Connection"
print_info "Testing connection to Neon database..."

if npm run db:test 2>&1 | grep -q "Connected successfully"; then
    print_success "Database connection successful"
else
    print_error "Database connection failed"
    print_info "Please check your DATABASE_URL in .env"
    print_info "See DATABASE_SETUP.md for troubleshooting"
    exit 1
fi

# Step 5: Run migrations
print_header "Step 5: Creating Database Schema"
read -p "Run database migrations to create tables? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Running migrations..."
    if npm run db:migrate 2>&1 | grep -q "Migration completed successfully"; then
        print_success "Database schema created successfully"
    else
        print_error "Migration failed"
        print_info "Tables might already exist. Check the error message above."
    fi
else
    print_warning "Skipped migrations"
fi

# Step 6: Verify setup
print_header "Step 6: Verifying Setup"
print_info "Running verification checks..."
npm run db:verify

# Step 7: Optional seed data
print_header "Step 7: Demo Data (Optional)"
read -p "Seed database with demo data for development? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Seeding database..."
    npm run db:seed
else
    print_warning "Skipped seeding"
fi

# Final message
print_header "Setup Complete!"
print_success "Your database is ready to use!"
echo ""
print_info "Next steps:"
echo "  - Start development server: npm run dev"
echo "  - Build for production: npm run build"
echo "  - See README.md for more information"
echo ""
print_info "Available database commands:"
echo "  - npm run db:test      # Test database connection"
echo "  - npm run db:migrate   # Run database migrations"
echo "  - npm run db:verify    # Verify database setup"
echo "  - npm run db:seed      # Seed demo data"
echo ""
