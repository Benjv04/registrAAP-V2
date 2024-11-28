
import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { Usuario } from '../../models/usuario';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  alumnos: Usuario[] = [];
  mostrarFormulario = false;
  alumnoSeleccionado: Usuario | null = null;

  // Formulario de alumnos
  nuevoAlumno: Usuario = new Usuario('', '', 'alumno', '', '');

  // Manejo de feriados
  feriados: any[] = [];
  nuevoFeriado = { date: '', title: '' };

  constructor(
    private router: Router,
    private loginService: LoginService,
    private toastController: ToastController,
    private alertController: AlertController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.cargarAlumnos();
    this.cargarFeriados();
  }

  // Cargar alumnos desde LoginService
  async cargarAlumnos() {
    this.alumnos = this.loginService.getAlumnos();
  }

  // Abrir formulario para editar
  abrirFormulario(alumno?: Usuario) {
    console.log('Abriendo formulario', alumno);
    this.mostrarFormulario = true;

    if (alumno) {
      this.alumnoSeleccionado = alumno;
      this.nuevoAlumno = { ...alumno };
    } else {
      this.alumnoSeleccionado = null;
      this.nuevoAlumno = new Usuario('', '', 'alumno', '', '');
    }
  }

  // Guardar alumno (agregar o editar)
  async guardarAlumno() {
    if (this.alumnoSeleccionado) {
      await this.loginService.editarAlumno(this.nuevoAlumno);
    } else {
      await this.loginService.agregarAlumno(this.nuevoAlumno);
    }

    this.cargarAlumnos();
    this.cerrarFormulario();
  }

  // Eliminar alumno
  async eliminarAlumno(username: string) {
    await this.loginService.eliminarAlumno(username);
    this.cargarAlumnos();
  }

  // Cerrar formulario
  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.nuevoAlumno = new Usuario('', '', 'alumno', '', '');
  }

  // Cerrar sesión
  async cerrarSesion() {
    await this.loginService.cerrarSesion();
    this.router.navigate(['/login']);
  }

  // Confirmar restablecer usuarios
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
            const adminPassword = '12345'; // Contraseña fija de admin (por ahora 12345)
            if (data.password === adminPassword) {
              await this.restablecerUsuarios();
              this.showToast('Usuarios restablecidos con éxito', 'success');
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

  // Mostrar un mensaje de notificación
  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
    });
    await toast.present();
  }

  // Cargar feriados desde la API
  async cargarFeriados() {
    try {
      this.feriados = await this.apiService.getFeriados().toPromise();
  
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      this.feriados = this.feriados
        .filter((feriado: { date: string }) => {
          const feriadoDate = new Date(feriado.date);
          return feriadoDate >= today;
        })
        .sort((a: { date: string }, b: { date: string }) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
  
      console.log('Feriados futuros obtenidos:', this.feriados);
    } catch (error) {
      console.error('Error al cargar los feriados', error);
      this.showToast('Error al cargar los feriados', 'danger');
    }
  }
  

  // Agregar un feriado personalizado
  async agregarFeriado() {
    const alert = await this.alertController.create({
      header: 'Agregar Feriado',
      inputs: [
        {
          name: 'date',
          type: 'date',
          label: 'Fecha',
          placeholder: 'Selecciona una fecha',
        },
        {
          name: 'title',
          type: 'text',
          label: 'Título',
          placeholder: 'Título del feriado',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.date && data.title) {
              this.apiService.addFeriado({ date: data.date, title: data.title });
              this.showToast('Feriado agregado con éxito', 'success');
              this.cargarFeriados();
            } else {
              this.showToast('Por favor complete todos los campos', 'warning');
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  

  // Eliminar un feriado personalizado
  async eliminarFeriado(date: string) {
    const apiHoliday = this.feriados.find(
      (feriado) => feriado.date === date && !feriado.isCustom
    );
  
    if (apiHoliday) {
      this.showToast('No se puede eliminar un feriado oficial', 'danger');
      return;
    }
  
    // Si es un feriado personalizado, eliminarlo
    this.apiService.deleteFeriado(date);
    this.showToast('Feriado eliminado con éxito', 'success');
    this.cargarFeriados();
  }
  
}
