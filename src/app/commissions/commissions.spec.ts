import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Commissions } from './commissions';

describe('Commissions', () => {
  let component: Commissions;
  let fixture: ComponentFixture<Commissions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Commissions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Commissions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset the form to a pristine and untouched state', () => {
    const nameControl = component.commissionForm.get('name');
    const descriptionControl = component.commissionForm.get('description');

    nameControl?.setValue('Test Name');
    nameControl?.markAsDirty();
    nameControl?.markAsTouched();

    descriptionControl?.setValue('A detailed project description');
    descriptionControl?.markAsDirty();
    descriptionControl?.markAsTouched();

    component.reset();

    expect(component.commissionForm.pristine).toBeTrue();
    expect(component.commissionForm.untouched).toBeTrue();
    expect(nameControl?.pristine).toBeTrue();
    expect(nameControl?.dirty).toBeFalse();
    expect(nameControl?.untouched).toBeTrue();
    expect(descriptionControl?.pristine).toBeTrue();
    expect(descriptionControl?.dirty).toBeFalse();
    expect(descriptionControl?.untouched).toBeTrue();
  });
});
