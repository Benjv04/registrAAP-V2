import { Component } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { LoginService } from '../../services/login.service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  username: string = ''; 
  password: string = '';

  constructor(
    private toastController: ToastController,
    private router: Router,
    private loginService: LoginService
  ) {}

  //validar el login
  async validateLogin() {
    console.log('Ejecutando validacion login');

    const user: Usuario | null = this.loginService.validateLogin(this.username, this.password);

    if (user) {
      this.showToastMessage('Login con exito', 'primary');
      // redigirir por rol

      if (user.rol === 'alumno') {
        user.presente = true; 
        console.log(`Presencia de ${user.name}: ${user.presente ? 'Presente' : 'Ausente'}`);
        this.loginService.actualizarAsistencia(user.username, user.presente);
      }
      
      if (user.rol === 'profesor') {
        this.router.navigate(['/home'], { state: { username: user.username } });
      } else if (user.rol === 'alumno') {
        this.router.navigate(['/home-alumnos'], { state: { username: user.username } });
      }

      this.username = '';
      this.password = '';

    } else {
      this.showToastMessage('Login erroneo', 'danger');
    }
  }

  async showToastMessage(message: string, color: string) {
    const toast = await this.toastController.create({
      duration: 3000,
      message: message,
      position: 'bottom',
      color: color
    });
    toast.present();
  }
}