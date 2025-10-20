-- init.sql - Inicialización de la base de datos Metrónomo

-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================== TABLAS ====================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabla de presets de metrónomo
CREATE TABLE IF NOT EXISTS metronome_presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    bpm INTEGER NOT NULL CHECK (bpm >= 30 AND bpm <= 300),
    beats_per_measure INTEGER NOT NULL CHECK (beats_per_measure >= 1 AND beats_per_measure <= 16),
    note_value INTEGER NOT NULL DEFAULT 4 CHECK (note_value IN (1, 2, 4, 8, 16)),
    sound_type VARCHAR(20) DEFAULT 'classic',
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de sesiones de práctica
CREATE TABLE IF NOT EXISTS practice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    preset_id UUID REFERENCES metronome_presets(id) ON DELETE SET NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    notes TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5)
);

-- Tabla de estadísticas del usuario
CREATE TABLE IF NOT EXISTS user_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    total_practice_time INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    favorite_bpm INTEGER,
    last_practice_date TIMESTAMP,
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== ÍNDICES ====================

CREATE INDEX IF NOT EXISTS idx_presets_user_id ON metronome_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_presets_created_at ON metronome_presets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_presets_is_favorite ON metronome_presets(is_favorite);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON practice_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_preset_id ON practice_sessions(preset_id);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ==================== FUNCIONES Y TRIGGERS ====================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presets_updated_at 
    BEFORE UPDATE ON metronome_presets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_statistics_updated_at 
    BEFORE UPDATE ON user_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar estadísticas después de una sesión
CREATE OR REPLACE FUNCTION update_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_statistics (user_id, total_practice_time, total_sessions, last_practice_date)
    VALUES (NEW.user_id, NEW.duration_minutes, 1, NEW.ended_at)
    ON CONFLICT (user_id) DO UPDATE SET
        total_practice_time = user_statistics.total_practice_time + NEW.duration_minutes,
        total_sessions = user_statistics.total_sessions + 1,
        last_practice_date = NEW.ended_at,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estadísticas
CREATE TRIGGER update_statistics_after_session
    AFTER INSERT ON practice_sessions
    FOR EACH ROW 
    WHEN (NEW.ended_at IS NOT NULL)
    EXECUTE FUNCTION update_user_statistics();

-- ==================== VISTAS ====================

-- Vista de presets populares
CREATE OR REPLACE VIEW popular_presets AS
SELECT 
    p.id,
    p.name,
    p.bpm,
    p.beats_per_measure,
    COUNT(s.id) as usage_count,
    AVG(s.rating)::NUMERIC(3,2) as avg_rating
FROM metronome_presets p
LEFT JOIN practice_sessions s ON p.id = s.preset_id
GROUP BY p.id, p.name, p.bpm, p.beats_per_measure
ORDER BY usage_count DESC;

-- Vista de resumen de usuario
CREATE OR REPLACE VIEW user_summary AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.created_at,
    COALESCE(us.total_practice_time, 0) as total_practice_time,
    COALESCE(us.total_sessions, 0) as total_sessions,
    us.last_practice_date,
    us.streak_days,
    COUNT(DISTINCT p.id) as preset_count
FROM users u
LEFT JOIN user_statistics us ON u.id = us.user_id
LEFT JOIN metronome_presets p ON u.id = p.user_id
GROUP BY u.id, u.username, u.email, u.created_at, 
         us.total_practice_time, us.total_sessions, 
         us.last_practice_date, us.streak_days;

-- ==================== DATOS DE EJEMPLO ====================

-- Usuario de demostración
INSERT INTO users (username, email, password_hash) 
VALUES 
    ('demo_user', 'demo@metronome.local', NULL),
    ('practice_master', 'master@metronome.local', NULL)
ON CONFLICT (username) DO NOTHING;

-- Presets predefinidos
INSERT INTO metronome_presets (user_id, name, bpm, beats_per_measure, note_value, sound_type, is_favorite)
SELECT 
    u.id,
    preset_data.name,
    preset_data.bpm,
    preset_data.beats_per_measure,
    preset_data.note_value,
    preset_data.sound_type,
    preset_data.is_favorite
FROM users u
CROSS JOIN (
    VALUES 
        ('Lento - Calentamiento', 60, 4, 4, 'classic', false),
        ('Tempo Medio', 120, 4, 4, 'classic', true),
        ('Rápido - Rock', 140, 4, 4, 'wood', false),
        ('Jazz Swing', 180, 4, 4, 'classic', false),
        ('Vals', 90, 3, 4, 'classic', false),
        ('Tiempo Compuesto', 120, 6, 8, 'electronic', false)
) AS preset_data(name, bpm, beats_per_measure, note_value, sound_type, is_favorite)
WHERE u.username = 'demo_user'
ON CONFLICT DO NOTHING;

-- Inicializar estadísticas para usuarios
INSERT INTO user_statistics (user_id, total_practice_time, total_sessions)
SELECT id, 0, 0 FROM users
ON CONFLICT (user_id) DO NOTHING;

-- ==================== FUNCIONES ÚTILES ====================

-- Función para obtener sesiones recientes
CREATE OR REPLACE FUNCTION get_recent_sessions(
    p_user_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    session_id UUID,
    preset_name VARCHAR,
    duration INTEGER,
    bpm INTEGER,
    started_at TIMESTAMP,
    rating INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        p.name,
        s.duration_minutes,
        p.bpm,
        s.started_at,
        s.rating
    FROM practice_sessions s
    LEFT JOIN metronome_presets p ON s.preset_id = p.id
    WHERE p_user_id IS NULL OR s.user_id = p_user_id
    ORDER BY s.started_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular racha de práctica
CREATE OR REPLACE FUNCTION calculate_practice_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_streak INTEGER := 0;
    v_current_date DATE := CURRENT_DATE;
    v_session_exists BOOLEAN;
BEGIN
    LOOP
        SELECT EXISTS(
            SELECT 1 
            FROM practice_sessions 
            WHERE user_id = p_user_id 
            AND DATE(started_at) = v_current_date
        ) INTO v_session_exists;
        
        IF NOT v_session_exists THEN
            EXIT;
        END IF;
        
        v_streak := v_streak + 1;
        v_current_date := v_current_date - INTERVAL '1 day';
    END LOOP;
    
    RETURN v_streak;
END;
$$ LANGUAGE plpgsql;

-- ==================== PERMISOS ====================

-- Otorgar permisos al usuario de la aplicación
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO metronome_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO metronome_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO metronome_user;

-- ==================== MENSAJES DE CONFIRMACIÓN ====================

DO $$
BEGIN
    RAISE NOTICE '✅ Base de datos inicializada correctamente';
    RAISE NOTICE '📊 Tablas creadas: users, metronome_presets, practice_sessions, user_statistics';
    RAISE NOTICE '🔍 Índices creados para optimización';
    RAISE NOTICE '⚡ Triggers y funciones configurados';
    RAISE NOTICE '👤 Usuario demo creado: demo_user';
    RAISE NOTICE '🎵 Presets de ejemplo agregados';
END $$;
