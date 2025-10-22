# Migración de Base de Datos - Metronomo

## Problema

La tabla `metronome_presets` fue creada con un esquema que no coincide con la entidad TypeORM del backend, causando errores 500 al intentar consultar los presets.

### Esquema antiguo (init.sql):
- `beats_per_measure`, `note_value`, `user_id`, `sound_type`, `created_at`, `updated_at`

### Esquema nuevo (TypeORM entity):
- `timeSignature`, `accentFirst`, `soundType`, `createdAt`, `updatedAt`

## Solución

Ejecutar el script de migración para actualizar el esquema de la tabla.

## Pasos para ejecutar la migración

### Opción 1: Usando Docker (Recomendado)

```bash
# Desde el directorio raíz del proyecto
docker exec -i metronome-postgres psql -U metronome_user -d metronome_db < database/migrate-preset-schema.sql
```

### Opción 2: Usando psql directamente

```bash
psql -h localhost -p 5432 -U metronome_user -d metronome_db -f database/migrate-preset-schema.sql
```

### Opción 3: Copiar y pegar en un cliente SQL

1. Conectar a la base de datos usando tu cliente SQL favorito (DBeaver, pgAdmin, etc.)
2. Abrir el archivo `database/migrate-preset-schema.sql`
3. Ejecutar todo el contenido del archivo

## Verificación

Después de ejecutar la migración, verificar que la tabla tiene las columnas correctas:

```sql
\d metronome_presets
```

Deberías ver las siguientes columnas:
- `id` (uuid)
- `name` (varchar)
- `bpm` (integer)
- `timeSignature` (varchar)
- `accentFirst` (boolean)
- `soundType` (varchar)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

## Reiniciar el backend

Después de ejecutar la migración, reinicia el backend:

```bash
docker restart metronome-backend
# o
docker-compose restart backend
```

## Notas

- La migración preserva los datos existentes, convirtiendo:
  - `beats_per_measure/note_value` → `timeSignature` (ej: "4/4")
  - `sound_type` → `soundType` (classic→click, wood→wood, electronic→beep)
  - Todos los presets tendrán `accentFirst=true` por defecto
