import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../model/user';

interface ProfileResponse {
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;
  private apiUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {
    const user = localStorage.getItem('user');
    if (user && user !== 'undefined' && user !== 'null') {
      try {
        this.currentUser = JSON.parse(user);
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        localStorage.removeItem('user');
        this.currentUser = null;
      }
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => {
        if (response.token && response.role && response.user) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUser = response.user;
        } else {
          console.error('Invalid login response:', response);
          throw new Error('Invalid login response');
        }
      })
    );
  }

  register(email: string, password: string, role: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, { email, password, role }).pipe(
      tap((response) => {
        if (response.token && response.role && response.user) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUser = response.user;
        }
      })
    );
  }

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/me`, { headers: this.getHeaders() }).pipe(
      tap((response) => {
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUser = response.user;
        }
      })
    );
  }

  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }
    const user = localStorage.getItem('user');
    if (user && user !== 'undefined' && user !== 'null') {
      try {
        this.currentUser = JSON.parse(user);
        return this.currentUser;
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        return null;
      }
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string {
    return localStorage.getItem('role') || '';
  }

  isApprenant(): boolean {
    return this.getRole() === 'apprenant';
  }

  isFormateur(): boolean {
    return this.getRole() === 'formateur';
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    this.currentUser = null;
    window.location.href = '/home';
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`
    });
  }
}