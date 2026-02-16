import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountedEnrollmentComponent } from './discounted-enrollment.component';

describe('DiscountedEnrollmentComponent', () => {
  let component: DiscountedEnrollmentComponent;
  let fixture: ComponentFixture<DiscountedEnrollmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscountedEnrollmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscountedEnrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
