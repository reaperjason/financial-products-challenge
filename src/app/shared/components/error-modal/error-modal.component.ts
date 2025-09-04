import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss']
})
export class ErrorModalComponent {
  @Output()
  understood = new EventEmitter<void>();

  onUnderstood(): void {
    this.understood.emit();
  }
}
