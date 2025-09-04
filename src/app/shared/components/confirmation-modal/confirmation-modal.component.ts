import { Component, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalService } from 'src/app/core/services/modal.service';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent {
  showModal = false;
  productName: string = '';
  productId: string = '';
  private subscription!: Subscription;

  @Output() confirmed = new EventEmitter<string>();

  constructor(private modalService: ModalService) { }

  ngOnInit(): void {
    this.subscription = this.modalService.confirmModalState$.subscribe(data => {
      if (data) {
        this.productName = data.name;
        this.productId = data.id;
        this.showModal = true;
      } else {
        this.showModal = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  closeModal(): void {
    this.modalService.closeConfirmationModal(false);
  }

  confirmDelete(): void {
    this.confirmed.emit(this.productId);
    this.modalService.closeConfirmationModal(false);
  }
}
