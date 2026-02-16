import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        switch(response.role) {
          case 'admin': this.router.navigate(['/dash']); break;
          case 'apprenant': this.router.navigate(['/home']); break;
          case 'formateur': this.router.navigate(['/instructor-schedule']); break;
          default: this.router.navigate(['/home']); break;
        }
      },
      error: (err) => {
        this.error = err.error.message || 'Erreur de connexion';
      }
    });
  }
}