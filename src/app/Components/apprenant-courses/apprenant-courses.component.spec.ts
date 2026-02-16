import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprenantCoursesComponent } from './apprenant-courses.component';

describe('ApprenantCoursesComponent', () => {
  let component: ApprenantCoursesComponent;
  let fixture: ComponentFixture<ApprenantCoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApprenantCoursesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprenantCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
