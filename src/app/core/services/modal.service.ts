import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';

export interface ConfirmationModalData {
  name: string;
  id: string;
  showCancelButton?: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class ModalService {

  private confirmModalState = new Subject<ConfirmationModalData | null>();
  public confirmModalState$ = this.confirmModalState.asObservable();

  // Este Subject es solo para el modal de ERRORES
  private errorModalState = new Subject<boolean>();
  public errorModalState$ = this.errorModalState.asObservable();

  private confirmResponse = new Subject<boolean>();
  private errorResponse = new Subject<void>();


  constructor(private router: Router) { }

  // Método para abrir el modal de CONFIRMACIÓN.
  public openConfirmationModal(data: ConfirmationModalData): Observable<boolean> {
    this.confirmModalState.next(data);

    return new Observable(observer => {
      const sub = this.confirmResponse.subscribe(response => {
        observer.next(response);
        observer.complete();
      });

      return () => {
        sub.unsubscribe();
      };
    });
  }

  // Método para cerrar el modal de CONFIRMACIÓN y emitir la respuesta del usuario.
  public closeConfirmationModal(response: boolean): void {
    this.confirmResponse.next(response);
    this.confirmModalState.next(null);
  }

  // Método para abrir el modal de ERRORES.
  public openErrorModal(): void {
    this.errorModalState.next(true);
  }

  // Método simple para cerrar el modal de ERRORES.
  public closeErrorModal(): void {
    this.errorModalState.next(false);
    this.errorResponse.next();
  }

  public handleBackendError(): void {
    this.errorModalState.next(true);

    this.errorResponse.subscribe(() => {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/products']);
      });
    });
  }
}
