import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
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
  isLoading = false;

  constructor(
    private toastController: ToastController,
    private router: Router,
    private loginService: LoginService,
    private loadingCtrl: LoadingController
  ) {}

  async validateLogin() {
    console.log('Ejecutando validación login');
    
    // mostrar el loading
    const loading = await this.loadingCtrl.create({
      message: 'Cargando...',
      spinner: 'crescent',
    });
    await loading.present();

    const user: Usuario | null = await this.loginService.validateLogin(this.username, this.password);

    if (user) {
      await this.loginService.guardarUsuario(user);

      this.showToastMessage('Login con éxito', 'primary');

      if (user.rol === 'alumno') {
        await this.router.navigate(['/home-alumnos'], { state: { username: user.username } });
      } //admin
      else if (user.rol === 'admin') {
        await this.router.navigate(['/admin'], { state: { username: user.username } });
        console.log('redirigiendo a admin');
      } //profesor
      else if (user.rol === 'profesor') {
        await this.router.navigate(['/home'], { state: { username: user.username } });
        console.log('redirigiendo a profesor');
      } 

      this.username = '';
      this.password = '';
    } 
    //mensaje de error
    else {
      this.showToastMessage('¡Login erróneo!', 'danger');
    }

    await this.delay(500);
    loading.dismiss();
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

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
