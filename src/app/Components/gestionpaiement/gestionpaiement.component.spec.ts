import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionpaiementComponent } from './gestionpaiement.component';

describe('GestionpaiementComponent', () => {
  let component: GestionpaiementComponent;
  let fixture: ComponentFixture<GestionpaiementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionpaiementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionpaiementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
