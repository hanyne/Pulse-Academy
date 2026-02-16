import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormateurCoursesComponent } from './formateur-courses.component';

describe('FormateurCoursesComponent', () => {
  let component: FormateurCoursesComponent;
  let fixture: ComponentFixture<FormateurCoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormateurCoursesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormateurCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
