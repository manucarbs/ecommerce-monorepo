import { Component } from '@angular/core';
import { LoginComponent } from './pages/login/login';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [LoginComponent],
  template: '<app-login></app-login>',
})
export class App {}
