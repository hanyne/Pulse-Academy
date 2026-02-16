import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EnrollmentService } from '../../services/enrollement.service';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-gestionpaiement',
  templateUrl: './gestionpaiement.component.html',
  styleUrls: ['./gestionpaiement.component.css']
})
export class GestionPaiementComponent implements OnInit {
  enrollments: any[] = [];
  filteredEnrollments: any[] = [];
  courses: any[] = [];
  error: string = '';
  courseId: string = '';
  selectedCourseTitle: string = '';
  searchTerm: string = '';
  authService: any;

  constructor(
    private enrollmentService: EnrollmentService,
    private courseService: CourseService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';

    if (this.courseId) {
      if (!this.isValidObjectId(this.courseId)) {
        this.error = 'Erreur : ID de cours invalide';
        return;
      }
      this.loadCourseDetails();
      this.loadConfirmedEnrollments();
    } else {
      this.loadCourses();
    }
  }

  isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        console.log('Courses loaded:', courses);
        this.courses = courses;
        if (courses.length === 0) {
          this.error = 'Aucun cours disponible.';
        }
      },
      error: (err) => {
        console.error('Error loading courses:', err);
        this.error = err.error?.message || 'Erreur lors du chargement des cours';
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  loadCourseDetails(): void {
    this.courseService.getCourse(this.courseId).subscribe({
      next: (course) => {
        this.selectedCourseTitle = course.title;
      },
      error: (err) => {
        console.error('Error loading course details:', err);
        this.error = err.error?.message || 'Erreur lors du chargement des détails du cours';
      }
    });
  }

  loadConfirmedEnrollments(): void {
    if (!this.courseId) {
      this.error = 'Erreur : Aucun cours sélectionné';
      return;
    }
    this.enrollmentService.getConfirmedEnrollments(this.courseId).subscribe({
      next: (enrollments) => {
        console.log('Confirmed enrollments loaded:', enrollments);
        this.enrollments = enrollments;
        this.filteredEnrollments = enrollments;
      },
      error: (err) => {
        console.error('Error loading confirmed enrollments:', err);
        this.error = err.error?.message || 'Erreur lors du chargement des inscriptions confirmées';
      }
    });
  }

  confirmPayment(id: string): void {
    if (!this.isValidObjectId(id)) {
      this.error = 'Erreur : ID d\'inscription invalide';
      return;
    }
    this.enrollmentService.updateEnrollmentStatus(id, 'completed').subscribe({
      next: () => {
        console.log('Payment confirmed:', id);
        const enrollment = this.enrollments.find(e => e._id === id);
        if (enrollment) {
          enrollment.status = 'completed';
        }
        this.searchEnrollments();
        this.error = '';
      },
      error: (err) => {
        console.error('Error confirming payment:', err);
        this.error = err.error?.message || 'Erreur lors de la confirmation du paiement';
      }
    });
  }

  searchEnrollments(): void {
    if (!this.searchTerm.trim()) {
      this.filteredEnrollments = this.enrollments;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredEnrollments = this.enrollments.filter(enrollment =>
      enrollment.nom.toLowerCase().includes(term) ||
      enrollment.prenom.toLowerCase().includes(term)
    );
  }

  onCourseChange(courseId: string): void {
    this.courseId = courseId;
    this.router.navigate([`/gestionpaiement/${courseId}`]);
    this.loadCourseDetails();
    this.loadConfirmedEnrollments();
  }
}