#!/bin/bash

# 🔍 Поиск и исправление Docker на сервере
# Находит Docker в системе и исправляет PATH

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

echo "🔍 Поиск и исправление Docker на сервере"
echo "========================================"

# Ищем Docker в системе
print_info "Поиск Docker в системе..."

DOCKER_FOUND=""
DOCKER_PATHS="/usr/bin/docker /usr/local/bin/docker /snap/bin/docker /usr/lib/docker/docker /opt/docker/docker"

for path in $DOCKER_PATHS; do
    if [ -f "$path" ]; then
        print_success "Docker найден: $path"
        DOCKER_FOUND="$path"
        ls -la "$path"
        break
    fi
done

if [ -z "$DOCKER_FOUND" ]; then
    print_warning "Docker не найден в стандартных местах, ищем везде..."
    DOCKER_FOUND=$(find /usr /opt /var -name "docker" -type f 2>/dev/null | head -1)
    if [ -n "$DOCKER_FOUND" ]; then
        print_success "Docker найден: $DOCKER_FOUND"
        ls -la "$DOCKER_FOUND"
    else
        print_error "Docker не найден в системе!"
        print_info "Установите Docker: sudo ./setup-server.sh"
        exit 1
    fi
fi

# Ищем Docker Compose
print_info "Поиск Docker Compose..."

COMPOSE_FOUND=""
COMPOSE_PATHS="/usr/local/bin/docker-compose /usr/bin/docker-compose /snap/bin/docker-compose"

for path in $COMPOSE_PATHS; do
    if [ -f "$path" ]; then
        print_success "Docker Compose найден: $path"
        COMPOSE_FOUND="$path"
        ls -la "$path"
        break
    fi
done

if [ -z "$COMPOSE_FOUND" ]; then
    print_warning "Docker Compose не найден в стандартных местах, ищем везде..."
    COMPOSE_FOUND=$(find /usr /opt -name "docker-compose" -type f 2>/dev/null | head -1)
    if [ -n "$COMPOSE_FOUND" ]; then
        print_success "Docker Compose найден: $COMPOSE_FOUND"
        ls -la "$COMPOSE_FOUND"
    else
        print_warning "Docker Compose не найден"
    fi
fi

# Исправляем PATH
print_info "Исправление PATH..."

DOCKER_DIR=$(dirname "$DOCKER_FOUND")
export PATH="$DOCKER_DIR:$PATH"

if [ -n "$COMPOSE_FOUND" ]; then
    COMPOSE_DIR=$(dirname "$COMPOSE_FOUND")
    export PATH="$COMPOSE_DIR:$PATH"
fi

# Проверяем результат
print_info "Проверка исправления..."

if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version 2>/dev/null || echo "не отвечает")
    print_success "Docker работает: $DOCKER_VERSION"
else
    print_error "Docker все еще не найден в PATH"
fi

if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version 2>/dev/null || echo "не отвечает")
    print_success "Docker Compose работает: $COMPOSE_VERSION"
else
    print_warning "Docker Compose не найден в PATH"
fi

# Создаем постоянное исправление
print_info "Создание постоянного исправления..."

# Добавляем в .bashrc
BASHRC_LINE="export PATH=\"$DOCKER_DIR:$PATH\""
if ! grep -q "export PATH.*docker" ~/.bashrc 2>/dev/null; then
    echo "$BASHRC_LINE" >> ~/.bashrc
    print_success "Добавлено в ~/.bashrc"
else
    print_info "PATH уже настроен в ~/.bashrc"
fi

# Создаем скрипт для быстрого исправления
cat > fix-docker-path-now.sh << EOF
#!/bin/bash
export PATH="$DOCKER_DIR:$PATH"
if [ -n "$COMPOSE_FOUND" ]; then
    export PATH="$(dirname $COMPOSE_FOUND):\$PATH"
fi
echo "✅ Docker PATH исправлен для текущей сессии"
EOF

chmod +x fix-docker-path-now.sh
print_success "Создан скрипт fix-docker-path-now.sh"

echo ""
print_success "Исправление завершено!"
print_info "Для применения изменений выполните:"
echo "  source ~/.bashrc"
echo "  или"
echo "  ./fix-docker-path-now.sh"
echo ""
print_info "Теперь можно запустить: sh setup-server.sh"
