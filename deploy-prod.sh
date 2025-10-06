#!/bin/bash

# 🏢 Алмазгеобур ЭТП - Production Deploy Script
# Скрипт для деплоя в продакшен

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_message() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
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

# Проверка прав root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Этот скрипт должен запускаться с правами root"
        print_message "Используйте: sudo ./deploy-prod.sh"
        exit 1
    fi
}

# Проверка зависимостей
check_dependencies() {
    print_message "Проверка зависимостей..."
    
    # Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker не установлен"
        print_message "Установите Docker: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
        exit 1
    fi
    
    # Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose не установлен"
        print_message "Установите Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_success "Все зависимости установлены"
}

# Создание необходимых директорий
create_directories() {
    print_message "Создание директорий..."
    
    mkdir -p logs/{nginx,backend,frontend}
    mkdir -p backups
    mkdir -p ssl
    mkdir -p nginx/conf.d
    
    # Установка прав
    chown -R 1000:1000 logs/
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

# Проверка конфигурации
check_config() {
    print_message "Проверка конфигурации..."
    
    if [ ! -f ".env" ]; then
        print_error "Файл .env не найден"
        print_message "Создайте файл .env на основе env.example"
        exit 1
    fi
    
    # Проверка обязательных переменных
    required_vars=("POSTGRES_PASSWORD" "SECRET_KEY" "NEXT_PUBLIC_API_URL")
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env || grep -q "^${var}=your_" .env; then
            print_error "Переменная $var не настроена в .env"
            print_message "Отредактируйте файл .env и установите правильные значения"
            exit 1
        fi
    done
    
    print_success "Конфигурация проверена"
}

# Остановка существующих сервисов
stop_services() {
    print_message "Остановка существующих сервисов..."
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    print_success "Сервисы остановлены"
}

# Сборка образов
build_images() {
    print_message "Сборка Docker образов для продакшена..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    print_success "Образы собраны"
}

# Запуск сервисов
start_services() {
    print_message "Запуск продакшен сервисов..."
    docker-compose -f docker-compose.prod.yml up -d
    
    print_message "Ожидание запуска сервисов..."
    sleep 30
}

# Проверка здоровья
check_health() {
    print_message "Проверка здоровья сервисов..."
    
    # Проверка базы данных
    for i in {1..30}; do
        if docker exec agb_etp_postgres_prod pg_isready -U agb_etp >/dev/null 2>&1; then
            print_success "База данных готова"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "База данных не запустилась"
            return 1
        fi
        sleep 2
    done
    
    # Проверка backend
    for i in {1..30}; do
        if curl -s http://localhost:8000/health >/dev/null 2>&1; then
            print_success "Backend готов"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Backend не запустился"
            return 1
        fi
        sleep 2
    done
    
    # Проверка frontend
    for i in {1..30}; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            print_success "Frontend готов"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Frontend не запустился"
            return 1
        fi
        sleep 2
    done
    
    # Проверка nginx
    for i in {1..30}; do
        if curl -s http://localhost/health >/dev/null 2>&1; then
            print_success "Nginx готов"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Nginx не запустился"
            return 1
        fi
        sleep 2
    done
}

# Инициализация базы данных
init_database() {
    print_message "Инициализация базы данных..."
    
    # Создание таблиц
    docker exec agb_etp_backend_prod python -c "
import sys
sys.path.append('/app')
from database import engine
from models import Base
Base.metadata.create_all(bind=engine)
print('Таблицы созданы')
" 2>/dev/null || print_warning "Таблицы уже существуют"
    
    # Создание тестовых данных (только если база пустая)
    docker exec agb_etp_backend_prod python -c "
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
        print_success "UFW настроен"
    fi
    
    # iptables (CentOS/RHEL)
    if command -v iptables &> /dev/null; then
        iptables -A INPUT -p tcp --dport 22 -j ACCEPT
        iptables -A INPUT -p tcp --dport 80 -j ACCEPT
        iptables -A INPUT -p tcp --dport 443 -j ACCEPT
        iptables -A INPUT -j DROP
        print_success "iptables настроен"
    fi
}

# Настройка мониторинга
setup_monitoring() {
    print_message "Настройка мониторинга..."
    
    # Создание скрипта мониторинга
    cat > /usr/local/bin/agb-monitor.sh << 'EOF'
#!/bin/bash
# Скрипт мониторинга сервисов

cd /opt/agb_etp

# Проверка статуса контейнеров
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "ALERT: Some containers are down!"
    # Здесь можно добавить отправку уведомлений
fi

# Проверка места на диске
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "ALERT: Disk usage is ${DISK_USAGE}%"
fi

# Проверка памяти
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM_USAGE -gt 90 ]; then
    echo "ALERT: Memory usage is ${MEM_USAGE}%"
fi
EOF
    
    chmod +x /usr/local/bin/agb-monitor.sh
    
    # Добавление в crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/agb-monitor.sh") | crontab -
    
    print_success "Мониторинг настроен"
}

# Показать информацию о доступе
show_access_info() {
    echo ""
    echo "🎉 Продакшен деплой завершен успешно!"
    echo ""
    echo "📱 Доступ к приложению:"
    echo "   HTTP: http://$(hostname -I | awk '{print $1}')"
    echo "   HTTPS: https://$(hostname -I | awk '{print $1}')"
    echo "   API: http://$(hostname -I | awk '{print $1}')/api/"
    echo "   API Docs (Swagger): http://$(hostname -I | awk '{print $1}')/docs"
    echo "   API Docs (ReDoc): http://$(hostname -I | awk '{print $1}')/redoc"
    echo ""
    echo "🔧 Управление:"
    echo "   Остановить: docker-compose -f docker-compose.prod.yml down"
    echo "   Логи: docker-compose -f docker-compose.prod.yml logs -f"
    echo "   Статус: docker-compose -f docker-compose.prod.yml ps"
    echo "   Мониторинг: /usr/local/bin/agb-monitor.sh"
    echo ""
    echo "📊 Мониторинг:"
    echo "   Логи: tail -f logs/*/access.log"
    echo "   Ресурсы: docker stats"
    echo "   Диск: df -h"
    echo ""
}

# Основной процесс
main() {
    echo "🏢 Алмазгеобур ЭТП - Production Deploy"
    echo "======================================"
    echo ""
    
    check_root
    check_dependencies
    create_directories
    check_ssl
    check_config
    stop_services
    build_images
    start_services
    check_health
    init_database
    setup_firewall
    setup_monitoring
    show_access_info
}

# Запуск
main "$@"
