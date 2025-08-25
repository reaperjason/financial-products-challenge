import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product.model';
import { ProductService } from 'src/app/core/services/product.service';
import { Router } from '@angular/router';
import { ModalService } from 'src/app/core/services/modal.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  displayedProducts: Product[] = [];
  searchTerm: string = '';
  pageSize: number = 5;

  //control skeleton de tabla
  isLoading = true;

  constructor(
    private productService: ProductService,
    private router: Router,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.applyFilterAndPagination();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  applyFilterAndPagination(): void {
    // Filtro por nombre y descripcion
    this.filteredProducts = this.products.filter(p =>
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    // Paginar según pageSize
    this.displayedProducts = this.filteredProducts.slice(0, this.pageSize);
  }

  goToNewProduct(): void {
    this.router.navigate(['/products/new']);
  }

  editProduct(product: Product): void {
    this.router.navigate(['/products/edit', product.id]);
  }

  deleteProduct(productId: string): void {
    this.productService.deleteProduct(productId).subscribe({
      next: () => this.loadProducts(),
      error: (err) => console.error(err)
    });
  }

  openDeleteModal(product: Product): void {
    console.log('open deleyte modal');
    this.modalService.open({ name: product.name, id: product.id });
  }

  //Menu dropdown
  options = [
    { label: 'Editar', value: 'edit' },
    { label: 'Eliminar', value: 'delete' }
  ];

  onOptionSelected(option: any, product: Product) {
    if (option === 'edit') {
      this.editProduct(product);
    } else if (option === 'delete') {
      this.openDeleteModal(product);
    }
  }
}
