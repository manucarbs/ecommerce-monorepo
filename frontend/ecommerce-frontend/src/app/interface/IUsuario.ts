export interface IUsuario {
  id: number;
  auth0Sub: string;
  email: string;
  nombre?: string | null;
  apellido?: string | null;
  pictureUrl?: string | null;
  creadoEn?: string; // ISO
}

export interface UsuarioCreateDto {
  auth0Sub: string;
  email: string;
  nombre?: string;
  apellido?: string;
  pictureUrl?: string;
}
