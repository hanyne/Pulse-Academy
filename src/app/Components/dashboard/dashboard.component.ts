// dashboard.component.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { EnrollmentService } from '../../services/enrollement.service';
import { UserService } from '../../services/user.service';
import { CourseService } from '../../services/course.service';
import { ContactService } from '../../services/contact.service';
import { AuthService } from 'src/app/services/auth.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  // Basic statistics
  totalEnrollments = 0;
  totalStudents = 0;
  totalInstructors = 0;
  totalCourses = 0;
  totalNewMessages = 0;

  // Advanced statistics
  enrollmentsThisMonth = 0;
  enrollmentsThisYear = 0;
  pendingEnrollments = 0;
  confirmedEnrollments = 0;
  activeInstructors = 0;
  topCourses: { title: string; count: number }[] = [];
  monthlyEnrollmentsData: number[] = [];
  monthlyLabels: string[] = [];

  // Helper flag → avoids complex .some() expressions in template
  hasEnrollmentsTrend = false;

  error = '';
  loading = true;

  private enrollmentsChart!: Chart;

  constructor(
    private enrollmentService: EnrollmentService,
    private userService: UserService,
    private courseService: CourseService,
    private contactService: ContactService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAllStatistics();
  }

  ngAfterViewInit(): void {
    this.initEnrollmentsChart();
  }

  private loadAllStatistics(): void {
    this.loading = true;

    forkJoin({
      courses: this.courseService.getCourses(),
      instructors: this.userService.getInstructors(),
      messages: this.contactService.getMessages()
    }).subscribe({
      next: ({ courses, instructors, messages }) => {
        this.totalCourses = courses.length;
        this.totalInstructors = instructors.length;

        // Change this logic depending on your backend (unread vs total messages)
        this.totalNewMessages = messages.filter((m: any) => !m.read).length || messages.length;

        // Active instructors = those linked to at least one course
        const instructorIdsWithCourses = new Set(
          courses.map((c: any) => c.instructor?._id).filter(Boolean)
        );
        this.activeInstructors = instructorIdsWithCourses.size;

        // Load enrollments for every course
        const enrollmentObservables = courses.map((course: any) =>
          this.enrollmentService.getEnrollments(course._id)
        );

        forkJoin(enrollmentObservables).subscribe({
          next: (enrollmentArrays) => {
            const allEnrollments = enrollmentArrays.flat();

            this.totalEnrollments = allEnrollments.length;

            // Count unique students
            const uniqueStudentIds = new Set(allEnrollments.map((e: any) => e.user?._id));
            this.totalStudents = uniqueStudentIds.size;

            // Compute all advanced stats
            this.calculateAdvancedStats(allEnrollments, courses);

            this.loading = false;
          },
          error: (err) => {
            this.error = 'Erreur lors du chargement des inscriptions';
            console.error('Enrollments fetch error:', err);
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des données principales';
        console.error('Main data fetch error:', err);
        this.loading = false;
      }
    });
  }

  private calculateAdvancedStats(enrollments: any[], courses: any[]): void {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);

    // ────────────────────────────────────────────────
    // Enrollments this month / this year
    // ────────────────────────────────────────────────
    this.enrollmentsThisMonth = enrollments.filter(e => {
      const date = new Date(e.createdAt || e.date || 0);
      return date >= thisMonthStart;
    }).length;

    this.enrollmentsThisYear = enrollments.filter(e => {
      const date = new Date(e.createdAt || e.date || 0);
      return date >= thisYearStart;
    }).length;

    // ────────────────────────────────────────────────
    // Status distribution – FIXED TYPING
    // ────────────────────────────────────────────────
    type EnrollmentStatus = 'pending' | 'confirmed' | 'paid' | 'refused';

    const statusCount: Record<EnrollmentStatus, number> = {
      pending: 0,
      confirmed: 0,
      paid: 0,
      refused: 0
    };

    enrollments.forEach(e => {
      const statusRaw = (e.status || '').toLowerCase();
      // Only count known statuses
      if (statusRaw === 'pending' || statusRaw === 'confirmed' ||
          statusRaw === 'paid'    || statusRaw === 'refused') {
        statusCount[statusRaw as EnrollmentStatus]++;
      }
    });

    this.pendingEnrollments   = statusCount.pending;
    this.confirmedEnrollments = statusCount.confirmed + statusCount.paid;

    // ────────────────────────────────────────────────
    // Top 5 most enrolled courses
    // ────────────────────────────────────────────────
    const courseCountMap = new Map<string, { title: string; count: number }>();

    courses.forEach((course: any) => {
      courseCountMap.set(course._id, { title: course.title, count: 0 });
    });

    enrollments.forEach((enrollment: any) => {
      const courseId = enrollment.course?._id || enrollment.course;
      if (courseId && courseCountMap.has(courseId)) {
        courseCountMap.get(courseId)!.count++;
      }
    });

    this.topCourses = Array.from(courseCountMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // ────────────────────────────────────────────────
    // Prepare monthly chart data + trend flag
    // ────────────────────────────────────────────────
    this.prepareMonthlyChartData(enrollments);
  }

  private prepareMonthlyChartData(enrollments: any[]): void {
    const counts: Record<string, number> = {};
    const now = new Date();

    this.monthlyLabels = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = date.toLocaleString('fr-FR', { month: 'short', year: 'numeric' });
      this.monthlyLabels.push(label);
      counts[label] = 0;
    }

    enrollments.forEach(e => {
      const date = new Date(e.createdAt || e.date || 0);
      const label = date.toLocaleString('fr-FR', { month: 'short', year: 'numeric' });
      if (label in counts) {
        counts[label]++;
      }
    });

    this.monthlyEnrollmentsData = this.monthlyLabels.map(label => counts[label] || 0);

    // Update safe boolean for template usage
    this.hasEnrollmentsTrend =
      this.monthlyEnrollmentsData.length > 0 &&
      this.monthlyEnrollmentsData.some(count => count > 0);

    this.updateChart();
  }

  private initEnrollmentsChart(): void {
    const canvas = document.getElementById('enrollmentsChart') as HTMLCanvasElement | null;
    if (!canvas) return;

    this.enrollmentsChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Inscriptions',
          data: [],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          legend: { display: true, position: 'top' }
        }
      }
    });
  }

  private updateChart(): void {
    if (this.enrollmentsChart) {
      this.enrollmentsChart.data.labels = this.monthlyLabels;
      (this.enrollmentsChart.data.datasets[0] as any).data = this.monthlyEnrollmentsData;
      this.enrollmentsChart.update();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}