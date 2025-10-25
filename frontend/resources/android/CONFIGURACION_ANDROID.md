# Configuración de Android para Conexiones HTTP

## Problema
Android bloquea por defecto las conexiones HTTP (cleartext traffic) en apps nativas por seguridad. Esto causa timeout cuando la app intenta conectarse al servidor.

## Solución: Configurar AndroidManifest.xml

Después de ejecutar `npx cap add android`, necesitas aplicar estos cambios manualmente:

### Paso 1: Copiar el archivo de configuración de red

```bash
# Desde la carpeta frontend/
cp resources/android/xml/network_security_config.xml android/app/src/main/res/xml/
```

Si la carpeta `android/app/src/main/res/xml/` no existe, créala:

```bash
mkdir -p android/app/src/main/res/xml/
cp resources/android/xml/network_security_config.xml android/app/src/main/res/xml/
```

### Paso 2: Modificar AndroidManifest.xml

Abre el archivo `android/app/src/main/AndroidManifest.xml` y agrega estos permisos y configuración:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- AGREGAR ESTOS PERMISOS -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"

        <!-- AGREGAR ESTAS DOS LÍNEAS -->
        android:usesCleartextTraffic="true"
        android:networkSecurityConfig="@xml/network_security_config">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths"></meta-data>
        </provider>
    </application>
</manifest>
```

### Cambios clave en AndroidManifest.xml:

1. **Permisos agregados** (antes de `<application>`):
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
   <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
   ```

2. **Atributos agregados en `<application>`**:
   ```xml
   android:usesCleartextTraffic="true"
   android:networkSecurityConfig="@xml/network_security_config"
   ```

### Paso 3: Reconstruir y reinstalar

```bash
# 1. Reconstruir el proyecto Angular
npm run build

# 2. Sincronizar con Capacitor
npx cap sync

# 3. Abrir Android Studio
npx cap open android

# 4. En Android Studio:
# - Build > Clean Project
# - Build > Rebuild Project
# - Run > Run 'app' (o presiona ▶️)
```

## Verificación

Después de instalar la app con estos cambios:

1. **Ver logs en Android Studio**:
   - View → Tool Windows → Logcat
   - Busca: `🔗 Conectando a:`
   - Deberías ver: `🔗 Conectando a: 192.168.50.1`

2. **Verificar conexión**:
   - La app debería conectarse sin timeout
   - Los logs mostrarán: `WebSocket connection established`

## Notas de Seguridad

⚠️ **IMPORTANTE**: Esta configuración permite conexiones HTTP sin encriptar.

- ✅ **Desarrollo**: OK para desarrollo local
- ❌ **Producción**: NUNCA uses HTTP en producción
- ✅ **Producción**: Configura HTTPS con certificado SSL en el servidor

Para producción:
1. Configura HTTPS en el servidor
2. Cambia las URLs en `environment.prod.ts` de `http://` a `https://`
3. Elimina o restringe `network_security_config.xml` a solo HTTPS
4. Cambia `cleartextTrafficPermitted="false"` en la configuración de red

## Troubleshooting

Si sigue sin conectar:

1. **Verifica que el servidor esté corriendo**:
   ```bash
   # Desde el móvil, abre el navegador y ve a:
   http://192.168.50.1:3000/api
   ```

2. **Verifica que los archivos estén en su lugar**:
   - `android/app/src/main/res/xml/network_security_config.xml` debe existir
   - `android/app/src/main/AndroidManifest.xml` debe tener los cambios

3. **Verifica los logs de Logcat**:
   - Busca errores como "CLEARTEXT communication not permitted"
   - Si ves ese error, revisa que `android:usesCleartextTraffic="true"` esté en el manifest

4. **Reconstruye completamente**:
   - Build → Clean Project
   - Build → Rebuild Project
   - Desinstala la app del móvil manualmente
   - Vuelve a instalar desde Android Studio

## Más información

Consulta `DEBUGGING.md` para más detalles sobre cómo diagnosticar problemas de conexión.
