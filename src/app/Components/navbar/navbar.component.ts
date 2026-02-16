import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  isApprenant(): boolean {
    return this.authService.isLoggedIn() && this.authService.isApprenant();
  }

  logout(): void {
    this.authService.logout();
  }

  navigateToProfile(): void {
    this.router.navigate(['profile']);
  }

  getPhotoUrl(photo: string | undefined): string {
    if (photo && photo !== 'undefined' && photo !== '') {
      const path = photo.startsWith('Uploads/') ? photo : `Uploads/${photo}`;
      return `http://localhost:5000/${path}`;
    }
    return 'assets/img/default-user.jpg';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/img/default-user.jpg';
  }
}