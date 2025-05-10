import { Component, Input, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { NgForOf, NgIf, JsonPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { PostsService } from '../../service/posts/posts.service';
import { CategoriesObjects } from '../../model/categories-objects/categories-objects.model';
import {FirebaseStorageService} from "../../service/firebase-storage/firebase-storage";
import {lastValueFrom} from "rxjs";

@Component({
  selector: 'app-create-info-post-content',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    NgxDropzoneModule
  ],
  templateUrl: './create-info-post-content.component.html',
  styleUrls: ['./create-info-post-content.component.css']
})
export class CreateInfoPostContentComponent implements OnInit {
  @Input() category_id: string | null = null;
  @Input() product_name: string | null = null;
  @Input() description: string | null = null;
  @Input() change_for: string | null = null;
  @Input() price: number | null = null;
  @Input() images: string[] = [];

  categories: CategoriesObjects[] = [];
  files: File[] = [];
  imagesUrl: string[] = [];
  maxFiles = 4;
  totalFiles = 0;

  formProduct = new FormGroup({
    category_id: new FormControl<string | null>(null, Validators.required),
    product_name: new FormControl<string | null>(null, Validators.required),
    description: new FormControl<string | null>(null, Validators.required),
    change_for: new FormControl<string | null>(null, Validators.required),
    price: new FormControl<number | null>(null, Validators.required)
  });

  constructor(private postService: PostsService, private storageService: FirebaseStorageService) {}

  ngOnInit(): void {
    this.formProduct.patchValue({
      category_id: this.category_id,
      product_name: this.product_name,
      description: this.description,
      change_for: this.change_for,
      price: this.price
    });

    this.totalFiles = this.images.length;
    this.postService.getCategoriesProducts().subscribe(res => {
      this.categories = res.map(cat => ({ ...cat, id: cat.id.toString() }));
    });
  }

  onSubmit(): any {
    this.formProduct.markAllAsTouched();
    return this.formProduct.valid ? this.formProduct.value : null;
  }

  onSelect(event: any): void {
    const nuevos = this.totalFiles + event.addedFiles.length;
    if (nuevos <= this.maxFiles) {
      this.files.push(...event.addedFiles);
      this.totalFiles = nuevos;
    } else {
      const resto = this.maxFiles - this.totalFiles;
      this.files.push(...event.addedFiles.slice(0, resto));
      this.totalFiles = this.maxFiles;
    }
  }

  onRemove(file: File): void {
    const i = this.files.indexOf(file);
    if (i >= 0) {
      this.files.splice(i, 1);
      this.totalFiles--;
    }
  }

  validateInput(event: InputEvent): void {
    if (event.data === '-' || event.data === '+') event.preventDefault();
  }

  async uploadImage(): Promise<string[]> {
    this.imagesUrl = [];
    for (const file of this.files) {
      const { progress$, url$ } = this.storageService.uploadProductImage(file, this.category_id || 'default');
      progress$.subscribe();
      const url = await lastValueFrom(url$);
      this.imagesUrl.push(url);
    }
    return this.imagesUrl;
  }
}
