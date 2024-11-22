import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'https://api.boostr.cl/holidays.json';
  private localStorageKey = 'customHolidays';

  constructor(private http: HttpClient) {}

  // Obtener feriados combinados (API + Local)
  getFeriados(): Observable<any> {
    return this.http.get(this.apiUrl).pipe(
      map((response: any) => {
        const apiHolidays = (response.data || []).map((holiday: any) => ({
          ...holiday,
          isCustom: false,
        }));
  
        const localHolidays = (JSON.parse(localStorage.getItem(this.localStorageKey) || '[]') || []).map((holiday: any) => ({
          ...holiday,
          isCustom: true,
        }));
  
        return [...apiHolidays, ...localHolidays];
      }),
      catchError((error) => {
        console.error('Error obteniendo los feriados', error);
        return of([]);
      })
    );
  }
  

  // Agregar un nuevo feriado a localStorage
  addFeriado(feriado: { date: string; title: string }) {
    const customHolidays = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
    customHolidays.push(feriado);
    localStorage.setItem(this.localStorageKey, JSON.stringify(customHolidays));
  }

  // Eliminar un feriado de localStorage
  deleteFeriado(date: string) {
    let customHolidays = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
    customHolidays = customHolidays.filter((h: any) => h.date !== date);
    localStorage.setItem(this.localStorageKey, JSON.stringify(customHolidays));
  }
}
