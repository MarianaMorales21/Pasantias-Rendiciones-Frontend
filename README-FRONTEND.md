# Manual Técnico de la Interfaz de Usuario (Frontend): Sistema de Rendición de Cuentas

Este documento proporciona una guía técnica profunda sobre la arquitectura, estructura de carpetas, flujo de navegación, consumo de servicios (API), componentes críticos reutilizables y algoritmos de validación financiera implementados en la interfaz de usuario del **Sistema de Rendición de Cuentas**.

---

## 1. Descripción General

La interfaz de usuario del sistema de rendiciones está construida como una **SPA (Single Page Application)** moderna, reactiva y de alto rendimiento. El núcleo tecnológico está compuesto por:

*   **Vite**: Herramienta de compilación rápida y servidor de desarrollo optimizado.
*   **React 19**: Biblioteca base para la construcción de interfaces de usuario mediante componentes declarativos.
*   **TypeScript**: Superconjunto tipado estático que añade robustez y previene errores en tiempo de desarrollo.
*   **Tailwind CSS v4**: Motor de estilos basado en utilidades y variables nativas CSS, proporcionando una interfaz limpia y adaptativa con soporte nativo de modo oscuro (Dark Mode).

La aplicación está diseñada para gestionar flujos administrativos complejos, estructurando la captura de datos gubernamentales, el control del presupuesto en tiempo real y la exportación oficializada de informes financieros en formato PDF bajo lineamientos institucionales de **FUNDES - Táchira**.

---

## 2. Estructura del Proyecto

La disposición del código fuente en la carpeta `/src` está basada en principios de separación de responsabilidades y modularidad:

```text
Pasantias-Frontend/
├── index.html                   # Plantilla HTML principal
├── package.json                 # Gestión de dependencias y scripts NPM
├── tailwind.config.js           # Configuración del motor Tailwind CSS v4
├── tsconfig.json                # Configuración global de TypeScript
├── src/
│   ├── main.tsx                 # Punto de entrada de inicialización de la aplicación React
│   ├── App.tsx                  # Enrutamiento principal y envoltura de proveedores de contexto
│   ├── index.css                # Estilos globales y declaración de variables Tailwind v4
│   ├── api/                     # Configuración de variables de entorno y endpoints del backend
│   │   └── apiConfig.ts
│   ├── types/                   # Definición de interfaces TypeScript para todo el modelo de datos
│   │   ├── surrender.ts
│   │   ├── debitNote.ts
│   │   ├── surrenderDetails.ts
│   │   ├── orders.ts
│   │   ├── beneficiary.ts
│   │   ├── programs.ts
│   │   └── user.ts
│   ├── context/                 # Contextos de React para la gestión del estado global
│   │   ├── AuthContext.tsx      # Control de sesión, autenticación y roles de usuario
│   │   ├── SidebarContext.tsx   # Estado visual del menú lateral colapsable
│   │   └── ThemeContext.tsx     # Estado global para modo claro / oscuro (Dark Mode)
│   ├── helpers/                 # Utilidades genéricas y conversiones
│   │   ├── helpHttp.ts          # Envoltura (Wrapper) de Fetch API asíncrona
│   │   └── numberToLetters.ts   # Conversor de montos numéricos a texto contable (Bolívares)
│   ├── hooks/                   # Hooks personalizados para encapsular lógica de negocio y CRUDs
│   │   ├── useSurrender.ts      # Orquestador del flujo OPG -> RND -> NDB -> DRN
│   │   ├── useOrders.ts         # Hook de control para órdenes de pago
│   │   ├── useReports.ts        # Hook para cargar reportes detallados y consolidados
│   │   └── ...
│   ├── layout/                  # Plantillas de estructura visual común
│   │   └── AppLayout.tsx        # Layout del dashboard con barra lateral y cabecera reactiva
│   ├── components/              # Componentes de UI modulares y reutilizables
│   │   ├── auth/                # Guardias de rutas y componentes de autenticación
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── PublicRoute.tsx
│   │   ├── common/              # Componentes visuales genéricos
│   │   │   ├── ScrollToTop.tsx
│   │   │   ├── ComponentCard.tsx
│   │   │   └── PageBreadCrumb.tsx
│   │   ├── form/                # Elementos de entrada de datos avanzados
│   │   │   ├── InputField.tsx
│   │   │   ├── SearchableSelect.tsx # Select con buscador y paginación interna
│   │   │   └── MultiSelect.tsx
│   │   ├── ui/                  # Componentes primitivos de diseño atómico
│   │   │   ├── button/
│   │   │   ├── modal/           # Ventanas modales unificadas con portal React
│   │   │   └── badge/
│   │   └── tables/              # Envolturas de tablas dinámicas con templates
│   │       └── BasicTables/
│   │           └── BasicTableOne.tsx
│   ├── pages/                   # Vistas principales de la aplicación asociadas a rutas
│   │   ├── Dashboard/           # Métrica inicial y resumen ejecutivo
│   │   ├── AuthPages/           # Inicio de sesión, registro y recuperación de clave
│   │   ├── Surrender.tsx        # Pantalla central de rendición y auditoría de gastos
│   │   ├── Order.tsx            # Pantalla de gestión de órdenes de pago
│   │   ├── Reports.tsx          # Panel de previsualización y exportación de reportes PDF
│   │   └── ...
│   └── utils/                   # Lógica matemática, validaciones y exportaciones
│       ├── validationsDebitNote.tsx # Algoritmos de validación de montos
│       └── pdfGenerators.ts     # Motores de generación PDF (jsPDF + AutoTable)
```

---

## 3. Consumo de Servicios (API) y Comunicación Asíncrona

El frontend no utiliza librerías externas pesadas como Axios para el consumo de red, sino que confía en una envoltura robusta construida sobre la **Fetch API nativa del navegador**, localizada en [helpHttp.ts](file:///c:/Users/Mariana%20Morales/Desktop/9no%20Pasantias/Programacion/Pasantias-Frontend/src/helpers/helpHttp.ts).

### Arquitectura de `helpHttp`

La función `helpHttp` expone una interfaz limpia con los verbos HTTP estándar (`get`, `post`, `put`, `del`). Características fundamentales de esta implementación:

1.  **Seguridad por Cookies Seguras (`credentials: 'include'`)**:
    El backend utiliza tokens JWT almacenados en cookies HTTPOnly para mitigar vulnerabilidades XSS. `helpHttp` fuerza explícitamente a que cada solicitud envíe y acepte cookies configurando `credentials: 'include'`.
2.  **Mecanismo de Aborto de Petición (Timeout)**:
    Utiliza la API `AbortController` para cancelar solicitudes colgadas que superen un tiempo límite (por defecto `5000ms`, parametrizable hasta `30000ms` en peticiones pesadas de reportes o correos). Si se dispara el timeout, se lanza una excepción controlada devolviendo un error `408 Request timed out`.
3.  **Manejo de Errores Unificado (`handleErrors`)**:
    Analiza el estado HTTP de la respuesta (`response.ok`). Si no es exitoso (4xx/5xx), parsea el cuerpo de error en formato JSON y propaga un objeto estructurado que satisface la interfaz `ApiError`:
    ```typescript
    export interface ApiError {
      err: boolean;
      status: string | number;
      statusText: string;
      message?: string;
    }
    ```
4.  **Guardia de Tipo para TypeScript (`isApiError`)**:
    Permite validar de forma estática en los controladores y hooks si la respuesta retornada por el servicio representa un modelo de datos exitoso o un fallo de la API:
    ```typescript
    export const isApiError = (res: unknown): res is ApiError => {
      return typeof res === "object" && res !== null && "err" in res;
    };
    ```

### Definición Centralizada de Endpoints

La URL base de la API se obtiene dinámicamente según el entorno del compilador en [apiConfig.ts](file:///c:/Users/Mariana%20Morales/Desktop/9no%20Pasantias/Programacion/Pasantias-Frontend/src/api/apiConfig.ts):

```typescript
export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
```

---

## 4. Flujo de Navegación, Rutas y Ciclo de Vida de la Sesión

El enrutamiento está controlado por **React Router DOM v7**. El flujo de navegación divide la interfaz en dos mundos excluyentes controlados por guardias a nivel de componente.

### A. Guardias de Enrutamiento

*   **`ProtectedRoute`**: Envuelve las vistas del Dashboard y administración.
    *   Si el usuario no está autenticado, redirige inmediatamente a `/signin`.
    *   Muestra un indicador de carga animado (*Spinner*) mientras se valida el estado del token al refrescar el navegador.
*   **`PublicRoute`**: Envuelve las páginas de autenticación (`/signin`, `/signup`, `/forgot-password`).
    *   Si el usuario ya está autenticado e intenta acceder al login, es redirigido automáticamente a la raíz `/` (Dashboard).

### B. Ciclo de Vida de la Sesión y Mitigación de Vulnerabilidades de Historial

El estado de la sesión está centralizado en [AuthContext.tsx](file:///c:/Users/Mariana%20Morales/Desktop/9no%20Pasantias/Programacion/Pasantias-Frontend/src/context/AuthContext.tsx). Una particularidad crítica implementada es el control de la caché de retroceso de página (**bfcache**):

```typescript
useEffect(() => {
  const handlePageShow = (e: PageTransitionEvent) => {
    if (e.persisted) {
      verifySession(); // Forzar verificación al pulsar el botón "Atrás" del navegador
    }
  };
  window.addEventListener('pageshow', handlePageShow);
  return () => window.removeEventListener('pageshow', handlePageShow);
}, []);
```

Esto impide que un usuario que ha cerrado sesión pueda retroceder en el historial de navegación y ver datos cacheados en pantalla, forzando la consulta del perfil en la API (`/auth/profile`) la cual fallará y destruirá el estado del usuario local, redirigiéndolo al inicio de sesión.

---

## 5. Componentes Críticos Reutilizables

Para garantizar homogeneidad visual, la aplicación utiliza componentes de UI altamente parametrizados:

### A. DataTable Dinámico (`BasicTableOne.tsx`)
En lugar de renderizar tablas de forma cableada en cada pantalla, se implementa una envoltura genérica que recibe la definición de columnas y datos, permitiendo inyectar lógica de renderizado personalizado mediante patrones de callback:

```typescript
interface Column<T> {
  header: string;
  key: string;
  render?: (item: T) => React.ReactNode; // Callback para renderizado a la medida
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
}
```

### B. SearchableSelect (`SearchableSelect.tsx`)
Un control desplegable especializado para el manejo de catálogos extensos (ej. Partidas presupuestarias o Beneficiarios).
*   Cuenta con una caja de búsqueda interna que filtra elementos localmente.
*   Implementa navegación por teclado y soporte para pantallas de alta densidad.

### C. Modal Centralizado (`Modal`)
El componente modal utiliza portales de React para renderizarse fuera del árbol DOM jerárquico inmediato, previniendo problemas con propiedades CSS `z-index` y desbordamientos (`overflow: hidden`).

---

## 6. Algoritmos de Validaciones Financieras y Lógica Contable

El núcleo de la lógica de negocio en el frontend reside en los algoritmos contables de [validationsDebitNote.tsx](file:///c:/Users/Mariana%20Morales/Desktop/9no%20Pasantias/Programacion/Pasantias-Frontend/src/utils/validationsDebitNote.tsx), los cuales operan en conjunto con el hook de estado [useSurrender.ts](file:///c:/Users/Mariana%20Morales/Desktop/9no%20Pasantias/Programacion/Pasantias-Frontend/src/hooks/useSurrender.ts) para evitar la inconsistencia presupuestaria.

### A. Jerarquía de Datos del Sistema de Rendición

```text
  ┌───────────────────────────────────┐
  │     Orden de Pago (OPG)           │
  │     Monto Total Asignado          │
  └─────────────────┬─────────────────┘
                    │
                    ▼ (1 a Muchas)
  ┌───────────────────────────────────┐
  │     Rendición (Cabecera / RND)    │
  │     Monto de Reintegro            │
  └─────────────────┬─────────────────┘
                    │
                    ▼ (1 a Muchas)
  ┌───────────────────────────────────┐
  │     Nota de Débito (Gasto / NDB)  │
  │     Subtotal, Retenciones y Neto  │
  └─────────────────┬─────────────────┘
                    │
                    ▼ (1 a Muchos)
  ┌───────────────────────────────────┐
  │     Detalle de Gasto (DRN)        │
  │     Monto imputado a Partida      │
  └───────────────────────────────────┘
```

### B. Algoritmo 1: Validación de Detalles de Gasto (`validateDetailAmount`)

Los detalles de gasto se imputan individualmente contra partidas presupuestarias específicas. El monto acumulado de los detalles no puede superar el monto de la nota de débito.

*   **Caso Especial (Retenciones)**: Si la Nota de Débito posee retenciones, los detalles deben validarse contra el **Subtotal** de la factura (`sub_ndb`), ya que el Neto (`mon_ndb`) refleja la salida del banco después de restar las retenciones aplicadas, pero el gasto real imputado a las partidas presupuestarias debe ser por el total antes de retenciones.
*   **Caso Normal**: Si no hay retenciones, la base de validación es el **Monto Neto** (`mon_ndb`).

**Código del Algoritmo**:
```typescript
export const validateDetailAmount = (
    newAmount: number,
    selectedNdb: DebitNoteItem | null,
    allDetails: SurrenderDetailsItem[],
    editingId?: number | string
) => {
    if (!selectedNdb) return { valid: false, remaining: 0, excess: false };

    // Filtrar y sumar montos de los detalles de la nota de débito, excluyendo el que se está editando
    const totalSpent = allDetails
        .filter((d) => d.cod_drn !== editingId)
        .reduce((acc, curr) => acc + Number(curr.mon_drn), 0);

    const hasRetention = selectedNdb.has_retention || Number(selectedNdb.sub_ndb) > 0;
    const baseAmount = hasRetention ? Number(selectedNdb.sub_ndb) : Number(selectedNdb.mon_ndb);
    const remaining = baseAmount - totalSpent;

    const round2 = (n: number) => Math.round(n * 100) / 100;
    
    return {
        valid: round2(newAmount) <= round2(remaining),
        remaining: Math.max(0, remaining),
        excess: round2(newAmount) > round2(remaining)
    };
};
```

### C. Algoritmo 2: Validación de Notas de Débito contra el Saldo OPG (`validateDebitNoteAmount`)

Garantiza que la suma de todos los gastos (Notas de Débito) e ingresos (Reintegros) a lo largo del tiempo no exceda el presupuesto inicial asignado en la Orden de Pago (OPG).

*   **Cronología de Rendiciones**: Las rendiciones se ordenan secuencialmente por su identificador (`cod_rnd`). Las rendiciones anteriores afectan al saldo disponible.
*   **Regla de Detalles Completos**: Para sumar un gasto al histórico de rendición, la nota de débito debe tener sus detalles de gastos completos (`total_details >= mon_ndb`).
*   **Efecto de los Reintegros**: Los reintegros (`rnt_rnd`) son devoluciones de dinero no gastado al banco. Actúan **sumando** disponibilidad al presupuesto neto disponible de la OPG.

$$\text{Presupuesto Disponible} = \text{Monto OPG} - \sum \text{Gasto Anterior} + \sum \text{Reintegro Anterior} + \text{Reintegro Actual} - \sum \text{Gasto Actual (Otras NDB)}$$

**Código del Algoritmo**:
```typescript
export const validateDebitNoteAmount = (
    newAmount: number,
    selectedOpg: OrderItem | null,
    selectedRnd: SurrenderItem | null,
    allDebitNotes: DebitNoteItem[],
    allRenditions: SurrenderItem[],
    editingId?: number | string
) => {
    const orderAmount = Number(selectedOpg?.mon_opg ?? 0);
    if (!orderAmount || !selectedRnd) return { valid: false, remaining: 0, excess: false };

    // Ordenar las rendiciones cronológicamente
    const sortedRnds = [...allRenditions].sort((a, b) => a.cod_rnd - b.cod_rnd);
    const currentIndex = sortedRnds.findIndex(r => r.cod_rnd === selectedRnd.cod_rnd);
    const sliceIndex = currentIndex !== -1 ? currentIndex : sortedRnds.length;

    // Identificar las rendiciones anteriores a la actual
    const previousRndIds = new Set(sortedRnds.slice(0, sliceIndex).map(r => r.cod_rnd));

    // Monto gastado en rendiciones anteriores (sólo notas con detalles completos)
    const previousSpent = allDebitNotes
        .filter((note) => previousRndIds.has(note.rnd_ndb) && (note.total_details ?? 0) >= Number(note.mon_ndb || 0))
        .reduce((acc, curr) => acc + Number(curr.mon_ndb || 0), 0);

    // Reintegros aplicados en rendiciones anteriores
    const previousReintegros = sortedRnds
        .slice(0, sliceIndex)
        .reduce((acc, curr) => acc + Number(curr.rnt_rnd || 0), 0);

    // Reintegro registrado en la rendición en curso
    const currentReintegro = Number(selectedRnd.rnt_rnd || 0);

    // Saldo disponible de partida antes de gastos locales
    const maxAvailable = orderAmount - previousSpent + previousReintegros + currentReintegro;

    // Monto gastado en la rendición en curso por otras Notas de Débito completas
    const currentSpent = allDebitNotes
        .filter((note) => note.rnd_ndb === selectedRnd.cod_rnd && note.cod_ndb !== editingId && (note.total_details ?? 0) >= Number(note.mon_ndb || 0))
        .reduce((acc, curr) => acc + Number(curr.mon_ndb || 0), 0);

    const remaining = maxAvailable - currentSpent;
    const round2 = (n: number) => Math.round(n * 100) / 100;

    return {
        valid: round2(newAmount) <= round2(remaining),
        remaining: Math.max(0, remaining),
        excess: round2(newAmount) > round2(remaining)
    };
};
```

---

## 7. Motores de Generación y Exportación PDF

El módulo [pdfGenerators.ts](file:///c:/Users/Mariana%20Morales/Desktop/9no%20Pasantias/Programacion/Pasantias-Frontend/src/utils/pdfGenerators.ts) implementa la lógica de dibujo directo y modelado de datos para reportes contables oficiales utilizando **jsPDF** y **jsPDF-AutoTable**.

La aplicación exporta cuatro tipos de documentos estructurados bajo regulaciones de la contraloría gubernamental del estado Táchira:

*   **Detalle de Rendición (`exportDetailedPDF`)**: Genera un informe tabular exhaustivo agrupado por programa con logotipos gubernamentales en Base64, cuadro de resumen presupuestario y firmas de las autoridades con sus decretos.
*   **Acta de Entrega (`exportActaPDF`)**: Oficio justificativo formal que notifica la rendición de fondos con el monto transcrito en letras contables (`numberToLetters.ts`).
*   **Solicitud de Constancia en Formato (`exportSolicitudFormaPDF`)**: Formulario oficial **OYM-E6.1-01F/2015** regulado con un marco grueso perimetral de $0.8\text{ mm}$ y coordenadas cartesianas estrictas.

---

## 8. Módulos de la Aplicación y sus Validaciones Internas (Vistas)

El frontend está compuesto por una serie de módulos específicos de negocio que controlan el estado de los datos en formularios y restringen acciones según privilegios.

### A. Módulo de Autenticación y Perfil
*   **Objetivo**: Validar el ingreso y recuperar credenciales.
*   **Validaciones del Formulario**:
    *   Cédula: Obligatoria, remueve caracteres no numéricos y limita la entrada.
    *   Contraseña: Campo obligatorio, debe poseer longitud mínima de 6 caracteres en el cambio de clave.
    *   Se comprueba en caliente si el usuario posee estado nominal `Suspendido` o `Inactivo` bloqueando la sesión y redirigiendo con alerta informativa.

### B. Módulo de Órdenes de Pago (OPG)
*   **Objetivo**: Administrar el origen de fondos asignado a los cuentadantes.
*   **Validaciones del Formulario**:
    *   **Nro de Orden**: Numérico entero, estrictamente obligatorio.
    *   **Monto asignado**: Numérico decimal (`step="0.01"`), obligatorio y mayor que cero.
    *   **Cuentadante y Partida Presupuestaria**: Selección obligatoria de elementos existentes y activos en el catálogo de datos.
    *   **Fecha de Emisión**: Tipo fecha, no puede ser posterior al día de hoy.
    *   **Fecha de Cobro**: Opcional, no puede ser posterior a hoy ni anterior a la fecha de emisión de la orden.
    *   **Fecha de Decreto**: Obligatoria, no puede ser posterior a la fecha de emisión.
    *   **Concepto**: Caja de texto multilinea obligatorio.
    *   **Restricción de Eliminación**: Si la OPG posee rendiciones registradas en base de datos, la acción de eliminación está bloqueada y muestra un modal de aviso.

### C. Módulo de Control de Rendiciones (RND)
*   **Objetivo**: Crear y editar carpetas de rendiciones contables correspondientes a una OPG.
*   **Validaciones del Formulario**:
    *   **Nro Rendición**: Únicamente caracteres numéricos, obligatorio y único por cada OPG.
    *   **Fecha de Rendición**: Obligatoria, no puede ser una fecha futura.
    *   **Periodo**: Campo descriptivo de texto obligatorio (ej. *MARZO 2024*).
    *   **Reintegro**: Numérico decimal opcional. Se bloquea si es la primera rendición de la OPG y se deshabilita si la rendición está `'Entregada'`.
    *   **Estado**: Desplegable limitado. Si la rendición está `'Entregada'`, se inhabilita el cambio de estado a roles no administradores.
    *   **Restricción de Eliminación**: Si la rendición posee Notas de Débito asociadas, el botón de borrado se cancela y pide limpiar el contenido del gasto primero.

### D. Módulo de Notas de Débito (NDB)
*   **Objetivo**: Declarar erogaciones particulares de una rendición en curso.
*   **Validaciones del Formulario**:
    *   **Número de Documento**: Reemplaza caracteres especiales e inyecta de fondo el prefijo obligatorio `'ND-'`.
    *   **Fecha**: Obligatoria, no puede ser una fecha futura.
    *   **Catálogos (Beneficiario, Programa, Banco)**: Selección obligatoria de registros marcados como activos en el sistema.
    *   **Referencia Bancaria**: Obligatorio, admite solo dígitos numéricos.
    *   **Mecanismo de Retenciones**: Al activar "Posee retención", se habilitan en cascada las validaciones de montos:
        *   Subtotal obligatorio y menor/igual al monto de la OPG.
        *   Cada retención individual (IVA, Timbre Fiscal, ISLR) debe ser menor o igual al subtotal y menor al monto de la OPG.
        *   El monto total neto se autocalcula y bloquea para edición: $\text{Neto} = \text{Subtotal} - \sum \text{Retenciones}$.
    *   **Monto total (Sin retenciones)**: Campo editable que valida en tiempo real con `validateDebitNoteAmount` no superar el saldo de la OPG.
    *   **Restricción de Eliminación**: Bloqueada si la Nota de Débito posee detalles de partidas (DRN) asignados.

### E. Módulo de Detalles de Gasto (DRN)
*   **Objetivo**: Imputar el dinero de una Nota de Débito a partidas presupuestarias específicas del programa social.
*   **Validaciones del Formulario**:
    *   **Partida Presupuestaria**: Búsqueda interactiva en catálogo de partidas activas.
    *   **Monto de Detalle**: Valida contra `validateDetailAmount` asegurando que no exceda el subtotal/neto disponible del documento padre.
    *   **Descripción**: Obligatorio, detalla la justificación del gasto para la contraloría.

### F. Módulo de Cuentadantes (Contadores)
*   **Objetivo**: Administrar los funcionarios públicos responsables del manejo del dinero.
*   **Validaciones del Formulario**:
    *   **Cédula**: Se concatena de forma obligatoria el prefijo `"V-"` y restringe la entrada a un máximo de 8 caracteres numéricos.
    *   **Nombre, Apellido y Dirección**: Cadenas de texto obligatorias que se limpian de espacios sobrantes al enviar.
    *   **Estado**: Desplegable protegido. Solo modificable por el rol Administrador.
    *   **Restricción de Eliminación**: Si el cuentadante posee Órdenes de Pago vinculadas a su expediente, el sistema despliega una advertencia y bloquea el borrado lógico/físico.

### G. Módulo de Beneficiarios
*   **Objetivo**: Registro de personas naturales o jurídicas proveedoras de servicios o ayudas sociales.
*   **Validaciones del Formulario**:
    *   **Tipo de RIF**: Selector obligatorio de prefijo entre `"V"`, `"G"` o `"J"`.
    *   **Identificador (RIF / Cédula)**:
        *   Si es `"V"`, limita la entrada a 8 caracteres puramente numéricos.
        *   Si es `"G"` o `"J"`, formatea en tiempo real agregando un guion antes del último dígito para cumplir la norma fiscal.
    *   **Nombre y Dirección**: Obligatorios.
    *   **Protección de Datos**: RIF y Estado inhabilitados para edición si el usuario no tiene rol de Administrador.
    *   **Restricción de Eliminación**: Bloqueado si existen Notas de Débito asociadas al beneficiario.

### H. Módulo de Programas
*   **Objetivo**: Registrar los programas gubernamentales y sociales donde se imputan los gastos.
*   **Validaciones del Formulario**:
    *   **Nombre del Programa**: Campo obligatorio y único.
    *   **Estado**: Activo/Inactivo.
    *   **Restricción de Eliminación**: Bloqueado si el programa se ha utilizado en la imputación de Notas de Débito para resguardar la consistencia histórica.

### I. Módulo de Autoridades y Firmantes
*   **Objetivo**: Gestionar los datos personales y credenciales de las tres autoridades institucionales cuyos nombres y decretos se imprimen en todos los documentos oficiales del sistema (Actas, Solicitudes y Reportes Detallados).
*   **Estructura**: El módulo **no es un CRUD convencional**. La pantalla muestra tres bloques fijos y predefinidos correspondientes a los cargos requeridos por el sistema:
    1.  `Presidenta de la fundacion`
    2.  `Coordinadora de administracion`
    3.  `DIRECTORA DE ADMINISTRACIÓN Y FINANZAS`

    Cada bloque renderiza la información de la autoridad asignada a ese cargo, o muestra un aviso `"No hay datos registrados para este cargo"` si aún no existe en la base de datos. El orden de los bloques en pantalla es fijo: la Presidenta ocupa el ancho completo en la parte superior, y las otras dos autoridades se ubican en una grilla de dos columnas debajo.
*   **Comportamiento de Edición**: No existe creación ni eliminación de autoridades desde la UI. Únicamente se permite **editar** la información de una autoridad existente. El botón "Editar" se muestra solo si la autoridad tiene datos registrados.
*   **Validaciones del Formulario**:
    *   **Cédula**: Se filtra con `replace(/\D/g, "")` y se limita a un máximo de 8 caracteres numéricos en el evento `onChange`.
    *   **Nombre y Apellidos**: Campos de texto libres, obligatorios. Se envían limpiando valores `null` o `undefined` antes del `PUT`.
    *   **Profesión (Rango Académico)**: Selección obligatoria desde el catálogo de rangos (`useRanks`), que carga los títulos académicos registrados en el sistema.
    *   **Decreto / Resolución**: Campo de texto libre que registra el instrumento legal (Gaceta Oficial, Resolución interna) que acredita el cargo de la autoridad. Se imprime directamente en los documentos PDF.

### J. Módulo de Partidas Presupuestarias
*   **Objetivo**: Administrar el catálogo de partidas del clasificador presupuestario gubernamental. Cada partida representa una categoría formal de gasto (ej. `4.01.01.01.01 — Sueldos y Salarios`) a la que se imputan los detalles de gasto (DRN) de las Notas de Débito.
*   **Validaciones del Formulario**:
    *   **Número de Partida**: Campo obligatorio. Se sanitiza con la expresión regular `replace(/[^\d.]/g, "")` en el evento `onChange`, permitiendo únicamente dígitos y puntos, que es el formato estándar del clasificador presupuestario venezolano (ej. `4.01.01.01.01`).
    *   **Nombre de la Partida**: Texto obligatorio descriptivo de la categoría presupuestaria.
    *   **Búsqueda en Tiempo Real**: La pantalla dispone de un campo de búsqueda que filtra el listado de partidas en el frontend sin llamadas adicionales a la API, actualizando el resultado de forma inmediata al tipear.
    *   **Restricción de Eliminación**: Si una partida ya ha sido utilizada en detalles de gasto (DRN), el sistema intercepta el intento de borrado con un modal de advertencia diferenciado (`isDeleteBlockedOpen`) que indica que la partida está vinculada a documentos contables y no puede eliminarse para preservar la integridad histórica.

### K. Módulo de Reportes y Exportación PDF
*   **Objetivo**: Vista centralizada de generación, previsualización interactiva y exportación en PDF de los cuatro instrumentos contables oficiales requeridos por la contraloría de FUNDES Táchira.
*   **Estructura**: La pantalla se divide en dos zonas:
    1.  **Panel de Configuración Superior**: Contiene el selector de rendición (con `SearchableSelect`), cuatro indicadores en tiempo real (Orden de Pago, Nro de Rendición, % Rendido, Monto Por Rendir), y los botones de acción `GENERAR` y `EXPORTAR PDF`.
    2.  **Panel de Vista Previa con Pestañas**: Cuatro pestañas estilo carpeta que cambian el documento previsualizado sin recargar datos. El área de previsualización cuenta con controles de zoom (25% a 200%) y scroll independiente.
*   **Los cuatro documentos disponibles**:
    *   **DETALLE DE GASTOS**: Tabla exhaustiva de todas las notas de débito agrupadas por programa y partida presupuestaria, con logotipos gubernamentales y firmas de las tres autoridades.
    *   **ACTA DE ENTREGA**: Oficio formal que notifica la rendición, con el monto expresado en letras contables (`numberToLetters`).
    *   **SOLICITUD (FORMATO)**: Formulario oficial `OYM-E6.1-01F/2015` con marco perimetral reglamentario y coordenadas cartesianas estrictas.
    *   **SOLICITUD (CARTA)**: Versión alternativa del oficio de solicitud en formato carta libre, con el encabezado institucional.
*   **Validaciones y Comportamiento**:
    *   El botón `GENERAR` está deshabilitado si no se ha seleccionado una rendición.
    *   El botón `EXPORTAR PDF` está deshabilitado hasta que `detailedReport` haya sido cargado exitosamente desde la API.
    *   La pantalla lee el parámetro `?rnd=<id>` de la URL al montarse, permitiendo navegar directamente a un reporte específico desde el módulo de Rendiciones.
    *   Las estadísticas del panel superior (% Rendido, Monto Por Rendir) se calculan en tiempo real con `useMemo` a partir del objeto `summary` retornado por el endpoint del reporte consolidado.

### L. Módulo de Usuarios del Sistema
*   **Objetivo**: Gestión administrativa de las cuentas de acceso al sistema. Accesible exclusivamente por el rol Administrador, permite crear, editar y eliminar los usuarios que operan el sistema de rendiciones.
*   **Validaciones del Formulario**:
    *   **Nombre Completo**: Campo de texto obligatorio.
    *   **Cédula**: Se fuerza el prefijo `"V-"` como prefijo visual fijo (no editable) en la UI. La parte numérica se sanitiza con `replace(/\D/g, "")` y se limita a 8 dígitos. El campo de cédula queda **bloqueado en modo edición** (`disabled={editMode}`) para evitar la modificación del identificador único del usuario.
    *   **Correo electrónico**: Campo de tipo `email` con validación de presencia. Obligatorio para poder recuperar contraseñas olvidadas.
    *   **Rol**: Selector con tres opciones: `Administrador` (1), `Coordinador` (2), `Cuentadante` (3). Se refleja en la tabla con un badge de color diferenciado por rol.
    *   **Contraseña**: Obligatoria al crear. En modo edición el campo se etiqueta como "Nueva contraseña" y es opcional (si se deja vacío, el backend mantiene la contraseña actual).
    *   **Estado**: Selector poblado dinámicamente desde el catálogo de estados (`useStateData`), filtrado para mostrar únicamente `Activo`, `Suspendido` e `Inactivo`.
    *   **Búsqueda en Tiempo Real**: El campo de búsqueda filtra simultáneamente por nombre, cédula y correo electrónico del usuario sin llamadas adicionales a la API.
    *   **Restricción de Eliminación**: La eliminación es permanente y no tiene restricción por registros vinculados (a diferencia de cuentadantes). Solicita confirmación en un modal antes de ejecutar el `DELETE`.

### M. Dashboard — Resumen Ejecutivo de Rendiciones
*   **Objetivo**: Vista de inicio post-login que ofrece una panorámica ejecutiva del estado presupuestario de la institución. Permite seleccionar una Orden de Pago y visualizar en tiempo real todas sus estadísticas y el historial de ejecución.
*   **Estructura y Componentes**:
    *   **Selector de Orden de Pago**: Selector `<select>` en la cabecera que filtra todos los datos de la vista al cambiar de OPG. Al seleccionar una OPG, `useDashboard` dispara los fetches correspondientes y actualiza los componentes hijos mediante props.
    *   **Tarjetas de Métricas (`EcommerceMetrics`)**: Panel de indicadores clave derivados del `summary` del reporte de OPG: Monto Total, Total Rendido, Total Reintegros y Disponible Restante.
    *   **Gráfico Circular de Ejecución (`MonthlyTarget`)**: Indicador de porcentaje de ejecución presupuestaria de la OPG seleccionada, visualizado como un gráfico de tipo gauge/donut.
    *   **Gráfico de Presupuesto por Programa (`BudgetByProgramChart`)**: Gráfico de barras o distribución que muestra el gasto acumulado discriminado por cada programa social al que se imputaron gastos en la OPG activa.
    *   **Tabla de Ejecución de Rendiciones (`RenditionExecutionTable`)**: Listado de todas las rendiciones de la OPG con sus montos y estados de ejecución.
    *   **Tabla de Estadísticas por Partida (`DepartureStatsTable`)**: Análisis del gasto discriminado por partida presupuestaria, con soporte para dos modos de visualización (`departureStatsMode`) seleccionables por el usuario.
    *   **Historial de Actividad (`RecentOrders`)**: Tabla de las últimas operaciones registradas en la OPG seleccionada.
*   **Validaciones y Comportamiento**:
    *   No posee formularios de entrada de datos; es una pantalla de solo lectura.
    *   Mientras los datos se están cargando, se muestra un indicador de carga global a nivel de pantalla (`loading`).
    *   Todos los componentes visuales reciben sus datos exclusivamente por `props` desde el hook `useDashboard`, manteniendo los componentes de gráficos y tablas como presentacionales puros.

---

## 9. Estrategia y Arquitectura de las Validaciones en el Frontend

La solidez técnica del sistema depende de cómo y dónde se ejecutan e interceptan las validaciones de los datos antes de transmitirse a la red. El frontend implementa una **estrategia de validación en tres capas acopladas** al ciclo de vida del componente React:

```text
               ┌──────────────────────────────────────────────┐
               │    1. Sanitización en Caliente (onChange)    │
               │    Expresiones Regulares y Formateadores     │
               └──────────────────────┬───────────────────────┘
                                      │
                                      ▼ (Si pasa)
               ┌──────────────────────────────────────────────┐
               │    2. Validación Síncrona Local (OnSubmit)   │
               │    Mapa de Errores 'fieldErrors' (Borde Rojo) │
               └──────────────────────┬───────────────────────┘
                                      │
                                      ▼ (Si pasa)
               ┌──────────────────────────────────────────────┐
               │   3. Validación Lógica de Negocio (Helpers)  │
               │   Cierre Proactivo de Modal y Advertencia    │
               └──────────────────────────────────────────────┘
```

### Capa 1: Sanitización en Caliente (Intercepción en onChange)
La primera línea de defensa se ejecuta a nivel de eventos del DOM en el atributo `onChange` de los inputs. Su propósito es impedir de forma física que el usuario escriba caracteres inválidos.

*   **Mecanismo**: Utiliza expresiones regulares (`regex`) en caliente para filtrar strings.
*   **Ejemplos**:
    *   En el input de número de rendición (`num_rnd`) y referencia bancaria (`ref_ndb`):
        ```typescript
        onChange={(e) => onChange("num_rnd", e.target.value.replace(/\D/g, ""))}
        ```
        La expresión `\D` remueve inmediatamente cualquier carácter que no sea un dígito numérico, previniendo caracteres alfabéticos.
    *   En el input de RIF en [Beneficiary.tsx](file:///c:/Users/Mariana%20Morales/Desktop/9no%20Pasantias/Programacion/Pasantias-Frontend/src/pages/Beneficiary.tsx):
        ```typescript
        onChange={(e) => {
          const raw = e.target.value;
          if (rifPrefix === "V") {
            onRifNumChange(raw.replace(/\D/g, "").slice(0, 8)); // Solo 8 números para cédula V
          } else {
            const digits = raw.replace(/\D/g, "");
            // Si supera los 8 caracteres de la cédula base, añade guion intermedio para el verificador
            onRifNumChange(digits.length <= 8 ? digits : digits.slice(0, 8) + "-" + digits.slice(8, 9));
          }
        }}
        ```

### Capa 2: Validación Síncrona Local (Presencia en Submit)
Se ejecuta en el hook personalizado (`useSurrender`, `useOrders`, `useBeneficiaries`) al dispararse el envío del formulario.

*   **Mecanismo**: Se evalúan las propiedades obligatorias del estado del formulario local (`formData`). Si alguna falta, se inyecta en un mapa temporal de errores de tipo clave-valor (`Record<string, string>`).
*   **Actualización del Estado**: Si el objeto temporal contiene errores, se actualiza el estado de React `fieldErrors` (`setFieldErrors(errors)`) y se interrumpe inmediatamente el flujo (`return`).
*   **Ejemplo en el Hook**:
    ```typescript
    const rndErrors: Record<string, string> = {};
    if (!rndFormData.num_rnd) rndErrors.rnd_num_rnd = "Este campo es requerido";
    if (!rndFormData.opg_rnd) rndErrors.rnd_opg_rnd = "Este campo es requerido";
    if (Object.keys(rndErrors).length > 0) {
        setFieldErrors(rndErrors);
        return; // Detiene la comunicación con la API
    }
    ```
*   **Feedback en la UI**: El formulario recibe por props el mapa `fieldErrors`. Mediante clases condicionales de Tailwind CSS, el input afectado se tiñe de color rojo y renderiza una etiqueta descriptiva:
    ```tsx
    <Input 
      id="rnd-num"
      value={rndFormData.num_rnd}
      className={fieldErrors?.rnd_num_rnd ? "border-red-500" : "border-gray-300"} 
    />
    {fieldErrors?.rnd_num_rnd && (
      <p className="text-xs text-red-500 mt-1">Este campo no puede faltar.</p>
    )}
    ```

### Capa 3: Validación Lógica de Negocio y Reglas Financieras
Ocurre inmediatamente después de pasar las validaciones de presencia físicas, contrastando los datos ingresados contra la persistencia cargada en memoria (el árbol contable actual).

*   **Mecanismo**: Delega la lógica en funciones matemáticas de utilidad pura (`validateDebitNoteAmount`, `validateDetailAmount`).
*   **Intercepción Global**: Si el cálculo contable falla (ej. se excede el disponible de la OPG por Bs. 100):
    1. Se interrumpe la llamada asíncrona de creación/modificación.
    2. Se cierra de forma proactiva el modal del formulario actual para limpiar la vista.
    3. Se setea un estado global de mensaje de advertencia (`setWarningMessage`).
    4. Se abre una ventana modal de advertencia general a nivel de pantalla (`setIsWarningOpen(true)` o `setIsWarningModalOpen(true)`) alertando al operador el monto disponible real:
       ```typescript
       const { valid, remaining } = validateDebitNoteAmount(montoARendir, selectedOpg, selectedRnd, opgDebitNotes, renditions);
       if (!valid) {
           setIsNdbCreateOpen(false); // Cierre proactivo de formulario
           setWarningMessage(`No puedes exceder el monto de la orden de pago. Disponible: Bs. ${remaining.toLocaleString("es-VE")}`);
           setIsWarningOpen(true);    // Modal general de advertencia
           return;
       }
       ```

---

## 10. Patrón Arquitectónico Interno de los Custom Hooks

Cada módulo de negocio de la aplicación (Rendiciones, Órdenes de Pago, Beneficiarios, etc.) está regido por un **hook personalizado** que actúa como el **controlador del módulo**. Este patrón es la columna vertebral de la arquitectura y separa completamente la lógica de la presentación visual.

### A. Anatomía de un Custom Hook de Negocio

Todo hook de este sistema sigue una estructura interna estandarizada, dividida en bloques comentados:

```text
useXxx.ts
├── 1. FORMULARIOS VACÍOS (constantes de reset)
│   └── export const emptyXxxForm = { ... }
├── 2. ESTADOS PRINCIPALES (datos de listas)
│   └── useState<XxxItem[]>([])
├── 3. ESTADOS DE UI (modales abiertos/cerrados)
│   └── useState<boolean>(false) → isCreateOpen, isEditOpen, isDeleteOpen
├── 4. ESTADOS DE SELECCIÓN (ítem activo en pantalla)
│   └── useState<XxxItem | null>(null) → selectedXxx
├── 5. ESTADOS AUXILIARES (catálogos relacionados)
│   └── useState<OtherItem[]>([]) → beneficiaries, programs, etc.
├── 6. ESTADOS DE ERROR Y FEEDBACK
│   └── fieldErrors, warningMessage, isWarningOpen
├── 7. CÁLCULOS DERIVADOS (computed values en tiempo real)
│   └── const totalRendered = debitNotes.reduce(...)
├── 8. FUNCIONES DE FETCHING (llamadas a servicios)
│   └── fetchXxx(), fetchAuxiliary()
├── 9. useEffect DE SINCRONIZACIÓN
│   └── Reaccionan a cambios en selectedXxx para refrescar datos en cascada
├── 10. HANDLERS DE CRUD (Create, Update, Delete)
│    └── handleXxxCreate(), handleXxxUpdate(), handleXxxDelete()
└── 11. RETURN (interfaz pública del hook)
     └── { states, setters, handlers, computed }
```

### B. El Patrón de Cascada Reactiva (useEffect Encadenados)

El módulo de Rendiciones (`useSurrender`) implementa el patrón más complejo del sistema: una **cascada de selecciones** donde cada selección del usuario dispara automáticamente la carga de datos del nivel siguiente y limpia los niveles inferiores.

```typescript
// Al seleccionar una OPG → carga rendiciones + limpia NDB y detalles
useEffect(() => {
    if (selectedOpg) {
        fetchRenditionsByOpg(selectedOpg.cod_opg); // Dispara fetch de RNDs
        setSelectedRnd(null);  // Limpia selección de rendición
        setDebitNotes([]);     // Vacía notas de la vista
        setSelectedNdb(null);  // Limpia selección de nota
        setDetails([]);        // Vacía detalles de la vista
    }
}, [selectedOpg]);

// Al seleccionar una RND → carga notas de débito + limpia detalles
useEffect(() => {
    if (selectedRnd) {
        fetchDebitNotes(selectedRnd.cod_rnd);
        setSelectedNdb(null);
        setDetails([]);
    }
}, [selectedRnd]);

// Al seleccionar una NDB → carga detalles de gasto (DRN)
useEffect(() => {
    if (selectedNdb) fetchDetails(selectedNdb.cod_ndb);
    else setDetails([]);
}, [selectedNdb]);
```

Esto produce una UI dinámica donde el árbol jerárquico `OPG → RND → NDB → DRN` se navega de forma interactiva sin necesidad de recargar la página.

### C. Fetching Paralelo con `Promise.all`

Cuando se carga una OPG con múltiples rendiciones, las notas de débito de **todas** las rendiciones se deben cargar simultáneamente para calcular el saldo global. El hook evita las peticiones secuenciales (que serían lentas) usando `Promise.all`:

```typescript
const fetchDebitNotesByOpgRenditions = async (renditionsList: SurrenderItem[]) => {
    // Dispara N peticiones simultáneas, una por cada rendición
    const responses = await Promise.all(
        renditionsList.map((rendition) =>
            debitNoteService.getByRendition(rendition.cod_rnd)
        )
    );
    // Aplana todos los arrays de respuesta en una sola lista plana
    const notes = responses.flatMap((res) => {
        if (isApiError(res)) return [];
        return Array.isArray(res) ? res : [];
    });
    setOpgDebitNotes(notes); // Estado global para cálculos financieros
};
```

### D. Cálculos Financieros Derivados (Computed en Tiempo Real)

Los valores financieros de resumen no se almacenan en el backend; se **derivan en tiempo real** del estado en memoria del hook. React recalcula estos valores en cada renderizado cuando los estados de los que dependen cambian:

```typescript
// Total gastado en la OPG (solo notas con sus detalles cuadrados)
const totalRendered = opgDebitNotes.reduce(
    (acc, note) => acc + (
        (note.total_details ?? 0) >= Number(note.mon_ndb || 0)
            ? Number(note.mon_ndb || 0)
            : 0
    ),
    0
);

// Total devuelto al banco (reintegros de todas las rendiciones)
const totalReintegros = renditions.reduce(
    (acc, curr) => acc + Number(curr.rnt_rnd || 0),
    0
);

// Monto disponible = Asignado - Gastado + Devuelto
const remainingAmount = selectedOpg
    ? Math.max(Number(selectedOpg.mon_opg || 0) - (totalRendered - totalReintegros), 0)
    : 0;
```

Estos valores (`totalRendered`, `remainingAmount`) se exponen en el `return` del hook y son consumidos directamente por el componente de pantalla para mostrar el indicador de presupuesto en tiempo real.

### E. La Capa de Servicios (`/src/services/`)

Entre el hook y `helpHttp` existe una capa de abstracción adicional: los **servicios**. Cada entidad del dominio tiene su propio servicio que encapsula las URLs específicas y los verbos HTTP:

```typescript
// Ejemplo: src/services/surrenderService.ts
export const surrenderService = {
    getByOpg: (opg_id: number) =>
        helpHttp().get(`${API_BASE_URL}/renditions/opg/${opg_id}`),

    create: (data: Partial<SurrenderItem>) =>
        helpHttp().post(`${API_BASE_URL}/renditions`, { body: data }),

    update: (id: string, data: Partial<SurrenderItem>) =>
        helpHttp().put(`${API_BASE_URL}/renditions/${id}`, { body: data }),

    delete: (id: string) =>
        helpHttp().del(`${API_BASE_URL}/renditions/${id}`),
};
```

El hook llama al servicio, recibe la respuesta, la discrimina con `isApiError`, y actualiza el estado de React. Nunca accede a `helpHttp` directamente.

---

## 11. Control de Acceso y Permisos por Rol de Usuario

El sistema implementa control de acceso en dos niveles: **a nivel de ruta** (React Router) y **a nivel de componente** (condicionales inline).

### A. Estructura del Tipo de Usuario

El objeto de usuario almacenado en el contexto global sigue la interfaz `UserItem`:

```typescript
// src/types/user.ts
export interface UserItem {
    cod_usu: number;
    ced_usu: string;
    nom_usu: string;
    ape_usu: string;
    rol_usu: "Administrador" | "Usuario";   // Discriminante de permisos
    sta_usu: "Activo" | "Suspendido" | "Inactivo";
    ema_usu?: string;
}
```

### B. Control a Nivel de Ruta (`ProtectedRoute` y `PublicRoute`)

Los guardias de ruta son componentes de orden superior que consultan el `AuthContext` antes de renderizar cualquier vista:

```typescript
// src/components/auth/ProtectedRoute.tsx
export const ProtectedRoute = () => {
    const { authenticated, loading } = useAuth();

    if (loading) return <Spinner />;           // Espera validación de token
    if (!authenticated) return <Navigate to="/signin" replace />;

    return <Outlet />;   // Renderiza la vista solicitada si está autenticado
};
```

### C. Control a Nivel de Componente (Permisos por Rol)

Dentro de las pantallas y formularios, los permisos granulares se controlan consultando el campo `rol_usu` del objeto `user` obtenido con el hook `useAuth()`:

```typescript
const { user } = useAuth();
const isAdmin = user?.rol_usu === "Administrador";
```

Esta bandera booleana condiciona la visibilidad de botones de acción destructiva, la editabilidad de campos protegidos y el acceso a estados específicos del sistema. Ejemplos concretos:

| Acción / Campo | `Administrador` | `Usuario` |
|---|---|---|
| Cambiar estado de una OPG a `Inactivo` | ✅ Permitido | ❌ Deshabilitado |
| Editar el campo RIF de un Beneficiario | ✅ Permitido | ❌ Campo en modo lectura |
| Cambiar estado de Rendición a `Entregada` | ✅ Permitido | ❌ Selector bloqueado |
| Eliminar un Cuentadante con OPGs | ❌ Bloqueado (para todos) | ❌ Bloqueado (para todos) |
| Crear Órdenes de Pago y Rendiciones | ✅ Permitido | ✅ Permitido |

**Implementación en JSX**:
```tsx
// Campo de estado del Beneficiario (solo editable por Administrador)
<select
  value={formData.sta_ben}
  disabled={!isAdmin}
  onChange={(e) => onChange("sta_ben", e.target.value)}
>
  <option value="Activo">Activo</option>
  <option value="Inactivo">Inactivo</option>
</select>

// Botón de eliminación visible pero deshabilitado condicionalmente
<button
  onClick={handleDelete}
  disabled={!isAdmin || hasLinkedRecords}
  className={!isAdmin ? "opacity-50 cursor-not-allowed" : ""}
>
  Eliminar
</button>
```

### D. Verificación del Estado del Usuario en Login

En el momento del login, además de comprobar credenciales, el sistema verifica el estado nominal del usuario. Si la cuenta está `Suspendido` o `Inactivo`, la autenticación se rechaza en el backend y el frontend intercepta el error mostrando un mensaje descriptivo antes de redirigir, sin almacenar ningún token:

```typescript
// src/context/AuthContext.tsx
const login = async (ced_usu: string, cla_usu: string) => {
    const response = await api.post(`${API_BASE_URL}/auth/login`, {
        body: { ced_usu, cla_usu },
    }) as ApiResponse<UserItem>;

    if (isApiError(response)) {
        // El backend retorna 403 con mensaje descriptivo para cuentas suspendidas
        throw new Error(response.statusText || "Error al iniciar sesión");
    }

    setUser(response);
    setAuthenticated(true);
};
```

---

## 12. Sistema de Theming: Modo Claro y Oscuro (Dark Mode)

La aplicación implementa un sistema de temas completo y persistente basado en **variables CSS nativas de Tailwind CSS v4** y el contexto global `ThemeContext`.

### A. Contexto Global de Tema (`ThemeContext.tsx`)

El estado del tema actual (claro u oscuro) se gestiona globalmente en [ThemeContext.tsx](file:///c:/Users/Mariana%20Morales/Desktop/9no%20Pasantias/Programacion/Pasantias-Frontend/src/context/ThemeContext.tsx). Al iniciarse la aplicación, verifica si el usuario guardó previamente una preferencia en `localStorage`. Si no hay preferencia guardada, detecta la configuración del sistema operativo con la media query `prefers-color-scheme`.

```typescript
// src/context/ThemeContext.tsx (lógica de inicialización)
const getInitialTheme = (): "light" | "dark" => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};
```

Al cambiar el tema, se aplica inmediatamente la clase `"dark"` al elemento `<html>` raíz del documento, activando las variantes `dark:` de Tailwind CSS en todos los componentes hijos:

```typescript
const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);               // Persiste la preferencia
    document.documentElement.classList.toggle("dark", newTheme === "dark");
};
```

### B. Variables de Color de Tailwind CSS v4

Tailwind CSS v4 utiliza variables CSS nativas en lugar de un archivo de configuración de JavaScript. Las variables de color para el diseño del sistema están declaradas en [index.css](file:///c:/Users/Mariana Morales/Desktop/9no%20Pasantias/Programacion/Pasantias-Frontend/src/index.css) y cambian automáticamente cuando se activa la clase `dark`:

```css
/* src/index.css */
:root {
    --color-brand-blue: #465fff;
    --color-surface-primary: #ffffff;
    --color-text-primary: #101828;
    /* ... más variables de tema claro ... */
}

.dark {
    --color-surface-primary: #1a2332;
    --color-text-primary: #f0f4f8;
    /* ... variables reemplazadas para tema oscuro ... */
}
```

---

## 13. Variables de Entorno y Configuración del Entorno de Ejecución

La aplicación utiliza el sistema de variables de entorno nativo de **Vite**, accesibles en el código a través del prefijo `import.meta.env`.

### A. Archivo `.env.local` (Desarrollo Local)

Se debe crear un archivo `.env.local` en la raíz del proyecto antes de ejecutar la aplicación. Este archivo **no debe ser versionado** (está en `.gitignore`):

```env
# .env.local — Configuración de entorno de desarrollo local
VITE_API_URL=http://localhost:8080/api
```

### B. Archivo `.env.production` (Despliegue en Producción)

Para el entorno de producción, se utiliza un archivo `.env.production` que Vite detecta automáticamente al compilar con `npm run build`:

```env
# .env.production — URL del servidor backend de producción
VITE_API_URL=https://tu-dominio-produccion.com/api
```

### C. Consumo en el Código

La variable se importa de forma centralizada desde [apiConfig.ts](file:///c:/Users/Mariana%20Morales/Desktop/9no%20Pasantias/Programacion/Pasantias-Frontend/src/api/apiConfig.ts), donde se define un valor de respaldo (`fallback`) para cuando la variable no está definida:

```typescript
// src/api/apiConfig.ts
export const API_BASE_URL: string =
    import.meta.env.VITE_API_URL || "http://localhost:8080/api";
```

> **Nota de seguridad**: Solo las variables con el prefijo `VITE_` son expuestas al código del navegador. Variables sin este prefijo permanecen privadas en el proceso de build y nunca son incluidas en el bundle final.

---

## 14. Instalación, Configuración y Ejecución del Proyecto

### A. Prerequisitos

*   **Node.js**: v18.0.0 o superior (se recomienda la versión LTS).
*   **npm**: v9.0.0 o superior (incluido con Node.js).
*   El **backend** del sistema debe estar en ejecución y accesible en la URL configurada en `VITE_API_URL`.

### B. Pasos de Instalación

**1. Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd Pasantias-Frontend
```

**2. Instalar dependencias**
```bash
npm install
```

**3. Configurar variables de entorno**

Crear el archivo `.env.local` en la raíz del proyecto:
```bash
# En Windows (PowerShell)
New-Item .env.local
# Agregar el contenido:
VITE_API_URL=http://localhost:8080/api
```

### C. Comandos Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con Hot Module Replacement (HMR) en `http://localhost:5173` |
| `npm run build` | Compila la aplicación para producción en la carpeta `/dist` con optimizaciones de Vite |
| `npm run preview` | Sirve localmente el bundle de producción generado por `build` para validar el resultado |
| `npm run lint` | Ejecuta ESLint sobre todos los archivos `.ts` y `.tsx` del proyecto |

### D. Dependencias Principales del Proyecto

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "jspdf": "^2.5.2",
    "jspdf-autotable": "^3.8.4"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.x",
    "typescript": "^5.x",
    "vite": "^6.x",
    "tailwindcss": "^4.x",
    "@tailwindcss/vite": "^4.x",
    "eslint": "^9.x"
  }
}
```

---

## 15. Guía de Mantenimiento y Escalabilidad

Esta sección está dirigida a los desarrolladores que continuarán manteniendo o extendiendo el sistema. Describe los pasos concretos para las operaciones de mantenimiento más comunes, los patrones que deben respetarse, y las advertencias sobre áreas sensibles del código.

### A. Cómo Agregar un Nuevo Módulo de Negocio

Seguir el patrón establecido garantiza que el nuevo módulo sea consistente con el resto de la aplicación. Los pasos son los siguientes:

**1. Definir el tipo en `/src/types/`**
```typescript
// src/types/miEntidad.ts
export interface MiEntidadItem {
    cod_ent: number;
    nom_ent: string;
    sta_ent: number;
}
```

**2. Crear el servicio en `/src/services/`**
```typescript
// src/services/miEntidadService.ts
import { helpHttp } from "../helpers/helpHttp";
import { API_BASE_URL } from "../api/apiConfig";

export const miEntidadService = {
    getAll: () => helpHttp().get(`${API_BASE_URL}/mi-entidad`),
    create: (data: Partial<MiEntidadItem>) =>
        helpHttp().post(`${API_BASE_URL}/mi-entidad`, { body: data }),
    update: (id: string, data: Partial<MiEntidadItem>) =>
        helpHttp().put(`${API_BASE_URL}/mi-entidad/${id}`, { body: data }),
    delete: (id: string) =>
        helpHttp().del(`${API_BASE_URL}/mi-entidad/${id}`),
};
```

**3. Crear el hook en `/src/hooks/`** siguiendo la estructura de 11 bloques documentada en la Sección 10.

**4. Crear la página en `/src/pages/`** usando `BasicTableOne`, `Modal`, `Button` e `Input` del sistema de componentes existente.

**5. Registrar la ruta en `App.tsx`**:
```tsx
<Route path="/mi-entidad" element={<MiEntidad />} />
```

**6. Agregar el ítem al menú lateral** en el archivo de configuración de navegación correspondiente.

> ⚠️ **No crear componentes ad-hoc para tablas, modales o botones.** Siempre reutilizar los del sistema de componentes.

---

### B. Cómo Agregar una Nueva Validación Financiera

Si la lógica de validación involucra **cálculos con montos, fechas o relaciones entre entidades**, debe ir en [validationsDebitNote.tsx](file:///c:/Users/Mariana%20Morales/Desktop/9no%20Pasantias/Programacion/Pasantias-Frontend/src/utils/validationsDebitNote.tsx) como función pura exportada. **Nunca colocar lógica contable directamente dentro de un componente o en el JSX.**

Estructura de una función de validación nueva:
```typescript
// Firma estándar: recibe datos, retorna { valid, remaining, excess }
export const validateNuevaRegla = (
    monto: number,
    contexto: TipoContexto
): { valid: boolean; remaining: number; excess: boolean } => {
    // 1. Guard clause si faltan datos
    if (!contexto) return { valid: false, remaining: 0, excess: false };

    // 2. Cálculo
    const limite = calcularLimite(contexto);
    const round2 = (n: number) => Math.round(n * 100) / 100;

    return {
        valid: round2(monto) <= round2(limite),
        remaining: Math.max(0, limite - monto),
        excess: round2(monto) > round2(limite),
    };
};
```

El hook que la consuma debe seguir el patrón de intercepción de la Capa 3 (Sección 9): llamar a la función antes del `await`, cerrar el modal proactivamente si falla, y mostrar el mensaje en el modal de advertencia global.

---

### C. Cómo Agregar un Nuevo Documento PDF

Los motores de exportación están centralizados en [pdfGenerators.ts](file:///c:/Users/Mariana%20Morales/Desktop/9no%20Pasantias/Programacion/Pasantias-Frontend/src/utils/pdfGenerators.ts). Para agregar un nuevo tipo de documento:

1. Crear la función `exportNuevoDocumentoPDF(data, authorities)` en ese archivo.
2. Crear el componente de vista previa en `/src/components/reports/NuevoDocumento.tsx` que reproduzca la apariencia del documento en HTML/CSS para previsualización en pantalla.
3. Agregar una nueva pestaña en [Reports.tsx](file:///c:/Users/Mariana%20Morales/Desktop/9no%20Pasantias/Programacion/Pasantias-Frontend/src/pages/Reports.tsx):
    - Agregar la nueva clave al tipo `TabType`.
    - Agregar la pestaña al array de tabs.
    - Agregar el `else if` correspondiente en `handleExportPDF` y en el renderizado condicional de la vista previa.

> ⚠️ **Los logotipos y firmas en los PDFs están embebidos como strings Base64** directamente en `pdfGenerators.ts`. Si cambia la imagen institucional, se debe regenerar el Base64 y reemplazar la constante correspondiente.

---

### D. Cómo Agregar un Nuevo Rol de Usuario

Los roles están definidos actualmente como literales de tipo en la interfaz `UserItem`:

```typescript
rol_usu: "Administrador" | "Usuario";
```

Para agregar un nuevo rol (ej. `"Auditor"`):

1. Extender el tipo en `/src/types/user.ts`.
2. Agregar la opción en el `<select>` del formulario en [Users.tsx](file:///c:/Users/Mariana%20Morales/Desktop/9no%20Pasantias/Programacion/Pasantias-Frontend/src/pages/Users.tsx).
3. Revisar todos los lugares donde se usa `user?.rol_usu === "Administrador"` en los componentes de UI y determinar si el nuevo rol debe tener permisos similares o propios.
4. Coordinar con el backend la actualización de los valores permitidos en la columna de rol en la base de datos.

---

### E. Mantenimiento de Autoridades Firmantes

Los datos de las autoridades (nombre, cargo, decreto) se obtienen del endpoint `/authorities` en tiempo de ejecución. Si cambia una autoridad institucional, el cambio se hace únicamente desde la pantalla **Gestión de Autoridades** del sistema; **no requiere modificaciones en el código fuente**. Los PDFs tomaran los datos actualizados en la siguiente generación.

> ⚠️ **El campo `ran_aut` (cargo) de una autoridad en la base de datos debe coincidir exactamente** (incluyendo mayúsculas y espacios) con los valores definidos en la constante `REQUIRED_ROLES` de [Authorities.tsx](file:///c:/Users/Mariana%20Morales/Desktop/9no%20Pasantias/Programacion/Pasantias-Frontend/src/pages/Authorities.tsx). Si no coinciden, la autoridad no se asignará al bloque correcto y aparecerá como "Pendiente por registrar".

---

### F. Actualización de Dependencias

Se recomienda revisar y actualizar las dependencias del proyecto cada **3 a 6 meses**. Los puntos de mayor atención son:

| Dependencia | Riesgo de actualización | Razón |
|---|---|---|
| `react` / `react-dom` | **Alto** | Cambios de API en React 19+ pueden romper hooks o contextos |
| `react-router-dom` | **Medio** | Cada versión mayor cambia la API de enrutamiento significativamente |
| `tailwindcss` | **Medio** | Tailwind v4 usa variables CSS nativas; actualizar puede cambiar el sistema de tokens |
| `jspdf` / `jspdf-autotable` | **Bajo** | API estable; verificar compatibilidad entre las versiones de ambas librerías simultáneamente |
| `vite` | **Bajo** | Actualizaciones principalmente de rendimiento y compatibilidad de plugins |

Para actualizar de forma segura:
```bash
# Ver qué tiene actualizaciones disponibles
npm outdated

# Actualizar con verificación manual de cambios rompientes (BREAKING CHANGES)
npm update <paquete>
```

---

### G. Problemas Frecuentes y Resolución

| Síntoma | Causa probable | Solución |
|---|---|---|
| La sesión se cierra sola al presionar "Atrás" | Comportamiento correcto por diseño (bfcache guard) | No es un bug; revisa la sección 4-B |
| Los montos no cuadran en el reporte PDF | El redondeo de JavaScript con decimales | Verificar que `round2` se aplique en todas las comparaciones de `validationsDebitNote.tsx` |
| El selector de rendición no muestra opciones | `VITE_API_URL` apunta a un servidor apagado | Verificar `.env.local` y que el backend esté corriendo |
| Los PDFs se generan sin logotipos | Las constantes Base64 están vacías o corruptas | Regenerar el Base64 de las imágenes y actualizar `pdfGenerators.ts` |
| Un campo de formulario no muestra el borde rojo de error | La clave en `fieldErrors` no coincide con la clave usada en el `className` condicional | Verificar que la clave en `setFieldErrors({...})` sea idéntica a la usada en `fieldErrors?.clave` en el JSX |
| El Dark Mode no se activa | La clase `dark` no se está aplicando en `<html>` | Verificar que `ThemeContext` esté envolviendo la aplicación en `App.tsx` y que `localStorage` no tenga un valor cacheado incorrecto |

---

*Documento técnico generado para el proyecto de pasantías — FUNDES Táchira. Última actualización: Junio 2025.*
