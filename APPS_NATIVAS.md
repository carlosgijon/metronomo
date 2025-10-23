# 📱 Apps Nativas - Metrónomo Sincronizado

Este proyecto ahora utiliza **Ionic + Capacitor** para crear apps nativas iOS y Android.

## 🏗️ Nueva Arquitectura

```
┌──────────────────────────────────┐
│  SERVIDOR (Backend Only)         │
│  ┌────────────────────────────┐  │
│  │  Backend NestJS            │  │
│  │  - WebSocket (puerto 3000) │  │
│  │  - PostgreSQL              │  │
│  │  - REST API                │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
              ▲
              │ WebSocket
    ┌─────────┴─────────┐
    │                   │
┌───▼──────┐      ┌─────▼─────┐
│ App iOS  │      │ App       │
│ (Ionic)  │      │ Android   │
│          │      │ (Ionic)   │
└──────────┘      └───────────┘
```

## 🚀 Comandos Principales

### 1. Desarrollo Web (pruebas rápidas)
```bash
cd frontend
npm install
ionic serve
```
Abre en `http://localhost:8100` con hot-reload.

### 2. Build de Producción
```bash
cd frontend
npm run build -- --configuration production
```
Compila la app en `dist/frontend/browser/`.

### 3. Sincronizar con Plataformas Nativas
Después de cada build o cambio:
```bash
cd frontend
npx cap sync
```
Copia los archivos web a `ios/` y `android/`.

### 4. Abrir en IDEs Nativos

**iOS (requiere macOS con Xcode):**
```bash
cd frontend
npx cap open ios
```
Abre el proyecto en Xcode. Desde ahí:
- Conecta un iPhone físico o usa simulador
- Presiona ▶️ Run
- La app se instalará en el dispositivo

**Android (requiere Android Studio):**
```bash
cd frontend
npx cap open android
```
Abre el proyecto en Android Studio. Desde ahí:
- Conecta un Android físico o usa emulador
- Presiona ▶️ Run
- La app se instalará en el dispositivo

## 📝 Workflow de Desarrollo

### Cambios en el Código:
1. Edita los archivos `.ts` o `.html` en `frontend/src/`
2. Haz build: `npm run build`
3. Sincroniza: `npx cap sync`
4. Abre en IDE: `npx cap open ios` o `npx cap open android`
5. Run desde el IDE

### Cambios en Plugins Nativos:
Si instalas nuevos plugins de Capacitor:
```bash
npm install @capacitor/[plugin-name]
npx cap sync
```

## 🔧 Servidor Backend

El servidor ya NO incluye el frontend. Solo corre el backend:

```bash
cd docker
docker-compose up -d
```

Esto inicia:
- **PostgreSQL** (puerto 5432)
- **Backend NestJS** (puerto 3000)
- **PgAdmin** (puerto 5050) - solo con `--profile dev`

## 🌐 Configuración del Backend

Las apps se conectan al backend via WebSocket:
- **Desarrollo local**: `ws://localhost:3000`
- **Producción**: `ws://tu-servidor:3000`

Edita la URL en `frontend/src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  wsUrl: 'ws://localhost:3000' // Cambia esto
};
```

## 📦 Estructura del Proyecto

```
metronomo/
├── frontend/          # Ionic Angular App
│   ├── android/       # Proyecto Android nativo (generado)
│   ├── ios/           # Proyecto iOS nativo (generado)
│   ├── src/           # Código fuente Angular/Ionic
│   ├── capacitor.config.ts
│   └── package.json
│
├── backend/           # NestJS Backend
│   ├── src/
│   └── Dockerfile
│
├── database/          # Scripts de PostgreSQL
│   └── init.sql
│
└── docker/            # Docker Compose (solo backend)
    └── docker-compose.yml
```

## 🎨 Diseño Implementado

### Master (Maestro):
- ✅ Card fullscreen con gradiente púrpura
- ✅ BPM GRANDE y FINO (120px) arriba centro
- ✅ Botón PLAY ENORME (160x160px) en el centro
- ✅ Chips de info arriba
- ✅ Slider y controles abajo

### Follower (Seguidor):
- ✅ Visualización de BPM y beats
- ✅ Badge de estado
- ✅ Diseño simplificado

### Login:
- ✅ Card centrado
- ✅ Radio buttons para roles
- ✅ Diseño limpio

## 🔐 Permisos Requeridos

Las apps necesitan permisos para:
- **Internet**: Para WebSocket
- **Audio**: Para reproducir el metrónomo
- **Wake Lock**: Para mantener pantalla encendida (opcional)

Los permisos se configuran automáticamente en:
- iOS: `ios/App/App/Info.plist`
- Android: `android/app/src/main/AndroidManifest.xml`

## 📱 Publicación en Stores

### App Store (iOS):
1. Configura certificados en Apple Developer
2. En Xcode: Product → Archive
3. Sube a App Store Connect
4. Envía para revisión

### Google Play (Android):
1. En Android Studio: Build → Generate Signed Bundle/APK
2. Crea keystore si no existe
3. Sube el AAB a Google Play Console
4. Publica

## 🆘 Troubleshooting

### "Browser directory not found"
```bash
npm run build
npx cap sync
```

### Cambios no aparecen en la app
```bash
npm run build
npx cap sync
# Luego rebuild desde el IDE
```

### Error de CORS en WebSocket
Verifica `CORS_ORIGIN` en `docker-compose.yml` (ya está en `*`)

### iOS: CocoaPods no instalado
```bash
sudo gem install cocoapods
cd ios/App
pod install
```

## 📚 Recursos

- [Ionic Docs](https://ionicframework.com/docs)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Angular Docs](https://angular.io/docs)
- [NestJS Docs](https://docs.nestjs.com)

---

**App ID**: `com.metronomo.sync`
**App Name**: Metrónomo Sincronizado
**Versión**: 1.0.0
