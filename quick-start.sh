#!/bin/bash

# Medflect AI Quick Start Script
# This script helps you set up and run the Medflect AI platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node -v | cut -d'v' -f2)
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
        if [ "$NODE_MAJOR" -ge 18 ]; then
            print_success "Node.js version $NODE_VERSION is compatible"
            return 0
        else
            print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18 or higher."
            return 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        return 1
    fi
}

# Function to check npm version
check_npm_version() {
    if command_exists npm; then
        NPM_VERSION=$(npm -v)
        NPM_MAJOR=$(echo $NPM_VERSION | cut -d'.' -f1)
        if [ "$NPM_MAJOR" -ge 8 ]; then
            print_success "npm version $NPM_VERSION is compatible"
            return 0
        else
            print_error "npm version $NPM_VERSION is too old. Please install npm 8 or higher."
            return 1
        fi
    else
        print_error "npm is not installed. Please install npm 8 or higher."
        return 1
    fi
}

# Function to check Docker
check_docker() {
    if command_exists docker; then
        print_success "Docker is installed"
        return 0
    else
        print_warning "Docker is not installed. You can still run in development mode."
        return 1
    fi
}

# Function to check Docker Compose
check_docker_compose() {
    if command_exists docker-compose; then
        print_success "Docker Compose is installed"
        return 0
    else
        print_warning "Docker Compose is not installed. You can still run in development mode."
        return 1
    fi
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            cp env.example .env
            print_success "Created .env file from env.example"
        else
            print_error "env.example not found. Please create a .env file manually."
            return 1
        fi
    else
        print_warning ".env file already exists"
    fi
    
    # Create necessary directories
    mkdir -p data logs uploads
    print_success "Created necessary directories"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install server dependencies
    if [ -f package.json ]; then
        npm install
        print_success "Server dependencies installed"
    fi
    
    # Install web (Vite) dependencies
    if [ -f packages/web/package.json ]; then
        cd packages/web
        npm install
        cd ../..
        print_success "Web dependencies installed"
    fi
}

# Function to build client
build_client() {
    print_status "Building client..."
    
    if [ -f packages/web/package.json ]; then
        cd packages/web
        npm run build
        cd ../..
        print_success "Web app built successfully"
    fi
}

# Function to start development servers
start_development() {
    print_status "Starting development servers..."
    
    if [ -f package.json ]; then
        npm run dev &
        DEV_PID=$!
        print_success "Development servers started (PID: $DEV_PID)"
        print_status "Server will be available at http://localhost:3001"
        print_status "Web app (Vite) will be available at http://localhost:5173 (or next free port)"
        print_status "Press Ctrl+C to stop the servers"
        
        # Wait for user to stop
        wait $DEV_PID
    fi
}

# Function to start with Docker
start_docker() {
    print_status "Starting with Docker..."
    
    if command_exists docker && command_exists docker-compose; then
        docker-compose up -d
        print_success "Docker containers started"
        print_status "Application will be available at http://localhost:3001"
        print_status "Use 'docker-compose logs -f' to view logs"
        print_status "Use 'docker-compose down' to stop containers"
    else
        print_error "Docker and Docker Compose are required for this option"
        return 1
    fi
}

# Function to show help
show_help() {
    echo "Medflect AI Quick Start Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  --check          Check system requirements"
    echo "  --setup          Setup environment and install dependencies"
    echo "  --dev            Start development servers"
    echo "  --docker         Start with Docker"
    echo "  --build          Build web app for production"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --check       # Check if your system meets requirements"
    echo "  $0 --setup       # Setup environment and install dependencies"
    echo "  $0 --dev         # Start development servers"
    echo "  $0 --docker      # Start with Docker"
    echo ""
}

# Main script logic
main() {
    echo "🏥 Medflect AI - Quick Start Script"
    echo "=================================="
    echo ""
    
    case "${1:-}" in
        --check)
            print_status "Checking system requirements..."
            check_node_version
            check_npm_version
            check_docker
            check_docker_compose
            print_success "System check completed"
            ;;
        --setup)
            print_status "Setting up Medflect AI..."
            check_node_version || exit 1
            check_npm_version || exit 1
            setup_environment
            install_dependencies
            print_success "Setup completed successfully"
            ;;
        --dev)
            print_status "Starting development mode..."
            check_node_version || exit 1
            check_npm_version || exit 1
            setup_environment
            install_dependencies
            start_development
            ;;
        --docker)
            print_status "Starting Docker mode..."
            check_docker || exit 1
            check_docker_compose || exit 1
            setup_environment
            start_docker
            ;;
        --build)
            print_status "Building for production..."
            check_node_version || exit 1
            check_npm_version || exit 1
            setup_environment
            install_dependencies
            build_client
            print_success "Build completed successfully"
            ;;
        --help|"")
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 