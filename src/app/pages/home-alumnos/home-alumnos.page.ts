import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home-alumnos',
  templateUrl: './home-alumnos.page.html',
  styleUrls: ['./home-alumnos.page.scss'],
})
export class HomeAlumnosPage implements OnInit {
  fechaHoraRegistro: string | null = null;
  mensajeBienvenida: string = ''; 

  constructor(private router: Router) {}

  ngOnInit() {
    this.mensajeBienvenida = 'Bienvenido al registro de asistencia';
    console.log(this.mensajeBienvenida);
  }

  registrarAsistencia() {
    this.fechaHoraRegistro = new Date().toLocaleString();
    console.log('Asistencia registrada en:', this.fechaHoraRegistro);
  }

  cerrarSesion() {
    this.router.navigate(['/login']); 
  }  
}
