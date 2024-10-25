import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home-alumnos',
  templateUrl: './home-alumnos.page.html',
  styleUrls: ['./home-alumnos.page.scss'],
})
export class HomeAlumnosPage implements OnInit {
  fechaHoraRegistro: string | null = null;
  mensajeBienvenida: string = '';
  feriados: any[] = [];

  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit() {
    this.mensajeBienvenida = 'Bienvenido al registro de asistencia';
    console.log(this.mensajeBienvenida);

    this.obtenerFeriados();
  }

  registrarAsistencia() {
    this.fechaHoraRegistro = new Date().toLocaleString();
    console.log('Asistencia registrada en:', this.fechaHoraRegistro);
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }

  obtenerFeriados() {
    this.apiService.getFeriados().subscribe(
      (response) => {
        if (response.status === 'success' && response.data) {
          this.feriados = response.data.slice(0, 5);
        } else {
          console.log('No se encontraron feriados');
          this.feriados = [];
        }
        console.log('Feriados obtenidos:', this.feriados);
      },
      (error) => {
        console.error('Error al obtener los feriados', error);
      }
    );
  }
}