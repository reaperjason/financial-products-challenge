# financial-products-challenge

Una aplicación web de gestión de productos financieros, desarrollada como un reto técnico. Permite a los usuarios visualizar, añadir, editar y eliminar productos a través de una interfaz intuitiva, con validaciones en tiempo real para asegurar la integridad de los datos.
**Esta aplicación es la parte del frontend y se conecta a un backend externo para la gestión de datos**

---

## Características Principales

- **Gestión Completa de Productos**: Funcionalidades CRUD (Crear, Leer, Actualizar, Eliminar) para productos financieros.
- **Validaciones Robustas**: Los formularios incluyen validaciones asíncronas para el ID del producto y validaciones síncronas para la fecha de lanzamiento.
- **Paginación y Búsqueda**: Funcionalidad de filtrado de productos por nombre o descripción y una paginación que permite visualizar los datos de forma eficiente.
- **Componentes Reutilizables**: Implementación de componentes modales, menús de opciones y un esqueleto de carga para una experiencia de usuario fluida.

---

## Tecnologías Utilizadas

El proyecto fue construido sobre el framework Angular, utilizando una arquitectura modular y las siguientes herramientas y librerías clave:

- **Node.js**: `18.20.0`
- **npm**: `v10.5.0`
- **Angular**: `v16.2.12`
  - **Angular CLI**: `v16.1.8`
- **RxJS**: Gestión de flujos de datos asíncronos para peticiones HTTP y manejo de estados.
- **Jest**: Framework de pruebas unitarias para un desarrollo guiado por pruebas (TDD).
- **SCSS**: Preprocesador de CSS para escribir hojas de estilo de manera más eficiente y estructurada.
- **Estilo CSS Nativo**: La interfaz se diseñó utilizando **CSS y SCSS puros**, sin la dependencia de frameworks externos como Bootstrap, Tailwind CSS o Material UI.

---

## Estructura del Proyecto

El proyecto sigue una arquitectura clara y modular para separar las responsabilidades y facilitar la escalabilidad.

- `core/`: Contiene servicios principales, interceptores y validadores compartidos en toda la aplicación.
- `products/`: Módulo principal que engloba toda la lógica y los componentes relacionados con la gestión de productos, como los formularios y la lista.
- `shared/`: Módulo para componentes reutilizables (como modales, encabezados y menús de opciones) que pueden ser usados en cualquier parte de la aplicación.

---

## Instalación y Ejecución

Sigue estos pasos para levantar el proyecto en tu entorno local:

1.  Clona el repositorio:
    ```bash
    git clone [URL_DEL_REPOSITORIO]
    ```
2.  Navega a la carpeta del proyecto:
    ```bash
    cd financial-products-challenge
    ```
3.  Instala las dependencias:
    ```bash
    npm install
    ```
4.  Ejecuta la aplicación:
    ```bash
    npm start o ng serve
    ```
    La aplicación se ejecutará en `http://localhost:4200`.

---

## Ejecución de Pruebas

Para garantizar la calidad del código, el proyecto cuenta con un conjunto robusto de pruebas unitarias.

1.  Para ejecutar las pruebas:
    ```bash
    npm test
    ```
2.  Para ejecutar las pruebas y generar un informe de cobertura:
    ```bash
    npm run test:coverage
    ```
    Una vez finalizada la ejecución, el informe se abrirá automáticamente en tu navegador.

---

## Autor

**Carlos Chicaiza**
