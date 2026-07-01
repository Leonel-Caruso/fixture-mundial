# Fixture Mundial 2026

Proyecto frontend + backend Node/Express para un fixture circular con:

- modo **Fixture** oficial.
- modo **Grupos** con tablas completas.
- modo **Predicción**, guardado por navegador/dispositivo con `localStorage`.
- panel de **Partidos Hoy**.
- backend `/api/matches` para usar datos mock o API real.
- favicon de pelota dorada de contorno.

## Ejecutar localmente

```bash
npm install
```

Copiar `.env.example` como `.env`:

```bash
cp .env.example .env
```

En Windows también podés hacerlo manualmente: duplicá `.env.example` y renombralo a `.env`.

Luego ejecutar:

```bash
npm start
```

Abrir:

```txt
http://localhost:3000
```

## Importante sobre `.env.example`

`.env.example` es solo una plantilla para GitHub. El servidor no lo toma como configuración real.

Para datos reales en tu PC necesitás un archivo `.env` en la raíz del proyecto, con:

```env
API_PROVIDER=api-football
API_FOOTBALL_KEY=TU_API_KEY
```

No subas `.env` a GitHub. Este proyecto ya incluye `.gitignore` para evitarlo.

## Verificar proveedor activo

Abrir:

```txt
http://localhost:3000/api/health
```

Si devuelve:

```json
{"provider":"mock"}
```

estás usando datos de prueba, no datos reales.

Para que se actualicen goles reales, debe devolver:

```json
{"provider":"api-football"}
```

También podés revisar:

```txt
http://localhost:3000/api/matches
```

Si un partido no aparece ahí con sus goles, el frontend no tiene forma de mostrar ese resultado real.

## Subir a una URL pública

Para que tus compañeros entren desde una URL y vean actualizaciones reales, subir a Render como **Web Service Node/Express** y configurar las variables de entorno en Render, no en GitHub:

```env
API_PROVIDER=api-football
API_FOOTBALL_KEY=TU_API_KEY
API_FOOTBALL_LEAGUE_ID=1
API_FOOTBALL_SEASON=2026
```

Comandos:

```bash
Build Command: npm install
Start Command: npm start
```

## Modo mock

Si usás:

```env
API_PROVIDER=mock
```

el backend lee solamente:

```txt
data/mock-live-results.json
```

Eso sirve para probar la interfaz, pero no consulta internet ni actualiza goles reales.


## Diagnóstico API real

Si `/api/matches` devuelve `[]`, probá estos endpoints:

- `/api/debug/config`: muestra si Render tomó las variables correctas, sin exponer la key.
- `/api/debug/api-football`: consulta API-FOOTBALL y devuelve cantidad de fixtures, errores oficiales y una muestra de partidos recibidos.

La app consulta tanto el rango del Mundial (`league=1&season=2026`) como `live=all`, para no perder partidos por cruce de fecha u horario.
