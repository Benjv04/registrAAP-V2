import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface Feriado {
  date: string;
  title: string;
  type: string;
  inalienable: boolean;
  extra: string;
}

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
  
    setTimeout(() => {
      const elem = document.querySelector('.asisRegist');
      if (elem) {
        elem.classList.add('hidden');
      }
      setTimeout(() => {
        this.fechaHoraRegistro = null;
      }, 500);
    }, 3000);
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }

  obtenerFeriados() {
    this.apiService.getFeriados().subscribe(
      (response) => {
        if (response.status === 'success' && response.data) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          this.feriados = response.data
            .filter((feriado: Feriado) => {
              const feriadoDate = new Date(feriado.date); 
              return feriadoDate >= today;
            })
            .slice(0, 5);
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