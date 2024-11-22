import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeolocalizacionService {
  private latitud: number | null = null;
  private longitud: number | null = null;
  private nombreEstudiante: string | null = null;

  setGeolocalizacion(latitud: number, longitud: number, nombreEstudiante: string) {
    this.latitud = latitud;
    this.longitud = longitud;
    this.nombreEstudiante = nombreEstudiante;
  }

  getGeolocalizacion() {
    return {
      latitud: this.latitud,
      longitud: this.longitud,
      nombreEstudiante: this.nombreEstudiante
    };
  }
}
