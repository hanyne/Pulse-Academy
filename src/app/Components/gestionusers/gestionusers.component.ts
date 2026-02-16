import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-gestionusers',
  templateUrl: './gestionusers.component.html',
  styleUrls: ['./gestionusers.component.css']
})
export class GestionusersComponent implements OnInit {
  users: any[] = [];
  newUser: any = { 
    email: '', 
    password: '', 
    role: 'apprenant', 
    firstName: '', 
    lastName: '', 
    dateOfBirth: '', 
    bio: '', 
    photo: null 
  };
  selectedUser: any = null;
  showEditModal: boolean = false;
  error: string = '';
  newUserPhotoPreview: string | null = null;
  selectedUserPhotoPreview: string | null = null;
  viewMode: 'add' | 'list' = 'add';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('Users loaded:', users);
        this.users = users;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.error = err.error?.message || 'Erreur lors du chargement des utilisateurs';
      },
    });
  }

  onFileSelected(event: Event, target: 'newUser' | 'selectedUser'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (target === 'newUser') {
        this.newUser.photo = file;
        this.newUserPhotoPreview = URL.createObjectURL(file);
      } else {
        this.selectedUser.photo = file;
        this.selectedUserPhotoPreview = URL.createObjectURL(file);
      }
    }
  }

  onCreate(): void {
    const formData = new FormData();
    formData.append('email', this.newUser.email);
    formData.append('password', this.newUser.password);
    formData.append('role', this.newUser.role);
    if (this.newUser.firstName) formData.append('firstName', this.newUser.firstName);
    if (this.newUser.lastName) formData.append('lastName', this.newUser.lastName);
    if (this.newUser.dateOfBirth) formData.append('dateOfBirth', this.newUser.dateOfBirth);
    if (this.newUser.bio) formData.append('bio', this.newUser.bio);
    if (this.newUser.photo) formData.append('photo', this.newUser.photo);

    this.userService.createUser(formData).subscribe({
      next: () => {
        this.loadUsers();
        this.resetNewUser();
        this.newUserPhotoPreview = null;
      },
      error: (err) => {
        console.error('Error creating user:', err);
        this.error = err.error?.message || 'Erreur lors de la création de l\'utilisateur';
      },
    });
  }

  openEditModal(user: any): void {
    this.selectedUser = { ...user, password: '', photo: null };
    this.selectedUserPhotoPreview = user.photo ? `http://localhost:5000/uploads/${user.photo}` : null;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
    this.selectedUserPhotoPreview = null;
  }

  onUpdate(): void {
    if (!this.selectedUser) return;

    const formData = new FormData();
    formData.append('email', this.selectedUser.email);
    formData.append('role', this.selectedUser.role);
    if (this.selectedUser.password) formData.append('password', this.selectedUser.password);
    if (this.selectedUser.firstName !== undefined) formData.append('firstName', this.selectedUser.firstName);
    if (this.selectedUser.lastName !== undefined) formData.append('lastName', this.selectedUser.lastName);
    if (this.selectedUser.dateOfBirth !== undefined) formData.append('dateOfBirth', this.selectedUser.dateOfBirth);
    if (this.selectedUser.bio !== undefined) formData.append('bio', this.selectedUser.bio);
    if (this.selectedUser.photo) formData.append('photo', this.selectedUser.photo);

    this.userService.updateUser(this.selectedUser._id, formData).subscribe({
      next: () => {
        this.loadUsers();
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Error updating user:', err);
        this.error = err.error?.message || 'Erreur lors de la mise à jour de l\'utilisateur';
      },
    });
  }

  deleteUser(id: string): void {
    if (!id) {
      console.error('User ID is undefined');
      this.error = 'Erreur : ID de l\'utilisateur non défini';
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      this.error = 'Erreur : Vous devez être connecté pour effectuer cette action';
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.userService.deleteUser(id).subscribe({
        next: (response) => {
          console.log('User deleted successfully:', response);
          this.loadUsers();
          this.error = '';
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          const errorMessage = err.error?.message || 'Erreur lors de la suppression de l\'utilisateur';
          this.error = errorMessage;
          if (err.status === 401) {
            this.error = 'Erreur : Session expirée ou accès non autorisé. Veuillez vous reconnecter.';
          }
        },
      });
    }
  }

  getUserPhotoUrl(photo: string | undefined): string {
    if (photo) {
      return `http://localhost:5000/uploads/${photo}`;
    }
    return 'assets/img/default-user.jpg';
  }

  resetNewUser(): void {
    this.newUser = { 
      email: '', 
      password: '', 
      role: 'apprenant', 
      firstName: '', 
      lastName: '', 
      dateOfBirth: '', 
      bio: '', 
      photo: null 
    };
  }

  setViewMode(mode: 'add' | 'list'): void {
    this.viewMode = mode;
    if (mode === 'add') {
      this.resetNewUser();
      this.newUserPhotoPreview = null;
    }
  }
}