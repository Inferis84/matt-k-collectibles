import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SupabaseService } from '../supabase';

interface GalleryImage {
  src: string;
  alt: string;
}

interface GalleryItem {
  title: string;
  description: string;
  referenceName: string;
  imageUrl: string;
  images: GalleryImage[];
  price: number | null;
  sold: boolean;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Gallery implements OnInit {
  galleryItems: GalleryItem[] = [];
  isLoading = true;
  errorMessage = '';
  selectedItem: GalleryItem | null = null;
  selectedImageIndex = 0;
  isModalOpen = false;
  private readonly galleryBasePath = '/gallery';

  constructor(
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    void this.loadGalleryItems();
  }

  private async loadGalleryItems() {
    try {
      const result = await this.supabase.getGalleryProjects();
      if (!result.success || !result.data) {
        this.errorMessage = 'Unable to load gallery thumbnails.';
        this.cdr.markForCheck();
        return;
      }

      this.galleryItems = (
        await Promise.all(
          result.data.map(async (row: any) => {
            const referenceName = String(row.reference_name ?? '').trim();
            if (!referenceName) {
              return null;
            }

            const titleImageUrl = `${this.galleryBasePath}/${encodeURIComponent(
              referenceName,
            )}/title.jpg`;
            const titleImageExists = await this.imageExists(titleImageUrl);
            if (!titleImageExists) {
              return null;
            }

            const images = await this.buildGalleryImages(referenceName, row.title);

            return {
              title: String(row.title ?? 'Untitled'),
              description: String(row.description ?? ''),
              referenceName,
              imageUrl: titleImageUrl,
              images,
              price:
                row.price == null || row.price === ''
                  ? null
                  : Number(row.price),
              sold:
                row.sold === true || row.sold === 'true' || row.sold === 1 ||
                row.sold === '1',
            } as GalleryItem;
          }),
        )
      ).filter((item): item is GalleryItem => item !== null);
    } catch (err) {
      console.error('Gallery load failed', err);
      this.errorMessage = 'Unable to load gallery thumbnails.';
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  openGalleryModal(item: GalleryItem, imageIndex = 0) {
    this.selectedItem = item;
    this.selectedImageIndex = imageIndex;
    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  closeGalleryModal() {
    this.selectedItem = null;
    this.selectedImageIndex = 0;
    this.isModalOpen = false;
    this.cdr.markForCheck();
  }

  showPreviousImage() {
    if (!this.selectedItem || this.selectedItem.images.length <= 1) {
      return;
    }

    this.selectedImageIndex =
      (this.selectedImageIndex - 1 + this.selectedItem.images.length) %
      this.selectedItem.images.length;
    this.cdr.markForCheck();
  }

  showNextImage() {
    if (!this.selectedItem || this.selectedItem.images.length <= 1) {
      return;
    }

    this.selectedImageIndex =
      (this.selectedImageIndex + 1) % this.selectedItem.images.length;
    this.cdr.markForCheck();
  }

  private async buildGalleryImages(referenceName: string, title: string) {
    const basePath = `${this.galleryBasePath}/${encodeURIComponent(referenceName)}`;
    const images: GalleryImage[] = [];

    const candidates = [
      'title.jpg',
      ...Array.from({ length: 20 }, (_, index) => `${index + 1}.jpg`),
    ];

    for (const candidate of candidates) {
      const imageUrl = `${basePath}/${candidate}`;
      if (await this.imageExists(imageUrl)) {
        images.push({
          src: imageUrl,
          alt: `${title} ${candidate}`,
        });
      }
    }

    return images;
  }

  private get isBrowser() {
    return (
      typeof window !== 'undefined' &&
      typeof document !== 'undefined' &&
      typeof Image !== 'undefined'
    );
  }

  private async imageExists(url: string) {
    if (!this.isBrowser) {
      return true;
    }

    return new Promise<boolean>((resolve) => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = url;
    });
  }
}
