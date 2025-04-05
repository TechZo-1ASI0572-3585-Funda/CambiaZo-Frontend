import {Component, ViewChild} from '@angular/core';
import {
  CreatePostInfoUserContentComponent
} from "../../components/create-post-info-user-content/create-post-info-user-content.component";
import {
  CreateInfoPostContentComponent
} from "../../components/create-info-post-content/create-info-post-content.component";
import {MatFormField} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {Products} from "../../model/products/products.model";
import {PostsService} from "../../service/posts/posts.service";
import {
  DialogRegisterSuccessfullyComponent
} from "../../components/dialog-register-successfully/dialog-register-successfully.component";
import {MatDialog} from "@angular/material/dialog";
import {
  DialogSuccessfullyPostComponent
} from "../../../public/components/dialog-successfully-post/dialog-successfully-post.component";
import {Router} from "@angular/router";

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    CreatePostInfoUserContentComponent,
    CreateInfoPostContentComponent,
    MatFormField,
    MatIcon,
    MatInput,
    MatButton
  ],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css'
})
export class PostComponent {

  imageDefault='https://media.istockphoto.com/id/1472933890/es/vector/no-hay-s%C3%ADmbolo-vectorial-de-imagen-falta-el-icono-disponible-no-hay-galer%C3%ADa-para-este.jpg?s=612x612&w=0&k=20&c=fTxCETonJ20MRRE6DFU9pbGws6e7sa1uySP49wU372I='

  constructor(
    private productsService: PostsService,
    private dialog: MatDialog,
    private router: Router,
  ) {
  }
  @ViewChild(CreatePostInfoUserContentComponent)createPostInfoUserContentComponent!:CreatePostInfoUserContentComponent;
  @ViewChild(CreateInfoPostContentComponent)createInfoPostContentComponent!:CreateInfoPostContentComponent;

  onPost(){
    const infoProduct = this.createInfoPostContentComponent.onSubmit()
    const contactProduct = this.createPostInfoUserContentComponent.onSubmit()

    if(infoProduct && contactProduct){
      this.createInfoPostContentComponent.uploadImage().then((images:string[]) => {

      const newProduct =
        {
          user_id: localStorage.getItem('id') || 'default',
          ...infoProduct,
          'images':!images.length ? [this.imageDefault] : images,
          'boost': contactProduct.boost,
          'location':{
            'country': contactProduct.country,
            'departament':contactProduct.departament,
            'district': contactProduct.district
            }
        }
      this.productsService.postProduct(newProduct).subscribe()
      })
      const dialogRef = this.dialog.open(DialogSuccessfullyPostComponent);
      dialogRef.afterClosed().subscribe(result => {
        this.router.navigateByUrl('/home');
      });
    }
  }


}
