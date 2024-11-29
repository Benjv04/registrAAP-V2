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
          date: new Date(holiday.date).toISOString().split('T')[0], // Formato consistente
          isCustom: false,
        }));

        const localHolidays = (JSON.parse(localStorage.getItem(this.localStorageKey) || '[]') || []).map((holiday: any) => ({
          ...holiday,
          date: new Date(holiday.date).toISOString().split('T')[0], // Formato consistente
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
  
    const formattedDate = new Date(feriado.date).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
  
    console.log('Feriado recibido:', feriado);
    console.log('Fecha normalizada:', formattedDate, 'Hoy:', today);
  
    if (formattedDate < today) {
      console.error('No se pueden agregar feriados en el pasado');
      return;
    }
  
    const existe = customHolidays.some(
      (h: any) => new Date(h.date).toISOString().split('T')[0] === formattedDate
    );
  
    if (existe) {
      console.error('El feriado ya existe');
      return;
    }
  
    customHolidays.push({
      ...feriado,
      date: formattedDate,
    });
  
    localStorage.setItem(this.localStorageKey, JSON.stringify(customHolidays));
    console.log('Feriado agregado:', feriado);
  }

  // Eliminar un feriado de localStorage
  deleteFeriado(date: string) {
    let customHolidays = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
    const formattedDate = new Date(date).toISOString().split('T')[0]; // Formatear fecha

    customHolidays = customHolidays.filter(
      (h: any) => new Date(h.date).toISOString().split('T')[0] !== formattedDate
    );
    localStorage.setItem(this.localStorageKey, JSON.stringify(customHolidays));
  }
}
