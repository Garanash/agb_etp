#!/bin/bash

# 🔍 Диагностика Docker на сервере
# Помогает найти и исправить проблемы с Docker

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

print_header() {
    echo -e "${CYAN}================================"
    echo -e "$1"
    echo -e "================================${NC}"
}

echo "🔍 Диагностика Docker на сервере"
print_header "Проверка системы"

# Информация о системе
echo "ОС: $(lsb_release -d 2>/dev/null | cut -f2 || uname -s)"
echo "Архитектура: $(uname -m)"
echo "Пользователь: $(whoami)"
echo "PATH: $PATH"
echo ""

print_header "Поиск Docker в системе"

# Ищем все возможные места установки Docker
DOCKER_LOCATIONS=(
    "/usr/bin/docker"
    "/usr/local/bin/docker"
    "/snap/bin/docker"
    "/usr/lib/docker/docker"
    "/opt/docker/docker"
    "/var/lib/docker/docker"
)

DOCKER_FOUND=""
for location in "${DOCKER_LOCATIONS[@]}"; do
    if [ -f "$location" ]; then
        print_success "Docker найден: $location"
        DOCKER_FOUND="$location"
        ls -la "$location"
        echo "Размер: $(du -h "$location" | cut -f1)"
        echo "Права: $(stat -c "%a %U:%G" "$location" 2>/dev/null || stat -f "%A %Su:%Sg" "$location" 2>/dev/null)"
        echo ""
    fi
done

if [ -z "$DOCKER_FOUND" ]; then
    print_error "Docker не найден в стандартных местах"
    echo "Ищем в других местах..."
    find /usr -name "docker" -type f 2>/dev/null | head -10
    find /opt -name "docker" -type f 2>/dev/null | head -10
    find /var -name "docker" -type f 2>/dev/null | head -10
fi

print_header "Проверка PATH"

echo "Текущий PATH:"
echo "$PATH" | tr ':' '\n' | nl
echo ""

# Проверяем, есть ли Docker в PATH
if command -v docker &> /dev/null; then
    print_success "Docker найден в PATH: $(which docker)"
    docker --version 2>/dev/null || print_warning "Docker найден, но не отвечает"
else
    print_warning "Docker не найден в PATH"
fi

print_header "Проверка сервисов"

# Проверяем статус Docker сервиса
if command -v systemctl &> /dev/null; then
    echo "Статус Docker сервиса:"
    systemctl status docker --no-pager -l 2>/dev/null || print_warning "Docker сервис не найден"
    echo ""
    
    echo "Активные сервисы Docker:"
    systemctl list-units --type=service | grep -i docker || print_info "Нет активных Docker сервисов"
    echo ""
else
    print_info "systemctl не найден (возможно, не systemd система)"
fi

print_header "Проверка процессов"

# Проверяем запущенные процессы Docker
echo "Процессы Docker:"
ps aux | grep -i docker | grep -v grep || print_info "Нет запущенных процессов Docker"
echo ""

print_header "Проверка портов"

# Проверяем порты Docker
echo "Слушающие порты:"
netstat -tlnp 2>/dev/null | grep -E ":(2375|2376|2377|2378|2379|2380)" || print_info "Docker порты не найдены"
echo ""

print_header "Проверка групп пользователей"

# Проверяем группы пользователя
echo "Группы текущего пользователя:"
groups
echo ""

if groups | grep -q docker; then
    print_success "Пользователь в группе docker"
else
    print_warning "Пользователь НЕ в группе docker"
    print_info "Выполните: sudo usermod -aG docker $USER"
fi

print_header "Проверка прав доступа"

if [ -n "$DOCKER_FOUND" ]; then
    echo "Права доступа к Docker:"
    ls -la "$DOCKER_FOUND"
    echo ""
    
    # Проверяем, можем ли мы выполнить Docker
    if [ -x "$DOCKER_FOUND" ]; then
        print_success "Docker исполняемый"
    else
        print_error "Docker НЕ исполняемый"
        print_info "Выполните: chmod +x $DOCKER_FOUND"
    fi
fi

print_header "Рекомендации"

if [ -n "$DOCKER_FOUND" ]; then
    DOCKER_DIR=$(dirname "$DOCKER_FOUND")
    print_info "Docker найден в: $DOCKER_DIR"
    print_info "Добавьте в PATH: export PATH=\"$DOCKER_DIR:\$PATH\""
    print_info "Или выполните: ./fix-docker-path.sh"
else
    print_error "Docker не найден в системе"
    print_info "Установите Docker: sudo ./setup-server.sh"
fi

echo ""
print_info "Для исправления выполните:"
echo "  export PATH=\"/usr/bin:/usr/local/bin:/snap/bin:\$PATH\""
echo "  source ~/.bashrc"
echo "  ./fix-docker-path.sh"
