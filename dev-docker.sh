#!/bin/bash

# EduAI-Asistent Development Docker Helper Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Docker Compose file
COMPOSE_FILE="docker-compose.dev.yml"

print_usage() {
    echo -e "${BLUE}EduAI-Asistent Development Docker Helper${NC}"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start         Start all services"
    echo "  stop          Stop all services"
    echo "  restart       Restart all services"
    echo "  build         Build all services"
    echo "  rebuild       Stop, rebuild, and start all services"
    echo "  logs          Show logs from all services"
    echo "  logs-backend  Show backend logs"
    echo "  logs-frontend Show frontend logs"
    echo "  logs-db       Show database logs"
    echo "  shell-backend Open shell in backend container"
    echo "  shell-frontend Open shell in frontend container"
    echo "  shell-db      Open database shell"
    echo "  reset-db      Reset database (WARNING: deletes all data)"
    echo "  status        Show status of all services"
    echo "  clean         Stop and remove all containers and volumes"
    echo "  setup         Initial setup with environment file"
    echo ""
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker is not installed${NC}"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${RED}Error: Docker Compose is not installed${NC}"
        exit 1
    fi
}

setup_env() {
    if [ ! -f "docker-compose.env.local" ]; then
        echo -e "${YELLOW}Creating local environment file...${NC}"
        cp docker-compose.env docker-compose.env.local
        echo -e "${YELLOW}Please edit docker-compose.env.local and add your OpenAI API key${NC}"
        echo -e "${YELLOW}Replace 'your-openai-api-key-here' with your actual API key${NC}"
    else
        echo -e "${GREEN}Environment file already exists${NC}"
    fi
}

case "${1:-help}" in
    start)
        echo -e "${GREEN}Starting all services...${NC}"
        docker-compose -f $COMPOSE_FILE up -d
        ;;
    stop)
        echo -e "${YELLOW}Stopping all services...${NC}"
        docker-compose -f $COMPOSE_FILE down
        ;;
    restart)
        echo -e "${YELLOW}Restarting all services...${NC}"
        docker-compose -f $COMPOSE_FILE restart
        ;;
    build)
        echo -e "${BLUE}Building all services...${NC}"
        docker-compose -f $COMPOSE_FILE build
        ;;
    rebuild)
        echo -e "${YELLOW}Stopping services...${NC}"
        docker-compose -f $COMPOSE_FILE down
        echo -e "${BLUE}Building services...${NC}"
        docker-compose -f $COMPOSE_FILE build
        echo -e "${GREEN}Starting services...${NC}"
        docker-compose -f $COMPOSE_FILE up -d
        ;;
    logs)
        docker-compose -f $COMPOSE_FILE logs -f
        ;;
    logs-backend)
        docker-compose -f $COMPOSE_FILE logs -f backend
        ;;
    logs-frontend)
        docker-compose -f $COMPOSE_FILE logs -f frontend
        ;;
    logs-db)
        docker-compose -f $COMPOSE_FILE logs -f db
        ;;
    shell-backend)
        echo -e "${BLUE}Opening backend shell...${NC}"
        docker-compose -f $COMPOSE_FILE exec backend sh
        ;;
    shell-frontend)
        echo -e "${BLUE}Opening frontend shell...${NC}"
        docker-compose -f $COMPOSE_FILE exec frontend sh
        ;;
    shell-db)
        echo -e "${BLUE}Opening database shell...${NC}"
        docker-compose -f $COMPOSE_FILE exec db psql -U postgres -d eduai_asistent
        ;;
    reset-db)
        echo -e "${RED}WARNING: This will delete all database data!${NC}"
        read -p "Are you sure? (y/N): " confirm
        if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
            echo -e "${YELLOW}Resetting database...${NC}"
            docker-compose -f $COMPOSE_FILE down -v
            docker-compose -f $COMPOSE_FILE up -d db
            sleep 5
            docker-compose -f $COMPOSE_FILE up -d
        else
            echo -e "${GREEN}Database reset cancelled${NC}"
        fi
        ;;
    status)
        docker-compose -f $COMPOSE_FILE ps
        ;;
    clean)
        echo -e "${RED}WARNING: This will remove all containers and volumes!${NC}"
        read -p "Are you sure? (y/N): " confirm
        if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
            echo -e "${YELLOW}Cleaning up...${NC}"
            docker-compose -f $COMPOSE_FILE down -v --rmi local
        else
            echo -e "${GREEN}Cleanup cancelled${NC}"
        fi
        ;;
    setup)
        setup_env
        ;;
    help|--help|-h)
        print_usage
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        print_usage
        exit 1
        ;;
esac
