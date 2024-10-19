import { Injectable } from '@angular/core';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private users: Usuario[] = [
    new Usuario('admin', '12345', 'profesor', 'Admin', 'User'),
    new Usuario('profesor1', '12345', 'profesor', 'Ivan', 'Fernandez'),
    new Usuario('alumno1', '12345', 'alumno', 'Diego', 'Fuentes', false),
    new Usuario('alumno2', '12345', 'alumno', 'Benjamin', 'Gonzalez', false),
    new Usuario('alumno3', '12345', 'alumno', 'alumno', '3', false),
    new Usuario('alumno4', '12345', 'alumno', 'alumno', '4', false)
  ];

  constructor() {}

  validateLogin(username: string, password: string): Usuario | null {
    console.log('Ejecutando validación');
    const found = this.users.find(user => user.username === username);
    if (found !== undefined && found.password === password) {
      console.log('Usuario existente y contraseña correcta');
      return found;
    }
    console.log('Usuario no existe o contraseña incorrecta');
    return null;
  }

  getAlumnos(): Usuario[] {
    return this.users.filter(user => user.rol === 'alumno');
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

  userExists(username: string): boolean {
    return this.users.some(user => user.username === username);
  }

  cambiarcontraseña(username: string, newPassword: string): boolean {
    if (!newPassword) {
      console.log('La nueva contraseña no puede estar vacia.');
      return false;
    }

    const userIndex = this.users.findIndex(user => user.username === username);
    if (userIndex !== -1) {
      this.users[userIndex].password = newPassword;
      console.log('Contraseña cambiada con exito para:', username);
      return true;
    }

    console.log('Usuario no encontrado:', username);
    return false;
  }
}