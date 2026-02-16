import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:5000/api/payments';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`,
      'Content-Type': 'application/json'
    });
  }

  // Record a new payment for an enrollment
  recordPayment(enrollmentId: string, amount: number, transactionId: string): Observable<any> {
    const body = { enrollmentId, amount, transactionId };
    return this.http.post(`${this.apiUrl}`, body, { headers: this.getHeaders() }).pipe(
      catchError(err => throwError(() => new Error(err.error?.message || 'Erreur lors de l\'enregistrement du paiement')))
    );
  }

  // Get payment status for an enrollment
  getPaymentStatus(enrollmentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/enrollment/${enrollmentId}`, { headers: this.getHeaders() }).pipe(
      catchError(err => throwError(() => new Error(err.error?.message || 'Erreur lors de la récupération du paiement')))
    );
  }
}