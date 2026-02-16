import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursescheduleComponent } from './courseschedule.component';

describe('CoursescheduleComponent', () => {
  let component: CoursescheduleComponent;
  let fixture: ComponentFixture<CoursescheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoursescheduleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursescheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
