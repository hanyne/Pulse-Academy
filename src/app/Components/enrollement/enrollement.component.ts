// enrollement.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CourseService } from '../../services/course.service';
import { EnrollmentService } from '../../services/enrollement.service';
import { Course } from '../../model/course';

@Component({
  selector: 'app-enrollement',
  templateUrl: './enrollement.component.html',
  styleUrls: ['./enrollement.component.css']
})
export class EnrollementComponent implements OnInit {
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
    private enrollmentService: EnrollmentService
  ) {
    this.enrollmentForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern('^[0-9]{8}$')]],
      cin: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      adresse: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      niveauEtude: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id');
    if (this.courseId) {
      this.courseService.getCourse(this.courseId).subscribe({
        next: (course) => this.course = course,
        error: (err) => this.errorMessage = 'Erreur lors du chargement des détails de la formation.'
      });
    }
  }

  onSubmit(): void {
    if (this.enrollmentForm.invalid || !this.courseId) {
      this.errorMessage = 'Veuillez remplir correctement tous les champs requis.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { nom, prenom, email, telephone, cin, adresse, niveauEtude } = this.enrollmentForm.value;

    this.enrollmentService.enroll(this.courseId, nom, prenom, email, telephone, cin, adresse, niveauEtude).subscribe({
      next: () => {
        this.successMessage = 'Inscription réussie !';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/courses']), 2000);
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Erreur lors de l\'inscription.';
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    if (this.courseId) {
      this.router.navigate(['/course', this.courseId]);
    } else {
      this.router.navigate(['/courses']);
    }
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
    };
  }
}