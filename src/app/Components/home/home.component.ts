// src/app/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ReviewService } from '../../services/review.service';
import { CourseService } from '../../services/course.service';
import { UserService } from '../../services/user.service'; // Import UserService
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Course } from 'src/app/model/course';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  reviews: any[] = [];
  courses: Course[] = [];
  instructors: any[] = []; // Add property to store instructors
  reviewForm: FormGroup;
  isLoggedIn: boolean = false;
  isApprenant: boolean = false;
  isSubmitting: boolean = false;
  selectedRating: number = 5;
  hoverRating: number = 0;

  constructor(
    private authService: AuthService,
    private reviewService: ReviewService,
    private courseService: CourseService,
    private userService: UserService, // Inject UserService
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    });
  }

  ngOnInit(): void {
  this.isLoggedIn = this.authService.isLoggedIn();
  this.isApprenant = this.authService.isApprenant();

  this.loadReviews();
  this.loadCourses();

  // Load instructors only if logged in (or make route public)
  if (this.isLoggedIn) {
    this.loadInstructors();
  } else {
    this.instructors = []; // or load a public version if you create one
    console.log('Instructors not loaded: user not authenticated');
  }
}

  loadReviews(): void {
    this.reviewService.getReviews().subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (err) => {
        console.error('Error fetching reviews:', err);
      },
    });
  }

  loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        console.log('Courses loaded:', courses);
        this.courses = courses;
      },
      error: (err) => {
        console.error('Error fetching courses:', err);
      },
    });
  }

// home.component.ts
loadInstructors(): void {
  // Only attempt if user is logged in AND is admin
  if (!this.authService.isLoggedIn() || !this.authService.isAdmin()) {
    console.log('Skipping instructors fetch: not admin or not logged in');
    this.instructors = []; // or show placeholder message
    return;
  }

  this.userService.getInstructors().subscribe({
    next: (instructors) => {
      console.log('Instructors loaded:', instructors);
      this.instructors = instructors.map(i => ({
        name: `${i.firstName} ${i.lastName}`,
        specialty: i.specialty || 'Formateur',
        profileImage: i.photo,
        instagram: i.instagram || '#'
      }));
    },
    error: (err) => {
      console.error('Error fetching instructors:', err);
      this.instructors = [];
    }
  });
}
  submitReview(): void {
    if (this.reviewForm.valid) {
      this.isSubmitting = true;
      this.reviewService.createReview(this.reviewForm.value).subscribe({
        next: (review) => {
          this.reviews.unshift(review);
          this.reviewForm.reset({ rating: 5, comment: '' });
          this.selectedRating = 5;
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error submitting review:', err);
          alert('Erreur lors de la soumission de l’avis. Veuillez réessayer.');
          this.isSubmitting = false;
        },
      });
    }
  }

  selectRating(rating: number): void {
    this.selectedRating = rating;
    this.reviewForm.patchValue({ rating });
  }
}