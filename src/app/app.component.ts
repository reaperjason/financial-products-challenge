import { Component } from '@angular/core';
import { ModalService } from './core/services/modal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'financial-products-challenge';
  showErrorModal = false;


  constructor(private modalService: ModalService) { }

  ngOnInit(): void {
    // Suscríbete al estado del modal de errores
    this.modalService.errorModalState$.subscribe(state => {
      this.showErrorModal = state;
    });
  }

  closeErrorModal(): void {
    this.modalService.closeErrorModal();
  }
}

