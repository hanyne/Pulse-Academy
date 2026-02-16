import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionformationComponent } from './gestionformation.component';

describe('GestionformationComponent', () => {
  let component: GestionformationComponent;
  let fixture: ComponentFixture<GestionformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionformationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
