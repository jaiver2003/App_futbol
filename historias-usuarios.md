# Historias de usuario – API Club de Fútbol

API REST en Node.js y MongoDB para administrar los jugadores de un club y el cobro de sus mensualidades.

Roles:
- **Administrador del club:** gestiona a los jugadores.
- **Tesorero del club:** gestiona el cobro y el recaudo de mensualidades.

## Registro de funcionalidades

| N.º | Historia de usuario | Funcionalidad | Endpoint y método HTTP | Resultado esperado |
|---|---|---|---|---|
| 1 | Como administrador del club, quiero registrar un jugador nuevo, para tener el plantel completo y organizado. | Registrar jugador | `POST /api/jugadores` | 201 con el jugador creado y guardado en MongoDB |
| 2 | Como administrador del club, quiero ver la lista de todos los jugadores, para conocer quiénes forman parte del club. | Listar jugadores | `GET /api/jugadores` | 200 con el arreglo de jugadores |
| 3 | Como administrador del club, quiero filtrar jugadores por posición y estado, para armar la alineación con los jugadores disponibles. | Filtrar por posición y estado | `GET /api/jugadores?posicion=Delantero&estado=activo` | 200 con los jugadores que cumplen el filtro |
| 4 | Como administrador del club, quiero actualizar los datos de un jugador, para mantener su información al día. | Actualizar jugador | `PUT /api/jugadores/:id` | 200 con el jugador modificado; 404 si no existe |
| 5 | Como administrador del club, quiero inactivar a un jugador que se retira, para no seguir cobrándole mensualidad sin borrar su historial. | Inactivar jugador | `PATCH /api/jugadores/:id/inactivar` | 200 con `estado: "inactivo"` |
| 6 | Como administrador del club, quiero que el número de camiseta no se repita, para evitar conflictos entre jugadores en la cancha. | Camiseta única | `GET /api/jugadores/camiseta/:numero` y `POST /api/jugadores` con número repetido | 200 con la disponibilidad; 400 si el número ya está asignado |
| 7 | Como tesorero del club, quiero registrar la mensualidad de un jugador, para llevar el control de los pagos. | Registrar mensualidad | `POST /api/mensualidades` | 201 con la mensualidad creada; 400 si ya existe para ese jugador, mes y año |
| 8 | Como tesorero del club, quiero consultar el historial de pagos de un jugador, para saber qué meses ha pagado. | Historial por jugador | `GET /api/mensualidades/jugador/:jugadorId` | 200 con el nombre del jugador, el total y sus pagos |
| 9 | Como tesorero del club, quiero ver los jugadores en mora de un mes, para cobrarles a quienes no han pagado. | Jugadores en mora | `GET /api/mensualidades/morosos?mes=Agosto&anio=2026` | 200 con los jugadores activos sin pago en ese mes |
| 10 | Como tesorero del club, quiero ver el resumen de recaudo de un mes, para conocer cuánto dinero ha ingresado al club. | Resumen de recaudo | `GET /api/mensualidades/resumen?mes=Agosto&anio=2026` | 200 con el total recaudado y la cantidad por estado |
| 11 | Como administrador del club, quiero consultar los jugadores inactivos, para saber quiénes se retiraron del club. | Listar jugadores inactivos | `GET /api/jugadores?estado=inactivo` | 200 con los jugadores inactivos |
| 12 | Como administrador del club, quiero reactivar a un jugador que regresa, para que vuelva a figurar como activo y a pagar su mensualidad. | Reactivar jugador | `PUT /api/jugadores/:id` con `{ "estado": "activo" }` | 200 con `estado: "activo"` |

> Las funcionalidades 11 y 12 son adicionales. Las 10 principales para la sustentación son de la 1 a la 10.

## Historias de usuario

1. Como **administrador del club**, quiero **registrar un jugador nuevo**, para **tener el plantel completo y organizado**.
2. Como **administrador del club**, quiero **ver la lista de todos los jugadores**, para **conocer quiénes forman parte del club**.
3. Como **administrador del club**, quiero **filtrar jugadores por posición y estado**, para **armar la alineación con los jugadores disponibles**.
4. Como **administrador del club**, quiero **actualizar los datos de un jugador**, para **mantener su información al día**.
5. Como **administrador del club**, quiero **inactivar a un jugador que se retira**, para **no seguir cobrándole mensualidad sin borrar su historial**.
6. Como **administrador del club**, quiero **que el número de camiseta no se repita**, para **evitar conflictos entre jugadores en la cancha**.
7. Como **tesorero del club**, quiero **registrar la mensualidad de un jugador**, para **llevar el control de los pagos**.
8. Como **tesorero del club**, quiero **consultar el historial de pagos de un jugador**, para **saber qué meses ha pagado**.
9. Como **tesorero del club**, quiero **ver los jugadores en mora de un mes**, para **cobrarles a quienes no han pagado**.
10. Como **tesorero del club**, quiero **ver el resumen de recaudo de un mes**, para **conocer cuánto dinero ha ingresado al club**.
11. Como **administrador del club**, quiero **consultar los jugadores inactivos**, para **saber quiénes se retiraron del club**.
12. Como **administrador del club**, quiero **reactivar a un jugador que regresa**, para **que vuelva a figurar como activo y a pagar su mensualidad**.
