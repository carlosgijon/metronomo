#!/usr/bin/env node

/**
 * Script para configurar automáticamente AndroidManifest.xml
 * para permitir conexiones HTTP (cleartext traffic)
 *
 * Compatible con Windows, macOS y Linux
 */

const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Rutas
const projectRoot = path.resolve(__dirname, '..');
const androidManifestPath = path.join(projectRoot, 'android/app/src/main/AndroidManifest.xml');
const networkConfigSourcePath = path.join(projectRoot, 'resources/android/xml/network_security_config.xml');
const networkConfigDestPath = path.join(projectRoot, 'android/app/src/main/res/xml/network_security_config.xml');

// Verificar que el archivo fuente existe
if (!fs.existsSync(networkConfigSourcePath)) {
  log(`❌ Error: No se encuentra el archivo ${networkConfigSourcePath}`, colors.red);
  process.exit(1);
}

// Verificar que la carpeta android existe
if (!fs.existsSync(path.join(projectRoot, 'android'))) {
  log('⚠️  La carpeta android/ no existe.', colors.yellow);
  log('   Ejecuta primero: npx cap add android', colors.yellow);
  process.exit(1);
}

log('\n🔧 Configurando Android para permitir conexiones HTTP...\n', colors.blue);

// 1. Crear carpeta xml si no existe
const xmlDir = path.dirname(networkConfigDestPath);
if (!fs.existsSync(xmlDir)) {
  log('📁 Creando carpeta res/xml/...', colors.blue);
  fs.mkdirSync(xmlDir, { recursive: true });
  log('✅ Carpeta creada', colors.green);
} else {
  log('✅ Carpeta res/xml/ ya existe', colors.green);
}

// 2. Copiar archivo de configuración de red
log('📄 Copiando network_security_config.xml...', colors.blue);
try {
  fs.copyFileSync(networkConfigSourcePath, networkConfigDestPath);
  log('✅ Archivo copiado correctamente', colors.green);
} catch (error) {
  log(`❌ Error al copiar archivo: ${error.message}`, colors.red);
  process.exit(1);
}

// 3. Verificar y modificar AndroidManifest.xml
if (!fs.existsSync(androidManifestPath)) {
  log('⚠️  AndroidManifest.xml no encontrado', colors.yellow);
  log('   Ejecuta primero: npx cap add android', colors.yellow);
  process.exit(1);
}

log('📝 Modificando AndroidManifest.xml...', colors.blue);

let manifestContent = fs.readFileSync(androidManifestPath, 'utf8');
let modified = false;

// Verificar y agregar permisos
const permissions = [
  '<uses-permission android:name="android.permission.INTERNET" />',
  '<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />',
  '<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />'
];

permissions.forEach(permission => {
  if (!manifestContent.includes(permission)) {
    // Agregar antes del tag <application>
    manifestContent = manifestContent.replace(
      /<application/,
      `${permission}\n    <application`
    );
    modified = true;
    log(`  ✅ Agregado: ${permission.match(/android.permission.(\w+)/)[1]}`, colors.green);
  } else {
    log(`  ✓ Ya existe: ${permission.match(/android.permission.(\w+)/)[1]}`, colors.green);
  }
});

// Agregar usesCleartextTraffic si no existe
if (!manifestContent.includes('android:usesCleartextTraffic')) {
  manifestContent = manifestContent.replace(
    /<application([^>]*)>/,
    '<application$1\n        android:usesCleartextTraffic="true">'
  );
  modified = true;
  log('  ✅ Agregado: android:usesCleartextTraffic="true"', colors.green);
} else if (!manifestContent.includes('android:usesCleartextTraffic="true"')) {
  // Si existe pero está en false, cambiarlo a true
  manifestContent = manifestContent.replace(
    /android:usesCleartextTraffic="false"/,
    'android:usesCleartextTraffic="true"'
  );
  modified = true;
  log('  ✅ Cambiado: android:usesCleartextTraffic a "true"', colors.green);
} else {
  log('  ✓ Ya existe: android:usesCleartextTraffic="true"', colors.green);
}

// Agregar networkSecurityConfig si no existe
if (!manifestContent.includes('android:networkSecurityConfig')) {
  manifestContent = manifestContent.replace(
    /<application([^>]*)>/,
    '<application$1\n        android:networkSecurityConfig="@xml/network_security_config">'
  );
  modified = true;
  log('  ✅ Agregado: android:networkSecurityConfig', colors.green);
} else {
  log('  ✓ Ya existe: android:networkSecurityConfig', colors.green);
}

// Guardar cambios si hubo modificaciones
if (modified) {
  fs.writeFileSync(androidManifestPath, manifestContent, 'utf8');
  log('\n✅ AndroidManifest.xml modificado correctamente', colors.green);
} else {
  log('\n✅ AndroidManifest.xml ya estaba configurado correctamente', colors.green);
}

log('\n🎉 Configuración completada!\n', colors.green);
log('Próximos pasos:', colors.blue);
log('  1. npm run build', colors.yellow);
log('  2. npx cap sync', colors.yellow);
log('  3. npx cap open android', colors.yellow);
log('  4. En Android Studio: Build → Clean Project → Rebuild Project\n', colors.yellow);
