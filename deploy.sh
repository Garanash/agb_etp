#!/bin/bash

# 🏢 Алмазгеобур ЭТП - Скрипт автоматического деплоя
# Автор: Команда разработки
# Версия: 1.0.0

set -e  # Остановить выполнение при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
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

# Проверка наличия Docker
check_docker() {
    print_message "Проверка Docker..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker не установлен. Установите Docker и попробуйте снова."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose не установлен. Установите Docker Compose и попробуйте снова."
        exit 1
    fi
    
    print_success "Docker и Docker Compose найдены"
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

# Остановка существующих контейнеров
stop_containers() {
    print_message "Остановка существующих контейнеров..."
    docker-compose down 2>/dev/null || true
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
    print_message "Сборка Docker образов..."
    docker-compose build --no-cache
    print_success "Образы собраны"
}

# Запуск сервисов
start_services() {
    print_message "Запуск сервисов..."
    docker-compose up -d
    
    print_message "Ожидание запуска сервисов..."
    sleep 10
    
    # Проверка статуса контейнеров
    print_message "Проверка статуса контейнеров..."
    docker-compose ps
}

# Проверка здоровья сервисов
check_health() {
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
        if curl -s http://localhost:8000/health >/dev/null 2>&1; then
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
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
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

# Показать информацию о доступе
show_access_info() {
    echo ""
    echo "🎉 Деплой завершен успешно!"
    echo ""
    echo "📱 Доступ к приложению:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000"
    echo "   API Docs: http://localhost:8000/docs"
    echo ""
    echo "👤 Тестовые пользователи:"
    echo "   Админ: admin@almazgeobur.ru / password"
    echo "   Поставщик: newuser@example.com / password123"
    echo ""
    echo "🔧 Управление:"
    echo "   Остановить: docker-compose down"
    echo "   Логи: docker-compose logs -f"
    echo "   Статус: docker-compose ps"
    echo ""
}

# Показать помощь
show_help() {
    echo "🏢 Алмазгеобур ЭТП - Скрипт деплоя"
    echo ""
    echo "Использование:"
    echo "  ./deploy.sh [опции]"
    echo ""
    echo "Опции:"
    echo "  --clean     Очистить Docker систему перед деплоем"
    echo "  --help      Показать эту справку"
    echo "  --stop      Остановить все сервисы"
    echo "  --restart   Перезапустить сервисы"
    echo "  --logs      Показать логи"
    echo "  --status    Показать статус сервисов"
    echo ""
    echo "Примеры:"
    echo "  ./deploy.sh              # Обычный деплой"
    echo "  ./deploy.sh --clean      # Деплой с очисткой"
    echo "  ./deploy.sh --stop       # Остановить сервисы"
    echo "  ./deploy.sh --restart    # Перезапустить"
    echo ""
}

# Обработка аргументов командной строки
case "${1:-}" in
    --help)
        show_help
        exit 0
        ;;
    --stop)
        print_message "Остановка сервисов..."
        docker-compose down
        print_success "Сервисы остановлены"
        exit 0
        ;;
    --restart)
        print_message "Перезапуск сервисов..."
        docker-compose restart
        print_success "Сервисы перезапущены"
        exit 0
        ;;
    --logs)
        print_message "Показ логов..."
        docker-compose logs -f
        exit 0
        ;;
    --status)
        print_message "Статус сервисов..."
        docker-compose ps
        exit 0
        ;;
    --clean)
        cleanup --clean
        ;;
    "")
        # Обычный деплой
        ;;
    *)
        print_error "Неизвестная опция: $1"
        show_help
        exit 1
        ;;
esac

# Основной процесс деплоя
main() {
    echo "🏢 Алмазгеобур ЭТП - Автоматический деплой"
    echo "=========================================="
    echo ""
    
    check_docker
    check_env
    stop_containers
    cleanup "$1"
    build_images
    start_services
    check_health
    init_database
    show_access_info
}

# Запуск основного процесса
main "$@"
