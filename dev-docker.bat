@echo off
setlocal enabledelayedexpansion

REM EduAI-Asistent Development Docker Helper Script for Windows

set COMPOSE_FILE=docker-compose.dev.yml

if "%1"=="" goto :help
if "%1"=="help" goto :help
if "%1"=="--help" goto :help
if "%1"=="-h" goto :help

if "%1"=="start" goto :start
if "%1"=="stop" goto :stop
if "%1"=="restart" goto :restart
if "%1"=="build" goto :build
if "%1"=="rebuild" goto :rebuild
if "%1"=="logs" goto :logs
if "%1"=="logs-backend" goto :logs-backend
if "%1"=="logs-frontend" goto :logs-frontend
if "%1"=="logs-db" goto :logs-db
if "%1"=="shell-backend" goto :shell-backend
if "%1"=="shell-frontend" goto :shell-frontend
if "%1"=="shell-db" goto :shell-db
if "%1"=="reset-db" goto :reset-db
if "%1"=="status" goto :status
if "%1"=="clean" goto :clean
if "%1"=="setup" goto :setup

echo Unknown command: %1
echo.
goto :help

:help
echo EduAI-Asistent Development Docker Helper
echo.
echo Usage: %0 [command]
echo.
echo Commands:
echo   start         Start all services
echo   stop          Stop all services
echo   restart       Restart all services
echo   build         Build all services
echo   rebuild       Stop, rebuild, and start all services
echo   logs          Show logs from all services
echo   logs-backend  Show backend logs
echo   logs-frontend Show frontend logs
echo   logs-db       Show database logs
echo   shell-backend Open shell in backend container
echo   shell-frontend Open shell in frontend container
echo   shell-db      Open database shell
echo   reset-db      Reset database (WARNING: deletes all data)
echo   status        Show status of all services
echo   clean         Stop and remove all containers and volumes
echo   setup         Initial setup with environment file
echo.
goto :end

:start
echo Starting all services...
docker-compose -f %COMPOSE_FILE% up -d
goto :end

:stop
echo Stopping all services...
docker-compose -f %COMPOSE_FILE% down
goto :end

:restart
echo Restarting all services...
docker-compose -f %COMPOSE_FILE% restart
goto :end

:build
echo Building all services...
docker-compose -f %COMPOSE_FILE% build
goto :end

:rebuild
echo Stopping services...
docker-compose -f %COMPOSE_FILE% down
echo Building services...
docker-compose -f %COMPOSE_FILE% build
echo Starting services...
docker-compose -f %COMPOSE_FILE% up -d
goto :end

:logs
docker-compose -f %COMPOSE_FILE% logs -f
goto :end

:logs-backend
docker-compose -f %COMPOSE_FILE% logs -f backend
goto :end

:logs-frontend
docker-compose -f %COMPOSE_FILE% logs -f frontend
goto :end

:logs-db
docker-compose -f %COMPOSE_FILE% logs -f db
goto :end

:shell-backend
echo Opening backend shell...
docker-compose -f %COMPOSE_FILE% exec backend sh
goto :end

:shell-frontend
echo Opening frontend shell...
docker-compose -f %COMPOSE_FILE% exec frontend sh
goto :end

:shell-db
echo Opening database shell...
docker-compose -f %COMPOSE_FILE% exec db psql -U postgres -d eduai_asistent
goto :end

:reset-db
echo WARNING: This will delete all database data!
set /p confirm="Are you sure? (y/N): "
if /i "!confirm!"=="y" (
    echo Resetting database...
    docker-compose -f %COMPOSE_FILE% down -v
    docker-compose -f %COMPOSE_FILE% up -d db
    timeout /t 5 /nobreak > nul
    docker-compose -f %COMPOSE_FILE% up -d
) else (
    echo Database reset cancelled
)
goto :end

:status
docker-compose -f %COMPOSE_FILE% ps
goto :end

:clean
echo WARNING: This will remove all containers and volumes!
set /p confirm="Are you sure? (y/N): "
if /i "!confirm!"=="y" (
    echo Cleaning up...
    docker-compose -f %COMPOSE_FILE% down -v --rmi local
) else (
    echo Cleanup cancelled
)
goto :end

:setup
if not exist "docker-compose.env.local" (
    echo Creating local environment file...
    copy docker-compose.env docker-compose.env.local
    echo Please edit docker-compose.env.local and add your OpenAI API key
    echo Replace 'your-openai-api-key-here' with your actual API key
) else (
    echo Environment file already exists
)
goto :end

:end
