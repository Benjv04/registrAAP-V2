import { Component } from '@angular/core';
import { LoginService } from '../../services/login.service'; 
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-reset-pass',
  templateUrl: './reset-pass.page.html',
  styleUrls: ['./reset-pass.page.scss'],
})
export class ResetPassPage {
  mostrarcontrasena: boolean = false;
  mostrarCodigo: boolean = false;
  email: string = '';
  codigo: string = ''
  password: string = '';
  confirmarcontrasena: string = '';

  constructor(
    private loginService: LoginService,
    private toastController: ToastController,
    private router: Router,
    private alertController: AlertController    
  ) {}

  verificacion() {
    console.log('Verificando usuario:', this.email);
    if (this.loginService.userExists(this.email)) {
      this.mostrarCodigo = true;
      this.presentToast('Usuario encontrado. Por favor, ingrese codigo de verificacion.','success');
    } else {
      this.presentToast('Usuario no encontrado. Verifique el nombre de usuario.','danger');
    }
  }

  verificarCodigo(){
    if (this.codigo.trim() !== '') {  
      this.mostrarCodigo = false;
      this.mostrarcontrasena = true;
      this.presentToast('Código verificado. Ingresa tu nueva contraseña.', 'success');

      this.email= ''; /* para k se borre el usuario antes agregado*/

    } else {
      this.presentToast('Código incorrecto. Verifica e inténtalo de nuevo.', 'danger');
    }
  }

  async confirmarRestablecimiento() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: 'Estas seguro de que deseas restablecer la contraseña?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.onSubmit(); 
          }
        }
      ]
    });

    await alert.present();
  }  

  async ngOnInit() {
    const isAuthenticated = await this.loginService.estaAutenticado();
    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
  } 

  onSubmit() {
    if (this.password !== this.confirmarcontrasena) {
      this.presentToast('Las contraseñas no coinciden','danger');
      return;
    }

    if (this.loginService.cambiarcontraseña(this.email, this.password)) {
      this.presentToast('Contraseña cambiada con exito','success');
      this.router.navigate(['/login']);
    } else {
      this.presentToast('Error al cambiar la contraseña','danger');
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color 
    });
    toast.present();
  }
}