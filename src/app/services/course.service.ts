import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Course } from '../model/course';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:5000/api/courses';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No token found. User might not be logged in.');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`
    });
  }

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      timeout(5000),
      catchError(err => {
        console.error('Error fetching courses:', err);
        const message = err.status === 0 ? 'Erreur réseau : impossible de contacter le serveur' : 
                        err.error?.error || err.message || 'Failed to fetch courses';
        return throwError(() => new Error(message));
      })
    );
  }

  getInstructorCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/instructor`, { headers: this.getHeaders() }).pipe(
      timeout(5000),
      catchError(err => {
        console.error('Error fetching instructor courses:', err);
        const message = err.status === 0 ? 'Erreur réseau : impossible de contacter le serveur' : 
                        err.error?.error || err.message || 'Failed to fetch instructor courses';
        return throwError(() => new Error(message));
      })
    );
  }

  getCourse(id: string): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      timeout(5000),
      catchError(err => {
        console.error('Error fetching course:', err);
        const message = err.status === 0 ? 'Erreur réseau : impossible de contacter le serveur' : 
                        err.error?.error || err.message || 'Failed to fetch course';
        return throwError(() => new Error(message));
      })
    );
  }

  createCourse(formData: FormData): Observable<Course> {
    console.log('Sending FormData to backend:');
    formData.forEach((value, key) => console.log(`${key}:`, value));
    return this.http.post<Course>(this.apiUrl, formData, { headers: this.getHeaders() }).pipe(
      timeout(10000),
      catchError(err => {
        console.error('Error creating course:', err);
        const message = err.status === 0 ? 'Erreur réseau : impossible de contacter le serveur' : 
                        err.error?.error || err.message || 'Failed to create course';
        return throwError(() => new Error(message));
      })
    );
  }

  updateCourse(formData: FormData): Observable<Course> {
    console.log('Updating course with data:');
    formData.forEach((value, key) => console.log(`${key}:`, value));
    const id = formData.get('_id') as string;
    return this.http.put<Course>(`${this.apiUrl}/${id}`, formData, { headers: this.getHeaders() }).pipe(
      timeout(10000),
      catchError(err => {
        console.error('Error updating course:', err);
        const message = err.status === 0 ? 'Erreur réseau : impossible de contacter le serveur' : 
                        err.error?.error || err.message || 'Failed to update course';
        return throwError(() => new Error(message));
      })
    );
  }

  deleteCourse(id: string): Observable<void> {
    const headers = this.getHeaders();
    console.log('Deleting course with ID:', id);
    console.log('Authorization Header:', headers.get('Authorization'));
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      timeout(5000),
      catchError(err => {
        console.error('Error deleting course:', err);
        const message = err.status === 0 ? 'Erreur réseau : impossible de contacter le serveur' : 
                        err.error?.error || err.message || 'Failed to delete course';
        return throwError(() => new Error(message));
      })
    );
  }
}