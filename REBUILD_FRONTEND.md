# Reconstruir Frontend

El código del frontend ha sido actualizado pero necesita ser reconstruido para que los cambios se reflejen en el servidor.

## Pasos para reconstruir

### Opción 1: Reconstruir con npm (Recomendado)

```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias (por si acaso)
npm install

# Construir el proyecto para producción
npm run build

# Si estás usando dev server, reiniciarlo
npm start
```

### Opción 2: Reconstruir con Docker

Si el frontend está corriendo en Docker:

```bash
# Reconstruir la imagen
docker-compose build frontend

# Reiniciar el contenedor
docker-compose restart frontend
# o
docker-compose up -d frontend
```

### Opción 3: Forzar rebuild completo

```bash
cd frontend

# Limpiar cache y node_modules
rm -rf node_modules dist .angular

# Reinstalar dependencias
npm install

# Reconstruir
npm run build
```

## Verificación

Después de reconstruir, refresca el navegador con **Ctrl+Shift+R** (hard refresh) para limpiar el caché.

Deberías ver en la consola:

```
🔊 Sonido programado para: 5.5 currentTime: 5.49 Acento: true
```

Los números deben ser pequeños (< 1000), NO timestamps Unix grandes como `1761147250`.

## Cambios importantes aplicados

1. ✅ Uso correcto de `audioContext.currentTime` (relativo, no absoluto)
2. ✅ Programación inmediata con `currentTime + 0.01`
3. ✅ Logging mejorado con más detalles
4. ✅ Mejor manejo de AudioContext state
