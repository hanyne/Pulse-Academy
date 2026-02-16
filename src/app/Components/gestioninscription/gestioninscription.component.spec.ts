import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestioninscriptionComponent } from './gestioninscription.component';

describe('GestioninscriptionComponent', () => {
  let component: GestioninscriptionComponent;
  let fixture: ComponentFixture<GestioninscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestioninscriptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestioninscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
