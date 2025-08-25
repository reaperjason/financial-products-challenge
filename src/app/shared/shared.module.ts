import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from './components/skeleton/skeleton.component';
import { HeaderComponent } from './components/header/header.component';
import { OptionsMenuComponent } from './components/options-menu/options-menu.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';



@NgModule({
  declarations: [
    ConfirmationModalComponent,
    SkeletonComponent,
    HeaderComponent,
    OptionsMenuComponent,
    ConfirmationModalComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    HeaderComponent,
    OptionsMenuComponent,
    ConfirmationModalComponent
  ]
})
export class SharedModule { }
