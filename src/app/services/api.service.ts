import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'https://api.boostr.cl/holidays.json'; // URL de la API
  private localStorageKey = 'customHolidays'; // Clave para feriados locales

  constructor(private http: HttpClient) {}

  // Función para normalizar fechas (formato YYYY-MM-DD)
  private normalizeDate(date: string | Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  // Obtener feriados combinados (API + Local)
  getFeriados(): Observable<any> {
    return this.http.get(this.apiUrl).pipe(
      map((response: any) => {
        const apiHolidays = (response.data || []).map((holiday: any) => ({
          ...holiday,
          date: this.normalizeDate(holiday.date), // Normalizar fecha
          isCustom: false,
        }));

        const localHolidays = (JSON.parse(localStorage.getItem(this.localStorageKey) || '[]') || []).map((holiday: any) => ({
          ...holiday,
          date: this.normalizeDate(holiday.date), // Normalizar fecha
          isCustom: true,
        }));

        return [...apiHolidays, ...localHolidays];
      }),
      catchError((error) => {
        console.error('Error obteniendo los feriados', error);
        return of([]); // En caso de error, retornar arreglo vacío
      })
    );
  }

  // Agregar un nuevo feriado a localStorage
  addFeriado(feriado: { date: string; title: string }): boolean {
    const customHolidays = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
    const formattedDate = this.normalizeDate(feriado.date);
    const today = this.normalizeDate(new Date());

    if (formattedDate < today) {
      console.error('No se pueden agregar feriados en el pasado');
      return false;
    }

    const existe = customHolidays.some(
      (h: any) => this.normalizeDate(h.date) === formattedDate
    );

    if (existe) {
      console.error('El feriado ya existe');
      return false;
    }

    customHolidays.push({
      ...feriado,
      date: formattedDate,
    });

    localStorage.setItem(this.localStorageKey, JSON.stringify(customHolidays));
    console.log('Feriado agregado:', feriado);
    return true;
  }

  // Eliminar un feriado de localStorage
  deleteFeriado(date: string): boolean {
    let customHolidays = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
    const formattedDate = this.normalizeDate(date);

    const nuevosFeriados = customHolidays.filter(
      (h: any) => this.normalizeDate(h.date) !== formattedDate
    );

    if (customHolidays.length === nuevosFeriados.length) {
      console.error('No se encontró el feriado para eliminar');
      return false;
    }

    localStorage.setItem(this.localStorageKey, JSON.stringify(nuevosFeriados));
    console.log('Feriado eliminado:', formattedDate);
    return true;
  }
}
