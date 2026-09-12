# Bun Elysia OpenAPI Starter

Starter kit backend RESTful API modern dan berkinerja tinggi yang dibangun menggunakan **Bun** dan **ElysiaJS**. Proyek ini dirancang secara modular dengan fitur otentikasi siap pakai, integrasi OpenAPI interaktif, serta type-safety menyeluruh dari skema database hingga endpoint handler.

---

## 🚀 Fitur Utama & Teknologi

| Teknologi | Kategori | Deskripsi |
| :--- | :--- | :--- |
| **[Bun](https://bun.sh/)** | Runtime & Package Manager | JavaScript & TypeScript runtime ultra-cepat |
| **[ElysiaJS](https://elysiajs.com/)** | Web Framework | Framework backend berkinerja tinggi untuk Bun dengan ergonomi TypeScript prima |
| **[Drizzle ORM](https://orm.drizzle.team/)** | ORM | TypeScript ORM ringan dan type-safe |
| **[MySQL 8.0+](https://www.mysql.com/)** | Database | Database relasional utama |
| **[Better Auth](https://www.better-auth.com/)** | Authentication | Sistem autentikasi komprehensif berbasis session cookie |
| **[Zod](https://zod.dev/)** | Validation | Validasi skema runtime |
| **[@elysia/openapi](https://elysiajs.com/plugins/openapi.html)** | API Documentation | Dokumentasi OpenAPI interaktif (Swagger / Scalar) |
| **[Docker & Compose](https://www.docker.com/)** | Containerization | Dukungan kontainerisasi aplikasi dan database |

---

## 📋 Prasyarat Sistem (Requirements)

Sebelum memulai, pastikan sistem Anda telah terpasang:
- **Bun**: v1.0.0 atau versi lebih baru ([Panduan Instalasi Bun](https://bun.sh/))
- **MySQL Server**: v8.0+ lokal atau melalui **Docker & Docker Compose**

---

## 🛠️ Instalasi & Menjalankan Proyek

### 1. Klon Repositori & Pasang Dependensi
```bash
bun install
```

### 2. Konfigurasi Environment Variables
Salin template konfigurasi `.env.example` ke `.env`:
```bash
cp .env.example .env
```

Sesuaikan nilai konfigurasi di file `.env`:
- `PORT`: Port server (default: `3000` / `3001`)
- `DATABASE_URL`: Connection string MySQL (contoh: `mysql://root:root@localhost:3306/mydb`)
- `BETTER_AUTH_SECRET`: Kunci rahasia acak (generate via: `openssl rand -base64 32`)
- `BETTER_AUTH_URL`: URL dasar API publik (contoh: `http://localhost:3000`)
- `CORS_ORIGIN`: Origin frontend yang diizinkan (contoh: `http://localhost:5173`)

### 3. Menjalankan Database (Opsional via Docker)
Jika belum memiliki instance MySQL lokal, Anda dapat menjalankan database menggunakan Docker Compose:
```bash
docker compose up -d db
```

### 4. Setup Skema Database (Drizzle ORM)
Sinkronisasikan skema database Drizzle ke instance MySQL:
```bash
# Opsi 1: Push skema langsung (disarankan untuk tahap development)
bun run db:push

# Opsi 2: Generate migrasi lalu terapkan migrasi
bun run db:generate
bun run db:migrate
```

### 5. Menjalankan Server
```bash
# Mode Development (dengan hot reload & file watch)
bun run dev

# Mode Production
bun run start
```

Server akan aktif secara default di: `http://localhost:3000` (atau sesuai konfigurasi `PORT`).

---

## 🔌 Cara Menggunakan API & Alur Otentikasi

Otentikasi pada proyek ini dikelola menggunakan **Better Auth** dengan mekanisme **Cookie-Based Session**.

### Alur Otentikasi (Authentication Flow)

1. **Registrasi Pengguna (Sign Up)**
   - **Method & Path**: `POST /api/auth/sign-up/email`
   - **Body JSON**:
     ```json
     {
       "email": "user@example.com",
       "password": "strongpassword123",
       "name": "John Doe"
     }
     ```

2. **Login Pengguna (Sign In)**
   - **Method & Path**: `POST /api/auth/sign-in/email`
   - **Body JSON**:
     ```json
     {
       "email": "user@example.com",
       "password": "strongpassword123"
     }
     ```
   - **Response**: Mengembalikan data user dan otomatis menyematkan header `Set-Cookie` (`better-auth.session_token`).

3. **Cek Sesi Aktif**
   - **Method & Path**: `GET /api/auth/get-session`
   - Mengembalikan data sesi dan profil pengguna yang sedang login.

4. **Mengakses Endpoint Terproteksi**
   - Endpoint di bawah modul `/users` dilindungi oleh middleware `authGuard`.
   - Browser atau HTTP client wajib menyertakan session cookie pada setiap request:
     - `GET /users`: Mendapatkan daftar seluruh user
     - `GET /users/:id`: Mendapatkan detail user berdasarkan ID
     - `PATCH /users/:id`: Memperbarui informasi user
     - `DELETE /users/:id`: Menghapus user

---

## 📁 Struktur Folder Proyek

Arsitektur kode diorganisir secara modular di dalam direktori `src/`:

```text
src/
├── config/         # Konfigurasi aplikasi & validasi environment variables
├── db/             # Koneksi database client & skema Drizzle ORM
├── lib/            # Library helper, konfigurasi Better Auth & validasi Zod
├── middlewares/    # Middleware global (auth guard, rate limiter, error handler)
├── modules/        # Modul domain/fitur terpisah (controller, router, & skema)
│   ├── auth/       # Handler endpoint otentikasi Better Auth
│   └── users/      # Handler & skema CRUD user
├── plugins/        # Plugin Elysia (konfigurasi CORS)
└── index.ts        # Entrypoint server & konfigurasi OpenAPI documentation
```

---

## 📖 Dokumentasi Interaktif OpenAPI

Proyek ini telah dilengkapi dengan antarmuka dokumentasi API interaktif menggunakan plugin **OpenAPI**.

- **URL Dokumentasi**:
  `http://localhost:3000/docs` (atau sesuaikan port jika diubah pada `.env`)
- **Fitur**:
  - Melihat seluruh daftar endpoint, metode HTTP, serta deskripsi spesifikasinya.
  - Memeriksa skema payload request dan format respons (termasuk status code).
  - Melakukan uji coba request langsung melalui browser (**Try it out**).

---

## 📜 Lisensi

Proyek ini dirilis di bawah lisensi [MIT](LICENSE).
