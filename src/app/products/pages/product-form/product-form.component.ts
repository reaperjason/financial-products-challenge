import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, first, map, Observable, of, switchMap } from 'rxjs';
import { ProductService } from 'src/app/core/services/product.service';
import { Product } from '../../models/product.model';
import { dateReleaseValidator, dateRevisionValidator } from 'src/app/core/validators/date.validators';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode = false;
  productId: string | null = null;

  // Mensajes por control y tipo de error
  private readonly errorMessages: Record<string, Record<string, string>> = {
    id: {
      required: 'ID no válido!',
      minlength: 'ID debe tener al menos 3 caracteres.',
      maxlength: 'ID debe tener máximo 10 caracteres.',
      idExists: 'ID ya existe.'
    },
    name: {
      required: 'Este campo es requerido.',
      minlength: 'Debe tener al menos 5 caracteres.',
      maxlength: 'Debe tener máximo 100 caracteres.'
    },
    description: {
      required: 'Este campo es requerido.',
      minlength: 'Debe tener al menos 10 caracteres.',
      maxlength: 'Debe tener máximo 200 caracteres.'
    },
    logo: {
      required: 'Este campo es requerido.',
      pattern: 'Debe ser una URL de imagen válida.'
    },
    date_release: {
      required: 'Este campo es requerido.',
      dateRelease: 'La fecha debe ser hoy o posterior.'
    },
    date_revision: {
      required: 'Este campo es requerido.',
      dateRevision: 'Debe ser exactamente un año posterior a la liberación.'
    }
  };

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const urlSegment = this.route.snapshot.url[0]?.path;
    this.isEditMode = urlSegment !== 'new';
    if (this.isEditMode) {
      this.productId = this.route.snapshot.paramMap.get('id');
      if (!this.productId) {
        this.router.navigate(['/products']);
        return;
      }
    }
    this.initForm();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      id: ['', {
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10)
        ],
        asyncValidators: [this.idValidator()],
        updateOn: 'blur'
      }],
      name: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200)
      ]],
      logo: ['', [
        Validators.required,
        Validators.pattern(/https?:\/\/.+\.(jpg|jpeg|png|gif|svg)$/i)
      ]],
      date_release: ['', [
        Validators.required,
        dateReleaseValidator()
      ]],
      date_revision: [{ value: '', disabled: true }, [
        Validators.required,
        dateRevisionValidator(() => this.productForm.get('date_release')?.value)
      ]]
    });

    if (this.isEditMode) {
      this.productForm.get('id')?.disable();
      this.productService.getProducts().subscribe(products => {
        const productToEdit = products.find(p => p.id === this.productId);
        if (productToEdit) {
          const formattedProduct = { ...productToEdit };

          // Formatear las fechas al formato 'yyyy-MM-dd'
          formattedProduct.date_release = this.formatDate(productToEdit.date_release);
          formattedProduct.date_revision = this.formatDate(productToEdit.date_revision);
          this.productForm.patchValue(formattedProduct);
        } else {
          this.router.navigate(['/products']);
        }
      });
    }

    this.productForm.get('date_release')?.valueChanges.subscribe(value => {
      this.updateDateRevision(value);
    });
  }


  // Validador asíncrono para el ID
  idValidator() {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      // Si está en modo edición, no valida la unicidad del ID
      if (this.isEditMode) {
        return of(null);
      }
      return of(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(id => {
          if (!id) return of(null);
          return this.productService.verifyProductId(id).pipe(
            map(exists => exists ? { idExists: true } : null),
            first()
          );
        })
      );
    };
  }

  // Actualiza la fecha de revisión automáticamente
  updateDateRevision(releaseDate: string): void {
    if (releaseDate) {
      const date = new Date(releaseDate);
      date.setFullYear(date.getFullYear() + 1);
      this.productForm.get('date_revision')?.setValue(date.toISOString().substring(0, 10));
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const formValue = this.productForm.getRawValue();

      // Normalizar las fechas al formato ISO 8601
      const product: Product = {
        ...formValue,
        date_release: new Date(formValue.date_release).toISOString(),
        date_revision: new Date(formValue.date_revision).toISOString()
      };

      if (this.isEditMode) {
        this.productService.updateProduct(this.productId!, product).subscribe({
          next: () => this.router.navigate(['/products']),
          error: (err) => console.error(err)
        });
      } else {
        this.productService.createProduct(product).subscribe({
          next: () => this.router.navigate(['/products']),
          error: (err) => console.error(err)
        });
      }
    }
  }

  onReset(): void {
    this.productForm.reset();
  }

  isInvalid(controlName: string): boolean {
    const control = this.productForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.productForm.get(controlName);
    if (control && control.errors && (control.dirty || control.touched)) {
      const errors = control.errors;
      const messages = this.errorMessages[controlName];
      for (const key in errors) {
        if (messages[key]) {
          return messages[key];
        }
      }
    }
    return null;
  }

  formatDate(date: string): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }

    return [year, month, day].join('-');
  }

  get id() {
    return this.productForm.get('id') as AbstractControl;
  }
  get name() {
    return this.productForm.get('name') as AbstractControl;
  }
}
