import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Preset } from '../models/preset.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PresetService {
  private presetsSignal = signal<Preset[]>([]);
  public presets = this.presetsSignal.asReadonly();

  private apiUrl = `${environment.apiUrl}/presets`;

  constructor(private http: HttpClient) {
    this.loadPresets();
  }

  loadPresets(): void {
    this.http.get<Preset[]>(this.apiUrl).subscribe({
      next: (presets) => this.presetsSignal.set(presets),
      error: (error) => console.error('Error cargando presets:', error)
    });
  }

  getPresets(): Observable<Preset[]> {
    return this.http.get<Preset[]>(this.apiUrl).pipe(
      tap(presets => this.presetsSignal.set(presets))
    );
  }

  getPreset(id: string): Observable<Preset> {
    return this.http.get<Preset>(`${this.apiUrl}/${id}`);
  }

  createPreset(preset: Preset): Observable<Preset> {
    return this.http.post<Preset>(this.apiUrl, preset).pipe(
      tap(() => this.loadPresets())
    );
  }

  updatePreset(id: string, preset: Partial<Preset>): Observable<Preset> {
    return this.http.put<Preset>(`${this.apiUrl}/${id}`, preset).pipe(
      tap(() => this.loadPresets())
    );
  }

  deletePreset(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadPresets())
    );
  }
}
