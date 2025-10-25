export enum WSMessageType {
  // Latency measurement
  PING = 'ping',
  PONG = 'pong',

  // User management
  USER_CONNECTED = 'user_connected',
  USER_DISCONNECTED = 'user_disconnected',
  CLIENT_READY = 'client_ready',

  // Metronome control
  METRONOME_STATE = 'metronome_state',
  METRONOME_START = 'metronome_start',
  METRONOME_STOP = 'metronome_stop',
  METRONOME_UPDATE = 'metronome_update',
  BEAT_EVENT = 'beat_event',

  // Presets
  PRESET_CREATED = 'preset_created',
  PRESET_UPDATED = 'preset_updated',
  PRESET_DELETED = 'preset_deleted',

  // Errors
  ERROR = 'error'
}

export interface WSMessage<T = any> {
  type: WSMessageType;
  payload: T;
  timestamp?: number;
}
