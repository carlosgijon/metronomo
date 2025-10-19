import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Preset {
  id?: string;
  name: string;
  bpm: number;
  beats_per_measure: number;
  note_value?: number;
  sound_type?: string;
  is_favorite?: boolean;
  user_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Session {
  id?: string;
  user_id?: string;
  preset_id?: string;
  duration_minutes: number;
  notes?: string;
  started_at?: Date;
  ended_at?: Date;
  rating?: number;
}

@Injectable({
  providedIn: 'root',
})
export class MetronomeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Presets
  getAllPresets(): Observable<Preset[]> {
    return this.http.get<Preset[]>(`${this.apiUrl}/presets`);
  }

  getPreset(id: string): Observable<Preset> {
    return this.http.get<Preset>(`${this.apiUrl}/presets/${id}`);
  }

  getFavoritePresets(): Observable<Preset[]> {
    return this.http.get<Preset[]>(`${this.apiUrl}/presets/favorites`);
  }

  createPreset(preset: Preset): Observable<Preset> {
    return this.http.post<Preset>(`${this.apiUrl}/presets`, preset);
  }

  updatePreset(id: string, preset: Partial<Preset>): Observable<Preset> {
    return this.http.put<Preset>(`${this.apiUrl}/presets/${id}`, preset);
  }

  deletePreset(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/presets/${id}`);
  }
}
