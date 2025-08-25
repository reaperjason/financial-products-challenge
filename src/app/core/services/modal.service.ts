import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private displayModal = new Subject<any>();

  constructor() { }

  open(data: any): void {
    this.displayModal.next(data);
  }

  close(): void {
    this.displayModal.next(null);
  }

  get data(): Observable<any> {
    return this.displayModal.asObservable();
  }
}
