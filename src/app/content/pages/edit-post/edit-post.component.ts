import {Component, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {NgForOf, NgIf} from "@angular/common";
import {Products} from "../../model/products/products.model";
import {PostsService} from "../../service/posts/posts.service";
import {FormEditPostComponent} from "../../components/form-edit-post/form-edit-post.component";
import {MatIcon} from "@angular/material/icon";
import {MatCardModule} from "@angular/material/card";
import {MatButton} from "@angular/material/button";
import {MatDialog} from "@angular/material/dialog";
import {
  CreatePostInfoUserContentComponent
} from "../../components/create-post-info-user-content/create-post-info-user-content.component";
import {
  CreateInfoPostContentComponent
} from "../../components/create-info-post-content/create-info-post-content.component";
import {
  DialogSuccessfulProductEditionComponent
} from "../../../public/components/dialog-successful-product-edition/dialog-successful-product-edition.component";
@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [
    RouterLink,
    NgForOf,
    MatIcon,
    MatCardModule,
    MatButton,
    MatIcon,
    FormEditPostComponent,
    CreatePostInfoUserContentComponent,
    CreateInfoPostContentComponent,
    NgIf
  ],
  templateUrl: './edit-post.component.html',
  styleUrls: ['../post/post.component.css','./edit-post.component.css']
  //component style of this component -> styleUrl: './edit-post.component.css
})
export class EditPostComponent implements OnInit{

  @ViewChild(CreatePostInfoUserContentComponent) createPostInfoUserContentComponent!: CreatePostInfoUserContentComponent;
  @ViewChild(CreateInfoPostContentComponent) createInfoPostContentComponent!: CreateInfoPostContentComponent;
  post:any
  constructor(private dialog:MatDialog, private productsService:PostsService,private route: ActivatedRoute, private router : Router){
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const products = params.get('postId')/*ong have this value: mathias&Id=1*/
      const id = products ? products.split('&Id=')[1] : ''/*id have this value: 1*/
      this.getPost(id);
    });
  }
  getPost(id:string) {
    this.productsService.getProductById(id).subscribe((res:any)=>{
      this.post = new Products(
        res.id,
        res.user_id,
        res.category_id,
        res.product_name,
        res.description,
        res.change_for,
        res.price,
        res.images,
        res.boost,
        res.available,
        res.location
      )
    })
  }


  onPost(){
    const infoProduct = this.createInfoPostContentComponent.onSubmit()
    const contactProduct = this.createPostInfoUserContentComponent.onSubmit()

    if(infoProduct && contactProduct){
      this.createInfoPostContentComponent.uploadImage().then((images:string[]) => {
        this.productsService.getDistrictId(this.post.location.district).subscribe(districtId => {
          const newProduct = {
            name: infoProduct.product_name || 'defaultName',
            description: infoProduct.description || 'defaultDescription',
            desiredObject: infoProduct.change_for || 'defaultObject',
            price: infoProduct.price || 0,
            image: this.post.images[0],
            boost: contactProduct.boost || false,
            available: true,
            productCategoryId: Number(infoProduct.category_id) || 0,
            userId: parseInt(localStorage.getItem('id') || '0'),
            districtId: districtId
          };
          this.productsService.putProduct(Number(this.post.id), newProduct).subscribe({
            next: () => {
              this.successEdition()
            },
            error: (err) => {
              console.log(err)
            }
          });
        });
      })
    }
  }

  successEdition(){
    const dialog =  this.dialog.open(DialogSuccessfulProductEditionComponent, {disableClose: true})

    dialog.afterClosed().subscribe(result => {
      this.router.navigateByUrl('/profile/my-posts')
    });


  }

}
