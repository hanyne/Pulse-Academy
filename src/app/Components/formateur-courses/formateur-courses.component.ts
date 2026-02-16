import { Component, OnInit } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { Course } from '../../model/course';
import { User } from '../../model/user';

@Component({
  selector: 'app-formateur-courses',
  templateUrl: './formateur-courses.component.html',
  styleUrls: ['./formateur-courses.component.css']
})
export class FormateurCoursesComponent implements OnInit {
  courses: Course[] = [];
  errorMessage: string = '';
  currentUser: User | null = null;

  constructor(
    private courseService: CourseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.authService.isLoggedIn()) {
      if (!this.authService.isFormateur()) {
        this.errorMessage = 'Accès réservé aux formateurs.';
        return;
      }
      this.loadCourses();
    } else {
      this.errorMessage = 'Utilisateur non connecté. Veuillez vous connecter.';
    }
  }

  loadCourses(): void {
    this.courseService.getInstructorCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        console.log('Courses for instructor:', this.courses);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des formations : ' + (err.error?.message || err.message);
        console.error('Error loading courses:', err);
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
    this.courses = this.courses.map(course => ({
      ...course,
      schedule: [...(course.schedule || [])].sort((a, b) => {
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
    }));

    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
  }
}