import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './components/modal/modal.component';
import { SkeletonComponent } from './components/skeleton/skeleton.component';
import { HeaderComponent } from './components/header/header.component';



@NgModule({
  declarations: [
    ModalComponent,
    SkeletonComponent,
    HeaderComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    HeaderComponent
  ]
})
export class SharedModule { }
