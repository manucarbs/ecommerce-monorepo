import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  login(username: string, password: string): Observable<boolean> {
    // Solo permite usuario "admin" y contraseña "1234"
    return of(username === 'admin' && password === '1234');
  }
}
