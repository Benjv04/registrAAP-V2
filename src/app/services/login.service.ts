import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private _storage: Storage | null = null;

  private users: Usuario[] = [
    new Usuario('admin', '12345', 'profesor', 'Admin', 'User'),
    new Usuario('profesor1', '12345', 'profesor', 'Ivan', 'Fernandez'),
    new Usuario('alumno1', '12345', 'alumno', 'Diego', 'Fuentes', false),
    new Usuario('alumno2', '12345', 'alumno', 'Benjamin', 'Gonzalez', false),
    new Usuario('alumno3', '12345', 'alumno', 'Alumno', '3', false),
    new Usuario('alumno4', '12345', 'alumno', 'Alumno', '4', false),
  ];

  constructor(private storage: Storage) {
    this.init();
  }

  //iniciar storage
  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  //validar
  validateLogin(username: string, password: string): Usuario | null {
    const found = this.users.find(user => user.username === username);
    return found && found.password === password ? found : null;
  }

  //guardar usuario
  async guardarUsuario(user: Usuario) {
    await this._storage?.set('usuario', user);
  }

  async obtenerUsuario(): Promise<Usuario | null> {
    return await this._storage?.get('usuario');
  }

  async estaAutenticado(): Promise<boolean> {
    const user = await this.obtenerUsuario();
    return !!user;
  }

  async cerrarSesion() {
    await this._storage?.remove('usuario');
    console.log('Sesión cerrada');
  }

  //obtener lista alumnos
  getAlumnos(): Usuario[] {
    return this.users.filter(user => user.rol === 'alumno');
  }
  //funcion para ver si el uisuario existe
  userExists(username: string): boolean {
    return this.users.some(user => user.username === username);
  }

  // cambia contraseña
  cambiarcontraseña(username: string, newPassword: string): boolean {
    if (!newPassword) {
      console.log('La nueva contraseña no puede estar vacía.');
      return false;
    }

    const userIndex = this.users.findIndex(user => user.username === username);
    if (userIndex !== -1) {
      this.users[userIndex].password = newPassword;
      console.log('Contraseña cambiada con éxito para:', username);
      return true;
    }

    console.log('Usuario no encontrado:', username);
    return false;
  }

  actualizarAsistencia(username: string, presente: boolean) {
    const alumno = this.users.find(user => user.username === username && user.rol === 'alumno');
    if (alumno) {
      alumno.presente = presente;
      console.log(`Presencia de ${username} actualizada a ${presente}`);
    } else {
      console.log('Alumno no encontrado');
    }
  }
}
