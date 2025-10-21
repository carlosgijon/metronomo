# Metrónomo Sincronizado - Frontend

Aplicación Angular para un metrónomo sincronizado en tiempo real con soporte para múltiples usuarios.

## Características

### Tres Perfiles de Usuario

1. **Maestro** - Control total del metrónomo
   - Iniciar/detener el metrónomo
   - Ajustar BPM (40-240)
   - Cambiar compás (2/4, 3/4, 4/4, 5/4, 6/8, 7/8, 9/8, 12/8)
   - Seleccionar tipo de sonido (click, beep, madera)
   - Activar/desactivar acentuación del primer tiempo
   - Cargar presets predefinidos

2. **Seguidor** - Visualización sincronizada
   - Ver el metrónomo en tiempo real
   - Sincronización automática con compensación de latencia
   - Visualización clara de los beats y el tempo

3. **Admin** - Gestión de presets
   - Crear presets personalizados
   - Editar presets existentes
   - Eliminar presets
   - Tabla CRUD completa con interfaz intuitiva

### Tecnologías

- **Angular 20** con Standalone Components
- **DaisyUI** para el diseño UI
- **Tailwind CSS** para estilos
- **WebSockets** para comunicación en tiempo real
- **Web Audio API** para generación de sonidos
- **Signals** para gestión de estado reactiva

### Sincronización de Latencia

Al conectarse, cada usuario:
1. Realiza 5 mediciones de latencia mediante ping/pong con el servidor
2. Calcula la latencia promedio comparando timestamps cliente-servidor
3. Ajusta la reproducción del metrónomo según su latencia individual
4. Garantiza sincronización precisa entre todos los dispositivos

## Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── login/          # Componente de login y selección de rol
│   │   ├── master/         # Panel de control del maestro
│   │   ├── follower/       # Vista de seguidor
│   │   └── admin/          # Panel administrativo CRUD
│   ├── guards/
│   │   ├── auth.guard.ts   # Guard de autenticación
│   │   └── role.guard.ts   # Guard de roles
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── preset.model.ts
│   │   ├── metronome.model.ts
│   │   └── websocket.model.ts
│   ├── services/
│   │   ├── auth.service.ts            # Autenticación y gestión de usuarios
│   │   ├── websocket.service.ts       # Comunicación WebSocket
│   │   ├── latency.service.ts         # Medición de latencia
│   │   ├── metronome-sync.service.ts  # Sincronización del metrónomo
│   │   └── preset.service.ts          # Gestión de presets
│   └── app.routes.ts
└── environments/
    ├── environment.ts       # Configuración de desarrollo
    └── environment.prod.ts  # Configuración de producción
```

## Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm start
# La aplicación estará disponible en http://localhost:4200

# Build para producción
npm run build

# Ejecutar tests
npm test
```

## Configuración

### Variables de Entorno

**Desarrollo** (`environment.ts`):
```typescript
{
  production: false,
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'ws://localhost:3000'
}
```

**Producción** (`environment.prod.ts`):
```typescript
{
  production: true,
  apiUrl: '/api',
  wsUrl: `ws://${window.location.host}`
}
```

## Uso con Ionic (iOS/Android)

Esta aplicación está diseñada para ser embebida en aplicaciones Ionic como WebView:

1. En el proyecto Ionic, configura la URL del servidor en el WebView
2. La aplicación detectará automáticamente la latencia del dispositivo
3. Todas las características funcionan completamente en WebView

## Protocolo WebSocket

### Mensajes del Cliente
- `PING`: Medición de latencia
- `METRONOME_START`: Iniciar metrónomo (solo maestro)
- `METRONOME_STOP`: Detener metrónomo (solo maestro)
- `METRONOME_UPDATE`: Actualizar configuración (solo maestro)

### Mensajes del Servidor
- `PONG`: Respuesta a ping con timestamps del servidor
- `METRONOME_STATE`: Estado actual del metrónomo
- `BEAT_EVENT`: Evento de beat con timestamp para sincronización
- `PRESET_*`: Eventos de presets (creado, actualizado, eliminado)

## API REST

### Endpoints de Presets

```
GET    /api/presets       - Listar todos los presets
GET    /api/presets/:id   - Obtener un preset
POST   /api/presets       - Crear preset
PUT    /api/presets/:id   - Actualizar preset
DELETE /api/presets/:id   - Eliminar preset
```

## Flujo de Uso

1. **Login**: Usuario ingresa nombre y selecciona rol (Maestro, Seguidor o Admin)
2. **Medición de Latencia**: Sistema mide latencia automáticamente
3. **Conexión WebSocket**: Establece conexión persistente con el servidor
4. **Navegación**: Redirige según el rol seleccionado
5. **Sincronización**: Los eventos del metrónomo se ajustan según latencia medida

## Sincronización entre Dispositivos

El sistema garantiza sincronización precisa mediante:

1. **Timestamps del servidor**: Todos los beats tienen timestamp de referencia
2. **Compensación de latencia**: Cada cliente ajusta según su latencia medida
3. **Web Audio API**: Programación precisa de audio con anticipación
4. **Reconexión automática**: Sistema resiliente ante desconexiones

## Generación de Audio

Tres tipos de sonidos generados con Web Audio API:
- **Click**: Frecuencia alta (1000Hz) con decay rápido
- **Beep**: Tono puro (800Hz) con decay medio
- **Madera**: Ruido blanco con decay rápido

## Personalización de Temas DaisyUI

Para cambiar temas, edita `src/styles.css`:

```css
@plugin "daisyui" {
  themes: light --default, dark --prefersdark;
}
```

Temas disponibles: light, dark, cupcake, bumblebee, emerald, corporate, synthwave, retro, cyberpunk, valentine, halloween, garden, forest, aqua, lofi, pastel, fantasy, wireframe, black, luxury, dracula, cmyk, autumn, business, acid, lemonade, night, coffee, winter

## Licencia

MIT
