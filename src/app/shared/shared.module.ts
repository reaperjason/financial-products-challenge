import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './components/modal/modal.component';
import { SkeletonComponent } from './components/skeleton/skeleton.component';
import { HeaderComponent } from './components/header/header.component';
import { OptionsMenuComponent } from './components/options-menu/options-menu.component';



@NgModule({
  declarations: [
    ModalComponent,
    SkeletonComponent,
    HeaderComponent,
    OptionsMenuComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    HeaderComponent,
    OptionsMenuComponent
  ]
})
export class SharedModule { }
