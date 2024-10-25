export class Usuario {
    username: string;
    password: string;
    name: string;
    lastname: string;
    rol: 'admin' | 'alumno' | 'profesor'; 
    presente: boolean;
  
    constructor(username: string, password: string, rol: 'admin' | 'alumno'| 'profesor', name: string = '', lastname: string = '',presente:boolean = false) {
      this.username = username;
      this.password = password;
      this.rol = rol;
      this.name = name;
      this.lastname = lastname;
      this.presente = presente;
    }
}
