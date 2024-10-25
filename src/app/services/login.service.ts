import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private _storage: Storage | null = null;

  //lista usuarios
  private users: Usuario[] = [
    new Usuario('admin', '12345', 'admin', 'Admin', 'User'),
    new Usuario('profesor1', '12345', 'profesor', 'Ivan', 'Fernandez'),
    new Usuario('alumno1', '12345', 'alumno', 'Diego', 'Fuentes', false),
    new Usuario('alumno2', '12345', 'alumno', 'Benjamin', 'Gonzalez', false),
    new Usuario('alumno3', '12345', 'alumno', 'Alumno', '3', false),
    new Usuario('alumno4', '12345', 'alumno', 'Alumno', '4', false),
    new Usuario('admin1', '12345', 'admin', 'Admin', '1', false),
  ];

  constructor(private storage: Storage) {
    this.init();
  }

  //iniciar storage
  async init() {
    const storage = await this.storage.create();
    this._storage = storage;

    const storedUsers = await this._storage?.get('usuarios');
    if (storedUsers) {
      this.users = storedUsers; 
    }
  }
  

  // guardar lista actualizada
  private async guardarUsuarios() {
    await this._storage?.set('usuarios', this.users);
  }

  //obtener lista alumnos
  getAlumnos(): Usuario[] {
    return this.users.filter((user) => user.rol === 'alumno');
  }

  // agregar nuevo alumno
  async agregarAlumno(alumno: Usuario) {
    this.users.push(alumno);
    await this.guardarUsuarios();
    console.log('Alumno agregado:', alumno);
  }

  // editar un alumno existente
  async editarAlumno(alumno: Usuario) {
    const index = this.users.findIndex((u) => u.username === alumno.username);
    if (index !== -1) {
      this.users[index] = alumno;
      await this.guardarUsuarios();
      console.log('Alumno editado:', alumno);
    }
  }

  // eliminar alumno
  async eliminarAlumno(username: string) {
    this.users = this.users.filter((user) => user.username !== username);
    await this.guardarUsuarios(); 
    console.log('Alumno eliminado:', username);
  }

  //validar login
  validateLogin(username: string, password: string): Usuario | null {
    const found = this.users.find((user) => user.username === username);
    if (found && found.password === password) {
      this.guardarUsuario(found);
      console.log('Login exitoso:', found);
      return found;
    }
    console.log('Usuario o contraseña incorrectos');
    return null;
  }

  async guardarUsuario(user: Usuario) {
    await this._storage?.set('usuario', user);
  }

  async obtenerUsuario(): Promise<Usuario | null> {
    return await this._storage?.get('usuario');
  }

  //ver si hay sesion iniciada
  async estaAutenticado(): Promise<boolean> {
    const user = await this.obtenerUsuario();
    return !!user;
  }

  // cerrar sesion(con storage)
  async cerrarSesion() {
    await this._storage?.remove('usuario');
    console.log('Sesión cerrada');
  }

  // actualizar asistencia
  actualizarAsistencia(username: string, presente: boolean) {
    const alumno = this.users.find(
      (user) => user.username === username && user.rol === 'alumno'
    );
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
  
  // cambiar contraseña usuario
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

  async resetUsuarios() {
    console.log('Restableciendo usuarios a los valores predeterminados...');
    
    this.users = [
      new Usuario('admin', '12345', 'admin', 'Admin', 'User'),
      new Usuario('profesor1', '12345', 'profesor', 'Ivan', 'Fernandez'),
      new Usuario('alumno1', '12345', 'alumno', 'Diego', 'Fuentes', false),
      new Usuario('alumno2', '12345', 'alumno', 'Benjamin', 'Gonzalez', false),
      new Usuario('alumno3', '12345', 'alumno', 'Alumno', '3', false),
      new Usuario('alumno4', '12345', 'alumno', 'Alumno', '4', false),
      new Usuario('admin1', '12345', 'admin', 'Admin', '1', false),
    ];
  
    await this.guardarUsuarios();
    console.log('Usuarios restablecidos con éxito.');
  }
  
}
