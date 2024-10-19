import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';
import { LoginService } from '../../services/login.service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  texto: string = ''; 
  alumnos:Usuario[]=[];

  constructor(private router: Router, private loginService: LoginService) {}

  ngOnInit() {
    this.alumnos = this.loginService.getAlumnos();
  }

  generarQR() {
    this.texto ='Bienvenido a RegistrAPP';
    console.log('QR generado:', this.texto);
  }

  cerrarSesion() {
    this.router.navigate(['/login']); 
  }

  cambiarPresencia(alumno: Usuario) {
    alumno.presente = !alumno.presente;
    console.log(`Presencia de ${alumno.name}: ${alumno.presente ? 'Presente' : 'Ausente'}`);
    this.loginService.actualizarAsistencia(alumno.username, alumno.presente); 
  }
}

