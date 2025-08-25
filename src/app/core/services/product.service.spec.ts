import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ProductService } from './product.service';
import { firstValueFrom } from 'rxjs';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get all financial products and unwrap the "data" property from the API response', () => {
    const dummyApiData = {
      data: [
        { id: '1', name: 'Product 1', description: 'desc 1', logo: 'logo1.png' },
        { id: '2', name: 'Product 2', description: 'desc 2', logo: 'logo2.png' }
      ]
    };
    const expectedProducts = dummyApiData.data;

    service.getProducts().subscribe((products) => {
      expect(products).toEqual(expectedProducts);
    });
    const request = httpMock.expectOne('http://localhost:3002/bp/products');
    expect(request.request.method).toBe('GET');
    request.flush(dummyApiData, { status: 200, statusText: 'OK' });
  });

  it('should delete a product and return a success message', () => {
    const productId = 'uno';
    const expectedResponse = { message: 'Product removed successfully' };

    service.deleteProduct(productId).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });
    const request = httpMock.expectOne(`http://localhost:3002/bp/products/${productId}`);
    expect(request.request.method).toBe('DELETE');

    request.flush(expectedResponse, { status: 200, statusText: 'OK' });
  });

  it('should create a new product via POST request and return the new product data', () => {
    const newProduct = {
      id: "dos",
      name: "Nombre producto",
      description: "Descripción producto",
      logo: "assets-1.png",
      date_release: "2025-01-01",
      date_revision: "2025-01-01"
    };
    const expectedResponse = {
      message: "Product added successfully",
      data: newProduct
    };

    service.createProduct(newProduct).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });
    const request = httpMock.expectOne('http://localhost:3002/bp/products');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(newProduct);

    request.flush(expectedResponse, { status: 200, statusText: 'OK' });
  });

  it('should update a product via PUT request and return the updated product data', () => {
    const productId = 'uno';
    const productToUpdate = {
      id: productId,
      name: "visa silver",
      description: "cuenta carlos",
      logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
      date_release: "2025-08-24T00:00:00.000Z",
      date_revision: "2026-08-24T00:00:00.000Z"
    };
    const expectedResponse = {
      message: "Product updated successfully",
      data: productToUpdate
    };

    service.updateProduct(productId, productToUpdate).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });
    const request = httpMock.expectOne(`http://localhost:3002/bp/products/${productId}`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(productToUpdate);

    request.flush(expectedResponse, { status: 200, statusText: 'OK' });
  });

  it('should verify if a product ID does not exist and return false', () => {
    const productId = 'dos';
    const expectedResponse = false;

    service.verifyProductId(productId).subscribe(exists => {
      expect(exists).toBe(expectedResponse);
    });
    const request = httpMock.expectOne(`http://localhost:3002/bp/products/verification/${productId}`);
    expect(request.request.method).toBe('GET');

    request.flush(expectedResponse, { status: 200, statusText: 'OK' });
  });

  it('should throw error when GET /bp/products fails', async () => {
    const products$ = service.getProducts();
    const promise = firstValueFrom(products$);
    const request = httpMock.expectOne('http://localhost:3002/bp/products');
    expect(request.request.method).toBe('GET');
    request.flush({ message: 'Server error' }, { status: 500, statusText: 'Server Error' });
    await expect(promise).rejects.toThrow();
  });

  it('should throw error when DELETE /bp/products/:id fails', async () => {
    const productId = 'no-existe';
    const delete$ = service.deleteProduct(productId);
    const promise = firstValueFrom(delete$);

    const request = httpMock.expectOne(`http://localhost:3002/bp/products/${productId}`);
    expect(request.request.method).toBe('DELETE');

    request.flush({ name: 'NotFoundError', message: 'Not product found' }, { status: 404, statusText: 'Not Found' });

    await expect(promise).rejects.toThrow();
  });

  it('should throw error when POST /bp/products fails', async () => {
    const newProduct = {
      id: '', name: '', description: '', logo: '', date_release: '', date_revision: ''
    };

    const create$ = service.createProduct(newProduct);
    const promise = firstValueFrom(create$); // Sin .catch(e => e)

    const request = httpMock.expectOne('http://localhost:3002/bp/products');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(newProduct);

    request.flush({ message: 'BadRequest', data: null }, { status: 400, statusText: 'Bad Request' });

    await expect(promise).rejects.toThrow();
  });

  it('should throw error when PUT /bp/products/:id fails', async () => {
    const productId = 'no-existe';
    const updatedProduct = {
      id: productId,
      name: 'update', description: 'test', logo: 'logo.png', date_release: '2025-01-01', date_revision: '2026-01-01'
    };

    const update$ = service.updateProduct(productId, updatedProduct);
    const promise = firstValueFrom(update$); // Sin .catch(e => e)

    const request = httpMock.expectOne(`http://localhost:3002/bp/products/${productId}`);
    expect(request.request.method).toBe('PUT');

    request.flush({ name: 'NotFoundError', message: 'Not product found' }, { status: 404, statusText: 'Not Found' });

    await expect(promise).rejects.toThrow();
  });

  it('should throw an error when verification GET /bp/products/verification/:id fails', async () => {
    const productId = 'any-id';
    const verification$ = service.verifyProductId(productId);
    const promise = firstValueFrom(verification$); // Sin .catch(e => e)

    const request = httpMock.expectOne(`http://localhost:3002/bp/products/verification/${productId}`);
    expect(request.request.method).toBe('GET');

    request.flush({ message: 'Server error' }, { status: 500, statusText: 'Server Error' });

    await expect(promise).rejects.toThrow();
  });
});
