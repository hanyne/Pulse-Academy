// src/app/discounted-enrollment/discounted-enrollment.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CourseService } from '../../services/course.service';
import { EnrollmentService } from '../../services/enrollement.service';
import { Course } from '../../model/course';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-discounted-enrollment',
  templateUrl: './discounted-enrollment.component.html',
  styleUrls: ['./discounted-enrollment.component.css']
})
export class DiscountedEnrollmentComponent implements OnInit {
  @Input() courses: Course[] = []; // Define courses as an input property
  enrollmentForm: FormGroup;
  courseId: string | null = null;
  course: Course | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private enrollmentService: EnrollmentService,
    private authService: AuthService
  ) {
    this.enrollmentForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern('^[0-9]{8}$')]],
      cin: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      adresse: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      niveauEtude: ['', [Validators.required]],
      courseId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Redirect to login if user is not authenticated
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // If courseId is passed via route (optional)
    this.courseId = this.route.snapshot.paramMap.get('id');
    if (this.courseId) {
      this.enrollmentForm.patchValue({ courseId: this.courseId });
      this.courseService.getCourse(this.courseId).subscribe({
        next: (course) => {
          this.course = course;
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors du chargement des détails de la formation.';
          console.error(err);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.enrollmentForm.invalid) {
      this.errorMessage = 'Veuillez remplir correctement tous les champs requis.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { nom, prenom, email, telephone, cin, adresse, niveauEtude, courseId } = this.enrollmentForm.value;

    this.enrollmentService.enrollDiscounted(courseId, nom, prenom, email, telephone, cin, adresse, niveauEtude).subscribe({
      next: () => {
        this.successMessage = 'Inscription avec réduction réussie !';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/courses']), 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Désolé, la réduction est réservée aux nouveaux apprenants.';
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/courses']);
  }

  get f(): { [key: string]: FormControl } {
    return this.enrollmentForm.controls as {
      nom: FormControl;
      prenom: FormControl;
      email: FormControl;
      telephone: FormControl;
      cin: FormControl;
      adresse: FormControl;
      niveauEtude: FormControl;
      courseId: FormControl;
    };
  }
}