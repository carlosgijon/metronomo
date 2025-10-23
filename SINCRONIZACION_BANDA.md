# Sincronización de Metrónomo para Bandas

## ⚠️ Limitaciones Físicas

La latencia de red es un problema **físico**, no de software:

| Escenario | Latencia típica | ¿Tolerable para música? |
|-----------|----------------|------------------------|
| Red local (WiFi) | 1-5ms | ✅ SÍ |
| Misma ciudad | 10-30ms | ⚠️ Apenas |
| Mismo país | 30-80ms | ❌ NO |
| Internacional | 100-300ms | ❌ Imposible |

**Para tocar música sincronizados necesitas < 20-30ms de latencia total.**

---

## 🎯 Soluciones según tu caso

### 1. **MISMO LUGAR FÍSICO** ⭐ (Red Local)

**Escenario:** Banda ensayando en el mismo espacio con auriculares individuales.

**Solución:**
- Todos conectados al mismo WiFi/router
- Latencia: 1-5ms (imperceptible)
- **Esta aplicación funciona perfectamente para esto**

**Configuración:**
```bash
# En el backend, asegúrate de estar escuchando en la IP local
# frontend/src/environments/environment.ts
export const environment = {
  wsUrl: 'ws://192.168.1.X:3000'  // IP local del router
};
```

**Ventajas:**
- ✅ Latencia imperceptible
- ✅ Metrónomo perfectamente sincronizado
- ✅ Todos escuchan el mismo timing

---

### 2. **UBICACIONES REMOTAS CON METRÓNOMO COMPARTIDO**

**Escenario:** Cada músico en su casa, quieren practicar con el mismo tempo.

**Solución actual (ya implementada):**
- Cada dispositivo ejecuta el metrónomo **localmente**
- El master controla START/STOP/BPM
- Cada músico escucha su propio metrónomo local
- **NO intentan tocar juntos en tiempo real** (físicamente imposible)

**Uso:**
1. Master envía comando START
2. Todos los metrónomos inician casi simultáneamente
3. Cada uno practica su parte individualmente
4. Se graban por separado y luego se mezclan

**Ventajas:**
- ✅ Timing perfecto individual
- ✅ Mismo tempo para todos
- ❌ No pueden tocar juntos en tiempo real (limitación física)

---

### 3. **GRABAR PARTES POR SEPARADO** ⭐ (Método profesional)

**Escenario:** Cada músico graba su parte por separado.

**Método:**
1. Master envía pista guía (bajo/batería/clic)
2. Cada músico descarga la pista
3. Cada uno graba su parte localmente con el metrónomo
4. Se envían las pistas y se mezclan

**Ventajas:**
- ✅ Sin problemas de latencia
- ✅ Calidad de audio profesional
- ✅ Método usado por bandas profesionales durante COVID

---

### 4. **SERVICIOS ESPECIALIZADOS DE BAJA LATENCIA**

Si realmente necesitas tocar en tiempo real remotamente:

**Opciones comerciales:**
- **JamKazam** (latencia ~20-40ms en condiciones óptimas)
- **JackTrip** (código abierto, requiere configuración técnica)
- **SonoBus** (gratuito, buena calidad)
- **Audiomovers Listento** (profesional, costoso)

**Requisitos:**
- Conexión de fibra óptica
- Estar en la misma región geográfica
- Router configurado correctamente (port forwarding)
- Interfaz de audio de baja latencia
- Auriculares (no altavoces)

**Limitaciones:**
- Funciona SOLO entre personas en la misma región
- Requiere conexiones excelentes
- Incluso así, hay latencia perceptible

---

## 🎵 Nuestra Aplicación: Para Qué Sirve

### ✅ Casos de uso IDEALES:

1. **Ensayo presencial con auriculares individuales**
   - Todos en la misma sala
   - Conexión WiFi local
   - Latencia imperceptible

2. **Práctica individual coordinada**
   - Cada músico practica su parte
   - Mismo tempo para todos
   - No intentan tocar juntos

3. **Grabación multipista remota**
   - Master envía pista guía
   - Todos graban con el mismo metrónomo
   - Se mezcla después

### ❌ NO sirve para:

- Tocar juntos en tiempo real desde ubicaciones remotas
  (esto es **físicamente imposible** con Internet normal)

---

## 🔧 Configuración Óptima para Red Local

Si estás en el mismo lugar físico, maximiza el rendimiento:

### Backend (servidor)
```bash
# Usar IP local del router, no localhost
cd backend
npm start
# Servidor corriendo en http://192.168.1.100:3000
```

### Frontend
```typescript
// frontend/src/environments/environment.ts
export const environment = {
  production: false,
  wsUrl: 'ws://192.168.1.100:3000'  // IP del servidor
};
```

### Red
1. Conectar todos los dispositivos al **mismo WiFi**
2. Usar WiFi 5GHz (más rápido que 2.4GHz)
3. Estar cerca del router
4. Cerrar otras aplicaciones que usen red

---

## 📊 Comparación de Soluciones

| Solución | Latencia | Costo | Complejidad | Calidad |
|----------|----------|-------|-------------|---------|
| **Red Local (esta app)** | 1-5ms | Gratis | Baja | ⭐⭐⭐⭐⭐ |
| **Metrónomo local** | 0ms | Gratis | Baja | ⭐⭐⭐⭐ |
| **JamKazam** | 20-50ms | Gratis/Pago | Media | ⭐⭐⭐ |
| **JackTrip** | 10-30ms | Gratis | Alta | ⭐⭐⭐⭐ |
| **Grabar separado** | N/A | Gratis | Baja | ⭐⭐⭐⭐⭐ |

---

## 🎯 Recomendación Final

### Si están en el mismo lugar:
**Usa esta aplicación con red local** → Funciona perfectamente

### Si están en lugares remotos:
**NO intentes tocar en tiempo real** → Es físicamente imposible con Internet normal

**En su lugar:**
1. Usa esta app para que todos practiquen con el mismo tempo
2. Graben partes por separado
3. Mezclen después

O usa servicios especializados como JamKazam si:
- Están en la misma ciudad
- Tienen fibra óptica
- Pueden tolerar 20-40ms de latencia

---

## ❓ ¿Qué latencia estás experimentando?

Si ves latencia con el nuevo sistema local:
- ¿Están en el mismo lugar físico o remotos?
- ¿Qué tipo de latencia? (¿inicio del metrónomo? ¿entre beats?)
- ¿En qué dispositivo? (móvil/PC)

El metrónomo local que implementé NO debería tener latencia en los beats individuales.
