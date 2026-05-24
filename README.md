# Auth System (JWT + Refresh Token Sessions)

Node.js + Express + MongoDB authentication API using:
- **Access tokens** (JWT) returned in JSON
- **Refresh token** stored as an **HttpOnly cookie**
- **Sessions** stored in MongoDB (hashed refresh token + revoke support)

## Tech Stack
- Node.js (ESM)
- Express
- MongoDB + Mongoose
- Cloudinary (media storage)
- Multer (multipart uploads)
- JSON Web Tokens (`jsonwebtoken`)
- `morgan` logging (console + `logs/access.log`)
- Tests: Node test runner + `supertest` + `mongodb-memory-server`

---

## Setup

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment variables
Create a `.env` file in the project root:

```env
PORT=3333
MONGO_URI=mongodb://...
JWT_SECRET=your_secret
ACCESS_JWT_EXPIRES_IN=15m
REFRESH_JWT_EXPIRES_IN=7d
MODE=DEV
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

Notes:
- `JWT_SECRET`, `MONGO_URI`, and expiry settings are required (the app will exit if missing).
- `CLOUDINARY_URL` is required for media uploads in non-test environments.
- Refresh cookies are set with `secure: true` only when `NODE_ENV=production`.

### 3) Run the server
```bash
npm run dev
```

Server starts on `http://localhost:3333`.

---

## Auth Flow

- Register/Login returns an **access token** in the JSON response (`accesstoken`).
- A **refresh token** is set as an HttpOnly cookie named `refreshtoken`.
- Use the access token to call protected routes:

```http
Authorization: Bearer <accesstoken>
```

- When access token expires, call `GET /api/auth/refresh-token` (cookie required) to get a new access token.

---

## API Routes

### Auth (`/api/auth`)

#### `POST /api/auth/register`
Body:
```json
{
  "username": "rayyan",
  "email": "rayyan@example.com",
  "password": "Passw0rd1"
}
```
Response:
- Sets cookie `refreshtoken`
- Returns `{ accesstoken, data: { username, email } }`

#### `POST /api/auth/login`
Body:
```json
{
  "email": "rayyan@example.com",
  "password": "Passw0rd1"
}
```
Response:
- Sets cookie `refreshtoken`
- Returns `{ accesstoken }`

#### `GET /api/auth/get-me` (Protected)
Header:
```http
Authorization: Bearer <accesstoken>
```
Response:
```json
{
  "message": "User found successfully",
  "user": { "username": "...", "email": "..." }
}
```

#### `GET /api/auth/refresh-token`
- Requires `refreshtoken` cookie
- Rotates refresh token and returns a new access token

#### `GET /api/auth/logout`
- Requires `refreshtoken` cookie
- Revokes the current session and clears the cookie

#### `GET /api/auth/logout-all`
- Requires `refreshtoken` cookie
- Revokes all sessions for the user and clears the cookie

---

### Media (`/api/media`) (Protected)
All media routes require:
```http
Authorization: Bearer <accesstoken>
```

Media is stored in Cloudinary using the folder structure:
`Home/Gallery-app/<user_id>/<media_id>`

#### `POST /api/media/post`
This endpoint supports either:
- `multipart/form-data` with a `file` field (recommended), OR
- JSON body with a `url` (uploads from a remote URL)

Example JSON body:
```json
{
  "url": "https://example.com/sample.jpg"
}
```

#### `GET /api/media/get-all`
Returns all media records for the authenticated user.

#### `GET /api/media/get/:id`
Returns a single media record.

#### `DELETE /api/media/delete/:id`
Deletes a single media record.

#### `DELETE /api/media/delete-all`
Deletes all media records for the authenticated user.

---

## Running Tests
```bash
npm test
```

Tests use an in-memory MongoDB by default.

---

## Docker
The repo includes a `Dockerfile`.

Build:
```bash
docker build -t authsystemfulltokenized .
```

Run (provide env vars at runtime):
```bash
docker run -p 3333:3333 --env-file .env authsystemfulltokenized
```
