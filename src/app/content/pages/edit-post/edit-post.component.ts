import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgForOf, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { PostsService } from '../../service/posts/posts.service';
import { CreatePostInfoUserContentComponent } from '../../components/create-post-info-user-content/create-post-info-user-content.component';
import { CreateInfoPostContentComponent } from '../../components/create-info-post-content/create-info-post-content.component';
import { DialogSuccessfulProductEditionComponent } from '../../../public/components/dialog-successful-product-edition/dialog-successful-product-edition.component';

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [
    RouterLink,
    MatIcon,
    MatCardModule,
    MatButton,
    CreatePostInfoUserContentComponent,
    CreateInfoPostContentComponent,
    NgIf
  ],
  templateUrl: './edit-post.component.html',
  styleUrls: ['../post/post.component.css','./edit-post.component.css']
})
export class EditPostComponent implements OnInit {
  @ViewChild(CreatePostInfoUserContentComponent) createPostInfoUserContentComponent!: CreatePostInfoUserContentComponent;
  @ViewChild(CreateInfoPostContentComponent) createInfoPostContentComponent!: CreateInfoPostContentComponent;
  post: any;

  constructor(
    private dialog: MatDialog,
    private productsService: PostsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const raw = params.get('postId') || '';
      const id = raw.split('&Id=')[1] || '';
      this.getPost(id);
    });
  }

  getPost(id: string): void {
    this.productsService.getProductById(id).subscribe((res: any) => {
      this.post = res;
    });
  }

  onPost(): void {
    const infoProduct = this.createInfoPostContentComponent.onSubmit();
    const contactProduct = this.createPostInfoUserContentComponent.onSubmit();
    if (infoProduct && contactProduct) {
      this.createInfoPostContentComponent.uploadImage().then((images: string[]) => {
        this.productsService.getDistrictId(this.post.location.district).subscribe(districtId => {
          const newProduct = {
            name: infoProduct.product_name,
            description: infoProduct.description,
            desiredObject: infoProduct.change_for,
            price: infoProduct.price,
            image: this.post.images[0],
            boost: contactProduct.boost,
            available: true,
            productCategoryId: Number(infoProduct.category_id),
            userId: Number(localStorage.getItem('id')),
            districtId
          };
          this.productsService.putProduct(Number(this.post.id), newProduct).subscribe(() => this.successEdition());
        });
      });
    }
  }

  successEdition(): void {
    const ref = this.dialog.open(DialogSuccessfulProductEditionComponent, { disableClose: true });
    ref.afterClosed().subscribe(() => this.router.navigateByUrl('/profile/my-posts'));
  }
}
