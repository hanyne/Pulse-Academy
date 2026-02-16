import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionmessagesComponent } from './gestionmessages.component';

describe('GestionmessagesComponent', () => {
  let component: GestionmessagesComponent;
  let fixture: ComponentFixture<GestionmessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionmessagesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionmessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
