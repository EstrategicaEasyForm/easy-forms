import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SexagePage } from './sexage.page';

describe('SexagePage', () => {
  let component: SexagePage;
  let fixture: ComponentFixture<SexagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SexagePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SexagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
