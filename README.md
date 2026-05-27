# 🍿 ShutterScore

Selamat datang di **ShutterScore**. Aplikasi ini merupakan platform berbasis web di mana pengguna dapat mencatat, memberikan penilaian (rating), dan menemukan berbagai rekomendasi film yang menarik, terinspirasi dari aplikasi Letterboxd. Antarmuka aplikasi ini didesain dengan tema *dark aesthetic* untuk memberikan pengalaman visual yang elegan.

Secara teknis, proyek ini dirancang dengan arsitektur terdistribusi yang berjalan pada **tiga Virtual Machine (VM)** atau server terpisah:
- 🗄️ **VM Database**: Berfungsi sebagai tempat penyimpanan seluruh data pengguna dan informasi film. Komponen ini menggunakan **PostgreSQL** yang berjalan di dalam *container* Docker.
- 🧠 **VM Backend**: Bertindak sebagai pemroses utama logika bisnis dan jembatan pertukaran data. Komponen ini dibangun menggunakan **Node.js** dan framework **Express**.
- 🎨 **VM Frontend**: Merupakan antarmuka pengguna (User Interface) interaktif. Dibangun menggunakan **React** dan **Vite**, serta dilayani oleh **Nginx** sebagai *web server*.

---

## Gambaran Arsitektur & Jaringan

```mermaid
graph TD
    User([Browser Pengguna]) -->|HTTP Port 80| VM1[VM Frontend - Nginx]
    VM1 -->|Request API Port 5000| VM2[VM Backend - Express REST API]
    VM2 -->|Query Database Port 5432| VM3[VM Database - PostgreSQL Docker]
    
    subgraph VM3_LAN [Batas Jaringan VM Database]
        Docker[Docker Engine] -.->|Port 5432| PG[(Container PostgreSQL)]
    end
```

---

## 🛠️ Panduan Penggunaan VM (menggunakan Vagrant)

Sistem *server* pada proyek ini dikonfigurasi menggunakan **Vagrant** dan **VirtualBox**. Sebelum memulai, pastikan Anda telah membuka terminal (Command Prompt atau PowerShell) tepat pada direktori root proyek ini.

### 1. Menghidupkan Virtual Machine
Untuk menyalakan seluruh VM dari kondisi nonaktif, jalankan perintah berikut pada terminal:
```bash
vagrant up
```
Mohon tunggu beberapa saat. Vagrant akan secara otomatis melakukan inisialisasi dan mengaktifkan ketiga server tersebut. 

Setelah proses selesai, Anda dapat membuka peramban (*browser*) dan mengakses aplikasi web melalui alamat IP yang telah ditetapkan (misalnya: `http://192.168.56.12`).

### 2. Mematikan Virtual Machine
Apabila Anda telah selesai menggunakan aplikasi, sangat disarankan untuk mematikan VM agar sumber daya komputer Anda tidak terbebani. Gunakan perintah berikut:
```bash
vagrant halt
```
Perintah ini akan mematikan seluruh mesin virtual secara aman.


---

## 🐳 Panduan Menjalankan Secara Lokal (Tanpa VM)

Apabila Anda ingin menjalankan keseluruhan aplikasi secara langsung pada komputer lokal Anda tanpa menggunakan VM, Anda dapat memanfaatkan **Docker Compose**:

1. Buka terminal pada direktori root proyek ini.
2. Jalankan perintah berikut untuk membangun dan menjalankan seluruh *container* di latar belakang:
   ```bash
   docker compose up -d --build
   ```
3. Setelah proses selesai, aplikasi siap diakses melalui peramban:
   - 🎨 **Tampilan Web (Frontend)**: `http://localhost:8080`
   - ⚙️ **API Backend**: `http://localhost:5000`

---

## 🔑 Akun Uji Coba

Untuk mempermudah pengujian, kami telah menyediakan beberapa akun percobaan yang dapat langsung Anda gunakan untuk *login*.

Seluruh akun di bawah ini menggunakan kata sandi (*password*) yang sama, yaitu: **`password123`**

- 🎬 **Username:** `cinephile99` (Email: `cinephile99@shutterscore.com`)
- 🍿 **Username:** `filmgirl` (Email: `filmgirl@shutterscore.com`)
- 👑 **Username:** `shutter_admin` (Email: `admin@shutterscore.com`)

Selamat mencoba dan mengeksplorasi aplikasi ini!