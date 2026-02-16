// src/app/admin-reviews/admin-reviews.component.ts
import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-reviews',
  templateUrl: './admin-reviews.component.html',
  styleUrls: ['./admin-reviews.component.css'],
})
export class AdminReviewsComponent implements OnInit {
  reviews: any[] = [];
  errorMessage: string = '';
  selectedReview: any = null; // For modal
  showDeleteModal: boolean = false; // Control modal visibility

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn() || !this.authService.isAdmin()) {
      this.errorMessage = 'Accès réservé aux administrateurs.';
      this.router.navigate(['/login']);
      return;
    }
    this.loadReviews();
  }

  loadReviews(): void {
    this.reviewService.getReviews().subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        console.log('Loaded reviews:', reviews);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des avis.';
        console.error('Error fetching reviews:', err);
      },
    });
  }

  openDeleteModal(review: any): void {
    this.selectedReview = review;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.selectedReview = null;
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.selectedReview) return;
    const id = this.selectedReview._id;
    console.log('Attempting to delete review with ID:', id);
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Veuillez vous connecter en tant qu’admin.';
      this.router.navigate(['/login']);
      this.closeDeleteModal();
      return;
    }
    this.reviewService.deleteReview(id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter((review) => review._id !== id);
        this.errorMessage = '';
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error('Error deleting review:', err);
        this.errorMessage = err.status === 401 ? 'Session expirée. Veuillez vous reconnecter.' :
                         err.status === 403 ? 'Accès réservé aux administrateurs.' :
                         err.status === 404 ? 'Avis introuvable.' :
                         'Erreur lors de la suppression de l’avis.';
        this.closeDeleteModal();
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}