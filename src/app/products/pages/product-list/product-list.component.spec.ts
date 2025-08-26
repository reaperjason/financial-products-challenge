import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ProductListComponent } from './product-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfirmationModalComponent } from 'src/app/shared/components/confirmation-modal/confirmation-modal.component';
import { FormsModule } from '@angular/forms';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductService } from 'src/app/core/services/product.service';
import { Router } from '@angular/router';
import { ModalService } from 'src/app/core/services/modal.service';
import { Product } from '../../models/product.model';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({ selector: 'app-options-menu', template: '' })
class MockOptionsMenuComponent {
  @Input() options: any;
  @Output() optionSelected = new EventEmitter<string>();
}

@Component({ selector: 'app-confirmation-modal', template: '' })
class MockConfirmationModalComponent {
  @Output() confirmed = new EventEmitter<string>();
}

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productService: Partial<ProductService>;
  let router: Partial<Router>;
  let modalService: Partial<ModalService>;

  const mockProducts: Product[] = [
    {
      id: 'uno',
      name: 'visa silver',
      description: 'cuenta carlos',
      logo: 'logo1.png',
      date_release: '2025-08-24T00:00:00.000Z',
      date_revision: '2026-08-24T00:00:00.000Z'
    },
    {
      id: 'dos',
      name: 'mastercard gold',
      description: 'cuenta alexis',
      logo: 'logo2.png',
      date_release: '2025-08-30T00:00:00.000Z',
      date_revision: '2026-08-30T00:00:00.000Z'
    },
    {
      id: 'tres',
      name: 'tarjeta de debito',
      description: 'cuenta de ahorros',
      logo: 'logo3.png',
      date_release: '2025-09-01T00:00:00.000Z',
      date_revision: '2026-09-01T00:00:00.000Z'
    },
  ];


  beforeEach(async () => {
    productService = {
      getProducts: jest.fn(() => of(mockProducts)),
      deleteProduct: jest.fn(() => of(void 0)),
    };
    router = {
      navigate: jest.fn(),
    };
    modalService = {
      open: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [
        ProductListComponent,
        MockOptionsMenuComponent,
        MockConfirmationModalComponent
      ],
      imports: [FormsModule, CommonModule],
      providers: [
        { provide: ProductService, useValue: productService },
        { provide: Router, useValue: router },
        { provide: ModalService, useValue: modalService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;

    productService = TestBed.inject(ProductService);
    router = TestBed.inject(Router);
    modalService = TestBed.inject(ModalService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on ngOnInit and set isLoading to false', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(component.products.length).toBe(3);
    expect(component.isLoading).toBeFalsy();
    expect(component.displayedProducts.length).toBe(3);
  }));

  it('should handle error when fetching products', fakeAsync(() => {
    const errorResponse = 'Failed to fetch products';
    (productService.getProducts as jest.Mock).mockReturnValue(throwError(() => new Error(errorResponse)));
    const consoleErrorSpy = jest.spyOn(console, 'error');
    component.ngOnInit();
    tick();
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(component.isLoading).toBeFalsy();
  }));

  it('should filter products by a search term and display only matching products', () => {
    component.products = mockProducts;
    const searchTerm = 'a';
    component.searchTerm = searchTerm;
    component.applyFilterAndPagination();

    const allFilteredProductsContainTerm = component.filteredProducts.every(
      p => p.name.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm)
    );
    expect(allFilteredProductsContainTerm).toBeTruthy();

    const expectedCount = mockProducts.filter(
      p => p.name.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm)
    ).length;
    expect(component.filteredProducts.length).toBe(expectedCount);
  });

  it('should change page size and update displayed products', () => {
    component.products = mockProducts;
    component.pageSize = 2;
    component.applyFilterAndPagination();
    expect(component.displayedProducts.length).toBe(2);
  });

  it('should navigate to new product page', () => {
    component.goToNewProduct();
    expect(router.navigate).toHaveBeenCalledWith(['/products/new']);
  });

  it('should navigate to edit product page when option selected is "edit"', () => {
    const productToEdit = mockProducts[0];
    component.onOptionSelected('edit', productToEdit);
    expect(router.navigate).toHaveBeenCalledWith(['/products/edit', productToEdit.id]);
  });

  it('should open the delete modal when "delete" option is selected', () => {
    const productToDelete = mockProducts[0];
    component.onOptionSelected('delete', productToDelete);
    expect(modalService.open).toHaveBeenCalledWith({ name: productToDelete.name, id: productToDelete.id });
  });

  it('should delete a product and reload the list', fakeAsync(() => {
    const productIdToDelete = 'uno';
    (productService.deleteProduct as jest.Mock).mockReturnValue(of(null));
    const loadProductsSpy = jest.spyOn(component, 'loadProducts');

    component.deleteProduct(productIdToDelete);
    tick();

    expect(productService.deleteProduct).toHaveBeenCalledWith(productIdToDelete);
    expect(loadProductsSpy).toHaveBeenCalled();
  }));
});
