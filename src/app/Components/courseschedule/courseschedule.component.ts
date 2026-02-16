import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { Course } from '../../model/course';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-courseschedule',
  templateUrl: './courseschedule.component.html',
  styleUrls: ['./courseschedule.component.css']
})
export class CoursescheduleComponent implements OnInit {
 courseId: string = '';
  course: Course | undefined;
  newScheduleEntry: {
    day: string;
    startTime: string;
    endTime: string;
    date: string; // YYYY-MM-DD format from native date input
  } = { day: '', startTime: '', endTime: '', date: '' };
  daysOfWeek: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  schedule: { day: string; startTime: string; endTime: string; date?: string }[] = [];
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private route: ActivatedRoute, private courseService: CourseService, private authService: AuthService) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    if (this.courseId) {
      this.loadCourse();
    } else {
      this.errorMessage = 'ID de la formation manquant.';
    }
  }

  loadCourse(): void {
    this.courseService.getCourse(this.courseId).subscribe({
      next: (course) => {
        this.course = course;
        this.schedule = course.schedule || [];
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement de la formation : ' + (err.error?.message || err.message);
        console.error('Error loading course:', err);
      }
    });
  }

  addScheduleEntry(): void {
    if (!this.newScheduleEntry.day || !this.newScheduleEntry.startTime || !this.newScheduleEntry.endTime) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires (jour, heure de début, heure de fin).';
      return;
    }
    if (this.newScheduleEntry.date && !this.isValidDate(this.newScheduleEntry.date)) {
      this.errorMessage = 'Veuillez entrer une date valide (YYYY-MM-DD).';
      return;
    }
    this.schedule.push({ ...this.newScheduleEntry });
    this.newScheduleEntry = { day: '', startTime: '', endTime: '', date: '' };
    this.errorMessage = '';
  }

  removeScheduleEntry(index: number): void {
    this.schedule.splice(index, 1);
  }

  saveSchedule(): void {
    if (!this.course) {
      this.errorMessage = 'Formation non chargée.';
      return;
    }
    const formData = new FormData();
    formData.append('_id', this.course._id);
    formData.append('title', this.course.title);
    formData.append('description', this.course.description);
    formData.append('instructor', this.course.instructor._id);
    formData.append('duration', this.course.duration || '');
    formData.append('price', this.course.price?.toString() || '0');
    formData.append('rating', (this.course.rating ?? 0).toString());
    formData.append('imagePath', this.course.image || '');
    formData.append('schedule', JSON.stringify(this.schedule));

    this.courseService.updateCourse(formData).subscribe({
      next: (updatedCourse) => {
        this.course = updatedCourse;
        this.schedule = updatedCourse.schedule || [];
        this.successMessage = 'Planning mis à jour avec succès !';
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la mise à jour du planning : ' + (err.error?.message || err.message);
        console.error('Error updating schedule:', err);
      }
    });
  }

  private isValidDate(dateString: string): boolean {
    if (!dateString) return true; // Optional field
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/) !== null;
  }

  private sortKey: string = 'day';
  private sortDirection: 'asc' | 'desc' = 'asc';

  sortBy(key: string): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
    this.schedule.sort((a, b) => {
      let valueA: string | number = a[this.sortKey as keyof typeof a] || '';
      let valueB: string | number = b[this.sortKey as keyof typeof b] || '';

      if (this.sortKey === 'date' && valueA && valueB) {
        valueA = new Date(valueA as string).getTime() || 0;
        valueB = new Date(valueB as string).getTime() || 0;
      }

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // New method to calculate total scheduled hours
  getTotalScheduledHours(): number {
    return this.schedule.reduce((total, entry) => {
      const start = new Date(`1970-01-01T${entry.startTime}:00`);
      const end = new Date(`1970-01-01T${entry.endTime}:00`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + (hours > 0 ? hours : 0);
    }, 0);
  }
  updateDayFromDate(): void {
    if (this.newScheduleEntry.date) {
      const date = new Date(this.newScheduleEntry.date);
      const dayIndex = date.getDay();
      // Adjust for French day names (Sunday = 0, Monday = 1, etc.)
      const frenchDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      this.newScheduleEntry.day = frenchDays[dayIndex];
    } else {
      this.newScheduleEntry.day = '';
    }
  }
   logout(): void {
    this.authService.logout();
  }
}