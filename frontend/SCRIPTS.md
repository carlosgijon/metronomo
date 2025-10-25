# Scripts NPM Automatizados

Este proyecto incluye scripts NPM que automatizan el proceso de compilación para Android e iOS. Funcionan en **Windows, macOS y Linux**.

## 🎯 Inicio Rápido

### Primera Compilación - Android

```bash
cd frontend
npm install
npx cap add android
npm run deploy:android
```

Esto automáticamente:
1. ✅ Compila el proyecto Angular
2. ✅ Sincroniza con Capacitor
3. ✅ Configura permisos de red en AndroidManifest.xml
4. ✅ Copia archivos de configuración de red
5. ✅ Abre Android Studio

### Primera Compilación - iOS (solo macOS)

```bash
cd frontend
npm install
npx cap add ios
npm run deploy:ios
```

## 📋 Scripts Disponibles

### Scripts de Build

| Comando | Plataforma | Descripción |
|---------|-----------|-------------|
| `npm run build:android` | Android | Build + Sync + Configuración automática de permisos |
| `npm run build:ios` | iOS | Build + Sync |

**Ejemplo:**
```bash
npm run build:android
```

Esto ejecuta:
1. `npm run build` - Compila el proyecto Angular
2. `npx cap sync` - Sincroniza con Capacitor
3. `npm run setup:android` - Configura AndroidManifest.xml automáticamente

### Scripts de Deploy (Build + Abrir IDE)

| Comando | Plataforma | Descripción |
|---------|-----------|-------------|
| `npm run deploy:android` | Android | Build completo + Abre Android Studio |
| `npm run deploy:ios` | iOS | Build completo + Abre Xcode |

**Ejemplo:**
```bash
npm run deploy:android
```

Esto ejecuta todo el proceso de build y luego abre Android Studio.

### Scripts de Configuración

| Comando | Plataforma | Descripción |
|---------|-----------|-------------|
| `npm run setup:android` | Android | Configura permisos de red automáticamente |
| `npm run setup:ios` | iOS | No requiere configuración especial |

**Ejemplo:**
```bash
npm run setup:android
```

Este script:
- ✅ Crea la carpeta `android/app/src/main/res/xml/`
- ✅ Copia `network_security_config.xml`
- ✅ Agrega permisos INTERNET, ACCESS_NETWORK_STATE, ACCESS_WIFI_STATE
- ✅ Configura `android:usesCleartextTraffic="true"`
- ✅ Configura `android:networkSecurityConfig="@xml/network_security_config"`

### Scripts de IDE

| Comando | Plataforma | Descripción |
|---------|-----------|-------------|
| `npm run open:android` | Android | Solo abre Android Studio |
| `npm run open:ios` | iOS | Solo abre Xcode |

### Scripts de Capacitor

| Comando | Descripción |
|---------|-------------|
| `npm run cap:sync` | Sincroniza cambios con Capacitor |
| `npm run cap:update` | Actualiza plugins de Capacitor |

## 🔧 Script de Configuración Android (setup-android.js)

El script `scripts/setup-android.js` modifica automáticamente el AndroidManifest.xml para permitir conexiones HTTP durante desarrollo.

### ¿Qué hace?

1. **Crea carpetas necesarias:**
   ```
   android/app/src/main/res/xml/
   ```

2. **Copia configuración de red:**
   ```
   resources/android/xml/network_security_config.xml
   → android/app/src/main/res/xml/
   ```

3. **Modifica AndroidManifest.xml:**
   - Agrega permisos de red (INTERNET, ACCESS_NETWORK_STATE, ACCESS_WIFI_STATE)
   - Configura `android:usesCleartextTraffic="true"`
   - Configura `android:networkSecurityConfig="@xml/network_security_config"`

### Ejecución Manual

```bash
node scripts/setup-android.js
```

### Salida Esperada

```
🔧 Configurando Android para permitir conexiones HTTP...

✅ Carpeta res/xml/ ya existe
📄 Copiando network_security_config.xml...
✅ Archivo copiado correctamente
📝 Modificando AndroidManifest.xml...
  ✅ Agregado: INTERNET
  ✅ Agregado: ACCESS_NETWORK_STATE
  ✅ Agregado: ACCESS_WIFI_STATE
  ✅ Agregado: android:usesCleartextTraffic="true"
  ✅ Agregado: android:networkSecurityConfig

✅ AndroidManifest.xml modificado correctamente

🎉 Configuración completada!

Próximos pasos:
  1. npm run build
  2. npx cap sync
  3. npx cap open android
  4. En Android Studio: Build → Clean Project → Rebuild Project
```

### Idempotencia

El script es **idempotente**: puede ejecutarse múltiples veces sin problemas. Si los cambios ya existen, simplemente confirma que todo está correcto.

## 🔄 Flujos de Trabajo Comunes

### Desarrollo Diario - Android

```bash
# 1. Haces cambios en el código...

# 2. Rebuild y sincroniza
npm run build:android

# 3. Abre Android Studio (si no está abierto)
npm run open:android

# 4. En Android Studio: Run ▶️
```

### Desarrollo Diario - iOS

```bash
# 1. Haces cambios en el código...

# 2. Rebuild y sincroniza
npm run build:ios

# 3. Abre Xcode (si no está abierto)
npm run open:ios

# 4. En Xcode: Run ▶️
```

### Solo Sincronizar (cambios menores)

Si solo modificaste archivos web y ya compilaste antes:

```bash
npm run cap:sync
```

### Primera vez después de clonar el repo

```bash
cd frontend
npm install

# Para Android
npx cap add android
npm run deploy:android

# Para iOS (solo macOS)
npx cap add ios
npm run deploy:ios
```

## 🐛 Troubleshooting

### Error: "La carpeta android/ no existe"

**Solución:**
```bash
npx cap add android
```

Luego ejecuta nuevamente:
```bash
npm run setup:android
```

### Error: "CLEARTEXT communication not permitted"

**Causa:** AndroidManifest.xml no está configurado correctamente.

**Solución:**
```bash
npm run setup:android
```

Luego reconstruye en Android Studio:
- Build → Clean Project
- Build → Rebuild Project
- Run ▶️

### Error: Script falla en Windows

**Causa:** Node.js debe estar instalado y en el PATH.

**Solución:**
- Verifica que Node.js está instalado: `node --version`
- Asegúrate de usar CMD, PowerShell o Git Bash
- Los scripts funcionan igual en todos los sistemas

## 📖 Documentación Relacionada

- **[BUILD.md](BUILD.md)** - Guía completa de compilación
- **[DEBUGGING.md](DEBUGGING.md)** - Guía de debugging y conexión
- **[resources/android/CONFIGURACION_ANDROID.md](resources/android/CONFIGURACION_ANDROID.md)** - Configuración manual de Android

## ⚠️ Notas Importantes

### Desarrollo vs Producción

Los scripts configuran la app para **desarrollo con HTTP**. Para producción:

1. Configura HTTPS en el servidor
2. Cambia las URLs en `environment.prod.ts` a `https://`
3. Modifica `android/app/src/main/AndroidManifest.xml`:
   - Cambia `android:usesCleartextTraffic="true"` a `"false"`
4. Opcionalmente, restringe `network_security_config.xml` a solo HTTPS

### Compatibilidad

- ✅ Windows 10/11
- ✅ macOS (Catalina o superior)
- ✅ Linux (Ubuntu, Debian, Fedora, etc.)

Los scripts usan Node.js puro (módulo `fs` y `path`) que funcionan igual en todos los sistemas operativos.

### Git

La carpeta `/android` y `/ios` están en `.gitignore`. Por esto:

- Los scripts deben ejecutarse en cada máquina después de `npx cap add android/ios`
- Los cambios en AndroidManifest.xml NO se commitean
- La configuración es local y debe aplicarse manualmente

## 🎓 Aprende Más

### ¿Por qué es necesario configurar Android?

Android bloquea conexiones HTTP por defecto desde Android 9 (API 28) por seguridad. Esto se llama "Cleartext Traffic Protection".

Para desarrollo local con servidor HTTP, necesitamos:
1. Declarar permisos de red
2. Permitir tráfico cleartext (HTTP sin encriptar)
3. Especificar qué dominios/IPs pueden usar HTTP

### ¿Qué es network_security_config.xml?

Es un archivo de configuración de Android que define:
- Qué conexiones de red están permitidas
- Qué certificados SSL son de confianza
- Qué dominios pueden usar HTTP (cleartext)

Nuestro archivo permite HTTP solo para IPs locales:
- `localhost` / `127.0.0.1`
- `192.168.1.23` (PC de desarrollo)
- `192.168.50.1` (servidor en red móvil)
- `10.0.2.2` (emulador Android)

### ¿Por qué usar scripts NPM?

- ✅ Multiplataforma (Windows, macOS, Linux)
- ✅ Versionados en Git
- ✅ Documentados en package.json
- ✅ Fáciles de recordar y ejecutar
- ✅ Automatizan tareas repetitivas
- ✅ Reducen errores humanos
