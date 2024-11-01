import { Component } from '@angular/core';
import { Router } from '@angular/router';
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

  async validateLogin() {
    console.log('Ejecutando validación login');
    
    const user: Usuario | null = this.loginService.validateLogin(this.username, this.password);

    if (user) {
      await this.loginService.guardarUsuario(user);

      this.showToastMessage('Login con exito', 'primary');
      //redirigir segun rol
      //alumno
      if (user.rol === 'alumno') {
        user.presente = true; 
        this.loginService.actualizarAsistencia(user.username, user.presente);
        console.log(`Presencia de ${user.name}: ${user.presente ? 'Presente' : 'Ausente'}`);
        this.router.navigate(['/home-alumnos'], { state: { username: user.username } });
      } 
      //admin
      else if (user.rol === 'admin') {
        this.router.navigate(['/admin'], { state: { username: user.username } });
        console.log('redirigiendo a admin');
      } 
      //profesor
      else if (user.rol === 'profesor') {
        this.router.navigate(['/home'], { state: { username: user.username } });
        console.log('redirigiendo a profesor');
      } 

      this.username = '';
      this.password = '';
    } 
    //mensaje de error
    else {
      this.showToastMessage('¡Login erroneo!', 'danger');
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
