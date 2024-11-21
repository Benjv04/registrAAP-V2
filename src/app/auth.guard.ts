import { Injectable } from '@angular/core';
import { CanActivate,ActivatedRouteSnapshot, RouterStateSnapshot, Router, GuardResult, MaybeAsync  } from '@angular/router';
import { LoginService } from './services/login.service';
import { ToastController } from '@ionic/angular';

@Injectable ({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate{
  constructor(private loginService: LoginService, private router: Router, private toastController: ToastController){}


  /*metodo para ver si permite activar la ruta*/
  async canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): Promise<boolean> {

    const estaAutenticado = await this.loginService.estaAutenticado();

    /*mensaje de error en caso de no estar autenticado*/
    if (!estaAutenticado){
      this.presentToast('inicia sesion para acceder a esta pagina', 'danger','warning');
      this.router.navigate(['./login']);
    } 
    
    return estaAutenticado;
  }

   /* Mostrar mensaje de error personalizado con icono */
   async presentToast(message: string, color: string, type: 'warning' | 'info' | 'error' = 'info') {
    let icon = '';

    /* Selecciona el icono segun  tipo de mensaje*/
    switch (type) {
      case 'warning':
        icon = '⚠️';  // Advertencia
        break;
      case 'info':
        icon = 'ℹ️';  // Informacion
        break;
      case 'error':
        icon = '❌';  // Error
        break;
      default:
        icon = 'ℹ️';  // default (no se me ocuarrio otro icono)
    }

    const toast = await this.toastController.create({
      message: `${icon} ${message}`,
      duration: 5000,
      position: 'bottom',
      color: color,
      cssClass: 'alerta-naveg'
    });
    toast.present();
  }
  }

