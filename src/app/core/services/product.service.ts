import { Injectable } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Product } from 'src/app/products/models/product.model';


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = `${environment.apiBaseUrl}/bp/products`;

  constructor(private http: HttpClient) { }

  // Obtener todos los productos
  getProducts(): Observable<Product[]> {
    return this.http.get<any>(this.apiUrl)
      .pipe(
        map(response => response.data),
        tap(data => {
          if (!environment.production) {
            console.log('Products fetched:', data);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Crear un nuevo producto
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product)
      .pipe(
        tap(data => {
          if (!environment.production) {
            console.log('Product created:', data);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Actualizar un producto existente
  updateProduct(id: string, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product)
      .pipe(
        tap(data => {
          if (!environment.production) {
            console.log('Product updated:', data);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Eliminar un producto
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          if (!environment.production) {
            console.log(`Product with ID ${id} deleted`);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Verificar si un ID existe
  verifyProductId(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/verification/${id}`)
      .pipe(
        tap(exists => {
          if (!environment.production) {
            console.log(`ID verification for ${id}: ${exists}`);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Manejo centralizado de errores
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Error del cliente o red
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Error del backend
      errorMessage = `Backend returned code ${error.status}, body: ${JSON.stringify(error.error)}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
