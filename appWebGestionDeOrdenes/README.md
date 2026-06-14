# Sistema de Gestión de Órdenes de Mantenimiento
## Tecnologías Utilizadas
Frontend: 
React, React Router DOM, Axios, JWT Decode, Vite  

Backend:
Node.js, Express, Sequelize, SQLite, JWT (jsonwebtoken), bcryptjs, CORS,

## Instrucciones de Ejecución
- Backend

```
cd backend
npm install
npm start
```
El backend se ejecutará utilizando Express y SQLite.


- Frontend

```
cd frontend
npm install
npm run dev
```
Por defecto Vite levanta la aplicación en:
http://localhost:5173

## Usuarios de Prueba
- __Administrador__  
  Email: martin@dds.com
  Contraseña: 123456
Permisos:  
-Consultar todas las órdenes  
-Crear órdenes  
-Modificar órdenes  
-Asignar técnicos  
-Procesar órdenes  
-Resolver órdenes  
-Cancelar órdenes  


- __Técnico__  
  Email: pedro@dds.com 
  Contraseña: 123456
Permisos:  
-Consultar órdenes asignadas  
-Procesar órdenes  
-Resolver órdenes


- __Solicitante__  
Usuario: jose@dds.com
Contraseña: 123456
Permisos:  
-Crear órdenes  
-Consultar únicamente sus propias órdenes  


## Endpoints Principales
- __Autenticación__  
Registrar usuario:  POST /auth/register  
Iniciar sesión:     POST /auth/login  


- __Usuarios__  
Obtener técnicos: GET /usuarios/tecnicos


- __Activos__  
Obtener todos los activos: GET /activos


- __Órdenes__  
Obtener órdenes:                GET /ordenes  
Obtener orden por ID:           GET /ordenes/:id  
Obtener historial de una orden: GET /ordenes/:id/historial  
Crear orden:                    POST /ordenes  


## Rutas Frontend
Las principales pantallas implementadas son:

/login  
/register  
/dashboard  
/ordenes  
/ordenes/nueva  
/ordenes/:id  
/ordenes/:id/editar  
/unauthorized  

Además existe una pantalla para rutas inexistentes:
*
que redirige a la página NotFound.


## Validación de Activo, Prioridad y Estado
- Validación de Activo  
Antes de crear o modificar una orden se valida:  
-Que el activo exista.  
-Que el activo se encuentre en estado de alta.  
-Que pueda recibir órdenes de mantenimiento.
Estas validaciones se realizan mediante:
validarExistenciaActivo() y
validarActivoEnAlta()

- Validación de Prioridad  
Antes de registrar una orden se verifica que la prioridad asignada sea consistente con la criticidad del activo.
La validación se realiza mediante:
validarCriticidad()
Esto impide registrar órdenes con prioridades incompatibles respecto a la criticidad definida para el activo.

- Validación de Estado  
El sistema controla las transiciones de estado mediante operaciones -específicas:  
-Asignar  
-Procesar  
-Resolver  
-Cancelar  
De esta manera se evita que una orden cambie arbitrariamente entre estados.
Además se registran los cambios en el historial de la orden.

## JWT, Roles y Permisos
La autenticación se implementa mediante JSON Web Tokens (JWT).  
Proceso:  
    1. El usuario inicia sesión mediante /auth/login.  
    2. El backend valida las credenciales.  
    3. Se genera un JWT firmado.  
    4. El frontend almacena el token.  
    5. El token se envía en cada solicitud protegida:
	Authorization: Bearer <token>

__Middleware verificarToken__  
Valida:
    • Existencia del token.
    • Firma válida.
    • Integridad de la información.

__Middleware verificarRol__  
Controla los permisos según el rol del usuario autenticado.  
Roles soportados:  
-admin  
-tecnico  
-solicitante  

## Ejecución de Pruebas
Actualmente el proyecto no posee pruebas automatizadas implementadas.
El script definido es:
npm test
Resultado actual:
Error: no test specified

## Limitaciones Conocidas
    • La persistencia utiliza SQLite local.
    • No existe recuperación de contraseña.
    • No existe notificación por correo electrónico.
    • No existe carga de archivos adjuntos.
    • No existe actualización en tiempo real.
    • Las credenciales de usuarios dependen de la base de datos utilizada en cada ejecución.
