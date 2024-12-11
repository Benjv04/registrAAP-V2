import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LoginService } from '../../services/login.service';
import { Usuario } from '../../models/usuario';
import { AlertController } from '@ionic/angular';
import { QrScannerService } from '../../services/qr-scanner.service';

// Interfaz para feriados
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
  // Propiedades
  usuario: Usuario | null = null;
  fechaHoraRegistro: string | null = null;
  mensajeBienvenida: string = '';
  feriados: Feriado[] = [];
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

    // Obtener datos del usuario
    this.usuario = await this.loginService.obtenerUsuario();
    this.mensajeBienvenida = `Bienvenido, ${this.usuario?.name || 'alumno'}!`;
    console.log(this.mensajeBienvenida);

    // Obtener lista de feriados
    this.obtenerFeriados();
  }

  // Seleccionar una asignatura
  elegirAsignatura(asignatura: string) {
    this.seleccionada = asignatura;
    this.mostrarAsignatura = false; 
    console.log(`Asignatura seleccionada: ${asignatura}`);
  }

  // Cambiar de asignatura
  cambAsig() {
    this.mostrarAsignatura = true; 
    this.seleccionada = null;
    console.log('Cambio de asignatura activado');
  }

  // Escanear QR y registrar asistencia
  async scan(): Promise<void> {
    try {
      // Validar si es feriado
      const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const esFeriado = this.feriados.some((feriado) => feriado.date === today);
  
      if (esFeriado) {
        await this.mostrarAlertaError('Hoy es un dia feriado, no se puede registrar asistencia.');
        return;
      }
  
      // Escanear QR
      const barcodes = await this.qrScannerService.scan();
      this.result = barcodes.join(', ');
      console.log('Resultado del escaneo:', this.result);
  
      // Validar el formato(cod de asignatura|seccion|sala|fecha)
      const qrPattern = /^[A-Z]{3}\d{3}\|[A-Z0-9]+\|[A-Za-z0-9]+\|\d{8}$/;
      if (!qrPattern.test(this.result)) {
        await this.mostrarAlertaError('El QR escaneado no cumple con el formato esperado.');
        return;
      }
  
      // mostrar datos del QR por consola
      const [asignatura, seccion, sala, fecha] = this.result.split('|');
      console.log(`Asignatura: ${asignatura}, Sección: ${seccion}, Sala: ${sala}, Fecha: ${fecha}`);
  
      // Verifica si fecha del QR es valida con el formato 
      const fechaQR = `${fecha.substring(0, 4)}-${fecha.substring(4, 6)}-${fecha.substring(6, 8)}`;
      const fechaHoy = new Date().toISOString().split('T')[0];
      if (fechaQR !== fechaHoy) {
        await this.mostrarAlertaError('La fecha no coincide con la fecha actual.');
        return;
      }
  
      // Registrar asistencia
      this.fechaHoraRegistro = new Date().toLocaleString();
      console.log('Asistencia registrada:', this.fechaHoraRegistro);
  
      // Actualizar la asistencia para el usuario
      if (this.usuario) {
        this.loginService.actualizarAsistencia(this.usuario.username, true);
        console.log(`Asistencia actualizada para ${this.usuario.username}`);
      }
      // Logica si lo quiero hacer con la asignatura
      //if (this.usuario) {
      //  const asignatura = this.result.split('|')[0]; 
      //  if (this.seleccionada === asignatura) {
      //    this.loginService.actualizarAsistencia(this.usuario.username, true);
      //    console.log(`Asistencia actualizada para ${this.usuario.username} en la asignatura ${asignatura}`);
      //  } else {
      //    await this.mostrarAlertaError('La asignatura del QR no coincide con la asignatura seleccionada.');
      //  }
      //}
    } catch (error) {
      console.error('Error al escanear el codigo QR:', error);
      this.mostrarAlertaError('Error al abrir el escaner, intenta de nuevo.');
    }
  }


  // Cerrar sesion
  async cerrarSesion() {
    const alert = await this.alertController.create({
      header: 'Confirmación de cierre',
      message: '⚠️¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'cancel-button',
          handler: () => {
            console.log('Cierre de sesión cancelado');
          },
        },
        {
          text: 'Cerrar Sesión',
          cssClass: 'logout-button',
          handler: async () => {
            await this.loginService.cerrarSesion();
            this.router.navigate(['/login']);
          },
        },
      ],
    });
  
    await alert.present();
  }

  // Obtener feriados desde el servicio
  obtenerFeriados() {
    this.apiService.getFeriados().subscribe(
      (feriados) => {
        const today = new Date().toISOString().split('T')[0];

        // Filtrar y ordenar los feriados que sean posteriores o iguales a la fecha actual
        this.feriados = feriados
        .filter((feriado: Feriado) => feriado.date >= today)
        .sort((a: Feriado, b: Feriado) => (a.date > b.date ? 1 : -1)) 
        .slice(0, 5); 

        console.log('Feriados obtenidos:', this.feriados);
      },
      (error) => {
        console.error('Error al obtener los feriados:', error);
      }
    );
  }

  // Mostrar alerta en caso de error
  async mostrarAlertaError(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
