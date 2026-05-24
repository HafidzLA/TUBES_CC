# ShutterScore (Kloningan Letterboxd) - Web App 3-VM

Halo! Selamat datang di ShutterScore. Ini adalah aplikasi web tempat kamu bisa mencatat, memberi rating, dan menemukan film-film menarik layaknya aplikasi Letterboxd. Aplikasi ini dirancang dengan gaya dark aesthetic yang keren dan elegan.

Proyek ini dibuat agar bisa dijalankan pada tiga Virtual Machine (VM) atau server yang terpisah, yaitu:
1. VM Database: Tempat menyimpan semua data (menggunakan PostgreSQL di dalam Docker).
2. VM Backend: Otak dari aplikasi ini, yang memproses data dari dan ke database (menggunakan Node.js + Express).
3. VM Frontend: Tampilan antarmuka (User Interface) yang akan dilihat oleh pengguna (menggunakan React + Vite dan Nginx).

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

## Panduan Penggunaan VM (Vagrant)

Proyek ini dikelola menggunakan Vagrant dan VirtualBox. Pastikan Anda membuka terminal (Command Prompt/PowerShell) tepat di dalam folder proyek ini sebelum menjalankan perintah di bawah.

### 1. Menghidupkan VM
Untuk menyalakan semua VM dari kondisi mati, ketik perintah berikut di terminal:
```bash
vagrant up
```
Tunggu beberapa saat hingga proses selesai. Vagrant akan secara otomatis membuat dan menyalakan ketiga server.

Setelah menyala, Anda bisa langsung membuka browser dan mengakses aplikasi web melalui alamat IP yang telah ditentukan (misalnya http://192.168.56.12).

### 2. Mematikan VM
Setelah Anda selesai menggunakan web atau ingin beristirahat, matikan VM dengan aman agar tidak membebani komputer Anda. Gunakan perintah:
```bash
vagrant halt
```


---

## Cara Menjalankan Secara Lokal (Tanpa VM)

Jika kamu ingin mencoba menjalankan keseluruhan aplikasi di komputermu sendiri tanpa VM, kamu cukup menggunakan Docker Compose:

1. Buka terminal di folder utama proyek ini.
2. Jalankan perintah:
   ```bash
   docker-compose up -d --build
   ```
3. Buka browser dan akses:
   - Frontend (Tampilan): http://localhost:8080
   - API Backend: http://localhost:5000

---

## Akun Percobaan (Default)

Kami sudah menyiapkan beberapa akun yang bisa langsung kamu gunakan untuk mencoba login. Semua akun ini memiliki password yang sama, yaitu: password123

1. Username: cinephile99 (Email: cinephile99@shutterscore.com)
2. Username: filmgirl (Email: filmgirl@shutterscore.com)
3. Username: shutter_admin (Email: admin@shutterscore.com)

Selamat mencoba!
