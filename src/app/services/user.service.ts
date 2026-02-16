import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`
    });
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.error('Error fetching users:', err);
        return throwError(() => err);
      })
    );
  }

  getUser(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.error(`Error fetching user ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  getInstructors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/instructors`, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.error('Error fetching instructors:', err);
        return throwError(() => err);
      })
    );
  }

  createUser(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, formData, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.error('Error creating user:', err);
        return throwError(() => err);
      })
    );
  }

  updateUser(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, formData, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.error(`Error updating user ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  updateProfile(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/me`, formData, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.error('Error updating profile:', err);
        return throwError(() => err);
      })
    );
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(err => {
        console.error(`Error deleting user ${id}:`, err);
        return throwError(() => err);
      })
    );
  }
  getPublicInstructors(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl.replace('/auth', '')}/public/instructors`);
}
}