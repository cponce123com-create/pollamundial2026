# API — PollaWorld 2026

Base URL: `/api`

> **Nota:** Todas las rutas protegidas requieren autenticación por cookie HTTP-only (`jwt`). Las rutas de admin requieren rol `admin`.

---

## Autenticación — `/api/auth`

### `POST /auth/register`
Registrar nuevo usuario.

**Body:**
```json
{
  "name": "string",
  "phone": "string",
  "password": "string (min 6)",
  "emoji_id": "string"
}
```

**Response (200):**
```json
{ "user": { "id": "...", "name": "...", "phone": "...", "emoji_id": "...", "role": "participant", "payment_status": "pending" } }
```

---

### `POST /auth/login`
Iniciar sesión.

**Body:**
```json
{ "phone": "string", "password": "string" }
```

**Response (200):**
```json
{ "user": { "id": "...", "name": "...", "phone": "...", "emoji_id": "...", "role": "participant", "payment_status": "pending" } }
```

---

### `POST /auth/logout`
Cerrar sesión (limpia cookie). Requiere auth.

**Response (200):**
```json
{ "message": "Sesión cerrada correctamente." }
```

---

### `GET /auth/me`
Obtener datos del usuario autenticado.

**Response (200):**
```json
{ "user": { "id": "...", "name": "...", "phone": "...", "emoji_id": "...", "role": "participant", "payment_status": "pending" } }
```

---

## Partidos — `/api/matches`

### `GET /matches`
Listar todos los partidos ordenados por `match_order`.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "phase": "groups | round_of_16 | quarterfinals | semifinals | final",
    "group_name": "string | null",
    "home_team": "string",
    "away_team": "string",
    "home_flag": "string",
    "away_flag": "string",
    "match_date": "ISO string",
    "home_score_real": "number | null",
    "away_score_real": "number | null",
    "is_locked": "boolean",
    "match_order": "number"
  }
]
```

### `POST /matches`
Crear partido (admin).

**Body:**
```json
{
  "phase": "groups",
  "group_name": "A",
  "home_team": "Argentina",
  "away_team": "Brasil",
  "home_flag": "🇦🇷",
  "away_flag": "🇧🇷",
  "match_date": "2026-06-14T15:00:00Z"
}
```

---

## Predicciones — `/api/predictions`

### `GET /predictions/my`
Obtener predicciones del usuario autenticado.

**Response (200):**
```json
[
  {
    "prediction": { "id": "uuid", "match_id": "uuid", "home_score_pred": 2, "away_score_pred": 1, "points_earned": 0 },
    "match": { "id": "uuid", "home_team": "...", ... }
  }
]
```

### `GET /predictions/matches`
Obtener partidos con predicción del usuario (si existe).

**Response (200):**
```json
[
  {
    "id": "uuid",
    "phase": "...",
    "home_team": "...",
    "away_team": "...",
    "prediction": { "id": "uuid", "home_score_pred": 2, "away_score_pred": 1 } | null
  }
]
```

### `GET /predictions/popular`
Obtener predicciones más populares (promedio global por partido).

**Response (200):**
```json
{ "matchId": { "home_score_pred": 1.5, "away_score_pred": 0.8 } }
```

### `GET /predictions/user/:userId`
Obtener predicciones de un usuario (público, requiere torneo iniciado).

### `POST /predictions`
Guardar predicción individual.

**Body:**
```json
{ "match_id": "uuid", "home_score_pred": 2, "away_score_pred": 1 }
```

### `POST /predictions/bulk`
Guardar múltiples predicciones a la vez.

**Body:**
```json
{
  "predictions": [
    { "match_id": "uuid", "home_score_pred": 2, "away_score_pred": 1 },
    { "match_id": "uuid", "home_score_pred": 0, "away_score_pred": 0 }
  ]
}
```

**Response (200):**
```json
{ "saved": 2, "predictions": [ ... ] }
```

---

## Pagos — `/api/payments`

### `POST /payments/upload`
Subir comprobante de pago (multipart/form-data). Requiere auth.

**Campos:**
| Campo   | Tipo | Descripción            |
|---------|------|------------------------|
| `proof` | File | Imagen (jpg, png, gif, webp, max 5MB) |

**Response (200):**
```json
{ "url": "https://res.cloudinary.com/...", "message": "Comprobante subido. Pendiente de revisión." }
```

---

## Pool — `/api/pool`

### `GET /pool/config`
Obtener configuración del pool.

**Response (200):**
```json
{
  "id": "uuid",
  "entry_fee": 20,
  "prize_1st_pct": 50,
  "prize_2nd_pct": 30,
  "prize_3rd_pct": 20,
  "tournament_started": false,
  "yape_qr_url": "string | null",
  "yape_phone": "string | null"
}
```

### `PUT /pool/config`
Actualizar configuración del pool (admin).

### `GET /pool/stats`
Estadísticas del pool.

**Response (200):**
```json
{
  "approvedCount": 15,
  "entryFee": 20,
  "totalPool": 300,
  "prizes": { "first": 150, "second": 90, "third": 60 },
  "tournamentStarted": false
}
```

### `GET /pool/participants`
Listar participantes aprobados.

**Response (200):**
```json
[
  { "id": "uuid", "name": "string", "phone": "string", "emoji_id": "string" }
]
```

### `GET /pool/ranking`
Ranking global de participantes.

**Response (200):**
```json
[
  { "user_id": "uuid", "name": "string", "emoji_id": "string", "total_points": 15 }
]
```

### `POST /pool/upload-yape-qr`
Subir QR de Yape (admin, multipart/form-data).

---

## Admin — `/api/admin`

### `GET /admin/payments/pending`
Listar pagos pendientes.

### `GET /admin/payments/approved`
Listar pagos aprobados.

### `GET /admin/users`
Listar todos los usuarios.

### `GET /admin/predictions/export`
Exportar datos completos (admin).

**Response (200):**
```json
{
  "exported_at": "ISO string",
  "users": [ { "user": {...}, "predictions": [...] } ],
  "matches": [...]
}
```

### `PATCH /admin/payments/:userId/approve`
Aprobar pago de usuario.

### `PATCH /admin/payments/:userId/reject`
Rechazar pago de usuario.

**Body opcional:**
```json
{ "reason": "Comprobante ilegible" }
```

### `PATCH /admin/matches/:matchId/lock`
Bloquear/desbloquear partido.

**Body:**
```json
{ "locked": true }
```

### `POST /admin/matches/:matchId/result`
Registrar resultado de partido.

**Body:**
```json
{ "home_score_real": 2, "away_score_real": 1 }
```

---

## Health — `/api/health`

### `GET /api/health`
Health check del servidor.

**Response (200):**
```json
{ "status": "ok", "timestamp": "2026-01-01T00:00:00.000Z" }
```
