import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { Course } from '../../model/course';

@Component({
  selector: 'app-coursedetails',
  templateUrl: './coursedetails.component.html',
  styleUrls: ['./coursedetails.component.css']
})
export class CoursedetailsComponent implements OnInit {
  course: Course | null = null;
  courseId: string | null = null;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id');
    if (this.courseId && this.isValidObjectId(this.courseId)) {
      this.loadCourseDetails(this.courseId);
    } else {
      this.errorMessage = 'ID de la formation invalide.';
    }
  }

  isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  loadCourseDetails(courseId: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.courseService.getCourse(courseId).subscribe({
      next: (course) => {
        this.course = course;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des détails de la formation.';
        this.isLoading = false;
        console.error('Error loading course:', err);
      }
    });
  }

  enrollInCourse(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (!this.authService.isApprenant()) {
      this.errorMessage = 'Seuls les apprenants peuvent s’inscrire à une formation.';
      return;
    }

    if (!this.courseId) {
      this.errorMessage = 'ID de la formation non disponible.';
      return;
    }

    this.router.navigate(['/enrollment', this.courseId]);
  }

  getCourseImageUrl(image: string | undefined): string {
    if (image) {
      return `http://localhost:5000/uploads/${image}`;
    }
    return 'assets/img/courses-1.jpg';
  }
}