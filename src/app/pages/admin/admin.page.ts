import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { Usuario } from '../../models/usuario';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  alumnos: Usuario[] = [];
  mostrarFormulario = false; 
  alumnoSeleccionado: Usuario | null = null; 

  //formulario
  nuevoAlumno: Usuario = new Usuario('', '', 'alumno', '', '');

  constructor(private router: Router,private loginService: LoginService,
    private toastController: ToastController, private alertController: AlertController, 
  ) {}

  ngOnInit() {
    this.cargarAlumnos();
  }

  //cargar alumnos desde LoginService
  async cargarAlumnos() {
    this.alumnos = this.loginService.getAlumnos();
  }

  //abrir formulario para editar
  abrirFormulario(alumno?: Usuario) {
    console.log("Abriendo formulario", alumno);
    this.mostrarFormulario = true;
  
    if (alumno) {
      this.alumnoSeleccionado = alumno;
      this.nuevoAlumno = { ...alumno };
    } else {
      this.alumnoSeleccionado = null;
      this.nuevoAlumno = new Usuario('', '', 'alumno', '', '');
    }
  }
  

  //guardar alumno (agregar o editar)
  async guardarAlumno() {
    if (this.alumnoSeleccionado) {
      //editar alumno
      await this.loginService.editarAlumno(this.nuevoAlumno);
    } else {
      //agregar alumno
      await this.loginService.agregarAlumno(this.nuevoAlumno);
    }

    this.cargarAlumnos(); 
    this.cerrarFormulario(); 
  }

  //eliminar alumno
  async eliminarAlumno(username: string) {
    await this.loginService.eliminarAlumno(username);
    this.cargarAlumnos();
  }

  //cerrar formulario
  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.nuevoAlumno = new Usuario('', '', 'alumno', '', ''); // Reiniciar el modelo
  }
  async cerrarSesion() {
    await this.loginService.cerrarSesion();  
    this.router.navigate(['/login']); 
  }

  async confirmarRestablecerUsuarios() {
    const alert = await this.alertController.create({
      header: 'Confirmar reset',
      message: 'Ingrese su contraseña para confirmar.',
      inputs: [
        {
          name: 'password',
          type: 'password',
          placeholder: 'Contraseña',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: async (data) => {
            const adminPassword = '12345'; 
            if (data.password === adminPassword) {
              await this.restablecerUsuarios();
              this.showToast('Usuarios restablecidos con exito', 'success');
            } else {
              this.showToast('Contraseña incorrecta', 'danger');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async restablecerUsuarios() {
    await this.loginService.resetUsuarios();
    this.cargarAlumnos();
  }
  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
    });
    await toast.present();
  }
}
