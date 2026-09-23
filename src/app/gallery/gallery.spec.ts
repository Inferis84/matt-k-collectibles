import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gallery } from './gallery';
import { SupabaseService } from '../supabase';

describe('Gallery', () => {
  let component: Gallery;
  let fixture: ComponentFixture<Gallery>;
  let supabaseService: jasmine.SpyObj<SupabaseService>;

  beforeEach(async () => {
    supabaseService = jasmine.createSpyObj<SupabaseService>('SupabaseService', [
      'getGalleryProjects',
    ]);
    supabaseService.getGalleryProjects.and.returnValue(
      Promise.resolve({
        success: true,
        data: [{ title: 'Test', reference_name: 'demo', price: 100, sold: false }],
      }),
    );

    await TestBed.configureTestingModule({
      imports: [Gallery],
      providers: [{ provide: SupabaseService, useValue: supabaseService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Gallery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clear the loading state after gallery data loads', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.isLoading).toBeFalse();
    expect(component.galleryItems.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Test');
  });
});
