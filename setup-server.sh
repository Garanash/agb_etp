#!/bin/bash

# 🏢 Алмазгеобур ЭТП - Подготовка сервера
# Автоматическая установка всей инфраструктуры на сервере
# Версия: 1.0.0

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

# Проверка прав root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Этот скрипт должен запускаться с правами root"
        print_info "Используйте: sudo ./setup-server.sh"
        exit 1
    fi
}

# Настройка PATH
setup_path() {
    print_step "Настройка PATH..."
    
    # Добавляем стандартные пути для Docker
    export PATH="/usr/bin:/usr/local/bin:/snap/bin:$PATH"
    
    # Проверяем, есть ли Docker в системе
    if [ -f /usr/bin/docker ] || [ -f /usr/local/bin/docker ] || [ -f /snap/bin/docker ]; then
        print_info "Docker найден в системе"
    else
        print_info "Docker не найден, будет установлен"
    fi
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

# Обновление системы
update_system() {
    print_header "Обновление системы"
    
    case $OS in
        "Ubuntu"|"Debian GNU/Linux")
            print_step "Обновление пакетов Ubuntu/Debian..."
            apt update -y
            apt upgrade -y
            apt install -y curl wget git nano htop unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
            print_success "Система обновлена"
            ;;
        "CentOS Linux"|"Red Hat Enterprise Linux")
            print_step "Обновление пакетов CentOS/RHEL..."
            yum update -y
            yum install -y curl wget git nano htop unzip yum-utils device-mapper-persistent-data lvm2
            print_success "Система обновлена"
            ;;
        *)
            print_warning "Неподдерживаемая ОС: $OS"
            print_info "Попробуйте установить Docker вручную"
            ;;
    esac
}

# Установка Docker
install_docker() {
    print_header "Установка Docker"
    
    # Проверка существующей установки
    if command -v docker &> /dev/null; then
        print_warning "Docker уже установлен"
        docker --version
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
            docker --version
            return
        fi
    fi
    
    case $OS in
        "Ubuntu"|"Debian GNU/Linux")
            print_step "Установка Docker на Ubuntu/Debian..."
            
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
    esac
    
    # Запуск и включение Docker
    systemctl start docker
    systemctl enable docker
    
    # Добавление пользователя в группу docker
    usermod -aG docker $SUDO_USER
    
    # Обновляем PATH для текущей сессии
    export PATH="/usr/bin:/usr/local/bin:/snap/bin:$PATH"
    
    # Проверяем, что Docker работает
    sleep 2
    if docker --version >/dev/null 2>&1; then
        print_success "Docker настроен и запущен"
        docker --version
    else
        print_warning "Docker установлен, но требует перезагрузки сессии"
        print_info "Выполните: source ~/.bashrc или перезайдите в систему"
    fi
}

# Установка Docker Compose
install_docker_compose() {
    print_header "Установка Docker Compose"
    
    # Проверка существующей установки
    if command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose уже установлен"
        docker-compose --version
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

# Настройка файрвола
setup_firewall() {
    print_header "Настройка файрвола"
    
    # UFW (Ubuntu/Debian)
    if command -v ufw &> /dev/null; then
        print_step "Настройка UFW..."
        ufw --force enable
        ufw allow 22/tcp    # SSH
        ufw allow 80/tcp    # HTTP
        ufw allow 443/tcp   # HTTPS
        ufw allow 8000/tcp  # Backend API (для разработки)
        ufw allow 3000/tcp  # Frontend (для разработки)
        print_success "UFW настроен"
    fi
    
    # firewalld (CentOS/RHEL)
    if command -v firewall-cmd &> /dev/null; then
        print_step "Настройка firewalld..."
        systemctl start firewalld
        systemctl enable firewalld
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --permanent --add-port=8000/tcp
        firewall-cmd --permanent --add-port=3000/tcp
        firewall-cmd --reload
        print_success "firewalld настроен"
    fi
    
    # iptables (универсальный)
    if command -v iptables &> /dev/null; then
        print_step "Настройка iptables..."
        iptables -A INPUT -p tcp --dport 22 -j ACCEPT
        iptables -A INPUT -p tcp --dport 80 -j ACCEPT
        iptables -A INPUT -p tcp --dport 443 -j ACCEPT
        iptables -A INPUT -p tcp --dport 8000 -j ACCEPT
        iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
        iptables -A INPUT -j DROP
        print_success "iptables настроен"
    fi
}

# Установка дополнительных инструментов
install_tools() {
    print_header "Установка дополнительных инструментов"
    
    case $OS in
        "Ubuntu"|"Debian GNU/Linux")
            print_step "Установка инструментов на Ubuntu/Debian..."
            apt install -y \
                htop \
                tree \
                vim \
                nano \
                curl \
                wget \
                git \
                unzip \
                zip \
                jq \
                net-tools \
                dnsutils \
                telnet \
                nc \
                tcpdump \
                strace \
                lsof \
                ps aux
            ;;
        "CentOS Linux"|"Red Hat Enterprise Linux")
            print_step "Установка инструментов на CentOS/RHEL..."
            yum install -y \
                htop \
                tree \
                vim \
                nano \
                curl \
                wget \
                git \
                unzip \
                zip \
                jq \
                net-tools \
                bind-utils \
                telnet \
                nc \
                tcpdump \
                strace \
                lsof \
                procps-ng
            ;;
    esac
    
    print_success "Дополнительные инструменты установлены"
}

# Настройка мониторинга
setup_monitoring() {
    print_header "Настройка мониторинга"
    
    # Создание скрипта мониторинга системы
    cat > /usr/local/bin/system-monitor.sh << 'EOF'
#!/bin/bash
# Скрипт мониторинга системы

echo "=== СИСТЕМНЫЙ МОНИТОРИНГ $(date) ==="
echo

# Использование CPU
echo "CPU:"
top -bn1 | grep "Cpu(s)" | awk '{print "  Использование: " $2}'
echo

# Использование памяти
echo "ПАМЯТЬ:"
free -h | grep -E "Mem|Swap"
echo

# Использование диска
echo "ДИСК:"
df -h | grep -E "/$|/var|/tmp"
echo

# Сетевые соединения
echo "СЕТЬ:"
ss -tuln | grep -E ":80|:443|:8000|:3000|:5432"
echo

# Docker контейнеры
echo "DOCKER:"
if command -v docker &> /dev/null; then
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo "  Docker не установлен"
fi
echo

# Загрузка системы
echo "ЗАГРУЗКА:"
uptime
echo
EOF
    
    chmod +x /usr/local/bin/system-monitor.sh
    
    # Создание скрипта мониторинга приложения
    cat > /usr/local/bin/app-monitor.sh << 'EOF'
#!/bin/bash
# Скрипт мониторинга приложения

cd /opt/agb_etp 2>/dev/null || cd /home/$USER/agb_etp 2>/dev/null || {
    echo "Директория проекта не найдена"
    exit 1
}

echo "=== МОНИТОРИНГ ПРИЛОЖЕНИЯ $(date) ==="
echo

# Проверка статуса контейнеров
echo "СТАТУС КОНТЕЙНЕРОВ:"
if [ -f "docker-compose.yml" ]; then
    docker-compose ps
elif [ -f "docker-compose.prod.yml" ]; then
    docker-compose -f docker-compose.prod.yml ps
else
    echo "  Файл docker-compose не найден"
fi
echo

# Проверка здоровья сервисов
echo "ПРОВЕРКА ЗДОРОВЬЯ:"
if curl -s http://localhost:8000/health >/dev/null 2>&1; then
    echo "  ✅ Backend API: OK"
else
    echo "  ❌ Backend API: ОШИБКА"
fi

if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "  ✅ Frontend: OK"
else
    echo "  ❌ Frontend: ОШИБКА"
fi

if curl -s http://localhost/health >/dev/null 2>&1; then
    echo "  ✅ Nginx: OK"
else
    echo "  ❌ Nginx: ОШИБКА"
fi
echo

# Использование ресурсов Docker
echo "РЕСУРСЫ DOCKER:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
echo

# Логи ошибок
echo "ПОСЛЕДНИЕ ОШИБКИ:"
if [ -d "logs" ]; then
    find logs/ -name "*.log" -type f -exec tail -5 {} \; 2>/dev/null | grep -i error | tail -10
else
    echo "  Директория логов не найдена"
fi
EOF
    
    chmod +x /usr/local/bin/app-monitor.sh
    
    # Настройка cron для мониторинга
    (crontab -l 2>/dev/null; echo "# Мониторинг системы каждые 5 минут") | crontab -
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/system-monitor.sh >> /var/log/system-monitor.log 2>&1") | crontab -
    (crontab -l 2>/dev/null; echo "# Мониторинг приложения каждые 10 минут") | crontab -
    (crontab -l 2>/dev/null; echo "*/10 * * * * /usr/local/bin/app-monitor.sh >> /var/log/app-monitor.log 2>&1") | crontab -
    
    print_success "Мониторинг настроен"
}

# Настройка логирования
setup_logging() {
    print_header "Настройка логирования"
    
    # Создание директорий для логов
    mkdir -p /var/log/agb_etp/{nginx,backend,frontend,postgres}
    chown -R $SUDO_USER:$SUDO_USER /var/log/agb_etp/
    
    # Настройка logrotate
    cat > /etc/logrotate.d/agb_etp << 'EOF'
/var/log/agb_etp/*/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f /opt/agb_etp/docker-compose.prod.yml restart nginx 2>/dev/null || true
    endscript
}

/var/log/system-monitor.log
/var/log/app-monitor.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF
    
    print_success "Логирование настроено"
}

# Настройка резервного копирования
setup_backup() {
    print_header "Настройка резервного копирования"
    
    # Создание скрипта резервного копирования
    cat > /usr/local/bin/agb-backup.sh << 'EOF'
#!/bin/bash
# Скрипт резервного копирования

BACKUP_DIR="/opt/backups/agb_etp"
DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_DIR="/opt/agb_etp"

# Создание директории для бэкапов
mkdir -p $BACKUP_DIR

echo "=== РЕЗЕРВНОЕ КОПИРОВАНИЕ $(date) ==="

# Бэкап базы данных
echo "Создание бэкапа базы данных..."
if docker ps | grep -q agb_etp_postgres; then
    docker exec agb_etp_postgres_prod pg_dump -U agb_etp agb_etp > $BACKUP_DIR/database_$DATE.sql
    echo "✅ База данных: $BACKUP_DIR/database_$DATE.sql"
else
    echo "❌ Контейнер базы данных не запущен"
fi

# Бэкап загруженных файлов
echo "Создание бэкапа файлов..."
if [ -d "$PROJECT_DIR/backend/uploads" ]; then
    tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C $PROJECT_DIR backend/uploads
    echo "✅ Файлы: $BACKUP_DIR/uploads_$DATE.tar.gz"
else
    echo "❌ Директория uploads не найдена"
fi

# Бэкап конфигурации
echo "Создание бэкапа конфигурации..."
tar -czf $BACKUP_DIR/config_$DATE.tar.gz -C $PROJECT_DIR .env docker-compose*.yml nginx/
echo "✅ Конфигурация: $BACKUP_DIR/config_$DATE.tar.gz"

# Очистка старых бэкапов (старше 30 дней)
echo "Очистка старых бэкапов..."
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "✅ Резервное копирование завершено"
EOF
    
    chmod +x /usr/local/bin/agb-backup.sh
    
    # Настройка cron для бэкапов
    (crontab -l 2>/dev/null; echo "# Резервное копирование ежедневно в 2:00") | crontab -
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/agb-backup.sh >> /var/log/backup.log 2>&1") | crontab -
    
    print_success "Резервное копирование настроено"
}

# Создание пользователя для приложения
create_app_user() {
    print_header "Создание пользователя приложения"
    
    # Проверка существования пользователя
    if id "agb_user" &>/dev/null; then
        print_warning "Пользователь agb_user уже существует"
    else
        print_step "Создание пользователя agb_user..."
        useradd -m -s /bin/bash agb_user
        usermod -aG docker agb_user
        print_success "Пользователь agb_user создан"
    fi
}

# Создание директорий проекта
create_directories() {
    print_header "Создание директорий проекта"
    
    # Основная директория проекта
    mkdir -p /opt/agb_etp
    chown agb_user:agb_user /opt/agb_etp
    
    # Директории для логов
    mkdir -p /opt/agb_etp/logs/{nginx,backend,frontend,postgres}
    chown -R agb_user:agb_user /opt/agb_etp/logs
    
    # Директории для бэкапов
    mkdir -p /opt/backups/agb_etp
    chown -R agb_user:agb_user /opt/backups/agb_etp
    
    # Директории для SSL
    mkdir -p /opt/agb_etp/ssl
    chown agb_user:agb_user /opt/agb_etp/ssl
    
    print_success "Директории созданы"
}

# Настройка SSH (опционально)
setup_ssh() {
    print_header "Настройка SSH"
    
    # Создание SSH ключей для пользователя agb_user
    if [ ! -f /home/agb_user/.ssh/id_rsa ]; then
        print_step "Создание SSH ключей для agb_user..."
        sudo -u agb_user ssh-keygen -t rsa -b 4096 -f /home/agb_user/.ssh/id_rsa -N ""
        print_success "SSH ключи созданы"
    else
        print_warning "SSH ключи уже существуют"
    fi
    
    # Настройка SSH конфигурации
    cat > /etc/ssh/sshd_config.d/agb_etp.conf << 'EOF'
# Настройки SSH для Алмазгеобур ЭТП
PermitRootLogin no
PasswordAuthentication yes
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
ClientAliveInterval 300
ClientAliveCountMax 2
MaxAuthTries 3
EOF
    
    systemctl reload sshd
    print_success "SSH настроен"
}

# Финальная проверка
final_check() {
    print_header "Финальная проверка"
    
    echo "=== ПРОВЕРКА УСТАНОВКИ ==="
    echo
    
    # Проверка Docker
    export PATH="/usr/bin:/usr/local/bin:/snap/bin:$PATH"
    if command -v docker &> /dev/null; then
        print_success "Docker: $(docker --version)"
    elif [ -f /usr/bin/docker ] || [ -f /usr/local/bin/docker ] || [ -f /snap/bin/docker ]; then
        print_warning "Docker установлен, но не в PATH"
        print_info "Выполните: export PATH=\"/usr/bin:/usr/local/bin:/snap/bin:\$PATH\""
    else
        print_error "Docker не установлен"
    fi
    
    # Проверка Docker Compose
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose: $(docker-compose --version)"
    else
        print_error "Docker Compose не установлен"
    fi
    
    # Проверка сервисов
    if systemctl is-active --quiet docker; then
        print_success "Docker сервис: запущен"
    else
        print_error "Docker сервис: не запущен"
    fi
    
    # Проверка пользователя
    if id "agb_user" &>/dev/null; then
        print_success "Пользователь agb_user: создан"
    else
        print_error "Пользователь agb_user: не создан"
    fi
    
    # Проверка директорий
    if [ -d "/opt/agb_etp" ]; then
        print_success "Директория проекта: создана"
    else
        print_error "Директория проекта: не создана"
    fi
    
    echo
    print_info "Проверка завершена"
}

# Показать информацию о следующих шагах
show_next_steps() {
    print_header "Следующие шаги"
    
    echo "🎉 Подготовка сервера завершена!"
    echo
    echo "📋 Что было установлено:"
    echo "  ✅ Обновлена система"
    echo "  ✅ Установлен Docker и Docker Compose"
    echo "  ✅ Настроен файрвол"
    echo "  ✅ Установлены дополнительные инструменты"
    echo "  ✅ Настроен мониторинг"
    echo "  ✅ Настроено логирование"
    echo "  ✅ Настроено резервное копирование"
    echo "  ✅ Создан пользователь agb_user"
    echo "  ✅ Созданы необходимые директории"
    echo
    echo "🚀 Для деплоя приложения:"
    echo "  1. Переключитесь на пользователя agb_user:"
    echo "     sudo su - agb_user"
    echo
    echo "  2. Склонируйте репозиторий:"
    echo "     cd /opt/agb_etp"
    echo "     git clone <repository-url> ."
    echo
    echo "  3. Настройте конфигурацию:"
    echo "     cp env.example .env"
    echo "     nano .env"
    echo
    echo "  4. Запустите приложение:"
    echo "     ./deploy-prod.sh"
    echo
    echo "🔧 Если Docker не найден в PATH:"
    echo "     ./fix-docker-path.sh"
    echo
    echo "🔧 Полезные команды:"
    echo "  system-monitor.sh    - мониторинг системы"
    echo "  app-monitor.sh       - мониторинг приложения"
    echo "  agb-backup.sh        - резервное копирование"
    echo
    echo "📊 Логи:"
    echo "  /var/log/system-monitor.log"
    echo "  /var/log/app-monitor.log"
    echo "  /var/log/backup.log"
    echo
    echo "📁 Директории:"
    echo "  /opt/agb_etp         - проект"
    echo "  /opt/backups/agb_etp - бэкапы"
    echo "  /var/log/agb_etp     - логи приложения"
    echo
}

# Основная функция
main() {
    print_header "Алмазгеобур ЭТП - Подготовка сервера"
    echo "Автоматическая установка всей инфраструктуры"
    echo
    
    check_root
    setup_path
    detect_os
    update_system
    install_docker
    install_docker_compose
    setup_firewall
    install_tools
    setup_monitoring
    setup_logging
    setup_backup
    create_app_user
    create_directories
    setup_ssh
    final_check
    show_next_steps
}

# Запуск
main "$@"
