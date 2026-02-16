import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EnrollmentService } from '../../services/enrollement.service';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-gestioninscription',
  templateUrl: './gestioninscription.component.html',
  styleUrls: ['./gestioninscription.component.css']
})
export class GestioninscriptionComponent implements OnInit {
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    if (this.courseId) {
      if (!this.isValidObjectId(this.courseId)) {
        this.error = 'Erreur : ID de cours invalide';
        return;
      }
      this.loadCourseDetails();
      this.loadAllEnrollments();
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
        this.courses = courses;
        if (courses.length === 0) {
          this.error = 'Aucun cours disponible.';
        }
      },
      error: (err) => {
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
        this.error = err.error?.message || 'Erreur lors du chargement des détails du cours';
      }
    });
  }

  loadAllEnrollments(): void {
    if (!this.courseId) {
      this.error = 'Erreur : Aucun cours sélectionné';
      return;
    }
    this.enrollmentService.getEnrollments(this.courseId).subscribe({
      next: (enrollments) => {
        console.log('Enrollments received:', enrollments);
        console.log('Status values:', enrollments.map(e => e.status));
        this.enrollments = enrollments.map(enrollment => ({
          ...enrollment,
          status: this.normalizeStatus(enrollment.status)
        }));
        this.filteredEnrollments = [...this.enrollments];
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du chargement des inscriptions';
      }
    });
  }

  normalizeStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'en attente',
      'confirmed': 'confirme',
      'paid': 'paye',
      'refused': 'refuse'
    };
    return statusMap[status.toLowerCase()] || status;
  }

  updateStatus(id: string, newStatus: string): void {
    console.log('Attempting to update status for ID:', id, 'to:', newStatus); // Debug log
    if (!this.isValidObjectId(id)) {
      this.error = 'Erreur : ID d\'inscription invalide';
      console.log('Invalid ObjectId:', id);
      return;
    }
    this.enrollmentService.updateEnrollmentStatus(id, newStatus).subscribe({
      next: (response) => {
        console.log('Update successful:', response); // Debug log
        const enrollment = this.enrollments.find(e => e._id === id);
        if (enrollment) {
          enrollment.status = newStatus;
          console.log('Updated enrollment status locally:', enrollment);
        }
        this.searchEnrollments();
        this.error = '';
      },
      error: (err) => {
        console.error('Error updating status:', err); // Debug log
        this.error = err.error?.message || 'Erreur lors de la mise à jour du statut';
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
    this.router.navigate([`/gestiondemandes/${courseId}`]);
    this.loadCourseDetails();
    this.loadAllEnrollments();
  }
}