import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormEditPostComponent } from './form-edit-post.component';

describe('FormEditPostComponent', () => {
  let component: FormEditPostComponent;
  let fixture: ComponentFixture<FormEditPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormEditPostComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormEditPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
