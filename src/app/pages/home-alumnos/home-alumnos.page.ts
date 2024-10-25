import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LoginService } from '../../services/login.service';
import { Usuario } from '../../models/usuario';

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
  usuario: Usuario | null= null;
  fechaHoraRegistro: string | null = null;
  mensajeBienvenida: string = '';
  feriados: any[] = [];

  constructor(private router: Router, private apiService: ApiService,
    private loginService: LoginService
  ) {}

  async ngOnInit() {
    const isAuthenticated = await this.loginService.estaAutenticado();
    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuario = await this.loginService.obtenerUsuario();
    console.log('Usuario autenticado:', this.usuario);

    this.mensajeBienvenida = `Bienvenido, ${this.usuario?.name || 'alumno'}!`;
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

  async cerrarSesion() {
    await this.loginService.cerrarSesion(); 
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