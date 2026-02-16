import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ContactComponent } from './components/contact/contact.component';
import { AboutComponent } from './components/about/about.component';
import { CoursesComponent} from './components/course/course.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { GestionformationComponent } from './components/gestionformation/gestionformation.component';
import { GestionusersComponent } from './components/gestionusers/gestionusers.component';
import { AdminGuard } from './guards/admin.guard';
import { CoursedetailsComponent } from './components/coursedetails/coursedetails.component';
import { EnrollementComponent } from './components/enrollement/enrollement.component';
import { GestionmessagesComponent } from './components/gestionmessages/gestionmessages.component';
import { AdminReviewsComponent } from './components/admin-reviews/admin-reviews.component';
import { GestioninscriptionComponent } from './Components/gestioninscription/gestioninscription.component';
import { GestionPaiementComponent } from './components/gestionpaiement/gestionpaiement.component';
import { CoursescheduleComponent } from './components/courseschedule/courseschedule.component';
import { FormateurCoursesComponent } from './components/formateur-courses/formateur-courses.component';
import { ApprenantCoursesComponent } from './components/apprenant-courses/apprenant-courses.component';
import { InstructorGuard } from './guards/instructor-guard.service';
import { ApprenantGuard } from './guards/apprenant.guard';
import { DiscountedEnrollmentComponent } from './components/discounted-enrollment/discounted-enrollment.component';
import { ProfileComponent } from './components/profile/profile.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'about', component: AboutComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'course', component: CoursesComponent },
  { path: 'course/:id', component: CoursedetailsComponent },
  { path: 'dash', component: DashboardComponent },
  { path: 'admin/users', component: GestionusersComponent, canActivate: [AdminGuard] },
  { path: 'admin/course', component: GestionformationComponent },
  { path: 'admin/messages', component: GestionmessagesComponent },
  { path: 'enrollment/:id', component: EnrollementComponent },
  { path: 'gestioninscription/:id', component: GestioninscriptionComponent },
  { path: 'course-schedule/:id', component: CoursescheduleComponent },
  { path: 'gestionpaiement/:id', component: GestionPaiementComponent }, 
  { path: 'admin/review', component: AdminReviewsComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'instructor-schedule', component: FormateurCoursesComponent,canActivate: [InstructorGuard]},
  { path: 'apprenant-courses', component: ApprenantCoursesComponent, canActivate: [ApprenantGuard] }, 
  
  { path: '', redirectTo: '/courses', pathMatch: 'full' }
    
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }