import { Injectable } from '@angular/core';
import { CanActivate,ActivatedRouteSnapshot, RouterStateSnapshot, Router, GuardResult, MaybeAsync  } from '@angular/router';
import { LoginService } from './services/login.service';
import { ToastController } from '@ionic/angular';

@Injectable ({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate{
  constructor(private loginService: LoginService, private router: Router, private toastController: ToastController){}


  /*Metodo para ver si permite activar la ruta*/
  async canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): Promise<boolean> {

    const estaAutenticado = await this.loginService.estaAutenticado();

    /*mensaje de error en caso de no estar autenticado*/
    if (!estaAutenticado){
      this.presentToast('ERROR ********Debes iniciar sesión para acceder a esta página.******', 'danger');
      this.router.navigate(['./login']);
    } 
    
    return estaAutenticado;
  }

  /*error*/
  async presentToast(message: string, color: string){
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      position: 'bottom',
      color: color
    });
    toast.present();
  }

}