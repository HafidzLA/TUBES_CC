# Filmlog — Letterboxd Clone

> Film tracking web app deployed across 3 Virtual Machines using Vagrant.

## Arsitektur

```
Host Machine (Windows)
│
├── VM 1: letterboxd-db        (192.168.56.10)   ← MySQL
├── VM 2: letterboxd-backend   (192.168.56.11)   ← Node.js + Express API
└── VM 3: letterboxd-frontend  (192.168.56.12)   ← React + Nginx
```

Akses dari browser host: **http://localhost:8080** (port 80 VM frontend di-forward ke 8080 host)

---

## Cara Menjalankan

### Prasyarat
- [Vagrant](https://developer.hashicorp.com/vagrant/downloads) ≥ 2.3
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads) ≥ 7.0

### Langkah-langkah

```powershell
# Masuk ke folder project
cd C:\Users\LENOVO\.gemini\antigravity\scratch\letterboxd-clone

# Jalankan semua 3 VM (proses ini butuh ~10-15 menit pertama kali)
vagrant up

# Akses app di browser
start http://localhost:8080
```

### Perintah Vagrant Berguna

```powershell
# Cek status semua VM
vagrant status

# SSH ke VM tertentu
vagrant ssh db
vagrant ssh backend
vagrant ssh frontend

# Restart VM tertentu
vagrant reload backend

# Re-run provisioning (jika ada perubahan kode)
vagrant provision frontend

# Matikan semua VM
vagrant halt

# Hapus semua VM
vagrant destroy -f
```

---

## Struktur Project

```
letterboxd-clone/
├── Vagrantfile              ← Definisi 3 VM
├── provision-db.sh          ← Script provisioning VM database
├── provision-backend.sh     ← Script provisioning VM backend
├── provision-frontend.sh    ← Script provisioning VM frontend
│
├── backend/
│   ├── package.json
│   ├── server.js            ← Express entry point
│   ├── db.js                ← MySQL connection pool
│   └── routes/
│       ├── movies.js        ← GET /api/movies, GET /api/movies/:id
│       ├── reviews.js       ← GET/POST/DELETE /api/reviews
│       └── watchlist.js     ← GET/POST/DELETE /api/watchlist
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── index.css        ← Design system (dark cinematic theme)
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── MovieCard.jsx
        │   ├── StarRating.jsx
        │   ├── ReviewSection.jsx
        │   ├── Toast.jsx
        │   └── ToastContext.jsx
        └── pages/
            ├── Home.jsx
            ├── MovieDetail.jsx
            └── Watchlist.jsx
```

---

## Stack Teknologi

| Layer     | Teknologi           |
|-----------|---------------------|
| Frontend  | React 18 + Vite     |
| Styling   | Vanilla CSS         |
| Backend   | Node.js + Express   |
| Database  | MySQL 8             |
| Web Server| Nginx               |
| VM        | Vagrant + VirtualBox|
| OS (VM)   | Ubuntu 22.04 LTS    |

---

## API Endpoints

| Method | Endpoint                | Deskripsi                    |
|--------|-------------------------|------------------------------|
| GET    | /api/movies             | List semua film              |
| GET    | /api/movies/:id         | Detail satu film             |
| GET    | /api/reviews/:movieId   | Semua review untuk 1 film    |
| POST   | /api/reviews            | Tambah/update review         |
| DELETE | /api/reviews/:movieId   | Hapus review                 |
| GET    | /api/watchlist/:userId  | Watchlist user               |
| POST   | /api/watchlist          | Tambah ke watchlist          |
| DELETE | /api/watchlist/:movieId | Hapus dari watchlist         |
| GET    | /api/health             | Health check backend         |

---

## Kredensial Database

| Field    | Value        |
|----------|--------------|
| Host     | 192.168.56.10|
| Database | letterboxd   |
| User     | appuser      |
| Password | AppPass123!  |
