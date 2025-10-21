import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  standalone: true,
  selector: 'app-root',
  template: '', // nada visible
})
export class App {
  constructor(private auth: AuthService) {
    this.auth.loginWithRedirect(); // redirige inmediatamente al login
  }
}
