# Guía de Debugging - Problemas de Conexión en Móvil

Esta guía te ayudará a resolver problemas de conexión cuando instalas la app en un dispositivo móvil.

## 🔍 Verificaciones Básicas

### 1. Verifica que el Servidor Esté Corriendo

En tu servidor (192.168.50.1), verifica que el backend está levantado:

```bash
cd /ruta/a/tu/proyecto/docker
docker-compose ps
```

Deberías ver `metronome-backend` corriendo en el puerto 3000.

### 2. Verifica la Conectividad de Red

Desde tu móvil:
1. Conéctate a la misma red Wi-Fi que el servidor
2. Abre el navegador del móvil
3. Intenta acceder a: `http://192.168.50.1:3000/api`
4. Si ves un JSON de respuesta, la conectividad funciona ✅

Si NO puedes acceder desde el navegador:
- El servidor no está en la IP correcta
- El firewall está bloqueando el puerto 3000
- No estás en la misma red

### 3. Verifica el Firewall

En el servidor, asegúrate de que el puerto 3000 esté abierto:

**Linux:**
```bash
sudo ufw status
sudo ufw allow 3000/tcp
```

**Windows:**
```cmd
netsh advfirewall firewall add rule name="Metronomo Backend" dir=in action=allow protocol=TCP localport=3000
```

**macOS:**
```bash
# El firewall normalmente permite conexiones locales
```

### 4. Verifica la IP del Servidor

En el servidor, encuentra su IP local:

**Linux/macOS:**
```bash
ip addr show | grep inet
# o
ifconfig | grep inet
```

**Windows:**
```cmd
ipconfig
```

Busca la IP que empieza con `192.168.50.x` y verifica que sea `192.168.50.1`.

## 📱 Debugging en la App

### Ver los Logs de Conexión

La app imprime información de debug en la consola. Para verla:

#### Android (Android Studio)

1. Abre Android Studio
2. Ve a `View` → `Tool Windows` → `Logcat`
3. En el filtro, busca: `chromium`
4. Busca las líneas que empiezan con:
   - `🔗 Conectando a:`
   - `📱 Plataforma:`
   - `🌐 WebSocket:`

Deberías ver algo como:
```
🔗 Conectando a: 192.168.50.1
📱 Plataforma: android
🌐 WebSocket: ws://192.168.50.1:3000
```

#### Chrome Remote Debugging (Android)

1. En tu PC, abre Chrome
2. Conecta el móvil por USB
3. En Chrome, ve a: `chrome://inspect`
4. Busca tu app en "Remote Target"
5. Clic en "inspect"
6. Ve a la pestaña Console
7. Busca los logs de conexión

### Cambiar la IP Manualmente

Si necesitas cambiar la IP del servidor, edita el archivo:

**`frontend/src/environments/environment.prod.ts`**

Busca esta línea:
```typescript
if (isNative) {
  // APP NATIVA (Android/iOS)
  return '192.168.50.1';  // ⬅️ CAMBIA ESTA IP
}
```

Cámbiala por la IP correcta de tu servidor, luego:

```bash
cd frontend
npm run build
npx cap sync
npx cap open android
```

Y recompila la app.

## 🌐 Problemas Comunes

### Error: "WebSocket connection failed"

**Causa:** El servidor no está escuchando en el puerto correcto o el firewall lo bloquea.

**Solución:**
1. Verifica que el backend esté corriendo: `docker-compose ps`
2. Verifica el puerto: `netstat -tulpn | grep 3000` (Linux)
3. Abre el puerto en el firewall

### Error: "Network request failed"

**Causa:** El móvil no puede alcanzar la IP del servidor.

**Solución:**
1. Verifica que móvil y servidor estén en la misma red Wi-Fi
2. Verifica la IP del servidor con `ipconfig` o `ip addr`
3. Haz ping desde el móvil al servidor (usa app "Network Utilities")

### Error: "CORS policy blocked"

**Causa:** El backend no acepta conexiones desde la app.

**Solución:**
En el archivo `docker/.env`, asegúrate de tener:
```env
CORS_ORIGIN=*
```

O específicamente para tu red:
```env
CORS_ORIGIN=http://192.168.50.*,capacitor://localhost,http://localhost
```

Luego reinicia el backend:
```bash
cd docker
docker-compose restart backend
```

### La app se queda en "Cargando..."

**Causa:** No puede conectar al WebSocket.

**Solución:**
1. Verifica los logs en Logcat (Android Studio)
2. Verifica que `ws://192.168.50.1:3000` sea accesible
3. Usa una app de prueba de WebSocket en el móvil para verificar

## 🧪 Herramientas de Testing

### Test desde el navegador del móvil

1. Abre el navegador en tu móvil
2. Ve a: `http://192.168.50.1:3000/api`
3. Si ves JSON, el servidor está accesible ✅

### Test de WebSocket

Usa esta herramienta web en el navegador del móvil:
- https://www.websocket.org/echo.html
- Conecta a: `ws://192.168.50.1:3000`
- Si conecta, el WebSocket funciona ✅

### App de Network Utilities (Android)

Instala "Network Utilities" desde Play Store:
1. Abre la app
2. Ve a "Ping"
3. Ping a `192.168.50.1`
4. Si responde, la red funciona ✅

## 📋 Checklist de Debugging

Marca cada item que verifiques:

- [ ] El servidor está corriendo (`docker-compose ps`)
- [ ] El puerto 3000 está abierto en el firewall
- [ ] El móvil está en la misma red Wi-Fi que el servidor
- [ ] La IP del servidor es correcta (192.168.50.1)
- [ ] Puedes hacer ping al servidor desde el móvil
- [ ] Puedes acceder a `http://192.168.50.1:3000/api` desde el navegador del móvil
- [ ] Los logs de Logcat muestran la IP correcta
- [ ] CORS está configurado correctamente en el backend
- [ ] La app está compilada en modo producción (`npm run build`)
- [ ] Has sincronizado los cambios (`npx cap sync`)

## 🔄 Proceso de Re-compilación

Si cambias la configuración, sigue este proceso:

```bash
# 1. Cambiar IP en environment.prod.ts
# 2. Compilar
cd frontend
npm run build

# 3. Sincronizar
npx cap sync

# 4. Abrir en Android Studio
npx cap open android

# 5. Run/Debug desde Android Studio
# La app se reinstalará con la nueva configuración
```

## 📞 Información de Soporte

Si después de seguir todos estos pasos aún no funciona:

1. Copia los logs de Logcat
2. Ejecuta: `ipconfig` (Windows) o `ip addr` (Linux) en el servidor
3. Ejecuta: `docker-compose logs backend --tail=50` para ver logs del servidor
4. Anota qué red Wi-Fi está usando el móvil
5. Verifica si otros dispositivos pueden conectarse al servidor

## 🎯 Configuración Típica que Funciona

```
Servidor:
- IP: 192.168.50.1
- Puerto: 3000
- Firewall: Puerto 3000 abierto
- Docker: Backend corriendo
- CORS: Configurado como *

Móvil:
- WiFi: Misma red que el servidor (192.168.50.x)
- App: Compilada con environment.prod.ts
- IP configurada: 192.168.50.1

Environment.prod.ts:
if (isNative) {
  return '192.168.50.1';
}
```

Con esta configuración, la app debería conectar correctamente. ✅
