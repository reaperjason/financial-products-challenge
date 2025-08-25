import { ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from 'src/app/core/services/product.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { dateReleaseValidator, dateRevisionValidator } from 'src/app/core/validators/date.validators';
import { delay, map, switchMap, debounceTime, distinctUntilChanged, startWith, take, filter } from 'rxjs/operators';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let mockProductService: jest.Mocked<ProductService>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: any;

  const mockProduct = {
    id: 'trj-crdt',
    name: 'Tarjeta de Crédito',
    description: 'Tarjeta de crédito Visa para compras',
    logo: 'https://www.visa.com/logo.png',
    date_release: '2023-01-01T00:00:00.000Z',
    date_revision: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    mockProductService = {
      getProducts: jest.fn().mockReturnValue(of([mockProduct])),
      createProduct: jest.fn().mockReturnValue(of({ message: 'Success', data: mockProduct })),
      updateProduct: jest.fn().mockReturnValue(of({ message: 'Success', data: mockProduct })),
      verifyProductId: jest.fn(), // No mockReturnValue aquí, se hará en cada test async
    } as any;

    mockRouter = {
      navigate: jest.fn(),
    } as any;

    mockActivatedRoute = {
      snapshot: {
        url: [{ path: 'new' }], // Por defecto, modo nuevo
        paramMap: {
          get: jest.fn().mockReturnValue(null),
        },
      },
    };

    await TestBed.configureTestingModule({
      declarations: [ProductFormComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
      ],
      providers: [
        FormBuilder,
        { provide: ProductService, useValue: mockProductService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
  });

  describe('Initialization Tests', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize the form in "new" mode correctly', () => {
      component.ngOnInit();
      expect(component.isEditMode).toBeFalsy();
      expect(component.productForm).toBeDefined();
      expect(component.productForm.get('id')?.enabled).toBe(true);
      expect(component.productForm.get('id')?.asyncValidator).toBeDefined();
      expect(component.productForm.get('date_revision')?.disabled).toBe(true);
    });

    it('should initialize the form in "edit" mode and populate data', fakeAsync(() => {
      mockActivatedRoute.snapshot.url = [{ path: 'edit' }];
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(mockProduct.id);

      component.ngOnInit();
      fixture.detectChanges();
      flushMicrotasks(); // Asegura que cualquier microtarea de ngOnInit sea procesada

      tick(Infinity); // Avanza todos los temporizadores para observables como getProducts
      fixture.detectChanges();
      flushMicrotasks();

      expect(component.isEditMode).toBeTruthy();
      expect(component.productId).toBe(mockProduct.id);
      expect(component.productForm.get('id')?.disabled).toBe(true);
      expect(component.productForm.get('id')?.value).toBe(mockProduct.id);
      expect(component.productForm.get('name')?.value).toBe(mockProduct.name);
      expect(component.productForm.get('date_release')?.value).toBe('2023-01-01');
      expect(component.productForm.get('date_revision')?.value).toBe('2024-01-01');
    }));

    it('should navigate to /products if productId is null in edit mode', () => {
      mockActivatedRoute.snapshot.url = [{ path: 'edit' }];
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(null);

      component.ngOnInit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });

    it('should navigate to /products if product to edit is not found', fakeAsync(() => {
      mockActivatedRoute.snapshot.url = [{ path: 'edit' }];
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('non-existent-id');
      mockProductService.getProducts.mockReturnValue(of([]));

      component.ngOnInit();
      fixture.detectChanges();
      flushMicrotasks();
      tick(Infinity);
      fixture.detectChanges();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    }));
  });

  describe('Synchronous Validations', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should validate ID as required', () => {
      component.productForm.get('id')?.setValue('');
      component.productForm.get('id')?.markAsTouched();
      expect(component.productForm.get('id')?.hasError('required')).toBeTruthy();
      expect(component.isInvalid('id')).toBeTruthy();
      expect(component.getErrorMessage('id')).toBe('ID no válido!');
    });

    it('should validate ID minlength (3 characters)', () => {
      component.productForm.get('id')?.setValue('ab');
      component.productForm.get('id')?.markAsTouched();
      expect(component.productForm.get('id')?.hasError('minlength')).toBeTruthy();
      expect(component.getErrorMessage('id')).toBe('ID debe tener al menos 3 caracteres.');
    });

    it('should validate ID maxlength (10 characters)', () => {
      component.productForm.get('id')?.setValue('abcdefghijkl');
      component.productForm.get('id')?.markAsTouched();
      expect(component.productForm.get('id')?.hasError('maxlength')).toBeTruthy();
      expect(component.getErrorMessage('id')).toBe('ID debe tener máximo 10 caracteres.');
    });

    it('should validate name as required', () => {
      component.productForm.get('name')?.setValue('');
      component.productForm.get('name')?.markAsTouched();
      expect(component.productForm.get('name')?.hasError('required')).toBeTruthy();
      expect(component.getErrorMessage('name')).toBe('Este campo es requerido.');
    });

    it('should validate name minlength (5 characters)', () => {
      component.productForm.get('name')?.setValue('abcd');
      component.productForm.get('name')?.markAsTouched();
      expect(component.productForm.get('name')?.hasError('minlength')).toBeTruthy();
      expect(component.getErrorMessage('name')).toBe('Debe tener al menos 5 caracteres.');
    });

    it('should validate name maxlength (100 characters)', () => {
      const longName = 'a'.repeat(101);
      component.productForm.get('name')?.setValue(longName);
      component.productForm.get('name')?.markAsTouched();
      expect(component.productForm.get('name')?.hasError('maxlength')).toBeTruthy();
      expect(component.getErrorMessage('name')).toBe('Debe tener máximo 100 caracteres.');
    });

    it('should validate description as required', () => {
      component.productForm.get('description')?.setValue('');
      component.productForm.get('description')?.markAsTouched();
      expect(component.productForm.get('description')?.hasError('required')).toBeTruthy();
      expect(component.getErrorMessage('description')).toBe('Este campo es requerido.');
    });

    it('should validate description minlength (10 characters)', () => {
      component.productForm.get('description')?.setValue('abcde');
      component.productForm.get('description')?.markAsTouched();
      expect(component.productForm.get('description')?.hasError('minlength')).toBeTruthy();
      expect(component.getErrorMessage('description')).toBe('Debe tener al menos 10 caracteres.');
    });

    it('should validate description maxlength (200 characters)', () => {
      const longDesc = 'a'.repeat(201);
      component.productForm.get('description')?.setValue(longDesc);
      component.productForm.get('description')?.markAsTouched();
      expect(component.productForm.get('description')?.hasError('maxlength')).toBeTruthy();
      expect(component.getErrorMessage('description')).toBe('Debe tener máximo 200 caracteres.');
    });

    it('should validate logo as required', () => {
      component.productForm.get('logo')?.setValue('');
      component.productForm.get('logo')?.markAsTouched();
      expect(component.productForm.get('logo')?.hasError('required')).toBeTruthy();
      expect(component.getErrorMessage('logo')).toBe('Este campo es requerido.');
    });

    it('should validate logo pattern for invalid URL', () => {
      component.productForm.get('logo')?.setValue('invalid-url');
      component.productForm.get('logo')?.markAsTouched();
      expect(component.productForm.get('logo')?.hasError('pattern')).toBeTruthy();
      expect(component.getErrorMessage('logo')).toBe('Debe ser una URL de imagen válida.');
    });

    it('should validate logo pattern for valid URL', () => {
      component.productForm.get('logo')?.setValue('https://valid.com/image.png');
      component.productForm.get('logo')?.markAsTouched();
      expect(component.productForm.get('logo')?.hasError('pattern')).toBeFalsy();
    });

    it('should validate date_release as required', () => {
      component.productForm.get('date_release')?.setValue('');
      component.productForm.get('date_release')?.markAsTouched();
      expect(component.productForm.get('date_release')?.hasError('required')).toBeTruthy();
      expect(component.getErrorMessage('date_release')).toBe('Este campo es requerido.');
    });

    it('should validate date_release with custom dateReleaseValidator (past date)', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      component.productForm.get('date_release')?.setValue(pastDate.toISOString().substring(0, 10));
      component.productForm.get('date_release')?.markAsTouched();
      expect(component.productForm.get('date_release')?.hasError('dateRelease')).toBeTruthy();
      expect(component.getErrorMessage('date_release')).toBe('La fecha debe ser hoy o posterior.');
    });

    it('should pass date_release with custom dateReleaseValidator (future date)', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      component.productForm.get('date_release')?.setValue(futureDate.toISOString().substring(0, 10));
      component.productForm.get('date_release')?.markAsTouched();
      expect(component.productForm.get('date_release')?.hasError('dateRelease')).toBeFalsy();
    });

    it('should validate date_revision as required', () => {
      component.productForm.get('date_revision')?.enable();
      component.productForm.get('date_revision')?.setValue('');
      component.productForm.get('date_revision')?.markAsTouched();
      expect(component.productForm.get('date_revision')?.hasError('required')).toBeTruthy();
      expect(component.getErrorMessage('date_revision')).toBe('Este campo es requerido.');
    });

    it('should validate date_revision with custom dateRevisionValidator (incorrect date)', () => {
      const releaseDate = '2025-01-01';
      component.productForm.get('date_release')?.setValue(releaseDate);

      component.productForm.get('date_revision')?.enable();
      component.productForm.get('date_revision')?.setValue('2026-01-02');
      component.productForm.get('date_revision')?.markAsTouched();

      expect(component.productForm.get('date_revision')?.hasError('dateRevision')).toBeTruthy();
      expect(component.getErrorMessage('date_revision')).toBe('Debe ser exactamente un año posterior a la liberación.');
    });

    it('should pass date_revision with custom dateRevisionValidator (correct date)', () => {
      const releaseDate = '2025-01-01';
      component.productForm.get('date_release')?.setValue(releaseDate);

      component.productForm.get('date_revision')?.enable();
      component.productForm.get('date_revision')?.setValue('2026-01-01');
      component.productForm.get('date_revision')?.markAsTouched();

      expect(component.productForm.get('date_revision')?.hasError('dateRevision')).toBeFalsy();
    });

    it('should return true for isInvalid when control is invalid and touched/dirty', () => {
      const idControl = component.productForm.get('id');
      idControl?.setValue('a');
      idControl?.markAsTouched();
      fixture.detectChanges();
      expect(component.isInvalid('id')).toBeTruthy();

      idControl?.markAsDirty();
      fixture.detectChanges();
      expect(component.isInvalid('id')).toBeTruthy();
    });

    it('should return null for getErrorMessage if control is valid', () => {
      component.productForm.get('id')?.setValue('validID');
      component.productForm.get('id')?.markAsTouched();
      expect(component.getErrorMessage('id')).toBeNull();
    });
  });

  describe('Asynchronous Validations (idValidator)', () => {
    beforeEach(fakeAsync(() => {
      mockProductService.verifyProductId.mockClear();
      mockActivatedRoute.snapshot.url = [{ path: 'new' }];
      component.ngOnInit();
      fixture.detectChanges();
      flushMicrotasks(); // Procesa cualquier microtarea de ngOnInit, específicamente de startWith
      tick(Infinity); // Asegura que todas las tareas asíncronas iniciales se limpien de ngOnInit
      fixture.detectChanges();
      flushMicrotasks(); // Limpieza final para beforeEach
    }));

    it('should not call async validator in edit mode', fakeAsync(() => {
      mockActivatedRoute.snapshot.url = [{ path: 'edit' }];
      component.ngOnInit(); // Re-inicializa en modo edición
      fixture.detectChanges();
      flushMicrotasks(); // Limpia microtareas de ngOnInit en modo edición

      const idControl = component.productForm.get('id');
      idControl?.setValue('test-id');
      fixture.detectChanges();
      flushMicrotasks(); // Procesa la emisión de valueChanges (si no está deshabilitado)

      tick(500); // Avanza el debounceTime
      fixture.detectChanges(); // Dispara la validación asíncrona (debería omitirse porque isEditMode es true)
      flushMicrotasks();

      expect(mockProductService.verifyProductId).not.toHaveBeenCalled();
      tick(Infinity); // Asegura que no queden temporizadores
      flushMicrotasks();
    }));

    it('should return null if ID is unique', fakeAsync(() => {
      mockProductService.verifyProductId.mockImplementation((id: string) => {
        return of(false).pipe(delay(10));
      });
      const idControl = component.productForm.get('id');
      idControl?.setValue('unique-id');
      fixture.detectChanges(); // Activa valueChanges, inicia debounceTime
      flushMicrotasks(); // Procesa la emisión inicial de valueChanges

      tick(500); // Avanza el tiempo para que debounceTime se complete
      fixture.detectChanges(); // Procesa la emisión de debounceTime, llama al servicio, establece pending
      flushMicrotasks(); // Procesa cualquier microtarea de la iniciación de la llamada al servicio

      expect(mockProductService.verifyProductId).toHaveBeenCalledWith('unique-id');
      expect(idControl?.pending).toBeTruthy(); // Debería estar pending después de que se inicia la llamada al servicio

      tick(10); // Avanza el tiempo para el delay del mock del servicio
      fixture.detectChanges(); // Procesa la respuesta del servicio, resuelve pending
      flushMicrotasks(); // Limpia cualquier microtarea restante

      expect(idControl?.hasError('idExists')).toBeFalsy();
      expect(idControl?.valid).toBeTruthy();
      expect(component.getErrorMessage('id')).toBeNull();
      tick(Infinity); // Asegura que no queden temporizadores
      flushMicrotasks();
    }));

    it('should return null for empty ID in async validator', fakeAsync(() => {
      const idControl = component.productForm.get('id');
      idControl?.setValue('');
      fixture.detectChanges();
      flushMicrotasks(); // Procesa la emisión inicial de valueChanges

      tick(500); // Avanza debounceTime (no debería disparar el servicio si está vacío debido al filtro en idValidator)
      fixture.detectChanges();
      flushMicrotasks();

      expect(mockProductService.verifyProductId).not.toHaveBeenCalled();
      expect(idControl?.hasError('idExists')).toBeFalsy();
      expect(idControl?.hasError('required')).toBeTruthy();
      tick(Infinity); // Asegura que no queden temporizadores
      flushMicrotasks();
    }));
  });

  describe('Form Interactivity / Logic Tests', () => {
    it('should update date_revision automatically when date_release changes', fakeAsync(() => {
      component.ngOnInit();
      fixture.detectChanges();
      flushMicrotasks();

      const releaseControl = component.productForm.get('date_release');
      const revisionControl = component.productForm.get('date_revision');

      releaseControl?.setValue('2025-08-25');
      fixture.detectChanges(); // Para la propagación de valueChanges
      flushMicrotasks();
      tick(); // Avanza cualquier microtarea (como cálculos de fecha)

      const expectedRevisionDate = new Date('2026-08-25T00:00:00.000Z').toISOString().substring(0, 10);
      expect(revisionControl?.value).toBe(expectedRevisionDate);
      tick(Infinity); // Asegura que no queden temporizadores
      flushMicrotasks();
    }));

    it('should reset the form on onReset() call', () => {
      component.ngOnInit();
      component.productForm.get('name')?.setValue('Some Name');
      expect(component.productForm.get('name')?.value).toBe('Some Name');

      component.onReset();
      expect(component.productForm.get('name')?.value).toBeNull();
    });

    it('should format a date correctly', () => {
      const dateString = '2023-03-05T12:00:00.000Z';
      const formatted = component.formatDate(dateString);
      expect(formatted).toBe('2023-03-05');
    });
  });

  describe('Form Submission Tests (onSubmit)', () => {
    const validProduct = {
      id: 'valid-id',
      name: 'Valid Name 12345',
      description: 'Valid Description with enough characters',
      logo: 'https://valid.com/image.png',
      date_release: '2025-01-01',
      date_revision: '2026-01-01',
    };

    beforeEach(fakeAsync(() => {
      mockActivatedRoute.snapshot.url = [{ path: 'new' }];
      component.ngOnInit();
      fixture.detectChanges();
      flushMicrotasks(); // Limpia microtareas iniciales

      // Asegura que el mock para verifyProductId está configurado y su delay se limpia
      mockProductService.verifyProductId.mockImplementation((id: string) => of(false).pipe(delay(10)));

      component.productForm.patchValue(validProduct);
      component.productForm.get('id')?.markAsDirty();
      component.productForm.get('id')?.markAsTouched();
      fixture.detectChanges();
      flushMicrotasks(); // Asegura que todos los cambios de valor son procesados

      tick(500); // Para el debounceTime del validador asíncrono
      fixture.detectChanges(); // Dispara la llamada al servicio para el validador asíncrono
      flushMicrotasks();

      tick(10); // Limpia el delay del mock de verifyProductId
      fixture.detectChanges(); // Actualiza la validez del formulario después de la llamada al servicio
      flushMicrotasks();

      // Asegura un estado completamente limpio antes de cada prueba en este bloque describe
      component.productForm.get('id')?.setErrors(null);
      component.productForm.get('date_release')?.setErrors(null);
      component.productForm.get('date_revision')?.setErrors(null);
      component.productForm.updateValueAndValidity();

      tick(Infinity); // Avanza todos los temporizadores restantes para asegurar un estado limpio
      flushMicrotasks(); // Procesa cualquier microtarea final
      fixture.detectChanges(); // Detección de cambios final
    }));

    it('should not submit if form is invalid', () => {
      component.productForm.get('name')?.setValue('');
      component.productForm.updateValueAndValidity();
      fixture.detectChanges();

      expect(component.productForm.valid).toBeFalsy();
      component.onSubmit();
      expect(mockProductService.createProduct).not.toHaveBeenCalled();
      expect(mockProductService.updateProduct).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should call productService.updateProduct and navigate on valid form submission (edit mode)', fakeAsync(() => {
      // 1. Configuración específica para este test en modo edición
      component.isEditMode = true;
      component.productId = 'existing-id';
      mockActivatedRoute.snapshot.url = [{ path: 'edit' }];
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('existing-id');

      // 2. Mockear getProducts para que devuelva el producto que estamos "editando"
      const productToEditForTest = {
        ...mockProduct,
        id: 'existing-id',
        name: 'Updated Name',
        description: 'Updated Description.',
        logo: 'https://updated.com/logo.png',
        date_release: '2024-01-01T00:00:00.000Z',
        date_revision: '2025-01-01T00:00:00.000Z',
      };
      mockProductService.getProducts.mockReturnValue(of([productToEditForTest]));

      // 3. Inicializar el componente AHORA para que tome la configuración de edición y el mock
      component.ngOnInit();
      fixture.detectChanges();
      flushMicrotasks();

      // 4. Asegurar que los observables se completen y el formulario se parchee
      tick(Infinity); // Usa Infinity para limpiar todas las tareas asíncronas pendientes de ngOnInit/getProducts
      flushMicrotasks();
      fixture.detectChanges();

      const idControl = component.productForm.get('id');
      expect(idControl?.disabled).toBe(true);
      expect(idControl?.value).toBe('existing-id');
      expect(idControl?.asyncValidator).toBeNull(); // En modo edición, el validador asíncrono debería ser nulo

      // 5. Rellenar el resto del formulario (o verificar que ya está parcheado)
      expect(component.productForm.get('name')?.value).toBe('Updated Name');
      expect(component.productForm.get('description')?.value).toBe('Updated Description.');
      expect(component.productForm.get('logo')?.value).toBe('https://updated.com/logo.png');
      expect(component.productForm.get('date_release')?.value).toBe('2024-01-01');
      expect(component.productForm.get('date_revision')?.value).toBe('2025-01-01');

      // Asegurarse de que el formulario es válido después de todo
      component.productForm.updateValueAndValidity();
      tick(Infinity); // Tick final para asegurar que todas las actualizaciones de validez sean procesadas y los temporizadores limpiados
      flushMicrotasks();
      fixture.detectChanges();

      expect(component.productForm.valid).toBeTruthy();

      // 6. Llamar a onSubmit y verificar el comportamiento esperado
      component.onSubmit();
      tick(Infinity); // Asegura que el observable de onSubmit se complete
      flushMicrotasks();
      expect(mockProductService.updateProduct).toHaveBeenCalledWith(
        'existing-id',
        expect.objectContaining({
          id: 'existing-id',
          name: 'Updated Name',
          description: 'Updated Description.',
          logo: 'https://updated.com/logo.png',
          date_release: new Date('2024-01-01').toISOString(),
          date_revision: new Date('2025-01-01T00:00:00.000Z').toISOString(),
        })
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    }));

    it('should log error if createProduct fails', fakeAsync(() => {
      const consoleErrorSpy = jest.spyOn(console, 'error');
      mockProductService.createProduct.mockReturnValue(throwError(() => new Error('Creation failed')));

      expect(component.productForm.valid).toBeTruthy();
      component.onSubmit();
      tick(Infinity); // Limpia cualquier temporizador pendiente del observable de error
      flushMicrotasks();

      expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Creation failed'));
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    }));

    it('should log error if updateProduct fails', fakeAsync(() => {
      const consoleErrorSpy = jest.spyOn(console, 'error');
      mockProductService.updateProduct.mockReturnValue(throwError(() => new Error('Update failed')));
      component.isEditMode = true;
      component.productId = 'valid-id';
      component.productForm.get('id')?.disable();

      expect(component.productForm.valid).toBeTruthy();
      component.onSubmit();
      tick(Infinity); // Limpia cualquier temporizador pendiente del observable de error
      flushMicrotasks();

      expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Update failed'));
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    }));
  });

});
