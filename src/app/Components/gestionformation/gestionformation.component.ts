import { Component, OnInit } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { UserService } from '../../services/user.service';
import { Course } from '../../model/course';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestionformation',
  templateUrl: './gestionformation.component.html',
  styleUrls: ['./gestionformation.component.css']
})
export class GestionformationComponent implements OnInit {
  courses: Course[] = [];
  instructors: any[] = [];
  newCourse: Course = {
    _id: '',
    title: '',
    description: '',
    instructor: { _id: '', email: '', firstName: '', lastName: '' }, // Include all fields for display
    image: '',
    rating: 0,
    duration: '',
    price: 0,
    createdAt: new Date(),
    schedule: []
  };
  selectedCourse: Course = { ...this.newCourse };
  successMessage: string = '';
  errorMessage: string = '';
  newCourseImageFile: File | null = null;
  selectedCourseImageFile: File | null = null;
  newCourseImagePreview: string | null = null;
  selectedCourseImagePreview: string | null = null;

  constructor(
    private courseService: CourseService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadInstructors();
  }

  loadInstructors(): void {
    this.userService.getInstructors().subscribe({
      next: (instructors) => {
        this.instructors = instructors; // No need to filter, backend already returns formateurs
        console.log('Instructors loaded:', this.instructors);
        if (this.instructors.length === 0) {
          this.errorMessage = 'Aucun formateur disponible. Veuillez créer un formateur d\'abord.';
        }
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des formateurs : ' + (err.error?.error || err.message);
        console.error('Error loading instructors:', err);
      }
    });
  }

  loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        console.log('Courses loaded:', this.courses);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des formations : ' + (err.error?.error || err.message);
        console.error('Error loading courses:', err);
      }
    });
  }

  onFileSelected(event: Event, target: 'newCourse' | 'selectedCourse'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (target === 'newCourse') {
        this.newCourseImageFile = file;
        this.newCourseImagePreview = URL.createObjectURL(file);
      } else {
        this.selectedCourseImageFile = file;
        this.selectedCourseImagePreview = URL.createObjectURL(file);
      }
    }
  }

  openCreateModal(): void {
    this.newCourse = {
      _id: '',
      title: '',
      description: '',
      instructor: { _id: '', email: '', firstName: '', lastName: '' },
      image: '',
      rating: 0,
      duration: '',
      price: 0,
      createdAt: new Date(),
      schedule: []
    };
    this.newCourseImageFile = null;
    this.newCourseImagePreview = null;
    this.successMessage = '';
    this.errorMessage = '';
    const modalElement = document.getElementById('createCourseModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    } else {
      console.error('Create modal element not found');
    }
  }

  createCourse(): void {
    if (!this.newCourse.title || !this.newCourse.description || !this.newCourse.instructor._id) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires (titre, description, formateur).';
      return;
    }

    const formData = new FormData();
    formData.append('title', this.newCourse.title);
    formData.append('description', this.newCourse.description);
    formData.append('instructor', this.newCourse.instructor._id);
    formData.append('duration', this.newCourse.duration || '');
    formData.append('price', this.newCourse.price?.toString() || '0');
    formData.append('rating', (this.newCourse.rating ?? 0).toString());
    if (this.newCourseImageFile) {
      formData.append('image', this.newCourseImageFile);
    }
    // Include schedule if present
    if (this.newCourse.schedule && this.newCourse.schedule.length > 0) {
      formData.append('schedule', JSON.stringify(this.newCourse.schedule));
    }

    this.courseService.createCourse(formData).subscribe({
      next: (course) => {
        this.successMessage = 'Formation créée avec succès !';
        this.newCourse = {
          _id: '',
          title: '',
          description: '',
          instructor: { _id: '', email: '', firstName: '', lastName: '' },
          image: '',
          rating: 0,
          duration: '',
          price: 0,
          createdAt: new Date(),
          schedule: []
        };
        this.newCourseImageFile = null;
        this.newCourseImagePreview = null;
        this.closeModal('createCourseModal');
        setTimeout(() => {
          this.successMessage = '';
          this.loadCourses();
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la création de la formation : ' + (err.error?.error || err.message);
        console.error('Error creating course:', err);
      }
    });
  }

  openEditModal(course: Course): void {
    if (!course._id) {
      this.errorMessage = 'ID de la formation manquant.';
      return;
    }
    // Ensure instructor object has all necessary fields
    this.selectedCourse = {
      ...course,
      instructor: {
        _id: course.instructor?._id || '',
        email: course.instructor?.email || '',
        firstName: course.instructor?.firstName || '',
        lastName: course.instructor?.lastName || ''
      }
    };
    this.selectedCourseImageFile = null;
    this.selectedCourseImagePreview = null;
    this.successMessage = '';
    this.errorMessage = '';
    const modalElement = document.getElementById('editCourseModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    } else {
      console.error('Edit modal element not found');
    }
  }

  updateCourse(): void {
    if (!this.selectedCourse._id || !this.selectedCourse.title || !this.selectedCourse.description || !this.selectedCourse.instructor._id) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires (titre, description, formateur).';
      return;
    }

    const formData = new FormData();
    formData.append('_id', this.selectedCourse._id);
    formData.append('title', this.selectedCourse.title);
    formData.append('description', this.selectedCourse.description);
    formData.append('instructor', this.selectedCourse.instructor._id);
    formData.append('duration', this.selectedCourse.duration || '');
    formData.append('price', this.selectedCourse.price?.toString() || '0');
    formData.append('rating', (this.selectedCourse.rating ?? 0).toString());
    if (this.selectedCourseImageFile) {
      formData.append('image', this.selectedCourseImageFile);
    } else {
      formData.append('imagePath', this.selectedCourse.image || '');
    }
    // Include schedule if present
    if (this.selectedCourse.schedule && this.selectedCourse.schedule.length > 0) {
      formData.append('schedule', JSON.stringify(this.selectedCourse.schedule));
    }

    this.courseService.updateCourse(formData).subscribe({
      next: (updatedCourse) => {
        this.successMessage = 'Formation mise à jour avec succès !';
        this.selectedCourseImageFile = null;
        this.selectedCourseImagePreview = null;
        this.closeModal('editCourseModal');
        setTimeout(() => {
          this.successMessage = '';
          this.loadCourses();
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la mise à jour de la formation : ' + (err.error?.error || err.message);
        console.error('Error updating course:', err);
      }
    });
  }

  deleteCourse(id: string): void {
    if (!id) {
      this.errorMessage = 'ID de la formation manquant pour la suppression.';
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      this.courseService.deleteCourse(id).subscribe({
        next: () => {
          this.successMessage = 'Formation supprimée avec succès !';
          setTimeout(() => {
            this.successMessage = '';
            this.loadCourses();
          }, 2000);
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la suppression de la formation : ' + (err.error?.error || err.message);
          console.error('Error deleting course:', err);
        }
      });
    }
  }

  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement) || new (window as any).bootstrap.Modal(modalElement);
      modal.hide();
    } else {
      console.error(`Modal element with ID ${modalId} not found`);
    }
  }

  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) {
      return '';
    }
    const path = imagePath.startsWith('uploads/') ? imagePath : `uploads/${imagePath}`;
    const url = `http://localhost:5000/${path}`;
    console.log('Image URL:', url);
    return url;
  }

  onImageError(event: Event): void {
    console.error('Failed to load image:', (event.target as HTMLImageElement).src);
    (event.target as HTMLImageElement).style.display = 'none';
    const parent = (event.target as HTMLImageElement).parentElement;
    if (parent) {
      parent.innerHTML = '<span class="no-image">Image non disponible</span>';
    }
  }

  logout(): void {
    this.authService.logout();
  }

  manageEnrollments(courseId: string): void {
    if (courseId) {
      this.router.navigate([`/gestioninscription/${courseId}`]);
    } else {
      this.errorMessage = 'ID de la formation manquant.';
    }
  }

  viewSchedule(courseId: string): void {
    if (courseId) {
      this.router.navigate([`/course-schedule/${courseId}`]);
    } else {
      this.errorMessage = 'ID de la formation manquant.';
    }
  }
  
}