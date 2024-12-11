import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { Usuario } from '../../models/usuario';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  texto: string = '';
  alumnos: Usuario[] = [];
  alumnosFiltrados: Usuario[] = [];
  cursos: string[] = ['A', 'B', 'C'];
  mostrarAlumnos: boolean = false;
  cursoSeleccionado: string = '';

  latitud: number | null = null;
  longitud: number | null = null;

  asignatura: string = '';
  seccion: string = 'A';
  sala: string = '';
  fecha: string = '';

  horario: { [key: string]: string } = {
    '08:00-10:00': 'Matematicas',
    '10:00-12:00': 'Inglés',
    '12:00-14:00': 'Quimica',
    '14:00-16:00': 'Historia',
    '16:00-22:00': 'Educacion fisica',
  };

  salas: { [key: string]: string } = {
    'Matematicas': '001',
    'Inglés': '002',
    'Quimica': '003',
    'Historia': '004',
    'Educacion fisica': 'Patio',
  };

  constructor(private router: Router, private loginService: LoginService) {}

  async ngOnInit() {
    const isAuthenticated = await this.loginService.estaAutenticado();
    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    this.alumnos = this.loginService.getAlumnos();
    this.fecha = new Date().toLocaleDateString(); 
  }

  generarQR() {
    this.asignatura = this.obtenerAsignaturaActual();
    if (this.asignatura === '') {
      console.error('No hay una asignatura asignada para la hora actual');
      return;
    }

    this.sala = this.obtenerSalaAsignatura(this.asignatura);
    this.texto = `${this.asignatura}|${this.seccion}|${this.sala}|${this.fecha}`;
    console.log('QR generado:', this.texto);
  }

  obtenerAsignaturaActual(): string {
    const now = new Date();
    const currentHour = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

    for (let rango in this.horario) {
      const [start, end] = rango.split('-');
      if (this.estaEnRango(currentHour, start, end)) {
        return this.horario[rango];
      }
    }
    return '';
  }

  obtenerSalaAsignatura(asignatura: string): string {
    return this.salas[asignatura] || '000';
  }

  estaEnRango(current: string, start: string, end: string): boolean {
    return current >= start && current <= end;
  }

  async cerrarSesion() {
    await this.loginService.cerrarSesion();
    this.router.navigate(['/login']);
  }

  cambiarPresencia(alumno: Usuario) {
    alumno.presente = !alumno.presente;
    console.log(`Presencia de ${alumno.name}: ${alumno.presente ? 'Presente' : 'Ausente'}`);
    this.loginService.actualizarAsistencia(alumno.username, alumno.presente);
  }

  async obtenerGeolocalizacion() {
    try {
      const posicion = await Geolocation.getCurrentPosition();
      this.latitud = posicion.coords.latitude;
      this.longitud = posicion.coords.longitude;
      console.log(`Latitud: ${this.latitud}, Longitud: ${this.longitud}`);
    } catch (error) {
      console.error('Error obteniendo la geolocalización:', error);
    }
  }

  verAlumnos(curso: string) {
    this.cursoSeleccionado = curso;

    if (curso === 'A') {
      this.alumnosFiltrados = this.alumnos.slice(0, Math.floor(this.alumnos.length / 3));
    } else if (curso === 'B') {
      this.alumnosFiltrados = this.alumnos.slice(
        Math.floor(this.alumnos.length / 3),
        Math.floor((this.alumnos.length * 2) / 3)
      );
    } else if (curso === 'C') {
      this.alumnosFiltrados = this.alumnos.slice(Math.floor((this.alumnos.length * 2) / 3));
    }

    this.mostrarAlumnos = true;
  }

  volverCursos() {
    this.mostrarAlumnos = false;
    this.cursoSeleccionado = '';
    this.alumnosFiltrados = [];
  }
}
