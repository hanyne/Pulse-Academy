import { Component, OnInit } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CoursesComponent implements OnInit {
  courses: any[] = [];
  filteredCourses: any[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;
  pages: number[] = [];
  newCourse: any = { title: '', description: '', instructor: '', duration: '', price: null };
  newCourseImage: File | null = null;
  newCourseImagePreview: string | null = null;

  constructor(
    private courseService: CourseService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.filterCourses();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des formations:', err);
      },
    });
  }

  filterCourses(): void {
    let filtered = this.courses;
    if (this.searchTerm) {
      filtered = this.courses.filter(course =>
        (course.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false) ||
        (course.instructor?.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false) ||
        (course.instructor?.lastName?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false) ||
        (course.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false)
      );
    }
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredCourses = filtered.slice(start, start + this.pageSize);
  }

  onSearchChange(): void {
    this.currentPage = 1; // Réinitialiser à la première page lors d'une recherche
    this.filterCourses();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.filterCourses();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filterCourses();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.filterCourses();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.newCourseImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.newCourseImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  createCourse(): void {
    if (!this.newCourse.title || !this.newCourse.description || !this.newCourse.instructor) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    const formData = new FormData();
    formData.append('title', this.newCourse.title);
    formData.append('description', this.newCourse.description);
    formData.append('instructor', this.newCourse.instructor);
    if (this.newCourse.duration) formData.append('duration', this.newCourse.duration);
    if (this.newCourse.price) formData.append('price', this.newCourse.price.toString());
    if (this.newCourseImage) formData.append('image', this.newCourseImage);

    this.courseService.createCourse(formData).subscribe({
      next: () => {
        this.loadCourses();
        this.newCourse = { title: '', description: '', instructor: '', duration: '', price: null };
        this.newCourseImage = null;
        this.newCourseImagePreview = null;
        alert('Formation créée avec succès !');
      },
      error: (err) => {
        console.error('Erreur lors de la création de la formation:', err);
        alert('Erreur lors de la création de la formation.');
      },
    });
  }

  editCourse(course: any): void {
    console.log('Edit course:', course);
  }

  deleteCourse(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      this.courseService.deleteCourse(id).subscribe({
        next: () => {
          this.loadCourses();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de la formation:', err);
        },
      });
    }
  }

  getCourseImageUrl(image: string | undefined): string {
    if (image && image !== 'undefined' && image !== '') {
      return `http://localhost:5000/uploads/${image}`;
    }
    return 'assets/img/default-course.jpg'; // Image par défaut valide
  }
}