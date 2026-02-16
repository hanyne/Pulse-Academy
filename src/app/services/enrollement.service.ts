// src/app/services/enrollment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Enrollment } from '../model/enrollement';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private apiUrl = 'http://localhost:5000/api/enrollments';

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

  enroll(courseId: string, nom: string, prenom: string, email: string, telephone?: string, cin?: string, adresse?: string, niveauEtude?: string): Observable<Enrollment> {
    const body = { courseId, nom, prenom, email, telephone, cin, adresse, niveauEtude };
    console.log('Envoi de la requête POST avec body:', body);
    return this.http.post<Enrollment>(this.apiUrl, body, { headers: this.getHeaders() });
  }

  // src/app/services/enrollment.service.ts
 enrollDiscounted(courseId: string, nom: string, prenom: string, email: string, telephone?: string, cin?: string, adresse?: string, niveauEtude?: string): Observable<Enrollment> {
    const body = { courseId, nom, prenom, email, telephone, cin, adresse, niveauEtude };
    console.log('Envoi de la requête POST avec réduction:', body);
    return this.http.post<Enrollment>(`${this.apiUrl}/discounted`, body, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.error('Erreur complète:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message
        });
        return throwError(() => new Error(err.error?.message || 'Erreur lors de l\'inscription avec réduction'));
      })
    );
  }

  getEnrollments(courseId: string): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/all/${courseId}`, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.error(`Error fetching enrollments for course ${courseId}:`, err);
        throw err;
      })
    );
  }

  getPendingEnrollments(courseId: string): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/pending/${courseId}`, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.error(`Error fetching pending enrollments for course ${courseId}:`, err);
        throw err;
      })
    );
  }

  getConfirmedEnrollments(courseId: string): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/confirmed/${courseId}`, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.error(`Error fetching confirmed enrollments for course ${courseId}:`, err);
        throw err;
      })
    );
  }

  updateEnrollmentStatus(id: string, status: string): Observable<any> {
    console.log('Sending update request for ID:', id, 'with status:', status);
    return this.http.put(`${this.apiUrl}/${id}`, { status }, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.error(`Error updating enrollment ${id}:`, err);
        throw err;
      })
    );
  }

  getPaidEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/paid`, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.error('Error fetching paid enrollments:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to fetch paid enrollments'));
      })
    );
  }
}