#!/bin/bash

# 🏢 Алмазгеобур ЭТП - Единый скрипт деплоя
# Объединяет подготовку сервера, исправление Docker и деплой приложения
# Версия: 2.0.0

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Функции для вывода
print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}🏢 $1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

print_step() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

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

# Определение операционной системы
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VERSION=$VERSION_ID
    else
        print_error "Не удалось определить операционную систему"
        exit 1
    fi
    
    print_info "Обнаружена ОС: $OS $VERSION"
}

# Настройка PATH
setup_path() {
    print_step "Настройка PATH..."
    export PATH="/usr/bin:/usr/local/bin:/snap/bin:$PATH"
}

# Проверка и установка Docker
install_docker() {
    print_header "Проверка и установка Docker"
    
    # Проверка существующей установки
    if command -v docker &> /dev/null; then
        print_warning "Docker уже установлен"
        docker --version 2>/dev/null || print_warning "Docker найден, но не отвечает"
        return
    fi
    
    # Проверка, установлен ли Docker, но не в PATH
    DOCKER_PATHS="/usr/bin/docker /usr/local/bin/docker /snap/bin/docker"
    DOCKER_FOUND=""
    
    for path in $DOCKER_PATHS; do
        if [ -f "$path" ]; then
            DOCKER_FOUND="$path"
            break
        fi
    done
    
    if [ -n "$DOCKER_FOUND" ]; then
        print_warning "Docker установлен, но не в PATH. Добавляю в PATH..."
        export PATH="$(dirname $DOCKER_FOUND):$PATH"
        if command -v docker &> /dev/null; then
            print_success "Docker найден в PATH"
            docker --version 2>/dev/null || print_warning "Docker найден, но не отвечает"
            return
        fi
    fi
    
    # Установка Docker
    case $OS in
        "Ubuntu"|"Debian GNU/Linux")
            print_step "Установка Docker на Ubuntu/Debian..."
            
            # Обновление системы
            apt update -y
            apt install -y curl wget git nano htop unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
            
            # Удаление старых версий
            apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
            
            # Установка зависимостей
            apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
            
            # Добавление GPG ключа Docker
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
            
            # Добавление репозитория Docker
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            # Обновление пакетов и установка Docker
            apt update -y
            apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            
            print_success "Docker установлен"
            ;;
        "CentOS Linux"|"Red Hat Enterprise Linux")
            print_step "Установка Docker на CentOS/RHEL..."
            
            # Установка зависимостей
            yum install -y yum-utils device-mapper-persistent-data lvm2
            
            # Добавление репозитория Docker
            yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            
            # Установка Docker
            yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            
            print_success "Docker установлен"
            ;;
        *)
            print_warning "Неподдерживаемая ОС: $OS"
            print_info "Попробуйте установить Docker вручную"
            ;;
    esac
    
    # Запуск и включение Docker
    systemctl start docker
    systemctl enable docker
    
    # Добавление пользователя в группу docker (если не root)
    if [ "$EUID" -ne 0 ]; then
        sudo usermod -aG docker $USER
    fi
    
    # Обновляем PATH для текущей сессии
    export PATH="/usr/bin:/usr/local/bin:/snap/bin:$PATH"
    
    # Проверяем, что Docker работает
    sleep 2
    if docker --version >/dev/null 2>&1; then
        print_success "Docker настроен и запущен"
        docker --version 2>/dev/null || print_warning "Docker найден, но не отвечает"
    else
        print_warning "Docker установлен, но требует обновления PATH"
    fi
}

# Установка Docker Compose
install_docker_compose() {
    print_header "Установка Docker Compose"
    
    # Проверка существующей установки
    if command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose уже установлен"
        docker-compose --version 2>/dev/null || print_warning "Docker Compose найден, но не отвечает"
        return
    fi
    
    print_step "Скачивание Docker Compose..."
    
    # Определение архитектуры
    ARCH=$(uname -m)
    case $ARCH in
        x86_64) ARCH="x86_64" ;;
        aarch64) ARCH="aarch64" ;;
        armv7l) ARCH="armv7" ;;
        *) print_error "Неподдерживаемая архитектура: $ARCH"; exit 1 ;;
    esac
    
    # Скачивание последней версии
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -Po '"tag_name": "\K.*?(?=")')
    curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-${ARCH}" -o /usr/local/bin/docker-compose
    
    # Установка прав
    chmod +x /usr/local/bin/docker-compose
    
    # Создание символической ссылки
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    print_success "Docker Compose установлен (версия $COMPOSE_VERSION)"
}

# Проверка файла окружения
check_env() {
    print_message "Проверка конфигурации..."
    
    if [ ! -f ".env" ]; then
        print_warning "Файл .env не найден. Создаю из примера..."
        if [ -f "env.example" ]; then
            cp env.example .env
            print_success "Файл .env создан из примера"
            print_warning "Отредактируйте файл .env перед запуском в продакшене!"
        else
            print_error "Файл env.example не найден. Создайте файл .env вручную."
            exit 1
        fi
    else
        print_success "Файл .env найден"
    fi
}

# Создание необходимых директорий
create_directories() {
    print_message "Создание директорий..."
    
    mkdir -p logs/{nginx,backend,frontend}
    mkdir -p backups
    mkdir -p ssl
    mkdir -p nginx/conf.d
    
    # Установка прав
    chown -R 1000:1000 logs/ 2>/dev/null || true
    chmod -R 755 logs/
    
    print_success "Директории созданы"
}

# Проверка SSL сертификатов
check_ssl() {
    print_message "Проверка SSL сертификатов..."
    
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        print_warning "SSL сертификаты не найдены"
        print_message "Создаю самоподписанные сертификаты для тестирования..."
        
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=RU/ST=Moscow/L=Moscow/O=Almazgeobur/OU=IT/CN=localhost"
        
        print_warning "ВНИМАНИЕ: Используются самоподписанные сертификаты!"
        print_warning "Для продакшена замените их на валидные SSL сертификаты"
    else
        print_success "SSL сертификаты найдены"
    fi
}

# Остановка существующих контейнеров
stop_containers() {
    print_message "Остановка существующих контейнеров..."
    docker-compose down 2>/dev/null || true
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    print_success "Контейнеры остановлены"
}

# Очистка системы (опционально)
cleanup() {
    if [ "$1" = "--clean" ]; then
        print_message "Очистка Docker системы..."
        docker system prune -f
        docker volume prune -f
        print_success "Очистка завершена"
    fi
}

# Сборка образов
build_images() {
    local compose_file="docker-compose.yml"
    if [ "$1" = "prod" ]; then
        compose_file="docker-compose.prod.yml"
    fi
    
    print_message "Сборка Docker образов..."
    docker-compose -f $compose_file build --no-cache
    print_success "Образы собраны"
}

# Запуск сервисов
start_services() {
    local compose_file="docker-compose.yml"
    if [ "$1" = "prod" ]; then
        compose_file="docker-compose.prod.yml"
    fi
    
    print_message "Запуск сервисов..."
    docker-compose -f $compose_file up -d
    
    print_message "Ожидание запуска сервисов..."
    sleep 10
    
    # Проверка статуса контейнеров
    print_message "Проверка статуса контейнеров..."
    docker-compose -f $compose_file ps
}

# Проверка здоровья сервисов
check_health() {
    local compose_file="docker-compose.yml"
    local backend_port="8000"
    local frontend_port="3000"
    
    if [ "$1" = "prod" ]; then
        compose_file="docker-compose.prod.yml"
        backend_port="8000"
        frontend_port="3000"
    fi
    
    print_message "Проверка здоровья сервисов..."
    
    # Проверка базы данных
    print_message "Проверка базы данных..."
    for i in {1..30}; do
        if docker exec agb_etp_postgres pg_isready -U agb_etp >/dev/null 2>&1; then
            print_success "База данных готова"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "База данных не запустилась за 30 секунд"
            return 1
        fi
        sleep 1
    done
    
    # Проверка backend
    print_message "Проверка backend API..."
    for i in {1..30}; do
        if curl -s http://localhost:$backend_port/health >/dev/null 2>&1; then
            print_success "Backend API готов"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Backend API не запустился за 30 секунд"
            return 1
        fi
        sleep 1
    done
    
    # Проверка frontend
    print_message "Проверка frontend..."
    for i in {1..30}; do
        if curl -s http://localhost:$frontend_port >/dev/null 2>&1; then
            print_success "Frontend готов"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Frontend не запустился за 30 секунд"
            return 1
        fi
        sleep 1
    done
}

# Инициализация базы данных
init_database() {
    print_message "Инициализация базы данных..."
    
    # Создание таблиц
    docker exec agb_etp_backend python -c "
import sys
sys.path.append('/app')
from database import engine
from models import Base
Base.metadata.create_all(bind=engine)
print('Таблицы созданы')
" 2>/dev/null || print_warning "Таблицы уже существуют"
    
    # Создание тестовых данных
    docker exec agb_etp_backend python -c "
import sys
sys.path.append('/app')
from create_test_users import create_test_users
from create_test_tenders import create_test_tenders
from create_test_supplier_proposals import create_test_supplier_proposals
try:
    create_test_users()
    create_test_tenders()
    create_test_supplier_proposals()
    print('Тестовые данные созданы')
except Exception as e:
    print(f'Тестовые данные уже существуют: {e}')
" 2>/dev/null || print_warning "Тестовые данные уже существуют"
    
    print_success "База данных инициализирована"
}

# Настройка файрвола
setup_firewall() {
    print_message "Настройка файрвола..."
    
    # UFW (Ubuntu)
    if command -v ufw &> /dev/null; then
        ufw --force enable
        ufw allow 22/tcp    # SSH
        ufw allow 80/tcp    # HTTP
        ufw allow 443/tcp   # HTTPS
        ufw allow 8000/tcp  # Backend API (для разработки)
        ufw allow 3000/tcp  # Frontend (для разработки)
        print_success "UFW настроен"
    fi
    
    # iptables (CentOS/RHEL)
    if command -v iptables &> /dev/null; then
        iptables -A INPUT -p tcp --dport 22 -j ACCEPT
        iptables -A INPUT -p tcp --dport 80 -j ACCEPT
        iptables -A INPUT -p tcp --dport 443 -j ACCEPT
        iptables -A INPUT -p tcp --dport 8000 -j ACCEPT
        iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
        iptables -A INPUT -j DROP
        print_success "iptables настроен"
    fi
}

# Показать информацию о доступе
show_access_info() {
    local mode=$1
    echo ""
    echo "🎉 Деплой завершен успешно!"
    echo ""
    
    if [ "$mode" = "prod" ]; then
    echo "📱 Доступ к приложению (Production):"
    echo "   HTTP: http://$(hostname -I | awk '{print $1}')"
    echo "   HTTPS: https://$(hostname -I | awk '{print $1}')"
    echo "   API: http://$(hostname -I | awk '{print $1}')/api/"
    echo "   API Docs (Swagger): http://$(hostname -I | awk '{print $1}')/api/ololo/docs"
    echo "   API Docs (ReDoc): http://$(hostname -I | awk '{print $1}')/api/ololo/redoc"
    else
        echo "📱 Доступ к приложению (Development):"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend API: http://localhost:8000"
        echo "   API Docs (Swagger): http://localhost:8000/docs"
        echo "   API Docs (ReDoc): http://localhost:8000/redoc"
    fi
    
    echo ""
    echo "👤 Тестовые пользователи:"
    echo "   Админ: admin@almazgeobur.ru / password"
    echo "   Поставщик: newuser@example.com / password123"
    echo ""
    echo "🔧 Управление:"
    if [ "$mode" = "prod" ]; then
        echo "   Остановить: docker-compose -f docker-compose.prod.yml down"
        echo "   Логи: docker-compose -f docker-compose.prod.yml logs -f"
        echo "   Статус: docker-compose -f docker-compose.prod.yml ps"
    else
        echo "   Остановить: docker-compose down"
        echo "   Логи: docker-compose logs -f"
        echo "   Статус: docker-compose ps"
    fi
    echo ""
}

# Показать помощь
show_help() {
    echo "🏢 Алмазгеобур ЭТП - Единый скрипт деплоя"
    echo ""
    echo "Использование:"
    echo "  ./deploy.sh [опции]"
    echo ""
    echo "Опции:"
    echo "  --dev        Деплой в режиме разработки (по умолчанию)"
    echo "  --prod       Деплой в продакшен режиме"
    echo "  --setup      Только подготовка сервера (установка Docker)"
    echo "  --clean      Очистить Docker систему перед деплоем"
    echo "  --stop       Остановить все сервисы"
    echo "  --restart    Перезапустить сервисы"
    echo "  --logs       Показать логи"
    echo "  --status     Показать статус сервисов"
    echo "  --help       Показать эту справку"
    echo ""
    echo "Примеры:"
    echo "  ./deploy.sh              # Деплой в режиме разработки"
    echo "  ./deploy.sh --prod       # Деплой в продакшен режиме"
    echo "  ./deploy.sh --setup      # Только подготовка сервера"
    echo "  ./deploy.sh --clean      # Деплой с очисткой"
    echo "  ./deploy.sh --stop       # Остановить сервисы"
    echo "  ./deploy.sh --restart    # Перезапустить"
    echo ""
}

# Обработка аргументов командной строки
MODE="dev"
CLEAN=""

case "${1:-}" in
    --help)
        show_help
        exit 0
        ;;
    --prod)
        MODE="prod"
        ;;
    --dev)
        MODE="dev"
        ;;
    --setup)
        MODE="setup"
        ;;
    --clean)
        CLEAN="--clean"
        ;;
    --stop)
        print_message "Остановка сервисов..."
        docker-compose down 2>/dev/null || true
        docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
        print_success "Сервисы остановлены"
        exit 0
        ;;
    --restart)
        print_message "Перезапуск сервисов..."
        docker-compose restart 2>/dev/null || true
        docker-compose -f docker-compose.prod.yml restart 2>/dev/null || true
        print_success "Сервисы перезапущены"
        exit 0
        ;;
    --logs)
        print_message "Показ логов..."
        if [ -f "docker-compose.prod.yml" ] && docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
            docker-compose -f docker-compose.prod.yml logs -f
        else
            docker-compose logs -f
        fi
        exit 0
        ;;
    --status)
        print_message "Статус сервисов..."
        if [ -f "docker-compose.prod.yml" ] && docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
            docker-compose -f docker-compose.prod.yml ps
        else
            docker-compose ps
        fi
        exit 0
        ;;
    "")
        # Обычный деплой в режиме разработки
        ;;
    *)
        print_error "Неизвестная опция: $1"
        show_help
        exit 1
        ;;
esac

# Основной процесс деплоя
main() {
    echo "🏢 Алмазгеобур ЭТП - Единый скрипт деплоя"
    echo "========================================"
    echo ""
    
    detect_os
    setup_path
    
    if [ "$MODE" = "setup" ]; then
        install_docker
        install_docker_compose
        setup_firewall
        print_success "Подготовка сервера завершена!"
        exit 0
    fi
    
    # Проверка Docker
    if ! command -v docker &> /dev/null; then
        print_warning "Docker не найден, устанавливаю..."
        install_docker
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose не найден, устанавливаю..."
        install_docker_compose
    fi
    
    check_env
    create_directories
    check_ssl
    stop_containers
    cleanup "$CLEAN"
    build_images "$MODE"
    start_services "$MODE"
    check_health "$MODE"
    init_database
    setup_firewall
    show_access_info "$MODE"
}

# Запуск основного процесса
main "$@"