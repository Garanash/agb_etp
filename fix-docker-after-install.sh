#!/bin/bash

# 🔧 Исправление Docker PATH после установки
# Запустите этот скрипт после установки Docker

set -e

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
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

echo "🔧 Исправление Docker PATH после установки"
echo "=========================================="

# Обновляем PATH
export PATH="/usr/bin:/usr/local/bin:/snap/bin:$PATH"

print_info "Обновлен PATH: $PATH"

# Проверяем Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version 2>/dev/null || echo "не отвечает")
    print_success "Docker найден: $DOCKER_VERSION"
else
    print_error "Docker все еще не найден в PATH"
    print_info "Ищем Docker в системе..."
    
    # Ищем Docker
    DOCKER_PATHS="/usr/bin/docker /usr/local/bin/docker /snap/bin/docker"
    DOCKER_FOUND=""
    
    for path in $DOCKER_PATHS; do
        if [ -f "$path" ]; then
            DOCKER_FOUND="$path"
            print_info "Docker найден: $path"
            break
        fi
    done
    
    if [ -n "$DOCKER_FOUND" ]; then
        DOCKER_DIR=$(dirname "$DOCKER_FOUND")
        export PATH="$DOCKER_DIR:$PATH"
        print_success "Docker добавлен в PATH"
        
        if command -v docker &> /dev/null; then
            DOCKER_VERSION=$(docker --version 2>/dev/null || echo "не отвечает")
            print_success "Docker работает: $DOCKER_VERSION"
        fi
    else
        print_error "Docker не найден в системе"
        exit 1
    fi
fi

# Проверяем Docker Compose
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version 2>/dev/null || echo "не отвечает")
    print_success "Docker Compose найден: $COMPOSE_VERSION"
else
    print_warning "Docker Compose не найден в PATH"
    
    # Ищем Docker Compose
    COMPOSE_PATHS="/usr/local/bin/docker-compose /usr/bin/docker-compose /snap/bin/docker-compose"
    COMPOSE_FOUND=""
    
    for path in $COMPOSE_PATHS; do
        if [ -f "$path" ]; then
            COMPOSE_FOUND="$path"
            print_info "Docker Compose найден: $path"
            break
        fi
    done
    
    if [ -n "$COMPOSE_FOUND" ]; then
        COMPOSE_DIR=$(dirname "$COMPOSE_FOUND")
        export PATH="$COMPOSE_DIR:$PATH"
        print_success "Docker Compose добавлен в PATH"
        
        if command -v docker-compose &> /dev/null; then
            COMPOSE_VERSION=$(docker-compose --version 2>/dev/null || echo "не отвечает")
            print_success "Docker Compose работает: $COMPOSE_VERSION"
        fi
    else
        print_warning "Docker Compose не найден"
    fi
fi

# Проверяем статус Docker сервиса
print_info "Проверка статуса Docker сервиса..."
if command -v systemctl &> /dev/null; then
    if systemctl is-active --quiet docker; then
        print_success "Docker сервис запущен"
    else
        print_warning "Docker сервис не запущен, запускаю..."
        systemctl start docker
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

# Создаем постоянное исправление
print_info "Создание постоянного исправления PATH..."

# Добавляем в .bashrc
BASHRC_LINE="export PATH=\"/usr/bin:/usr/local/bin:/snap/bin:\$PATH\""
if ! grep -q "export PATH.*docker" ~/.bashrc 2>/dev/null; then
    echo "$BASHRC_LINE" >> ~/.bashrc
    print_success "Добавлено в ~/.bashrc"
else
    print_info "PATH уже настроен в ~/.bashrc"
fi

# Создаем скрипт для быстрого исправления
cat > fix-docker-now.sh << EOF
#!/bin/bash
export PATH="/usr/bin:/usr/local/bin:/snap/bin:\$PATH"
echo "✅ Docker PATH исправлен для текущей сессии"
EOF

chmod +x fix-docker-now.sh
print_success "Создан скрипт fix-docker-now.sh"

echo ""
print_success "Исправление завершено!"
print_info "Теперь можно запустить:"
echo "  sh deploy.sh"
echo ""
print_info "Для применения изменений в новой сессии:"
echo "  source ~/.bashrc"
