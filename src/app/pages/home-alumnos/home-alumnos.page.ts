import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LoginService } from '../../services/login.service';
import { Usuario } from '../../models/usuario';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController } from '@ionic/angular';


interface Feriado {
  date: string;
  title: string;
  type: string;
  inalienable: boolean;
  extra: string;
}

@Component({
  selector: 'app-home-alumnos',
  templateUrl: './home-alumnos.page.html',
  styleUrls: ['./home-alumnos.page.scss'],
})
export class HomeAlumnosPage implements OnInit {
  usuario: Usuario | null= null;
  fechaHoraRegistro: string | null = null;
  mensajeBienvenida: string = '';
  feriados: any[] = [];
  foto: string | null = null;

  constructor(private router: Router, private apiService: ApiService,
    private loginService: LoginService,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    const isAuthenticated = await this.loginService.estaAutenticado();
    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuario = await this.loginService.obtenerUsuario();
    console.log('Usuario autenticado:', this.usuario);

    this.mensajeBienvenida = `Bienvenido, ${this.usuario?.name || 'alumno'}!`;
    console.log(this.mensajeBienvenida);

    this.obtenerFeriados();
  }

  async registrarAsistencia() {
    try {
      await this.abrirCamara();
  
      this.fechaHoraRegistro = new Date().toLocaleString();
      console.log('Asistencia registrada en:', this.fechaHoraRegistro);
  
      setTimeout(() => {
        const elem = document.querySelector('.asisRegist');
        if (elem) {
          elem.classList.add('hidden');
        }
        setTimeout(() => {
          this.fechaHoraRegistro = null;
        }, 500);
      }, 3000);
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
    }
  }

  async cerrarSesion() {
    await this.loginService.cerrarSesion(); 
    this.router.navigate(['/login']); 
  }

  obtenerFeriados() {
    this.apiService.getFeriados().subscribe(
      (response) => {
        if (response.status === 'success' && response.data) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          this.feriados = response.data
            .filter((feriado: Feriado) => {
              const feriadoDate = new Date(feriado.date); 
              return feriadoDate >= today;
            })
            .slice(0, 5);
        } else {
          console.log('No se encontraron feriados');
          this.feriados = [];
        }
        console.log('Feriados obtenidos:', this.feriados);
      },
      (error) => {
        console.error('Error al obtener los feriados', error);
      }
    );
  }

  async abrirCamara() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });
  
      this.foto = `data:image/jpeg;base64,${image.base64String}`;
      console.log('Foto capturada:', this.foto);
    } catch (error: any) {  
      console.error('Error al abrir la camara', error);
      if (error.message && error.message.includes('denied')) {
        this.mostrarAlertaPermisos();
      }
    }
  }
  

  async mostrarAlertaPermisos() {
    const alert = await this.alertController.create({
      header: 'Permiso Requerido',
      message: 'Para utilizar la camara, necesitas permitir el acceso en la configuracion.',
      buttons: [
        {
          text: 'Entendido',
          role: 'cancel',
        },
      ],
    });
  
    await alert.present();
  }
  
  
}