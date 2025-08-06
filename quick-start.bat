@echo off
setlocal enabledelayedexpansion

REM Medflect AI Quick Start Script for Windows
REM This script helps you set up and run the Medflect AI platform

echo.
echo 🏥 Medflect AI - Quick Start Script
echo ==================================
echo.

if "%1"=="" goto :show_help
if "%1"=="--help" goto :show_help
if "%1"=="--check" goto :check_system
if "%1"=="--setup" goto :setup
if "%1"=="--dev" goto :start_dev
if "%1"=="--docker" goto :start_docker
if "%1"=="--build" goto :build
goto :show_help

:check_system
echo [INFO] Checking system requirements...
call :check_node
call :check_npm
call :check_docker
echo [SUCCESS] System check completed
goto :end

:setup
echo [INFO] Setting up Medflect AI...
call :check_node
if errorlevel 1 goto :end
call :check_npm
if errorlevel 1 goto :end
call :setup_environment
call :install_dependencies
echo [SUCCESS] Setup completed successfully
goto :end

:start_dev
echo [INFO] Starting development mode...
call :check_node
if errorlevel 1 goto :end
call :check_npm
if errorlevel 1 goto :end
call :setup_environment
call :install_dependencies
call :start_development
goto :end

:start_docker
echo [INFO] Starting Docker mode...
call :check_docker
if errorlevel 1 goto :end
call :setup_environment
call :start_docker_containers
goto :end

:build
echo [INFO] Building for production...
call :check_node
if errorlevel 1 goto :end
call :check_npm
if errorlevel 1 goto :end
call :setup_environment
call :install_dependencies
call :build_client
echo [SUCCESS] Build completed successfully
goto :end

:show_help
echo Medflect AI Quick Start Script
echo.
echo Usage: %0 [OPTION]
echo.
echo Options:
echo   --check          Check system requirements
echo   --setup          Setup environment and install dependencies
echo   --dev            Start development servers
echo   --docker         Start with Docker
echo   --build          Build client for production
echo   --help           Show this help message
echo.
echo Examples:
echo   %0 --check       # Check if your system meets requirements
echo   %0 --setup       # Setup environment and install dependencies
echo   %0 --dev         # Start development servers
echo   %0 --docker      # Start with Docker
echo.
goto :end

:check_node
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18 or higher.
    exit /b 1
)
for /f "tokens=1,2 delims=." %%a in ('node --version') do set NODE_VERSION=%%a
set NODE_MAJOR=%NODE_VERSION:~1%
if %NODE_MAJOR% geq 18 (
    echo [SUCCESS] Node.js version is compatible
    exit /b 0
) else (
    echo [ERROR] Node.js version is too old. Please install Node.js 18 or higher.
    exit /b 1
)

:check_npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed. Please install npm 8 or higher.
    exit /b 1
)
for /f "tokens=1 delims=." %%a in ('npm --version') do set NPM_MAJOR=%%a
if %NPM_MAJOR% geq 8 (
    echo [SUCCESS] npm version is compatible
    exit /b 0
) else (
    echo [ERROR] npm version is too old. Please install npm 8 or higher.
    exit /b 1
)

:check_docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Docker is not installed. You can still run in development mode.
    exit /b 1
)
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Docker Compose is not installed. You can still run in development mode.
    exit /b 1
)
echo [SUCCESS] Docker and Docker Compose are installed
exit /b 0

:setup_environment
echo [INFO] Setting up environment...
if not exist .env (
    if exist env.example (
        copy env.example .env >nul
        echo [SUCCESS] Created .env file from env.example
    ) else (
        echo [ERROR] env.example not found. Please create a .env file manually.
        exit /b 1
    )
) else (
    echo [WARNING] .env file already exists
)

if not exist data mkdir data
if not exist logs mkdir logs
if not exist uploads mkdir uploads
echo [SUCCESS] Created necessary directories
exit /b 0

:install_dependencies
echo [INFO] Installing dependencies...

if exist package.json (
    npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install server dependencies
        exit /b 1
    )
    echo [SUCCESS] Server dependencies installed
)

if exist client\package.json (
    cd client
    npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install client dependencies
        exit /b 1
    )
    cd ..
    echo [SUCCESS] Client dependencies installed
)
exit /b 0

:build_client
echo [INFO] Building client...
if exist client\package.json (
    cd client
    npm run build
    if errorlevel 1 (
        echo [ERROR] Failed to build client
        exit /b 1
    )
    cd ..
    echo [SUCCESS] Client built successfully
)
exit /b 0

:start_development
echo [INFO] Starting development servers...
if exist package.json (
    echo [SUCCESS] Development servers starting...
    echo [INFO] Server will be available at http://localhost:3001
    echo [INFO] Client will be available at http://localhost:3000
    echo [INFO] Press Ctrl+C to stop the servers
    npm run dev
)
exit /b 0

:start_docker_containers
echo [INFO] Starting with Docker...
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start Docker containers
    exit /b 1
)
echo [SUCCESS] Docker containers started
echo [INFO] Application will be available at http://localhost:3001
echo [INFO] Use 'docker-compose logs -f' to view logs
echo [INFO] Use 'docker-compose down' to stop containers
exit /b 0

:end
echo.
pause 