import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LoginService } from '../../services/login.service';
import { Usuario } from '../../models/usuario';
import { AlertController } from '@ionic/angular';
import { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner';

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

  elegirAsignatura(asignatura: string){
    this.seleccionada = asignatura;
    this.mostrarAsignatura = false;
  }

  async scan(): Promise<void> {
    try {
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: CapacitorBarcodeScannerTypeHint.ALL,
      });

      if (result.ScanResult) {
        this.result = result.ScanResult;
        console.log('Resultado del escaneo:', this.result);

        // Registrar asistencia despues de escaneo
        this.fechaHoraRegistro = new Date().toLocaleString();
        console.log('Asistencia registrada en:', this.fechaHoraRegistro);
      }
    } catch (error) {
      console.error('Error al escanear el codigo QR:', error);
      this.mostrarAlertaError('Error al abrir el escaner, intenta de nuevo.');
    }
  }

  async cerrarSesion() {
    await this.loginService.cerrarSesion();
    this.router.navigate(['/login']);
  }

  obtenerFeriados() {
    this.apiService.getFeriados().subscribe(
      (feriados) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
  
        // Filtrar y ordenar feriados por fecha
        this.feriados = feriados
          .filter((feriado: { date: string }) => {
            const feriadoDate = new Date(feriado.date);
            return feriadoDate >= today;
          })
          .sort((a: { date: string }, b: { date: string }) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          })
          .slice(0, 5);
  
        console.log('Feriados obtenidos y ordenados:', this.feriados);
      },
      (error) => {
        console.error('Error al obtener los feriados', error);
      }
    );
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
