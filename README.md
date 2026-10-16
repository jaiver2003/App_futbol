# Academia Dorada – API REST de gestión de jugadores y mensualidades

MVP de una API REST para un club deportivo. Permite administrar los jugadores (registro, consulta, actualización, inactivación y control de camiseta única) y llevar el control de sus mensualidades (pagos, historial, morosos y recaudo).



## Tecnologías

- **Backend:** Node.js, Express 5, TypeScript, Mongoose
- **Base de datos:** MongoDB (Compass para consultar los datos)
- **Frontend (adicional):** React, Vite y Tailwind CSS
- **Pruebas de la API:** Thunder Client

## Estructura del proyecto

```
App_futbol/
├── backend/
│   ├── src/
│   │   ├── models/        # Jugador.ts, Mensualidad.ts
│   │   ├── routes/        # jugadores.ts, mensualidades.ts
│   │   └── servidor.ts    # Punto de entrada
│   ├── .env.example       # Variables de entorno (plantilla)
│   └── package.json
├── frontend/              # Interfaz web en React
├── historias-usuarios.md  # Historias de usuario y registro de funcionalidades
└── README.md
```

## Cómo ejecutar el proyecto

### 1. Backend

```bash
cd backend
npm install
```

Crea un archivo `.env` dentro de `backend/` a partir de `.env.example`:

```
MONGODB_URI=
PORT=3001
```

Inicia el servidor:

```bash
npm run dev
```

El servidor queda en `http://localhost:3001`.

### 2. Frontend (opcional)

```bash
cd frontend
npm install
npm run dev
```

## Funcionalidades del MVP

Cada funcionalidad está asociada a una historia de usuario en [historias-usuarios.md](historias-usuarios.md).

| N.º | Funcionalidad | Método y endpoint |
|---|---|---|
| 1 | Registrar jugador | `POST /api/jugadores` |
| 2 | Listar jugadores | `GET /api/jugadores` |
| 3 | Filtrar por posición y estado | `GET /api/jugadores?posicion=Delantero&estado=activo` |
| 4 | Actualizar jugador | `PUT /api/jugadores/:id` |
| 5 | Inactivar jugador | `PATCH /api/jugadores/:id/inactivar` |
| 6 | Verificar camiseta única | `GET /api/jugadores/camiseta/:numero` (el `POST` rechaza números repetidos) |
| 7 | Registrar mensualidad | `POST /api/mensualidades` |
| 8 | Historial de pagos por jugador | `GET /api/mensualidades/jugador/:jugadorId` |
| 9 | Jugadores en mora | `GET /api/mensualidades/morosos?mes=Agosto&anio=2026` |
| 10 | Resumen de recaudo | `GET /api/mensualidades/resumen?mes=Agosto&anio=2026` |

Otros endpoints disponibles: `GET /api/jugadores/:id` y `DELETE /api/jugadores/:id`.

## Modelos de datos

**Jugador:** `nombre`, `apellido`, `edad`, `posicion`, `numeroCamiseta` (único), `telefono`, `estado` (`activo` o `inactivo`).

**Mensualidad:** `jugadorId` (referencia a Jugador), `mes`, `anio`, `valor`, `estado` (`pagado`, `pendiente` o `parcial`), `fechaPago`. Un jugador solo puede tener una mensualidad por mes y año.

## Códigos de estado HTTP

| Código | Significado |
|---|---|
| 200 | Consulta o actualización exitosa |
| 201 | Recurso creado |
| 400 | Datos inválidos, ID mal formado o regla de negocio incumplida |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

Todas las rutas manejan los errores con `try/catch`, por lo que una petición inválida no detiene la aplicación.

## Ejemplo de petición

`POST /api/mensualidades`

```json
{
  "jugadorId": "ID_DEL_JUGADOR",
  "mes": "Agosto",
  "anio": 2026,
  "valor": 50000,
  "estado": "pagado",
  "fechaPago": "2026-08-05"
}
```

## Integrantes

- [JAIVER MUÑOZ MUÑOZ]
