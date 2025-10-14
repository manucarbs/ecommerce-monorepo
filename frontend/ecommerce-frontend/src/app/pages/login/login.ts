import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // <-- agregar esto
import { AuthService } from '../../services/auth';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule, CommonModule], // <-- agregar CommonModule
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  username = '';
  password = '';
  loginError = false;

  constructor(private authService: AuthService) {}

  onLogin() {
    this.authService.login(this.username, this.password).subscribe(success => {
      if (success) {
        alert('Inicio de sesión exitoso 🎉');
        this.loginError = false;
      } else {
        this.loginError = true;
      }
    });
  }
}

