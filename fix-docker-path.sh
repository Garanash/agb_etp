#!/bin/bash

# 🔧 Исправление PATH для Docker
# Запустите этот скрипт, если Docker установлен, но не найден в PATH

set -e

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

echo "🔧 Исправление PATH для Docker"
echo "=============================="

# Обновляем PATH
export PATH="/usr/bin:/usr/local/bin:/snap/bin:$PATH"

# Проверяем Docker
if command -v docker &> /dev/null; then
    print_success "Docker найден в PATH"
    docker --version
else
    print_warning "Docker не найден в PATH, ищем в системе..."
    
    # Ищем Docker в стандартных местах
    DOCKER_PATHS=(
        "/usr/bin/docker"
        "/usr/local/bin/docker"
        "/snap/bin/docker"
        "/usr/lib/docker/docker"
    )
    
    DOCKER_FOUND=""
    for path in "${DOCKER_PATHS[@]}"; do
        if [ -f "$path" ]; then
            DOCKER_FOUND="$path"
            print_info "Docker найден: $path"
            break
        fi
    done
    
    if [ -n "$DOCKER_FOUND" ]; then
        print_info "Добавляю Docker в PATH..."
        export PATH="$(dirname $DOCKER_FOUND):$PATH"
        
        if command -v docker &> /dev/null; then
            print_success "Docker добавлен в PATH"
            docker --version
        else
            print_error "Не удалось добавить Docker в PATH"
        fi
    else
        print_error "Docker не найден в системе"
        print_info "Установите Docker: sudo ./setup-server.sh"
        exit 1
    fi
fi

# Проверяем Docker Compose
if command -v docker-compose &> /dev/null; then
    print_success "Docker Compose найден"
    docker-compose --version
else
    print_warning "Docker Compose не найден в PATH"
    
    # Ищем Docker Compose
    COMPOSE_PATHS=(
        "/usr/local/bin/docker-compose"
        "/usr/bin/docker-compose"
        "/snap/bin/docker-compose"
    )
    
    COMPOSE_FOUND=""
    for path in "${COMPOSE_PATHS[@]}"; do
        if [ -f "$path" ]; then
            COMPOSE_FOUND="$path"
            print_info "Docker Compose найден: $path"
            break
        fi
    done
    
    if [ -n "$COMPOSE_FOUND" ]; then
        print_info "Добавляю Docker Compose в PATH..."
        export PATH="$(dirname $COMPOSE_FOUND):$PATH"
        
        if command -v docker-compose &> /dev/null; then
            print_success "Docker Compose добавлен в PATH"
            docker-compose --version
        else
            print_error "Не удалось добавить Docker Compose в PATH"
        fi
    else
        print_warning "Docker Compose не найден"
    fi
fi

# Проверяем статус Docker
if command -v docker &> /dev/null; then
    print_info "Проверка статуса Docker..."
    if command -v systemctl &> /dev/null; then
        if systemctl is-active --quiet docker; then
            print_success "Docker сервис запущен"
        else
            print_warning "Docker сервис не запущен, запускаю..."
            sudo systemctl start docker
            if systemctl is-active --quiet docker; then
                print_success "Docker сервис запущен"
            else
                print_error "Не удалось запустить Docker сервис"
            fi
        fi
    else
        print_info "systemctl не найден (возможно, macOS), проверяю Docker напрямую..."
        if docker ps >/dev/null 2>&1; then
            print_success "Docker работает"
        else
            print_warning "Docker не отвечает, возможно, нужно запустить Docker Desktop"
        fi
    fi
fi

echo ""
print_success "Исправление PATH завершено!"
print_info "Теперь вы можете использовать команды docker и docker-compose"
print_info "Для постоянного исправления добавьте в ~/.bashrc:"
echo "export PATH=\"/usr/bin:/usr/local/bin:/snap/bin:\$PATH\""
