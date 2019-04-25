import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AspirationPage } from './aspiration.page';

describe('AspirationPage', () => {
  let component: AspirationPage;
  let fixture: ComponentFixture<AspirationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AspirationPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AspirationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
