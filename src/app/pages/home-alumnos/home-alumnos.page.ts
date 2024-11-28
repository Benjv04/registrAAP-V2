import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LoginService } from '../../services/login.service';
import { Usuario } from '../../models/usuario';
import { AlertController } from '@ionic/angular';
import { QrScannerService } from '../../services/qr-scanner.service';


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
  usuario: Usuario | null = null;
  fechaHoraRegistro: string | null = null;
  mensajeBienvenida: string = '';
  feriados: any[] = [];
  result: string = '';
  mostrarAsignatura: boolean = true;
  seleccionada: string | null = null;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private loginService: LoginService,
    private alertController: AlertController,
    private qrScannerService: QrScannerService    
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

  elegirAsignatura(asignatura: string){
    this.seleccionada = asignatura;
    this.mostrarAsignatura = false;
  }

  cambAsig(){
    this.mostrarAsignatura = true;
    this.seleccionada = null;
  }

  async scan(): Promise<void> {
    try {
      const barcodes = await this.qrScannerService.scan(); 
  
      if (barcodes && barcodes.length > 0) {
        this.result = barcodes.join(', '); 
        console.log('Resultado del escaneo:', this.result);
  
        // Registrar asistencia 
        this.fechaHoraRegistro = new Date().toLocaleString();
        console.log('Asistencia registrada en:', this.fechaHoraRegistro);
      }
    } catch (error) {
      console.error('Error al escanear el código QR:', error);
      this.mostrarAlertaError('Error al abrir el escáner, intenta de nuevo.');
    }
  }
  

  async cerrarSesion() {
    await this.loginService.cerrarSesion();
    this.router.navigate(['/login']);
  }

  obtenerFeriados() {
    this.apiService.getFeriados().subscribe({
      next: (response: any) => {
        console.log('Respuesta del servicio:', response);
  
        // verificar si tiene la propiedad `data`
        if (response && Array.isArray(response.data)) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
  
          // filtrar y ordenar feriados
          this.feriados = response.data
            .filter((feriado: Feriado) => {
              const feriadoDate = new Date(feriado.date);
              return feriadoDate >= today;
            })
            .sort((a: Feriado, b: Feriado) => {
              return new Date(a.date).getTime() - new Date(b.date).getTime();
            })
            .slice(0, 5);
  
          console.log('Feriados obtenidos y ordenados:', this.feriados);
        } else {
          console.error('La respuesta no contiene un arreglo valido de feriados:', response);
          this.feriados = [];
        }
      },
      error: (error: any) => {
        console.error('Error al obtener los feriados', error);
      },
      complete: () => {
        console.log('Obtención de feriados completada.');
      },
    });
  }
  

  async mostrarAlertaError(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}