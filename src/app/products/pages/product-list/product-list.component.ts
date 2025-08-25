import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product.model';
import { ProductService } from 'src/app/core/services/product.service';
import { Router } from '@angular/router';

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

  constructor(private productService: ProductService, private router: Router) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.applyFilterAndPagination();
      },
      error: (err) => console.error(err)
    });
  }

  applyFilterAndPagination(): void {
    // Filtro por nombre
    this.filteredProducts = this.products.filter(p =>
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    // Paginar según pageSize (por simplicidad se muestra solo la primera página)
    this.displayedProducts = this.filteredProducts.slice(0, this.pageSize);
  }

  goToNewProduct(): void {
    this.router.navigate(['/products/new']);
  }

  editProduct(product: Product): void {
    this.router.navigate(['/products/edit', product.id]);
  }

  deleteProduct(product: Product): void {
    if (confirm(`¿Eliminar el producto "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => this.loadProducts(),
        error: (err) => console.error(err)
      });
    }
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
      this.deleteProduct(product);
    }
  }
}
