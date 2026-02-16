import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../model/user';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  photoFile: File | null = null;
  photoPreview: string | null = null;
  successMessage: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false; // Indicateur de chargement
  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      firstName: [''],
      lastName: [''],
      dateOfBirth: [''],
      bio: [''],
      photo: [null]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.authService.getProfile().subscribe({
      next: (response) => {
        this.user = response.user;
        this.profileForm.patchValue({
          email: this.user.email,
          firstName: this.user.firstName || '',
          lastName: this.user.lastName || '',
          dateOfBirth: this.user.dateOfBirth ? new Date(this.user.dateOfBirth).toISOString().split('T')[0] : '',
          bio: this.user.bio || ''
        });
        this.photoPreview = this.user.photo ? this.getPhotoUrl(this.user.photo) : null;
        this.photoFile = null;
        if (this.photoInput) {
          this.photoInput.nativeElement.value = '';
        }
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement du profil : ' + (err.error?.error || err.message);
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000); // Uniformiser à 5 secondes
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.photoFile = input.files[0];
      this.photoPreview = URL.createObjectURL(this.photoFile);
      this.profileForm.patchValue({ photo: this.photoFile });
    }
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.errorMessage = 'Veuillez vérifier les champs obligatoires.';
      this.profileForm.markAllAsTouched();
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
      return;
    }

    this.isLoading = true; // Activer l'indicateur de chargement
    const formData = new FormData();
    formData.append('email', this.profileForm.get('email')?.value);
    if (this.profileForm.get('password')?.value) {
      formData.append('password', this.profileForm.get('password')?.value);
    }
    formData.append('firstName', this.profileForm.get('firstName')?.value || '');
    formData.append('lastName', this.profileForm.get('lastName')?.value || '');
    formData.append('dateOfBirth', this.profileForm.get('dateOfBirth')?.value || '');
    formData.append('bio', this.profileForm.get('bio')?.value || '');
    if (this.photoFile) {
      formData.append('photo', this.photoFile);
    }

    this.userService.updateProfile(formData).subscribe({
      next: () => {
        this.successMessage = 'Profil mis à jour avec succès !';
        this.loadProfile(); // Actualiser les données
        this.isLoading = false;
        setTimeout(() => {
          this.successMessage = '';
        }, 5000); // Message disparaît après 5 secondes
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la mise à jour du profil : ' + (err.error?.error || err.message);
        this.isLoading = false;
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getPhotoUrl(photo: string | undefined): string {
    if (photo && photo !== 'undefined' && photo !== '') {
      const path = photo.startsWith('Uploads/') ? photo : `Uploads/${photo}`;
      return `http://localhost:5000/${path}`;
    }
    return 'assets/img/default-user.jpg';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/img/default-user.jpg';
  }
}