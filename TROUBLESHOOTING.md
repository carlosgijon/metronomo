# Diagnóstico de Problemas de Conexión WebSocket

## 1. Verificar que el backend esté corriendo

```bash
# En el servidor
curl http://localhost:3000/health

# Deberías ver algo como:
# {"status":"ok","uptime":123}
```

Si esto NO funciona, el backend no está corriendo correctamente.

## 2. Verificar logs del backend

```bash
docker compose logs -f backend
```

Busca mensajes de error o que el servidor haya iniciado.

## 3. Verificar que Socket.IO esté escuchando

El error muestra que intenta conectar a:
`ws://localhost:3000/socket.io/?EIO=4&transport=websocket`

Esto es correcto. Socket.IO automáticamente expone `/socket.io/` cuando se configura correctamente.

## 4. Verificar CORS

El problema más común es CORS. Socket.IO necesita CORS configurado tanto en:
- El servidor HTTP (main.ts) ✅ Ya está
- El WebSocket Gateway ✅ Ya está (origin configurado)

## 5. Verificar que estés accediendo desde el origen correcto

Si estás en:
- `http://localhost:4200` → Debería funcionar
- `http://127.0.0.1:4200` → Puede fallar por CORS
- `http://tu-ip:4200` → Puede fallar por CORS

## Solución: Actualizar CORS para permitir múltiples orígenes

Voy a actualizar el código para permitir más orígenes.
