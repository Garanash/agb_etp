# 🔧 Исправление проблемы с Docker PATH

## 🚨 Проблема
```
⚠️  Docker уже установлен
setup-server.sh: 100: docker: not found
```

## ✅ Решение

### Вариант 1: Автоматическое исправление
```bash
# Полное исправление (рекомендуется)
sh fix-docker-path.sh

# Или быстрое исправление
sh quick-fix-docker.sh
```

### Вариант 2: Ручное исправление
```bash
# Добавьте Docker в PATH
export PATH="/usr/bin:/usr/local/bin:/snap/bin:$PATH"

# Проверьте, что Docker работает
docker --version

# Если не работает, найдите Docker
which docker
# или
find /usr -name "docker" 2>/dev/null
```

### Вариант 3: Постоянное исправление
```bash
# Добавьте в ~/.bashrc
echo 'export PATH="/usr/bin:/usr/local/bin:/snap/bin:$PATH"' >> ~/.bashrc

# Перезагрузите профиль
source ~/.bashrc
```

## 🔍 Диагностика

### Проверка установки Docker
```bash
# Проверьте, установлен ли Docker
ls -la /usr/bin/docker
ls -la /usr/local/bin/docker
ls -la /snap/bin/docker

# Проверьте статус сервиса
systemctl status docker

# Запустите сервис, если не запущен
sudo systemctl start docker
```

### Проверка PATH
```bash
# Посмотрите текущий PATH
echo $PATH

# Проверьте, где находится Docker
which docker
whereis docker
```

## 🚀 После исправления

### Проверьте работу Docker
```bash
docker --version
docker ps
```

### Запустите приложение
```bash
# Если все работает, запустите деплой
./deploy.sh
```

## 📞 Если ничего не помогает

1. **Переустановите Docker**:
   ```bash
   sudo apt remove docker docker-engine docker.io containerd runc
   sudo apt update
   sudo apt install docker.io
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

2. **Проверьте права пользователя**:
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **Перезагрузите систему**:
   ```bash
   sudo reboot
   ```

---

**Готово!** После исправления Docker должен работать корректно! 🎉
