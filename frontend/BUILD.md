# Guía de Compilación - Metrónomo Sincronizado

Esta guía explica cómo compilar la aplicación para Android e iOS usando Capacitor.

## 📋 Prerequisitos

### Para Android

- **Node.js** v18 o superior
- **Java Development Kit (JDK)** 17 o superior
  - Windows: Instalar [OpenJDK 17](https://adoptium.net/)
  - macOS: `brew install openjdk@17`
  - Linux: `sudo apt install openjdk-17-jdk`
- **Android Studio** (última versión)
  - Descargar de: https://developer.android.com/studio
  - Durante la instalación, asegúrate de instalar:
    - Android SDK
    - Android SDK Platform
    - Android Virtual Device (AVD)
- **Gradle** (se instala automáticamente con Android Studio)

### Para iOS (Solo en macOS)

- **macOS** (Catalina o superior)
- **Xcode** 14 o superior
  - Instalar desde la App Store
- **Xcode Command Line Tools**
  ```bash
  xcode-select --install
  ```
- **CocoaPods**
  ```bash
  sudo gem install cocoapods
  ```
- **Cuenta de Apple Developer** (para distribución)

## 🏗️ Proceso de Compilación

### 1. Preparar el Entorno

```bash
cd frontend
npm install
```

### 2. Inicializar Capacitor (Solo la primera vez)

Si es la primera vez que compilas, necesitas inicializar las plataformas nativas:

```bash
# Agregar plataforma Android
npx cap add android

# Agregar plataforma iOS (solo en macOS)
npx cap add ios
```

**Nota:** Este paso solo se hace UNA VEZ. Después de esto, solo usarás `npx cap sync`.

### 3. Configurar Permisos de Red en Android (IMPORTANTE)

⚠️ **Android bloquea conexiones HTTP por defecto**. Para permitir que la app se conecte al servidor en desarrollo, debes configurar los permisos de red:

```bash
# 1. Crear carpeta para configuración de red
mkdir -p android/app/src/main/res/xml

# 2. Copiar archivo de configuración de red
cp resources/android/xml/network_security_config.xml android/app/src/main/res/xml/
```

**Modificar `android/app/src/main/AndroidManifest.xml`:**

Agrega estos permisos ANTES del tag `<application>`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
```

Agrega estos atributos EN el tag `<application>`:
```xml
<application
    ...
    android:usesCleartextTraffic="true"
    android:networkSecurityConfig="@xml/network_security_config">
```

📖 **Instrucciones detalladas:** Ver `resources/android/CONFIGURACION_ANDROID.md`

⚠️ **IMPORTANTE:** Estos cambios solo son necesarios para desarrollo con HTTP. Para producción, usa HTTPS y elimina `android:usesCleartextTraffic="true"`.

### 4. Configurar Variables de Entorno

Edita `src/environments/environment.prod.ts` para configurar la IP del servidor:

```typescript
// Si compilas para producción, cambia estas IPs según tu infraestructura
const SERVER_IP = 'tu-servidor.com';  // O IP pública
const SERVER_PORT = 3000;
```

### 5. Build de Producción

```bash
npm run build
```

Este comando genera los archivos optimizados en `dist/frontend/browser/`.

### 6. Sincronizar con Capacitor

```bash
npx cap sync
```

Este comando:
- Copia los archivos web a las carpetas nativas
- Actualiza las dependencias nativas
- Sincroniza las configuraciones

## 📱 Compilación para Android

### Opción 1: Usando Android Studio (Recomendado)

1. **Abrir el proyecto en Android Studio:**
   ```bash
   npx cap open android
   ```

2. **Esperar a que Gradle sincronice** (primera vez puede tardar varios minutos)

3. **Conectar un dispositivo físico o iniciar un emulador:**
   - Dispositivo físico: Activar "Opciones de desarrollador" y "Depuración USB"
   - Emulador: Tools → AVD Manager → Create Virtual Device

4. **Ejecutar la aplicación:**
   - Clic en el botón ▶️ (Run) en la barra superior
   - O menú: Run → Run 'app'

5. **Generar APK de Debug:**
   - Build → Build Bundle(s) / APK(s) → Build APK(s)
   - El APK se generará en: `android/app/build/outputs/apk/debug/app-debug.apk`

6. **Generar APK/AAB de Producción (Firmado):**
   - Build → Generate Signed Bundle / APK
   - Seleccionar "Android App Bundle" (para Google Play) o "APK"
   - Crear o seleccionar una keystore
   - Completar los datos de firma
   - El archivo se generará en: `android/app/release/`

### Opción 2: Desde la Terminal

```bash
# Generar APK de debug
cd android
./gradlew assembleDebug

# Generar APK de release (sin firmar)
./gradlew assembleRelease

# El APK estará en: android/app/build/outputs/apk/
```

### Instalar APK en Dispositivo

```bash
# Via ADB
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 🍎 Compilación para iOS

### Opción 1: Usando Xcode (Recomendado)

1. **Abrir el proyecto en Xcode:**
   ```bash
   npx cap open ios
   ```

2. **Configurar el equipo de desarrollo:**
   - En Xcode, selecciona el proyecto en el navegador
   - En la pestaña "Signing & Capabilities"
   - Selecciona tu "Team" (cuenta de Apple Developer)
   - Xcode configurará automáticamente el provisioning profile

3. **Seleccionar el dispositivo:**
   - En la barra superior, selecciona un simulador o dispositivo físico conectado

4. **Ejecutar la aplicación:**
   - Clic en el botón ▶️ (Play) o Cmd + R
   - La primera vez, iOS pedirá confiar en el certificado de desarrollador

5. **Generar para Producción:**
   - Product → Archive
   - En el Organizer, selecciona el archive
   - Clic en "Distribute App"
   - Selecciona el método de distribución:
     - **App Store Connect**: Para subir a la App Store
     - **Ad Hoc**: Para distribución interna (hasta 100 dispositivos)
     - **Enterprise**: Para distribución empresarial
     - **Development**: Para testing local

### Opción 2: Desde la Terminal (Build básico)

```bash
cd ios/App
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release
```

## 🔄 Actualizar Código Nativo

Después de hacer cambios en el código web:

```bash
# 1. Rebuild del proyecto web
npm run build

# 2. Sincronizar cambios
npx cap sync

# 3. (Opcional) Actualizar plugins nativos
npx cap update
```

## ⚙️ Configuraciones Adicionales

### Cambiar el Nombre de la App

Edita `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'com.tuempresa.metronomo',
  appName: 'Metrónomo Sincronizado',
  // ...
};
```

**Importante:** Después de cambiar `appId`, debes ejecutar:
```bash
npx cap sync
```

### Configurar Icono y Splash Screen

1. **Preparar recursos:**
   - Icono: `icon.png` (1024x1024px)
   - Splash: `splash.png` (2732x2732px)

2. **Usar Cordova Resources (recomendado):**
   ```bash
   npm install -g cordova-res
   cordova-res ios --skip-config --copy
   cordova-res android --skip-config --copy
   ```

### Permisos

#### Android (`android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

#### iOS (`ios/App/App/Info.plist`):
```xml
<key>NSMicrophoneUsageDescription</key>
<string>Esta app necesita acceso al micrófono para el metrónomo</string>
```

## 🐛 Troubleshooting

### Android

**Error: SDK location not found**
```bash
# Crear archivo local.properties en android/
echo "sdk.dir=/ruta/a/tu/Android/SDK" > android/local.properties
# En macOS: ~/Library/Android/sdk
# En Windows: C:\Users\TuUsuario\AppData\Local\Android\Sdk
```

**Error: Gradle build failed**
```bash
# Limpiar y rebuild
cd android
./gradlew clean
./gradlew build
```

**Error: App no conecta al servidor (Timeout)**
- ⚠️ **CAUSA MÁS COMÚN:** Android bloquea conexiones HTTP por defecto
- **SOLUCIÓN:** Sigue los pasos en `resources/android/CONFIGURACION_ANDROID.md`
- Verifica que agregaste los permisos en `AndroidManifest.xml`
- Verifica que copiaste `network_security_config.xml` a la carpeta correcta
- Reconstruye completamente: Build → Clean Project → Rebuild Project

**Error: CLEARTEXT communication not permitted**
- Este error confirma que Android está bloqueando HTTP
- Sigue las instrucciones en `resources/android/CONFIGURACION_ANDROID.md`
- Asegúrate de que `android:usesCleartextTraffic="true"` está en el manifest
- Verifica que `android:networkSecurityConfig="@xml/network_security_config"` está configurado

**Error: Connection refused o Network unreachable**
- Verifica que la IP en `environment.prod.ts` sea accesible desde el dispositivo
- En Android, usa la IP local de tu PC en la red, no `localhost`
- Para emuladores Android: usa `10.0.2.2` para localhost
- Verifica el firewall del servidor (debe permitir puerto 3000)

### iOS

**Error: No se puede ejecutar en dispositivo**
- Verifica que el dispositivo esté registrado en tu cuenta de Apple Developer
- Verifica que el provisioning profile sea correcto
- En el dispositivo: Settings → General → Device Management → Confiar en el desarrollador

**Error: Pod install failed**
```bash
cd ios/App
pod repo update
pod install
```

**Error: App no conecta al servidor**
- Verifica que la IP en `environment.prod.ts` sea accesible desde el dispositivo
- Verifica que el servidor permita conexiones desde la red local
- Verifica el firewall del servidor

## 📦 Distribución

### Android (Google Play Store)

1. Genera un **Android App Bundle (AAB)** firmado
2. Crea una cuenta en [Google Play Console](https://play.google.com/console)
3. Crea una nueva aplicación
4. Sube el AAB
5. Completa la información de la tienda
6. Envía para revisión

### iOS (App Store)

1. Crea una cuenta en [Apple Developer](https://developer.apple.com/)
2. Crea un App ID en el portal de desarrollador
3. En Xcode: Product → Archive
4. Distribuye a App Store Connect
5. En [App Store Connect](https://appstoreconnect.apple.com/):
   - Crea una nueva app
   - Completa la información
   - Selecciona el build
   - Envía para revisión

## 🔗 Enlaces Útiles

- [Documentación de Capacitor](https://capacitorjs.com/docs)
- [Guía Android Studio](https://developer.android.com/studio/intro)
- [Guía Xcode](https://developer.apple.com/xcode/)
- [Ionic Framework](https://ionicframework.com/docs)

## 📝 Notas Importantes

1. **Primera compilación:** Puede tardar bastante tiempo, especialmente en Android
2. **Actualizaciones frecuentes:** Usa `npx cap sync` después de cambios en el código web
3. **Testing:** Siempre prueba en dispositivos físicos antes de distribuir
4. **Rendimiento:** El modo de producción (`npm run build`) es mucho más rápido que el modo desarrollo
5. **Versiones:** Actualiza el número de versión en `package.json` antes de cada release

## 🚀 Comandos Rápidos

```bash
# Desarrollo completo
npm run build && npx cap sync && npx cap open android
npm run build && npx cap sync && npx cap open ios

# Solo sincronizar cambios
npm run build && npx cap sync

# Actualizar plugins
npx cap update

# Ver estado de Capacitor
npx cap doctor
```
