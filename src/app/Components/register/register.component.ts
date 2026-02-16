import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  role: string = 'apprenant'; 
  error: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    console.log('Données envoyées:', { email: this.email, password: this.password, role: this.role });
    this.authService.register(this.email, this.password, this.role).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err.error.message || "Erreur d'inscription";
        console.error('Erreur reçue:', err);
      }
    });
  }
}