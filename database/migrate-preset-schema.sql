-- Migración para actualizar el esquema de metronome_presets
-- para que coincida con la entidad TypeORM

-- Paso 1: Crear tabla temporal con el nuevo esquema
CREATE TABLE IF NOT EXISTS metronome_presets_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    bpm INTEGER NOT NULL CHECK (bpm >= 30 AND bpm <= 300),
    "timeSignature" VARCHAR(10) NOT NULL DEFAULT '4/4',
    "accentFirst" BOOLEAN NOT NULL DEFAULT TRUE,
    "soundType" VARCHAR(20) NOT NULL DEFAULT 'click',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Paso 2: Migrar datos existentes
INSERT INTO metronome_presets_new (id, name, bpm, "timeSignature", "accentFirst", "soundType", "createdAt", "updatedAt")
SELECT
    id,
    name,
    bpm,
    CONCAT(beats_per_measure::text, '/', note_value::text) as "timeSignature",
    TRUE as "accentFirst",
    CASE
        WHEN sound_type = 'classic' THEN 'click'
        WHEN sound_type = 'wood' THEN 'wood'
        WHEN sound_type = 'electronic' THEN 'beep'
        ELSE 'click'
    END as "soundType",
    created_at as "createdAt",
    updated_at as "updatedAt"
FROM metronome_presets
WHERE EXISTS (SELECT 1 FROM metronome_presets LIMIT 1);

-- Paso 3: Eliminar tabla antigua y renombrar la nueva
DROP TABLE IF EXISTS metronome_presets CASCADE;
ALTER TABLE metronome_presets_new RENAME TO metronome_presets;

-- Paso 4: Recrear índices
CREATE INDEX IF NOT EXISTS idx_presets_created_at ON metronome_presets("createdAt" DESC);

-- Paso 5: Recrear trigger para updated_at
CREATE OR REPLACE FUNCTION update_preset_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_presets_updated_at
    BEFORE UPDATE ON metronome_presets
    FOR EACH ROW EXECUTE FUNCTION update_preset_updated_at_column();

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Esquema de metronome_presets migrado correctamente';
END $$;
