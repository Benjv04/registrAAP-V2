import { Injectable } from '@angular/core';
import { CanActivate,ActivatedRouteSnapshot, RouterStateSnapshot, Router, GuardResult, MaybeAsync  } from '@angular/router';
import { LoginService } from './services/login.service';

@Injectable ({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate{
  constructor(private loginService: LoginService, private router: Router){}


  /*Metodo para ver si permite activar la ruta*/
  async canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): Promise<boolean> {

    const isAuthenticated = await this.loginService.estaAutenticado();
    if (!isAuthenticated){
      this.router.navigate(['/src/app/pages/login']);
      return false;
    } 
    
    return true;
  }

}