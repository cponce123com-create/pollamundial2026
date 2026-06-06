# ⚽ La Polla del Ponce

Aplicación web para la gestión de una **polla mundialista** — predicciones de partidos del Mundial 2026 entre un grupo de amigos. Los participantes registran sus pronósticos, acumulan puntos según sus aciertos, y compiten en un ranking para ver quién es el mejor predictor.

---

## ✨ Características

- **Registro de usuarios** con emoji identificador y número de teléfono.
- **Predicciones** para cada partido de la fase de grupos y eliminatorias.
- **Sistema de puntuación**:
  - Marcador exacto → **5 pts**
  - Ganador correcto (marcador incorrecto) → **3 pts**
  - Empate acertado (sin goles exactos) → **2 pts**
- **Panel de administración** para gestionar partidos, resultados, pagos y configuración del torneo.
- **Subida de comprobantes de pago** con aprobación manual del admin.
- **Ranking en vivo** de participantes.
- **Exportación de boletos** en PDF con logos de selecciones.
- **Rate limiting** en registro e inicio de sesión (5 intentos/minuto).
- **Cierre automático** del torneo cuando el primer partido comienza.

---

## 📋 Requisitos

- **Node.js** ≥ 18
- **npm** ≥ 9
- **PostgreSQL** (recomendado: [Neon](https://neon.tech) serverless)
- Cuenta en [Cloudinary](https://cloudinary.com) (para almacenar comprobantes de pago)

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/pollamundial2026.git
cd pollamundial2026
```

### 2. Variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example pollaworld-2026/server/.env
```

Edita `pollaworld-2026/server/.env` con tus credenciales reales:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URL de conexión a PostgreSQL (Neon) |
| `JWT_SECRET` | Clave secreta para firmar JWT (ej: `openssl rand -hex 64`) |
| `CLOUDINARY_CLOUD_NAME` | Cloud name de Cloudinary |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary |
| `PORT` | Puerto del servidor (por defecto: `3001`) |
| `NODE_ENV` | `development` o `production` |
| `CLIENT_URL` | URL del frontend (por defecto: `http://localhost:5173`) |

### 3. Instalar dependencias

```bash
cd pollaworld-2026/server && npm install
cd ../client && npm install
```

### 4. Configurar la base de datos

```bash
cd ../server
npm run db:generate   # Genera archivos de migración
npm run db:push       # Empuja el schema a la BD
npm run db:migrate    # Ejecuta migraciones
```

### 5. Poblar datos iniciales (opcional)

```bash
npm run dev    # Inicia el servidor primero
# Luego ejecuta el seed:
npx tsx src/db/seed.ts
```

### 6. Iniciar en desarrollo

**Servidor:**
```bash
cd pollaworld-2026/server
npm run dev
# → http://localhost:3001
```

**Cliente:**
```bash
cd pollaworld-2026/client
npm run dev
# → http://localhost:5173
```

---

## 🏗️ Estructura del proyecto

```
pollamundial2026/
├── .env.example              # Plantilla de variables de entorno
├── README.md
├── render.yaml               # Config de despliegue en Render
└── pollaworld-2026/
    ├── client/               # Frontend React + Vite + TypeScript
    │   └── src/
    │       ├── components/   # Header, PdfBoleto
    │       ├── lib/          # api.ts, emojis.ts, flags.tsx, predictionsLogic.ts
    │       └── pages/        # Login, Register, Dashboard, Participants, Ranking, Admin
    └── server/               # Backend Express + Drizzle ORM + TypeScript
        └── src/
            ├── db/           # Schema, migraciones, seed
            ├── lib/          # jwt.ts, scoring.ts, cloudinary.ts
            ├── middleware/   # auth.ts, admin.ts
            └── routes/       # auth, matches, predictions, payments, admin, pool
```

---

## 📦 Despliegue en Render

Este proyecto incluye un archivo `render.yaml` para desplegar en [Render](https://render.com).

### Pasos:

1. Crea una cuenta en Render y conecta tu repositorio de GitHub.
2. Ve a **Blueprint** y conecta tu repositorio.
3. Render leerá `render.yaml` y creará automáticamente:
   - **Web Service** para el frontend (Vite)
   - **Web Service** para el backend (Node.js)
4. Configura las **Environment Variables** (las mismas del `.env`) directamente en Render.
5. Render ejecutará el script `setup.sh` para build + migraciones.

> ⚠️ Asegúrate de que `DATABASE_URL` apunte a tu base de datos en producción.

---

## 🔧 Comandos útiles

| Comando | Descripción |
|---|---|
| `npm run dev` (server) | Inicia servidor con hot-reload |
| `npm run dev` (client) | Inicia cliente Vite con HMR |
| `npm run build` (server) | Compila TypeScript del servidor |
| `npm run build` (client) | Compila TypeScript del cliente |
| `npm run db:generate` | Genera migraciones Drizzle |
| `npm run db:push` | Push del schema a la BD |
| `npm run db:migrate` | Ejecuta migraciones pendientes |
| `npx tsc --noEmit` | Verifica tipos sin compilar |

---

## 🧠 Sistema de puntuación

| Condición | Puntos |
|---|---|
| Marcador exacto (ej: 2-1) | 5 pts |
| Ganador correcto pero marcador incorrecto | 3 pts |
| Empate acertado (sin goles exactos) | 2 pts |
| No aciertas nada | 0 pts |

---

## 🛡️ Seguridad

- **JWT** con expiración de 7 días en cookie httpOnly.
- **Rate limiting** en login/register (5 intentos/minuto por IP).
- **Validación** de variables de entorno requeridas al iniciar el servidor.
- **Middleware** de verificación de rol de administrador.
- Comprobante de pago obligatorio para aprobar pagos.

---

## 👥 Créditos

Desarrollado por @scamander90

---

## 📄 Licencia

Uso privado — proyecto de grupo para La Polla del Ponce.