import { Component, OnInit } from '@angular/core';
import { EnrollmentService } from '../../services/enrollement.service';
import { AuthService } from '../../services/auth.service';
import { Enrollment } from '../../model/enrollement';
import { User } from '../../model/user';

@Component({
  selector: 'app-apprenant-courses',
  templateUrl: './apprenant-courses.component.html',
  styleUrls: ['./apprenant-courses.component.css']
})
export class ApprenantCoursesComponent implements OnInit {
  enrollments: Enrollment[] = [];
  errorMessage: string = '';
  currentUser: User | null = null;

  constructor(
    private enrollmentService: EnrollmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.authService.isLoggedIn()) {
      if (!this.authService.isApprenant()) {
        this.errorMessage = 'Accès réservé aux apprenants.';
        return;
      }
      this.loadPaidEnrollments();
    } else {
      this.errorMessage = 'Utilisateur non connecté. Veuillez vous connecter.';
    }
  }

  loadPaidEnrollments(): void {
    this.enrollmentService.getPaidEnrollments().subscribe({
      next: (enrollments) => {
        this.enrollments = enrollments;
        console.log('Paid enrollments:', this.enrollments);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des formations : ' + (err.message || 'Erreur inconnue');
        console.error('Error loading paid enrollments:', err);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  getPhotoUrl(photo: string | undefined): string {
    if (photo && photo !== 'undefined' && photo !== '') {
      const path = photo.startsWith('Uploads/') ? photo : `Uploads/${photo}`;
      return `http://localhost:5000/${path}`;
    }
    return ''; // Retourne une chaîne vide pour éviter l'image par défaut
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none'; // Masquer l'image en cas d'erreur
  }

  private sortKey: string = 'day';
  private sortDirection: 'asc' | 'desc' = 'asc';

  sortBy(key: string): void {
    this.enrollments = this.enrollments.map(enrollment => ({
      ...enrollment,
      course: {
        ...enrollment.course,
        schedule: [...(enrollment.course.schedule || [])].sort((a, b) => {
          let valueA: string | number = a[key as keyof typeof a] || '';
          let valueB: string | number = b[key as keyof typeof b] || '';

          if (key === 'date' && valueA && valueB) {
            valueA = new Date(valueA as string).getTime() || 0;
            valueB = new Date(valueB as string).getTime() || 0;
          }

          if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
          if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
          return 0;
        })
      }
    }));

    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
  }
}