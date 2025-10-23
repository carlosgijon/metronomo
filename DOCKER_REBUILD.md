# 🐳 Reconstruir con Docker

Esta guía te muestra cómo reconstruir y reiniciar la aplicación usando Docker.

## 📋 Comandos Rápidos

### Opción 1: Reconstruir TODO (recomendado tras cambios de código)

```bash
cd /home/user/metronomo/docker

# Detener todos los contenedores
docker-compose down

# Reconstruir y levantar (sin caché para asegurar cambios frescos)
docker-compose build --no-cache backend frontend
docker-compose up -d

# Ver logs para verificar
docker-compose logs -f backend frontend
```

### Opción 2: Reconstruir solo el backend

```bash
cd /home/user/metronomo/docker

# Reconstruir backend
docker-compose build --no-cache backend

# Reiniciar solo backend
docker-compose up -d backend

# Ver logs
docker-compose logs -f backend
```

### Opción 3: Reconstruir solo el frontend

```bash
cd /home/user/metronomo/docker

# Reconstruir frontend
docker-compose build --no-cache frontend

# Reiniciar solo frontend
docker-compose up -d frontend

# Ver logs
docker-compose logs -f frontend
```

### Opción 4: Reiniciar sin reconstruir (si no cambiaste código)

```bash
cd /home/user/metronomo/docker

# Reiniciar servicios
docker-compose restart backend frontend

# Ver logs
docker-compose logs -f backend frontend
```

---

## 🔧 Comandos Útiles

### Ver estado de los contenedores
```bash
docker-compose ps
```

### Ver logs en tiempo real
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend

# Últimas 100 líneas
docker-compose logs --tail=100 backend
```

### Ejecutar migración de base de datos
```bash
docker exec -i metronome-postgres psql -U metronome_user -d metronome_db < /home/user/metronomo/database/migrate-preset-schema.sql
```

### Acceder a la shell de un contenedor
```bash
# Backend
docker exec -it metronome-backend sh

# Frontend
docker exec -it metronome-frontend sh

# PostgreSQL
docker exec -it metronome-postgres psql -U metronome_user -d metronome_db
```

### Limpiar todo y empezar de cero
```bash
cd /home/user/metronomo/docker

# ADVERTENCIA: Esto borra la base de datos también
docker-compose down -v

# Reconstruir todo desde cero
docker-compose build --no-cache
docker-compose up -d
```

---

## 📊 Verificar que funciona

Después de reconstruir, verifica que todo esté corriendo:

```bash
# Verificar estado
docker-compose ps

# Deberías ver:
# metronome-backend    running    0.0.0.0:3000->3000/tcp
# metronome-frontend   running    0.0.0.0:80->80/tcp
# metronome-postgres   running    0.0.0.0:5432->5432/tcp
```

**Acceder a la aplicación:**
- Frontend: http://localhost (o el puerto configurado)
- Backend API: http://localhost:3000/api
- WebSocket: ws://localhost:3000

---

## 🚨 Troubleshooting

### El backend no inicia
```bash
# Ver logs completos
docker-compose logs backend

# Verificar que PostgreSQL está corriendo
docker-compose logs postgres

# Reiniciar backend
docker-compose restart backend
```

### El frontend no se actualiza con los cambios
```bash
# Reconstruir sin caché
docker-compose build --no-cache frontend
docker-compose up -d frontend

# Limpiar caché del navegador
# Presiona Ctrl+Shift+R en el navegador
```

### Error de conexión a la base de datos
```bash
# Verificar que PostgreSQL está saludable
docker-compose ps postgres

# Si no está healthy, reiniciar
docker-compose restart postgres

# Esperar 10-15 segundos y reiniciar backend
docker-compose restart backend
```

### Puerto ya en uso
```bash
# Ver qué proceso usa el puerto 3000
lsof -i :3000

# Detener todos los contenedores
docker-compose down

# Iniciar de nuevo
docker-compose up -d
```

---

## ⚡ Script de Reconstrucción Completa

Puedes crear un script para hacer todo de una vez:

```bash
#!/bin/bash
# rebuild.sh

cd /home/user/metronomo/docker

echo "🛑 Deteniendo contenedores..."
docker-compose down

echo "🔨 Reconstruyendo backend..."
docker-compose build --no-cache backend

echo "🔨 Reconstruyendo frontend..."
docker-compose build --no-cache frontend

echo "🚀 Iniciando servicios..."
docker-compose up -d

echo "⏳ Esperando 5 segundos..."
sleep 5

echo "📊 Estado de los servicios:"
docker-compose ps

echo "📝 Últimos logs del backend:"
docker-compose logs --tail=20 backend

echo "📝 Últimos logs del frontend:"
docker-compose logs --tail=20 frontend

echo ""
echo "✅ Reconstrucción completa!"
echo "Frontend: http://localhost"
echo "Backend: http://localhost:3000"
```

Hacer ejecutable:
```bash
chmod +x rebuild.sh
./rebuild.sh
```

---

## 🎯 Para aplicar los últimos cambios de sincronización

```bash
cd /home/user/metronomo/docker

# 1. Reconstruir ambos (backend y frontend tienen cambios)
docker-compose build --no-cache backend frontend

# 2. Reiniciar
docker-compose up -d

# 3. Verificar logs
docker-compose logs -f backend frontend

# 4. En el navegador, hacer hard refresh
# Presiona Ctrl+Shift+R
```

**Deberías ver en los logs del backend:**
```
🔌 WebSocket Gateway inicializado
Metrónomo iniciado, startTime: 1234567890200
```

**Y en la consola del navegador:**
```
⏱️ Midiendo latencia y offset de tiempo...
✅ Latencia de red: 5.50 ms
✅ Offset de tiempo: +11.20 ms
```

---

## 📦 Variables de Entorno

El archivo `docker/.env` contiene la configuración:

```bash
# Ver configuración actual
cat /home/user/metronomo/docker/.env

# Editar si es necesario
nano /home/user/metronomo/docker/.env
```

Variables importantes:
- `DB_PASSWORD`: Contraseña de PostgreSQL
- `NODE_ENV`: production/development
- `FRONTEND_PORT`: Puerto del frontend (default: 80)
- `CORS_ORIGIN`: Origen permitido para CORS

---

## ✅ Checklist Post-Reconstrucción

- [ ] `docker-compose ps` muestra todos los servicios "running"
- [ ] `docker-compose logs backend` no muestra errores
- [ ] `docker-compose logs frontend` no muestra errores
- [ ] Navegador puede acceder a http://localhost
- [ ] Backend responde en http://localhost:3000/health
- [ ] WebSocket conecta correctamente
- [ ] Consola del navegador muestra "Latencia de red" medida
- [ ] Al presionar START, logs muestran "startTime" sincronizado

Si todos los puntos están ✅, la aplicación está funcionando correctamente.
